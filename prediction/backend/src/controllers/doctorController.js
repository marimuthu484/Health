const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { USER_ROLES, APPOINTMENT_STATUS } = require('../config/constants');

// Get doctor profile
exports.getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update doctor profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'phone',
      'clinicAddress',
      'consultationFee',
      'availableSlots',
      'about',
      'availableTimings'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor's appointments with all filters
exports.getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }
    
    const { status, date } = req.query;
    const query = { doctorId: doctor._id };

    // Status filter (independent of date)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Optional date filter
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

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
          select: 'name email'
        }
      })
      .sort({ date: -1, 'timeSlot.startTime': 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor's patients
exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get unique patient IDs from appointments
    const appointments = await Appointment.find({ 
      doctorId: doctor._id,
      status: { $in: ['completed', 'confirmed', 'in-progress'] }
    }).distinct('patientId');

    const patients = await Patient.find({
      _id: { $in: appointments }
    }).populate('userId', 'name email avatar');

    res.json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get time slots
exports.getTimeSlots = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      timeSlots: doctor.availableSlots || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update time slots
exports.updateTimeSlots = async (req, res) => {
  try {
    const { timeSlots } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Validate time slots
    for (const daySlot of timeSlots) {
      if (!Number.isInteger(daySlot.dayOfWeek) || daySlot.dayOfWeek < 0 || daySlot.dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day of week'
        });
      }

      for (const slot of daySlot.slots) {
        if (!slot.startTime || !slot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'Start time and end time are required for all slots'
          });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid time format. Use HH:MM format'
          });
        }

        // Ensure start time is before end time
        if (slot.startTime >= slot.endTime) {
          return res.status(400).json({
            success: false,
            message: 'End time must be after start time'
          });
        }
      }
    }

    doctor.availableSlots = timeSlots;
    await doctor.save();

    res.json({
      success: true,
      message: 'Time slots updated successfully',
      timeSlots: doctor.availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available slots for a specific date
exports.getAvailableSlotsForDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Get doctor's available slots for this day
    const daySlots = doctor.availableSlots.find(slot => slot.dayOfWeek === dayOfWeek);
    
    if (!daySlots || !daySlots.slots.length) {
      return res.json({
        success: true,
        availableSlots: []
      });
    }

    // Get booked appointments for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] }
    });

    // Filter out booked slots
    const availableSlots = daySlots.slots.filter(slot => {
      if (!slot.isActive) return false;
      
      const isBooked = bookedAppointments.some(apt => 
        apt.timeSlot.startTime === slot.startTime
      );
      
      return !isBooked;
    });

    res.json({
      success: true,
      availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor statistics
exports.getDoctorStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get various statistics
    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPatients
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id }),
      Appointment.countDocuments({ 
        doctorId: doctor._id,
        date: { $gte: today, $lt: tomorrow }
      }),
      Appointment.countDocuments({ 
        doctorId: doctor._id,
        status: APPOINTMENT_STATUS.PENDING
      }),
      Appointment.countDocuments({ 
        doctorId: doctor._id,
        status: APPOINTMENT_STATUS.COMPLETED
      }),
      Appointment.countDocuments({ 
        doctorId: doctor._id,
        status: APPOINTMENT_STATUS.CANCELLED
      }),
      Appointment.distinct('patientId', { doctorId: doctor._id }).then(ids => ids.length)
    ]);

    res.json({
      success: true,
      stats: {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        totalPatients,
        rating: doctor.rating || 0,
        totalReviews: doctor.totalReviews || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search patients
exports.searchPatients = async (req, res) => {
  try {
    const { search } = req.query;
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Get patient IDs from doctor's appointments
    const appointments = await Appointment.find({ 
      doctorId: doctor._id,
      status: { $nin: ['cancelled'] }
    }).distinct('patientId');

    // Search patients
    const searchQuery = {
      _id: { $in: appointments }
    };

    if (search) {
      searchQuery.$or = [
        { 'userId.name': new RegExp(search, 'i') },
        { 'userId.email': new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const patients = await Patient.find(searchQuery)
      .populate('userId', 'name email avatar')
      .limit(20);

    res.json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient medical history (for doctor's view)
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Verify doctor has treated this patient
    const hasAppointment = await Appointment.findOne({
      doctorId: doctor._id,
      patientId: patientId,
      status: { $nin: ['cancelled'] }
    });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this patient\'s records'
      });
    }

    // Get patient details with medical history
    const patient = await Patient.findById(patientId)
      .populate('userId', 'name email avatar')
      .select('+medicalHistory +allergies +currentMedications +medicalReports');

    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({
      doctorId: doctor._id,
      patientId: patientId
    }).sort('-date');

    res.json({
      success: true,
      patient,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
