// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Activity, FileText, Calendar, Download, Eye, Trash2, Plus } from 'lucide-react';
import ConsultationNotification from '../components/patient/ConsultationNotification';
import AppointmentDetail from '../shared/AppointmentDetail';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { formatters } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const healthReports = [
    {
      id: 1,
      type: 'Heart Disease',
      riskLevel: 'Low',
      riskScore: 25,
      date: '2025-01-15',
      status: 'Completed',
      recommendations: 4
    },
    {
      id: 2,
      type: 'Liver Disease',
      riskLevel: 'Medium',
      riskScore: 55,
      date: '2025-01-10',
      status: 'Completed',
      recommendations: 6
    }
  ];

  const prescriptions = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      medication: 'Lisinopril 10mg',
      dosage: 'Once daily',
      date: '2025-01-15',
      refills: 2
    }
  ];

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await patientService.getAppointments();
      setAppointments(response.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await appointmentService.cancelAppointment(appointmentId);
        if (response.success) {
          alert('Appointment cancelled successfully');
          fetchAppointments();
        }
      } catch (error) {
        alert('Error cancelling appointment: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'in-progress':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAppointmentClick = async (appointment) => {
    try {
      // Fetch full appointment details with chat status
      const response = await appointmentService.getAppointment(appointment._id);
      setSelectedAppointment(response.appointment);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      // If error, still show with basic info
      setSelectedAppointment(appointment);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your health reports, appointments, and prescriptions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Health Reports</p>
                <p className="text-2xl font-bold text-gray-900">{healthReports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">Low</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'reports', label: 'Health Reports', icon: FileText },
                { id: 'prescriptions', label: 'Prescriptions', icon: Heart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
                  <button 
                    onClick={() => navigate('/consultation')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="large" />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div 
                        key={appointment._id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.doctorId?.userId?.name || 'Doctor'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.doctorId?.specialization}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.reason}
                              </p>
                              {appointment.chatEnabled && (
                                <p className="text-xs text-blue-600 mt-1">
                                  💬 Chat available
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatters.date(appointment.date)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            {appointment.status === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAppointment(appointment._id);
                                }}
                                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium block ml-auto"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Health Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Health Reports</h2>
                  <button 
                    onClick={() => navigate('/heart-prediction')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Assessment</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {healthReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${report.type === 'Heart Disease' ? 'bg-red-100' : 'bg-green-100'}`}>
                            {report.type === 'Heart Disease' ? (
                              <Heart className="h-5 w-5 text-red-600" />
                            ) : (
                              <Activity className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{report.type} Assessment</h3>
                            <p className="text-sm text-gray-600">Generated on {report.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(report.riskLevel)}`}>
                              {report.riskLevel} Risk
                            </span>
                            <p className="text-sm text-gray-600 mt-1">{report.recommendations} recommendations</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Prescriptions</h2>

                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{prescription.medication}</h3>
                            <p className="text-sm text-gray-600">Prescribed by {prescription.doctor}</p>
                            <p className="text-sm text-gray-600">{prescription.dosage}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{prescription.date}</p>
                          <p className="text-sm text-gray-600">{prescription.refills} refills remaining</p>
                          <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Request Refill
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          userRole="patient"
        />
      )}
      
      {/* Consultation Notification Component */}
      <ConsultationNotification />
    </div>
  );
};

export default Dashboard;
