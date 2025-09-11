const express = require('express');
const router = express.Router();
const {
  getChat,
  sendMessage,
  markAsRead,
  downloadAttachment
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/:appointmentId', getChat);
router.post('/:appointmentId/messages', sendMessage);
router.put('/:appointmentId/read', markAsRead);
router.get('/:appointmentId/messages/:messageId/attachments/:attachmentIndex/download', downloadAttachment);

module.exports = router;
