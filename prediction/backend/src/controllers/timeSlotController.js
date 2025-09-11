// src/controllers/timeSlotController.js
const TimeSlot = require('../models/TimeSlot');
const Doctor = require('../models/Doctor');
const moment = require('moment');

// Add time slots for a specific date
exports.addTimeSlots = async (req, res) => {
  try {
    const { date, slots } = req.body;

    // Verify doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Validate date
    const slotDate = moment(date);
    if (!slotDate.isValid() || slotDate.isBefore(moment().startOf('day'))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date or date is in the past'
      });
    }

    // Validate and create slots
    const createdSlots = [];
    for (const slot of slots) {
      const { startTime, endTime } = slot;

      // Validate time format
      if (!moment(startTime, 'HH:mm', true).isValid() || 
          !moment(endTime, 'HH:mm', true).isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Use HH:mm format'
        });
      }

      // Check if start time is before end time
      const start = moment(`${date} ${startTime}`);
      const end = moment(`${date} ${endTime}`);
      
      if (start.isSameOrAfter(end)) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }

      // Check for overlapping slots
      const overlappingSlot = await TimeSlot.findOne({
        doctorId: doctor._id,
        date: slotDate.toDate(),
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (overlappingSlot) {
        return res.status(400).json({
          success: false,
          message: `Time slot ${startTime}-${endTime} overlaps with existing slot`
        });
      }

      // Create time slot
      const newSlot = await TimeSlot.create({
        doctorId: doctor._id,
        date: slotDate.toDate(),
        startTime,
        endTime
      });

      createdSlots.push(newSlot);
    }

    res.status(201).json({
      success: true,
      message: `${createdSlots.length} time slots added successfully`,
      slots: createdSlots
    });

  } catch (error) {
    console.error('Error adding time slots:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get doctor's time slots
exports.getDoctorTimeSlots = async (req, res) => {
  try {
    const { doctorId, date, available } = req.query;

    // Build query
    const query = {};
    
    if (doctorId) {
      query.doctorId = doctorId;
    } else {
      // Get logged-in doctor's slots
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }
      query.doctorId = doctor._id;
    }

    // Filter by date if provided
    if (date) {
      const startDate = moment(date).startOf('day').toDate();
      const endDate = moment(date).endOf('day').toDate();
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default to future dates only
      query.date = { $gte: moment().startOf('day').toDate() };
    }

    // Filter by availability
    if (available === 'true') {
      query.isBooked = false;
    }

    const timeSlots = await TimeSlot.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('appointmentId', 'patientId status');

    res.json({
      success: true,
      count: timeSlots.length,
      timeSlots
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update time slot
exports.updateTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime } = req.body;

    const timeSlot = await TimeSlot.findById(slotId);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Verify doctor ownership
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || timeSlot.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this time slot'
      });
    }

    // Cannot update if booked
    if (timeSlot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update booked time slot'
      });
    }

    // Update slot
    if (startTime) timeSlot.startTime = startTime;
    if (endTime) timeSlot.endTime = endTime;
    
    await timeSlot.save();

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      timeSlot
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete time slot
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const timeSlot = await TimeSlot.findById(slotId);
    
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Verify doctor ownership
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || timeSlot.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this time slot'
      });
    }

    // Cannot delete if booked
    if (timeSlot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete booked time slot'
      });
    }

    await timeSlot.deleteOne();

    res.json({
      success: true,
      message: 'Time slot deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get available slots for patient booking
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    const startDate = moment(date).startOf('day').toDate();
    const endDate = moment(date).endOf('day').toDate();

    // Remove the time comparison for future dates
    const query = {
      doctorId,
      date: { $gte: startDate, $lte: endDate },
      isBooked: false
    };

    // Only filter by current time if it's today
    const availableSlots = await TimeSlot.find(query).sort({ startTime: 1 });

    // Filter out past slots only for today
    const filteredSlots = availableSlots.filter(slot => {
      if (moment(date).isSame(moment(), 'day')) {
        // For today, filter out past time slots
        const slotTime = moment(`${moment(date).format('YYYY-MM-DD')} ${slot.startTime}`);
        return slotTime.isAfter(moment());
      }
      // For future dates, show all slots
      return true;
    });

    res.json({
      success: true,
      count: filteredSlots.length,
      slots: filteredSlots
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
