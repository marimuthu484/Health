const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescription,
  getPatientPrescriptions
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { isDoctor } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/create', isDoctor, createPrescription);
router.get('/:id', getPrescription);
router.get('/patient/:patientId', getPatientPrescriptions);

module.exports = router;
