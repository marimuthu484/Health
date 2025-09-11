// src/pages/Consultation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Video, Calendar, Clock, User, CheckCircle, AlertCircle, ArrowLeft, Upload, FileText, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { timeSlotService } from '../services/timeSlotService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import moment from 'moment';

const Consultation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [medicalReport, setMedicalReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (location.state?.doctorId) {
      const doctor = doctors.find(d => d._id === location.state.doctorId);
      if (doctor) setSelectedDoctor(doctor);
    }
  }, [location.state, doctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const response = await patientService.getDoctors();
      setDoctors(response.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    
    try {
      const response = await timeSlotService.getAvailableSlots(
        selectedDoctor._id,
        selectedDate
      );
      setAvailableSlots(response.slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setMedicalReport(file);
    setError('');
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('doctorId', selectedDoctor._id);
      formData.append('timeSlotId', selectedSlot._id);
      formData.append('reason', reason);
      formData.append('consultationType', consultationType);
      
      if (medicalReport) {
        formData.append('medicalReport', medicalReport);
      }

      const response = await appointmentService.createAppointment(formData);
      
      if (response.success) {
        setBookingSuccess(true);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Video className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Online Consultation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule an appointment with our expert doctors
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {bookingSuccess ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Appointment Request Sent!
              </h2>
              <p className="text-gray-600 mb-2">
                Your appointment request has been sent to the doctor for approval.
              </p>
              <p className="text-gray-500 text-sm">
                You will receive an email notification once the doctor responds.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Select Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Step 1: Select Doctor
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor._id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center ${
                        selectedDoctor?._id === doctor._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={doctor.userId?.avatar || `https://ui-avatars.com/api/?name=${doctor.userId?.name}`}
                        alt={doctor.userId?.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {doctor.userId?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {doctor.specialization} • {doctor.experience} years experience
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          ${doctor.consultationFee} per consultation
                        </p>
                      </div>
                      {selectedDoctor?._id === doctor._id && (
                        <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Date */}
              {selectedDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Step 2: Select Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={moment().format('YYYY-MM-DD')}
                    max={moment().add(30, 'days').format('YYYY-MM-DD')}
                  />
                </div>
              )}

              {/* Step 3: Select Time Slot */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Step 3: Select Time Slot
                  </label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No available slots for this date.</p>
                      <p className="text-gray-400 text-sm">Please select another date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                            selectedSlot?._id === slot._id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Consultation Details */}
              {selectedSlot && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Step 4: Consultation Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'video', label: 'Video Call' },
                        { value: 'audio', label: 'Audio Call' },
                        { value: 'chat', label: 'Chat Only' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setConsultationType(type.value)}
                          className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                            consultationType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Step 5: Reason for Consultation
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please describe your symptoms or reason for consultation..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Medical Report (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {medicalReport ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{medicalReport.name}</p>
                              <p className="text-sm text-gray-500">
                                {(medicalReport.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setMedicalReport(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center py-4 text-gray-500 hover:text-gray-700"
                        >
                          <Upload className="h-8 w-8 mb-2" />
                          <span className="text-sm">Upload Medical Report (PDF)</span>
                          <span className="text-xs text-gray-400 mt-1">Max size: 10MB</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                onClick={handleBooking}
                disabled={loading || !selectedDoctor || !selectedDate || !selectedSlot || !reason}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                {loading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        {selectedDoctor && selectedSlot && !bookingSuccess && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">Dr. {selectedDoctor.userId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Specialization:</span>
                <span className="font-medium">{selectedDoctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{moment(selectedDate).format('MMMM D, YYYY')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Type:</span>
                <span className="font-medium capitalize">{consultationType}</span>
              </div>
              {medicalReport && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Medical Report:</span>
                  <span className="font-medium">Attached</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-bold text-lg">${selectedDoctor.consultationFee}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
