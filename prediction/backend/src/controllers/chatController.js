const Chat = require('../models/Chat');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for chat file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/chat-files');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mov|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: images, PDF, videos'));
    }
  }
}).single('attachment');

// Get chat messages
exports.getChat = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access
    const hasAccess = 
      appointment.patientId.userId.toString() === req.user._id.toString() ||
      appointment.doctorId.userId.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if chat is enabled
    if (!appointment.chatEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Chat is not available for this appointment'
      });
    }

    // Get or create chat
    let chat = await Chat.findOne({ appointment: appointmentId })
      .populate('participants', 'name email avatar')
      .populate('messages.sender', 'name email avatar');

    if (!chat) {
      chat = await Chat.create({
        appointment: appointmentId,
        participants: [
          appointment.patientId.userId,
          appointment.doctorId.userId
        ],
        messages: []
      });
      await chat.populate('participants', 'name email avatar');
    }

    res.json({
      success: true,
      chat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send message (text or file)
exports.sendMessage = async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { appointmentId } = req.params;
      const { content } = req.body;

      // Validate input
      if (!content && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'Message content or file is required'
        });
      }

      // Find chat
      const chat = await Chat.findOne({ appointment: appointmentId });
      
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
      }

      // Verify sender is participant
      const isParticipant = chat.participants.some(
        p => p.toString() === req.user._id.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message: 'You are not a participant in this chat'
        });
      }

      // Create message
      const message = {
        sender: req.user._id,
        content: content || '',
        messageType: req.file ? 'file' : 'text',
        readBy: [{
          user: req.user._id,
          readAt: new Date()
        }]
      };

      // Add file attachment if uploaded
      if (req.file) {
        const fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                        req.file.mimetype === 'application/pdf' ? 'pdf' :
                        req.file.mimetype.startsWith('video/') ? 'video' : 'other';

        message.attachments = [{
          fileName: req.file.originalname,
          fileUrl: `/uploads/chat-files/${req.file.filename}`,
          fileType: fileType,
          fileSize: req.file.size
        }];
      }

      chat.messages.push(message);
      await chat.save();

      // Populate sender info for response
      await chat.populate('messages.sender', 'name email avatar');
      const newMessage = chat.messages[chat.messages.length - 1];

      // Emit socket event if socket.io is implemented
      // io.to(appointmentId).emit('new-message', newMessage);

      res.json({
        success: true,
        message: newMessage
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const chat = await Chat.findOne({ appointment: appointmentId });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Update read status for all messages
    let updatedCount = 0;
    chat.messages.forEach(message => {
      const hasRead = message.readBy.some(
        r => r.user.toString() === req.user._id.toString()
      );

            if (!hasRead && message.sender.toString() !== req.user._id.toString()) {
        message.readBy.push({
          user: req.user._id,
          readAt: new Date()
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await chat.save();
    }

    res.json({
      success: true,
      message: `${updatedCount} messages marked as read`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Download chat attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { appointmentId, messageId, attachmentIndex } = req.params;

    // Find chat
    const chat = await Chat.findOne({ appointment: appointmentId });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    const isParticipant = chat.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find message
    const message = chat.messages.id(messageId);
    if (!message || !message.attachments || !message.attachments[attachmentIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    const attachment = message.attachments[attachmentIndex];
    const filePath = path.join(__dirname, '../..', attachment.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, attachment.fileName);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
