const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAppointments,
  getPatients,
  getTimeSlots,
  updateTimeSlots,
  getAvailableSlotsForDate
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { isDoctor } = require('../middleware/roleMiddleware');

// All routes require authentication and doctor role
router.use(protect, isDoctor);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/appointments', getAppointments);
router.get('/patients', getPatients);
router.get('/time-slots', getTimeSlots);
router.put('/time-slots', updateTimeSlots);

// Public route for getting available slots
router.get('/available-slots', protect, getAvailableSlotsForDate);

module.exports = router;
