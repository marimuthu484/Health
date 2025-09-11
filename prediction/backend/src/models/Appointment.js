const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../config/constants');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: Object.values(APPOINTMENT_STATUS),
    default: APPOINTMENT_STATUS.PENDING
  },
  reason: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video'
  },
  medicalReport: {
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  },
  notes: String,
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  payment: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  meetingLink: String,
  chatEnabled: {
    type: Boolean,
    default: false
  },
  consultationStartedAt: Date,
  consultationEndedAt: Date
}, {
  timestamps: true
});

// Enable chat when appointment is confirmed
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === APPOINTMENT_STATUS.CONFIRMED) {
    this.chatEnabled = true;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
