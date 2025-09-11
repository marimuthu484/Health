import React from 'react';
import { Star, Clock, DollarSign, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate(`/consultation`, { state: { doctorId: doctor._id } });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <img
          src={doctor.userId?.avatar || `https://ui-avatars.com/api/?name=${doctor.userId?.name}`}
          alt={doctor.userId?.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {doctor.userId?.name}
          </h3>
          <p className="text-gray-600">{doctor.specialization}</p>
          
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{doctor.experience} years experience</span>
          </div>
          
          <div className="flex items-center mt-1 text-sm text-gray-500">
            
            <MapPin className="h-4 w-4 mr-1" />
            <span>{doctor.clinicAddress}</span>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">
                {doctor.consultationFee}
              </span>
              <span className="text-sm text-gray-500 ml-1">per consultation</span>
            </div>
            
            <button
              onClick={handleBookAppointment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
