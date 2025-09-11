const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const pdfService = require('../services/pdfService');

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const { consultationId, medications, diagnosis, additionalNotes } = req.body;

    // Verify consultation exists
    const consultation = await Consultation.findById(consultationId)
      .populate('appointmentId');
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    // Get doctor info
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    // Create prescription
    const prescription = await Prescription.create({
      consultationId,
      doctorId: doctor._id,
      patientId: consultation.appointmentId.patientId,
      medications,
      diagnosis,
      additionalNotes,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Generate PDF
    const pdfUrl = await pdfService.generatePrescriptionPDF(prescription);
    prescription.pdfUrl = pdfUrl;
    await prescription.save();

    // Update consultation
    consultation.prescriptionId = prescription._id;
    await consultation.save();

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get prescription
exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId')
      .populate('consultationId');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient prescriptions
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      patientId: req.params.patientId,
      isActive: true 
    })
    .populate('doctorId')
    .sort('-createdAt');

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
