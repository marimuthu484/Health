import React, { useState, useEffect } from 'react';
import { Video, X, Bell } from 'lucide-react';
import { consultationService } from '../../services/consultationService';

const ConsultationNotification = () => {
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    checkForActiveConsultation();
    
    // Check every 10 seconds
    const interval = setInterval(checkForActiveConsultation, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForActiveConsultation = async () => {
    try {
      const response = await consultationService.getActiveConsultation();
      
      if (response.hasActiveConsultation && response.consultation) {
        setActiveConsultation(response.consultation);
        setShow(true);
      } else {
        setActiveConsultation(null);
        setShow(false);
      }
    } catch (error) {
      console.error('Error checking for active consultation:', error);
    }
  };

  const joinConsultation = () => {
    if (activeConsultation?.meetingLink) {
      window.open(activeConsultation.meetingLink, '_blank');
      setShow(false);
    }
  };

  if (!show || !activeConsultation) return null;

  const doctorName = activeConsultation.appointmentId?.doctorId?.userId?.name || 'Doctor';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <div className="bg-purple-600 text-white rounded-lg shadow-xl p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h4 className="font-semibold">Video Consultation Started</h4>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm mb-4">
          Dr. {doctorName} is ready for your video consultation. Click below to join.
        </p>
        
        <button
          onClick={joinConsultation}
          className="w-full bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Video className="h-4 w-4" />
          <span>Join Video Call</span>
        </button>
      </div>
    </div>
  );
};

export default ConsultationNotification;
