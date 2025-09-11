import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, 
  Upload, FileText, Award, Clock, Shield, DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../common/LoadingSpinner';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    licenseNumber: '',
    clinicAddress: '',
    about: '',
    consultationFee: '',
    availableTimings: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await doctorService.getProfile();
      const doctorData = response.doctor;
      setProfile({
        name: doctorData.userId?.name || '',
        email: doctorData.userId?.email || '',
        phone: doctorData.phone || '',
        specialization: doctorData.specialization || '',
        experience: doctorData.experience || '',
        qualification: doctorData.qualification || '',
        licenseNumber: doctorData.licenseNumber || '',
        clinicAddress: doctorData.clinicAddress || '',
        about: doctorData.about || '',
        consultationFee: doctorData.consultationFee || '',
        availableTimings: doctorData.availableTimings || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        phone: profile.phone,
        clinicAddress: profile.clinicAddress,
        consultationFee: parseInt(profile.consultationFee),
        about: profile.about,
        availableTimings: profile.availableTimings
      };

      await doctorService.updateProfile(updateData);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Doctor Profile</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50"
                >
                  {loading ? <LoadingSpinner size="small" /> : <Save className="h-4 w-4" />}
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="flex items-center space-x-2 bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <p className="text-gray-900 py-2">{profile.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <p className="text-gray-900 py-2">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <p className="text-gray-900 py-2">{profile.specialization}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <p className="text-gray-900 py-2">{profile.experience} years</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <p className="text-gray-900 py-2">{profile.qualification}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <p className="text-gray-900 py-2">{profile.licenseNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee
                </label>
                {isEditing ? (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      name="consultationFee"
                      value={profile.consultationFee}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">${profile.consultationFee}</p>
                )}
              </div>
            </div>

            {/* Clinic Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Address
              </label>
              {isEditing ? (
                <textarea
                  name="clinicAddress"
                  value={profile.clinicAddress}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.clinicAddress}</p>
              )}
            </div>

            {/* Available Timings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Timings
              </label>
              {isEditing ? (
                <textarea
                  name="availableTimings"
                  value={profile.availableTimings}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mon-Fri: 9:00 AM - 5:00 PM, Sat: 10:00 AM - 2:00 PM"
                />
              ) : (
                <p className="text-gray-900">{profile.availableTimings || 'Not specified'}</p>
              )}
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About
              </label>
              {isEditing ? (
                <textarea
                  name="about"
                  value={profile.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
                />
              ) : (
                <p className="text-gray-700">{profile.about || 'No description provided'}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
