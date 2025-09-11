const express = require('express');
const router = express.Router();
const {
  addTimeSlots,
  getDoctorTimeSlots,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableSlots
} = require('../controllers/timeSlotController');
const { protect } = require('../middleware/authMiddleware');
const { isDoctor, isPatient } = require('../middleware/roleMiddleware');

// Doctor routes
router.post('/add', protect, isDoctor, addTimeSlots);
router.get('/doctor', protect, isDoctor, getDoctorTimeSlots);
router.put('/:slotId', protect, isDoctor, updateTimeSlot);
router.delete('/:slotId', protect, isDoctor, deleteTimeSlot);

// Patient routes
router.get('/available', protect, getAvailableSlots);

module.exports = router;
