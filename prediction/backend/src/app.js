require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// 🔹 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 🔹 Log every request (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// 🔹 Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🔹 Attach Socket.IO instance to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔹 Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/time-slots', timeSlotRoutes);

// 🔹 Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 🔹 Error handler (must be last middleware)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 🔹 Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-appointment', (appointmentId) => {
    socket.join(`appointment-${appointmentId}`);
    console.log(`User joined appointment room: ${appointmentId}`);
  });

  socket.on('leave-appointment', (appointmentId) => {
    socket.leave(`appointment-${appointmentId}`);
    console.log(`User left appointment room: ${appointmentId}`);
  });

  socket.on('send-message', (data) => {
    io.to(`appointment-${data.appointmentId}`).emit('new-message', data.message);
  });

  socket.on('typing', (data) => {
    socket.to(`appointment-${data.appointmentId}`).emit('user-typing', {
      userId: data.userId,   
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

module.exports = { app, server, io };