import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import AdminStats from './AdminStats';
import DoctorApproval from './DoctorApproval';
//import DoctorApproval from './DoctorApproval';
import LoadingSpinner from '../components/common/LoadingSpinner';
//import LoadingSpinner from '../../components/common/LoadingSpinner';

//import { adminService } from '../../services/adminService';
import { adminService } from '../services/adminService';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchDoctors();
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDoctors({ status: activeTab });
      setDoctors(response.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      const response = await adminService.approveDoctor(doctorId);
      if (response.success) {
        alert('Doctor approved successfully!');
        fetchDoctors();
        fetchDashboardStats();
      }
    } catch (error) {
      alert('Error approving doctor: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await adminService.rejectDoctor(doctorId, reason);
      if (response.success) {
        alert('Doctor registration rejected.');
        fetchDoctors();
        fetchDashboardStats();
      }
    } catch (error) {
      alert('Error rejecting doctor: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage doctor registrations and platform operations</p>
        </div>

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Doctor Management */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab} Doctors
                </button>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Doctors List */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No doctors found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <DoctorApproval
                    key={doctor._id}
                    doctor={doctor}
                    onApprove={handleApproveDoctor}
                    onReject={handleRejectDoctor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
