const express = require('express');
const router = express.Router();
const {
  startConsultation,
  endConsultation,
  getConsultation,
  getActiveConsultation
} = require('../controllers/consultationController');
const { protect } = require('../middleware/authMiddleware');
const { isDoctor, isPatient } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/start', isDoctor, startConsultation);
router.get('/active', isPatient, getActiveConsultation);
router.put('/:consultationId/end', isDoctor, endConsultation);
router.get('/:id', getConsultation);

module.exports = router;
