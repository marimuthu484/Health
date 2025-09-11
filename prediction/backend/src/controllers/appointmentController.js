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

// Create appointment with optional medical report
exports.createAppointment = async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { doctorId, timeSlotId, reason, consultationType } = req.body;

      // Get patient info
      const patient = await Patient.findOne({ userId: req.user._id })
        .populate('userId', 'name email');
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient profile not found'
        });
      }

      // Verify time slot
      const timeSlot = await TimeSlot.findById(timeSlotId);
      if (!timeSlot || timeSlot.isBooked) {
        return res.status(400).json({
          success: false,
          message: 'Time slot not available'
        });
      }

      // Verify doctor
      const doctor = await Doctor.findById(doctorId)
        .populate('userId', 'name email');
      
      if (!doctor || doctor.status !== 'approved') {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found or not approved'
        });
      }

      // Verify time slot belongs to doctor
      if (timeSlot.doctorId.toString() !== doctorId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time slot for selected doctor'
        });
      }

      // Create appointment data
      const appointmentData = {
        patientId: patient._id,
        doctorId: doctor._id,
        timeSlotId: timeSlot._id,
        date: timeSlot.date,
        timeSlot: {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        },
        reason,
        consultationType: consultationType || 'video',
        status: APPOINTMENT_STATUS.PENDING,
        payment: {
          amount: doctor.consultationFee
        }
      };

      // Add medical report if uploaded
      if (req.file) {
        appointmentData.medicalReport = {
          fileName: req.file.originalname,
          fileUrl: `/uploads/medical-reports/${req.file.filename}`,
          uploadedAt: new Date()
        };
      }

      // Create appointment
      const appointment = await Appointment.create(appointmentData);

      // Mark time slot as booked
      timeSlot.isBooked = true;
      timeSlot.appointmentId = appointment._id;
      await timeSlot.save();

      // Populate appointment for response
      await appointment.populate([
        {
          path: 'patientId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        },
        {
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        }
      ]);

      // Send notification email to doctor
      await emailService.sendNewAppointmentNotification(
        doctor.userId.email,
        {
          doctorName: doctor.userId.name,
          patientName: patient.userId.name,
          date: timeSlot.date,
          time: `${timeSlot.startTime} - ${timeSlot.endTime}`,
          reason: reason,
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
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// Update appointment status (approve/reject)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const appointmentId = req.params.id;

    if (!status || !Object.values(APPOINTMENT_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    // Find appointment with all relations
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor authorization
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this appointment'
      });
    }

    // Update appointment status
    appointment.status = status;
    
    // Handle approval
    if (status === APPOINTMENT_STATUS.CONFIRMED) {
      appointment.chatEnabled = true;
      
      // Create chat room
      const chat = new Chat({
        appointment: appointment._id,
        participants: [
          appointment.doctorId.userId._id,
          appointment.patientId.userId._id
        ],
        messages: [{
          sender: appointment.doctorId.userId._id,
          content: 'Your appointment has been confirmed. You can now chat with your doctor.',
          messageType: 'system'
        }]
      });
      await chat.save();

      // Send confirmation email
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
    }
    
    // Handle rejection
    else if (status === APPOINTMENT_STATUS.CANCELLED && appointment.status === APPOINTMENT_STATUS.PENDING) {
      // Free up the time slot
      await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, {
        isBooked: false,
        appointmentId: null
      });

      // Send rejection email
      await emailService.sendAppointmentRejection(
        appointment.patientId.userId.email,
        {
          patientName: appointment.patientId.userId.name,
          doctorName: appointment.doctorId.userId.name,
          date: appointment.date,
          time: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
          reason: rejectionReason || 'Doctor is not available at this time'
        }
      );
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointment details
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check access permission
    const patient = await Patient.findOne({ userId: req.user._id });
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const hasAccess = 
      req.user.role === 'admin' ||
      (patient && appointment.patientId._id.toString() === patient._id.toString()) ||
      (doctor && appointment.doctorId._id.toString() === doctor._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get chat if exists
    let chat = null;
    if (appointment.chatEnabled) {
      chat = await Chat.findOne({ appointment: appointment._id })
        .populate('messages.sender', 'name email avatar');
    }

    res.json({
      success: true,
      appointment: {
        ...appointment.toObject(),
        chat: chat
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointments with filters
exports.getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    // Get user profile
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const patient = await Patient.findOne({ userId: req.user._id });

    if (doctor) {
      query.doctorId = doctor._id;
    } else if (patient) {
      query.patientId = patient._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Apply status filter (independent of date)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Apply date filter (optional)
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .sort({ date: -1, 'timeSlot.startTime': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Start consultation
exports.startConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify doctor authorization
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to start this consultation'
      });
    }

    // Check appointment status
    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      return res.status(400).json({
        success: false,
        message: 'Appointment must be confirmed before starting consultation'
      });
    }

    // Generate meeting link
    const meetingId = `healthpredict-${appointmentId}-${Date.now()}`;
    const meetingLink = `${process.env.CLIENT_URL}/video-call/${meetingId}`;

    // Update appointment
    appointment.status = APPOINTMENT_STATUS.IN_PROGRESS;
    appointment.meetingLink = meetingLink;
    appointment.consultationStartedAt = new Date();
    await appointment.save();

    // Send meeting link in chat
    const chat = await Chat.findOne({ appointment: appointmentId });
    if (chat) {
      chat.messages.push({
        sender: doctor.userId._id,
        content: `Video consultation started! Join here: ${meetingLink}`,
        messageType: 'meeting-link'
      });
      await chat.save();
    }

    // Send email with meeting link
    await emailService.sendConsultationStarted(
      appointment.patientId.userId.email,
      {
        patientName: appointment.patientId.userId.name,
        doctorName: appointment.doctorId.userId.name,
        meetingLink: meetingLink
      }
    );

    res.json({
      success: true,
      message: 'Consultation started successfully',
      meetingLink,
      appointment
    });

  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Download medical report
exports.downloadMedicalReport = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment || !appointment.medicalReport) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found'
      });
    }

    // Verify access
    const patient = await Patient.findOne({ userId: req.user._id });
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const hasAccess = 
      (patient && appointment.patientId.toString() === patient._id.toString()) ||
      (doctor && appointment.doctorId.toString() === doctor._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filePath = path.join(__dirname, '../..', appointment.medicalReport.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, appointment.medicalReport.fileName);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
