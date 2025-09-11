// src/pages/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { consultationService } from '../services/consultationService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Phone, Video, VideoOff, Mic, MicOff } from 'lucide-react';

const VideoCall = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch appointment details first
    fetchAppointmentDetails();
  }, [consultationId]);

  useEffect(() => {
    if (!appointment || error) return;

    // Load Jitsi Meet External API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initializeJitsi();
    script.onerror = () => {
      setError('Failed to load video conferencing. Please check your internet connection.');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [appointment]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await appointmentService.getAppointment(consultationId);
      if (response.appointment) {
        setAppointment(response.appointment);
      } else {
        setError('Appointment not found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setError('Unable to load appointment details. Please try again.');
      setLoading(false);
    }
  };

  const initializeJitsi = () => {
    try {
      // Determine display name based on user role
      const displayName = user?.name || 'Guest';
      const isDoctor = user?.role === 'doctor';
      const participantName = isDoctor ? `Dr. ${displayName}` : displayName;

      // Generate a unique room name
      const roomName = `healthpredict-consultation-${consultationId}`;

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: false,
          enableEmailInStats: false,
          enableWelcomePage: false,
          prejoinPageEnabled: true,
          prejoinPageTitle: 'HealthPredict Consultation',
          disableInviteFunctions: true,
          disableRemoteMute: true,
          remoteVideoMenu: {
            disableKick: true,
            disableGrantModerator: true
          },
          subject: `Medical Consultation`,
          hideConferenceSubject: false,
          enableInsecureRoomNameWarning: false,
          enableNoisyMicDetection: true,
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
          DISPLAY_WELCOME_FOOTER: false,
          APP_NAME: 'HealthPredict',
          NATIVE_APP_NAME: 'HealthPredict',
          PROVIDER_NAME: 'HealthPredict',
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'recording',
            'livestreaming',
            'settings',
            'videoquality',
            'filmstrip',
            'stats',
            'shortcuts',
            'tileview',
            'download',
            'help',
            'mute-everyone',
            'security'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
          VIDEO_LAYOUT_FIT: 'both',
          MOBILE_APP_PROMO: false,
          TILE_VIEW_MAX_COLUMNS: 2,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Patient',
          DEFAULT_LOCAL_DISPLAY_NAME: participantName,
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
        userInfo: {
          displayName: participantName,
          email: user?.email || ''
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      // Event listeners
      api.addEventListener('readyToClose', () => {
        handleEndCall();
      });

      api.addEventListener('videoConferenceJoined', () => {
        console.log('User joined the conference');
        setLoading(false);
        
        // Send a welcome message in chat
        const welcomeMessage = isDoctor 
          ? 'Doctor has joined the consultation. Feel free to explain your concerns.'
          : 'Patient has joined the consultation.';
        
        api.executeCommand('sendChatMessage', welcomeMessage);
      });

      api.addEventListener('participantJoined', (participant) => {
        console.log('Participant joined:', participant);
        api.executeCommand('sendChatMessage', 
          `${participant.displayName} has joined the consultation.`
        );
      });

      api.addEventListener('participantLeft', (participant) => {
        console.log('Participant left:', participant);
      });

      api.addEventListener('videoConferenceLeft', () => {
        console.log('User left the conference');
        handleEndCall();
      });

      // Handle recording events if needed
      api.addEventListener('recordingStatusChanged', (status) => {
        console.log('Recording status:', status);
        if (status.on) {
          api.executeCommand('sendChatMessage', 
            '🔴 Recording has started. This consultation is being recorded.'
          );
        }
      });

    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      setError('Failed to initialize video call. Please refresh and try again.');
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      // Update consultation status if needed
      if (user?.role === 'doctor' && appointment) {
        // You can add logic here to end the consultation in your backend
        console.log('Ending consultation...');
      }
      navigate(-1);
    } catch (error) {
      console.error('Error ending call:', error);
      navigate(-1);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-white mt-4 text-lg">Preparing your consultation room...</p>
          <p className="text-gray-400 mt-2 text-sm">Please ensure your camera and microphone are enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 relative">
      {/* Jitsi Meet Container */}
      <div 
        id="jitsi-container" 
        ref={jitsiContainerRef}
        className="h-full w-full"
      />
      
      {/* Optional: Custom Header Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-lg font-semibold">HealthPredict Video Consultation</h1>
            <p className="text-sm text-gray-300">
              {appointment?.patientId?.userId?.name && appointment?.doctorId?.userId?.name && (
                <>
                  {user?.role === 'doctor' 
                    ? `Patient: ${appointment.patientId.userId.name}`
                    : `Doctor: Dr. ${appointment.doctorId.userId.name}`
                  }
                </>
              )}
            </p>
          </div>
          <div className="text-white text-sm">
            Room ID: {consultationId.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
