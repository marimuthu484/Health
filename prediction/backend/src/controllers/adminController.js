const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const { DOCTOR_STATUS, USER_ROLES } = require('../config/constants');
const emailService = require('../services/emailService');

// Get all pending doctors
exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: DOCTOR_STATUS.PENDING })
      .populate('userId', 'name email createdAt');

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all doctors with filters
exports.getAllDoctors = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email createdAt')
      .sort('-createdAt');

    res.json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve doctor
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.status !== DOCTOR_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not in pending status'
      });
    }

    doctor.status = DOCTOR_STATUS.APPROVED;
    doctor.approvedBy = req.user._id;
    doctor.approvedAt = Date.now();
    await doctor.save();

    // Send approval email
    await emailService.sendDoctorApprovalEmail(doctor.userId.email, doctor.userId.name);

    res.json({
      success: true,
      message: 'Doctor approved successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reject doctor
exports.rejectDoctor = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.status !== DOCTOR_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not in pending status'
      });
    }

    doctor.status = DOCTOR_STATUS.REJECTED;
    doctor.rejectionReason = reason;
    doctor.rejectedAt = Date.now();
    await doctor.save();

    // Send rejection email
    await emailService.sendDoctorRejectionEmail(doctor.userId.email, doctor.userId.name, reason);

    res.json({
      success: true,
      message: 'Doctor rejected',
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalDoctors,
      pendingDoctors,
      approvedDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ status: DOCTOR_STATUS.PENDING }),
      Doctor.countDocuments({ status: DOCTOR_STATUS.APPROVED }),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalDoctors,
        pendingDoctors,
        approvedDoctors,
        totalPatients,
        totalAppointments,
        todayAppointments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
