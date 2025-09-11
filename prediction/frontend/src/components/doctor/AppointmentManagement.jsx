// src/components/doctor/AppointmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Video, Check, X, Eye, MessageSquare, Filter, FileText } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { consultationService } from '../../services/consultationService';
import { appointmentService } from '../../services/appointmentService';
import { formatters } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';
import AppointmentDetail from '../../shared/AppointmentDetail';
import moment from 'moment';

const AppointmentCard = ({ appointment, onAction, onViewDetails, onStartCall }) => {
  const [starting, setStarting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    await onAction(appointment._id, action);
    setActionLoading(false);
  };

  const handleStartCall = async () => {
    setStarting(true);
    await onStartCall(appointment._id);
    setStarting(false);
  };

  const patientName = appointment.patientId?.userId?.name || 'Unknown Patient';
  const patientAvatar = appointment.patientId?.userId?.avatar || 
    `https://ui-avatars.com/api/?name=${patientName}`;

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(appointment)}
    >
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start space-x-4 mb-4 xl:mb-0 flex-1">
          <img
            src={patientAvatar}
            alt={patientName}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {patientName}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{moment(appointment.date).format('MMM D, YYYY')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 flex-shrink-0" />
                <span className="capitalize">{appointment.consultationType || 'Video'} Consultation</span>
              </div>
            </div>

            <div className="mb-2">
              <span className="text-sm font-medium text-gray-900">Reason: </span>
              <span className="text-sm text-gray-700">{appointment.reason}</span>
            </div>

            {appointment.medicalReport && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <FileText className="h-4 w-4" />
                <span>Medical report attached</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row xl:flex-col space-y-2 sm:space-y-0 sm:space-x-3 xl:space-x-0 xl:space-y-2 xl:w-48" 
          onClick={(e) => e.stopPropagation()}>
          {appointment.status === 'pending' && (
            <>
              <button 
                onClick={() => handleAction('confirmed')} 
                disabled={actionLoading}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actionLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => handleAction('cancelled')} 
                disabled={actionLoading}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {actionLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </>
                )}
              </button>
            </>
          )}
          {(appointment.status === 'confirmed' || appointment.status === 'in-progress') && (
            <button 
              onClick={handleStartCall}
              disabled={starting}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {starting ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  <span>{appointment.status === 'in-progress' ? 'Join Call' : 'Start Call'}</span>
                </>
              )}
            </button>
          )}
          {appointment.chatEnabled && (
            <button 
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>View Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, selectedDate, currentPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (selectedDate) {
        params.date = selectedDate;
      }
      
      const response = await appointmentService.getAppointments(params);
      setAppointments(response.appointments || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (id, status) => {
    let rejectionReason;
    if (status === 'cancelled') {
      rejectionReason = prompt('Please provide a reason for rejection:');
      if (!rejectionReason) return;
    }

    try {
      const response = await appointmentService.updateAppointmentStatus(id, status, rejectionReason);
      
      if (response.success) {
        alert(response.message);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(error.response?.data?.message || 'Error updating appointment');
    }
  };

  const startVideoCall = async (appointmentId) => {
  try {
    const response = await appointmentService.startConsultation(appointmentId);
    
    if (response.success) {
      // Open in new tab with the appointmentId from response
      const videoCallUrl = `/video-call/${response.appointmentId || appointmentId}`;
      window.open(videoCallUrl, '_blank');
      
      // Refresh appointments to update status
      fetchAppointments();
    }
  } catch (error) {
    console.error('Error starting consultation:', error);
    
    // More detailed error message
    const errorMessage = error.response?.data?.message || 'Error starting video consultation';
    alert(errorMessage);
  }
};


  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending Approval</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter (Optional)
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="All dates"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setSelectedDate('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {statusFilter !== 'all' 
              ? `No ${statusFilter.replace('-', ' ')} appointments`
              : selectedDate 
              ? 'No appointments on selected date' 
              : 'No appointments scheduled'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              onAction={handleAppointmentAction}
              onViewDetails={(appointment) => setSelectedAppointment(appointment)}
              onStartCall={startVideoCall}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-500 border-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          userRole="doctor"
          onUpdate={fetchAppointments}
        />
      )}
    </div>
  );
};

export default AppointmentManagement;
