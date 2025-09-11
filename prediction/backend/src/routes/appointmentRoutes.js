// src/routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointment,
  getAppointments,
  updateAppointmentStatus,
  startConsultation,
  downloadMedicalReport,
  cancelAppointment  // Add this
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { isPatient, isDoctor } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// Patient routes
router.post('/create', isPatient, createAppointment);
router.put('/:id/cancel', isPatient, cancelAppointment);  // Add this

// Doctor routes
router.put('/:id/status', isDoctor, updateAppointmentStatus);
router.post('/start-consultation', isDoctor, startConsultation);

// Shared routes
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.get('/:appointmentId/medical-report/download', downloadMedicalReport);

module.exports = router;
