const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { DOCTOR_STATUS } = require('../config/constants');

// Get patient profile
exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update patient profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'phone',
      'address',
      'dateOfBirth',
      'gender',
      'bloodGroup',
      'emergencyContact',
      'allergies',
      'currentMedications',
      'height',
      'weight'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available doctors
exports.getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const query = { status: DOCTOR_STATUS.APPROVED };

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    let doctors = await Doctor.find(query)
      .populate('userId', 'name email avatar');

    // Additional search by name if search term provided
    if (search) {
      doctors = doctors.filter(doctor => 
        doctor.userId?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

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

// Get patient's appointments
exports.getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }
    
    const { status } = req.query;
    const query = { patientId: patient._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        }
      })
      .sort({ date: -1, 'timeSlot.startTime': -1 });

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

// Upload medical report
exports.uploadMedicalReport = async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const report = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/reports/${req.file.filename}`,
      uploadedAt: new Date(),
      description: description || ''
    };

    patient.medicalReports = patient.medicalReports || [];
    patient.medicalReports.push(report);
    await patient.save();

    res.json({
      success: true,
      message: 'Medical report uploaded successfully',
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get medical reports
exports.getMedicalReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      reports: patient.medicalReports || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete medical report
exports.deleteMedicalReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    patient.medicalReports = (patient.medicalReports || []).filter(
      report => report._id.toString() !== reportId
    );
    
    await patient.save();

    res.json({
      success: true,
      message: 'Medical report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
