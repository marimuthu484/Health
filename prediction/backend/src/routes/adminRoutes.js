const express = require('express');
const router = express.Router();
const {
  getPendingDoctors,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  getDashboardStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All routes require authentication and admin role
router.use(protect, isAdmin);

router.get('/dashboard/stats', getDashboardStats);
router.get('/doctors', getAllDoctors);
router.get('/doctors/pending', getPendingDoctors);
router.post('/doctors/:id/approve', approveDoctor);
router.post('/doctors/:id/reject', rejectDoctor);

module.exports = router;
