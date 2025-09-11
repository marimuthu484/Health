const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Chat = require('../models/Chat');
const TimeSlot = require('../models/TimeSlot');
const emailService = require('../services/emailService');
const { APPOINTMENT_STATUS } = require('../config/constants');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for medical report uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/medical-reports');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
}).single('medicalReport');

// ---------------- CREATE APPOINTMENT ----------------
exports.createAppointment = async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { doctorId, timeSlotId, reason, consultationType } = req.body;

      // Get patient
      const patient = await Patient.findOne({ userId: req.user._id }).populate('userId', 'name email');
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient profile not found' });
      }

      // Verify slot
      const timeSlot = await TimeSlot.findById(timeSlotId);
      if (!timeSlot || timeSlot.isBooked) {
        return res.status(400).json({ success: false, message: 'Time slot not available' });
      }

      // Verify doctor
      const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
      if (!doctor || doctor.status !== 'approved') {
        return res.status(404).json({ success: false, message: 'Doctor not found or not approved' });
      }

      if (timeSlot.doctorId.toString() !== doctorId) {
        return res.status(400).json({ success: false, message: 'Invalid time slot for selected doctor' });
      }

      // Appointment data
      const appointmentData = {
        patientId: patient._id,
        doctorId: doctor._id,
        timeSlotId: timeSlot._id,
        date: timeSlot.date,
        timeSlot: { startTime: timeSlot.startTime, endTime: timeSlot.endTime },
        reason,
        consultationType: consultationType || 'video',
        status: APPOINTMENT_STATUS.PENDING,
        payment: { amount: doctor.consultationFee }
      };

      if (req.file) {
        appointmentData.medicalReport = {
          fileName: req.file.originalname,
          fileUrl: `/uploads/medical-reports/${req.file.filename}`,
          uploadedAt: new Date()
        };
      }

      const appointment = await Appointment.create(appointmentData);

      // Mark slot booked
      timeSlot.isBooked = true;
      timeSlot.appointmentId = appointment._id;
      await timeSlot.save();

      await appointment.populate([
        { path: 'patientId', populate: { path: 'userId', select: 'name email' } },
        { path: 'doctorId', populate: { path: 'userId', select: 'name email' } }
      ]);

      await emailService.sendNewAppointmentNotification(
        doctor.userId.email,
        {
          doctorName: doctor.userId.name,
          patientName: patient.userId.name,
          date: timeSlot.date,
          time: `${timeSlot.startTime} - ${timeSlot.endTime}`,
          reason,
          hasReport: !!req.file
        }
      );

      res.status(201).json({
        success: true,
        message: 'Appointment request sent to doctor for approval',
        appointment
      });

    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// ---------------- UPDATE STATUS ----------------
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const appointmentId = req.params.id;

    if (!status || !Object.values(APPOINTMENT_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = status;

    if (status === APPOINTMENT_STATUS.CONFIRMED) {
      appointment.chatEnabled = true;
      const chat = new Chat({
        appointment: appointment._id,
        participants: [appointment.doctorId.userId._id, appointment.patientId.userId._id],
        messages: [{
          sender: appointment.doctorId.userId._id,
          content: 'Your appointment has been confirmed. You can now chat with your doctor.',
          messageType: 'system'
        }]
      });
      await chat.save();

      await emailService.sendAppointmentConfirmation(
        appointment.patientId.userId.email,
        {
          patientName: appointment.patientId.userId.name,
          doctorName: appointment.doctorId.userId.name,
          date: appointment.date,
          time: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
          consultationType: appointment.consultationType
        }
      );
    } else if (status === APPOINTMENT_STATUS.CANCELLED && appointment.status === APPOINTMENT_STATUS.PENDING) {
      await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, { isBooked: false, appointmentId: null });
      await emailService.sendAppointmentRejection(
        appointment.patientId.userId.email,
        {
          patientName: appointment.patientId.userId.name,
          doctorName: appointment.doctorId.userId.name,
          date: appointment.date,
          time: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
          reason: rejectionReason || 'Doctor is not available'
        }
      );
    }

    await appointment.save();

    res.json({ success: true, message: `Appointment ${status} successfully`, appointment });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET SINGLE ----------------
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email avatar' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const hasAccess =
      req.user.role === 'admin' ||
      (patient && appointment.patientId._id.toString() === patient._id.toString()) ||
      (doctor && appointment.doctorId._id.toString() === doctor._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let chat = null;
    if (appointment.chatEnabled) {
      chat = await Chat.findOne({ appointment: appointment._id }).populate('messages.sender', 'name email avatar');
    }

    res.json({ success: true, appointment: { ...appointment.toObject(), chat } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET LIST ----------------
exports.getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const patient = await Patient.findOne({ userId: req.user._id });

    if (doctor) {
      query.doctorId = doctor._id;
    } else if (patient) {
      query.patientId = patient._id;
    } else {
      return res.status(403).json({ success: false, message: 'User profile not found' });
    }

    if (status && status !== 'all') query.status = status;
    if (date) {
      const startDate = new Date(date); startDate.setHours(0,0,0,0);
      const endDate = new Date(date); endDate.setHours(23,59,59,999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email avatar' } })
      .sort({ date: -1, 'timeSlot.startTime': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ success: true, appointments, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- START CONSULTATION (FIXED) ----------------
exports.startConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to start this consultation' });
    }

    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      return res.status(400).json({ success: false, message: 'Appointment must be confirmed before starting consultation' });
    }

    const meetingLink = `${process.env.CLIENT_URL}/video-call/${appointmentId}`;

    appointment.status = APPOINTMENT_STATUS.IN_PROGRESS;
    appointment.meetingLink = meetingLink;
    appointment.consultationStartedAt = new Date();
    await appointment.save();

    const chat = await Chat.findOne({ appointment: appointmentId });
    if (chat) {
      chat.messages.push({
        sender: doctor.userId._id,
        content: `Video consultation started! Join here: ${meetingLink}`,
        messageType: 'meeting-link'
      });
      await chat.save();
    }

    try {
      await emailService.sendConsultationStarted(
        appointment.patientId.userId.email,
        {
          patientName: appointment.patientId.userId.name,
          doctorName: appointment.doctorId.userId.name,
          meetingLink
        }
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Consultation started successfully',
      meetingLink,
      appointmentId,
      appointment
    });

  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- DOWNLOAD REPORT ----------------
exports.downloadMedicalReport = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment || !appointment.medicalReport) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const hasAccess =
      (patient && appointment.patientId.toString() === patient._id.toString()) ||
      (doctor && appointment.doctorId.toString() === doctor._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../..', appointment.medicalReport.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    res.download(filePath, appointment.medicalReport.fileName);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- CANCEL ----------------
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this appointment' });
    }

    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: 'Only pending appointments can be cancelled' });
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();

    await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, { isBooked: false, appointmentId: null });

    res.json({ success: true, message: 'Appointment cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
