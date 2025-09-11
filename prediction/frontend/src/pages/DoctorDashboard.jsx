// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AppointmentManagement from '../components/doctor/AppointmentManagement';
import VideoConsultation from '../components/doctor/VideoConsultation';
import PatientManagement from '../components/doctor/PatientManagement';
import PrescriptionManagement from '../components/doctor/PrescriptionManagement';
import DoctorProfile from '../components/doctor/DoctorProfile';
import TimeSlotManagement from '../components/doctor/TimeSlotManagement';
import { Users, Calendar, Video, FileText, User, Bell, Settings, Clock } from 'lucide-react';
import { doctorService } from '../services/doctorService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    activePatients: 0,
    totalPrescriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await doctorService.getAppointments({ date: today });
      const allAppointmentsResponse = await doctorService.getAppointments({ status: 'pending' });
      
      // Fetch all patients
      const patientsResponse = await doctorService.getPatients();
      
      setStats({
        todayAppointments: appointmentsResponse.appointments.length,
        pendingAppointments: allAppointmentsResponse.appointments.length,
        activePatients: patientsResponse.patients.length,
        totalPrescriptions: 24 // This would come from prescriptions endpoint
      });

      // Set notifications for pending appointments
      if (allAppointmentsResponse.appointments.length > 0) {
        setNotifications([
          {
            id: 1,
            message: `You have ${allAppointmentsResponse.appointments.length} pending appointment requests`,
            type: 'appointment',
            time: 'Just now'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'blue' },
    { label: 'Pending Approvals', value: stats.pendingAppointments, icon: Clock, color: 'yellow' },
    { label: 'Active Patients', value: stats.activePatients, icon: Users, color: 'green' },
    { label: 'Prescriptions', value: stats.totalPrescriptions, icon: FileText, color: 'purple' }
  ];

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'timeslots', label: 'Time Slots', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Dr. {user?.name}</h1>
            <p className="text-gray-600">
              Manage your appointments, patients, and consultations
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {notifications.length > 0 && (
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className={`bg-${stat.color}-100 p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'appointments' && <AppointmentManagement />}
            {activeTab === 'timeslots' && <TimeSlotManagement />}
            {activeTab === 'patients' && <PatientManagement />}
            {activeTab === 'prescriptions' && <PrescriptionManagement />}
            {activeTab === 'profile' && <DoctorProfile />}
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-900">{n.message}</p>
                    <p className="text-xs text-gray-500">{n.time}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
