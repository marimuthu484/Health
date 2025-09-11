import React from 'react';
import { CheckCircle, XCircle, FileText, Phone, Mail, MapPin } from 'lucide-react';

const DoctorApproval = ({ doctor, onApprove, onReject }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <img
            src={doctor.userId?.avatar || `https://ui-avatars.com/api/?name=${doctor.userId?.name}`}
            alt={doctor.userId?.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {doctor.userId?.name}
            </h3>
            <p className="text-gray-600">{doctor.specialization}</p>
            
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {doctor.userId?.email}
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {doctor.phone}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {doctor.clinicAddress}
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                License: {doctor.licenseNumber}
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Experience:</span>
                <span className="ml-2 font-medium">{doctor.experience} years</span>
              </div>
              <div>
                <span className="text-gray-500">Qualification:</span>
                <span className="ml-2 font-medium">{doctor.qualification}</span>
              </div>
              <div>
                <span className="text-gray-500">Consultation Fee:</span>
                <span className="ml-2 font-medium">${doctor.consultationFee}</span>
              </div>
              <div>
                <span className="text-gray-500">Applied On:</span>
                <span className="ml-2 font-medium">
                  {new Date(doctor.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onApprove(doctor._id)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onReject(doctor._id)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <XCircle className="h-4 w-4" />
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorApproval;
