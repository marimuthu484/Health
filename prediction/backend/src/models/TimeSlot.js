const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, {
  timestamps: true
});

// Index for efficient queries
timeSlotSchema.index({ doctorId: 1, date: 1 });
timeSlotSchema.index({ doctorId: 1, date: 1, isBooked: 1 });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
