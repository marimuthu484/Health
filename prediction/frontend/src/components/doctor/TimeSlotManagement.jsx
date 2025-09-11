import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { timeSlotService } from '../../services/timeSlotService';
import LoadingSpinner from '../common/LoadingSpinner';
import moment from 'moment';

const TimeSlotManagement = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlots, setNewSlots] = useState([{ startTime: '', endTime: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate]);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await timeSlotService.getDoctorTimeSlots({ date: selectedDate });
      setTimeSlots(response.timeSlots);
    } catch (error) {
      setError('Error fetching time slots');
    } finally {
      setLoading(false);
    }
  };

  const addSlotRow = () => {
    setNewSlots([...newSlots, { startTime: '', endTime: '' }]);
  };

  const removeSlotRow = (index) => {
    const updatedSlots = newSlots.filter((_, i) => i !== index);
    setNewSlots(updatedSlots);
  };

  const updateSlotRow = (index, field, value) => {
    const updatedSlots = [...newSlots];
    updatedSlots[index][field] = value;
    setNewSlots(updatedSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate slots
    const validSlots = newSlots.filter(slot => slot.startTime && slot.endTime);
    if (validSlots.length === 0) {
      setError('Please add at least one valid time slot');
      return;
    }

    // Check for invalid times
    for (const slot of validSlots) {
      if (slot.startTime >= slot.endTime) {
        setError('End time must be after start time');
        return;
      }
    }

    setLoading(true);
    try {
      await timeSlotService.addTimeSlots(selectedDate, validSlots);
      setSuccess('Time slots added successfully');
      setNewSlots([{ startTime: '', endTime: '' }]);
      fetchTimeSlots();
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding time slots');
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      await timeSlotService.deleteTimeSlot(slotId);
      fetchTimeSlots();
      setSuccess('Time slot deleted successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting time slot');
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Time Slot Management</h2>
        <p className="text-gray-600">Add your available time slots for each date</p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={moment().format('YYYY-MM-DD')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {selectedDate && (
        <>
          {/* Add New Slots */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Time Slots for {moment(selectedDate).format('MMMM D, YYYY')}
            </h3>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {newSlots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <select
                    value={slot.startTime}
                    onChange={(e) => updateSlotRow(index, 'startTime', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Start Time</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>

                  <span className="text-gray-500">to</span>

                  <select
                    value={slot.endTime}
                    onChange={(e) => updateSlotRow(index, 'endTime', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">End Time</option>
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeSlotRow(index)}
                    className="text-red-600 hover:text-red-700"
                    disabled={newSlots.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={addSlotRow}
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another Slot
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:bg-gray-400"
                >
                  {loading ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Slots
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Slots */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : timeSlots.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Existing Time Slots
              </h3>

              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      {slot.isBooked && (
                        <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Booked
                        </span>
                      )}
                    </div>
                    
                    {!slot.isBooked && (
                      <button
                        onClick={() => deleteTimeSlot(slot._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimeSlotManagement;
