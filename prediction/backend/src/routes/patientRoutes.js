const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDoctors,
  getAppointments,
  uploadMedicalReport,
  getMedicalReports,
  deleteMedicalReport
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { isPatient } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

// All routes require authentication and patient role
router.use(protect, isPatient);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/doctors', getDoctors);
router.get('/appointments', getAppointments);

// Medical reports
router.get('/medical-reports', getMedicalReports);
router.post('/medical-reports', upload.single('report'), uploadMedicalReport);
router.delete('/medical-reports/:reportId', deleteMedicalReport);

module.exports = router;
