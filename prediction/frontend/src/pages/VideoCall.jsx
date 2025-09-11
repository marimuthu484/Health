// src/pages/VideoCall.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { appointmentService } from "../services/appointmentService";
import LoadingSpinner from "../components/common/LoadingSpinner";

const VideoCall = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);
  
  // Use refs to prevent multiple instances
  const apiRef = useRef(null);
  const containerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Cleanup function
  const cleanup = () => {
    if (apiRef.current) {
      try {
        console.log("Cleaning up Jitsi instance");
        apiRef.current.dispose();
        apiRef.current = null;
      } catch (e) {
        console.error("Error during cleanup:", e);
      }
    }
    isInitializedRef.current = false;
  };

  // Fetch appointment details
  useEffect(() => {
    fetchAppointmentDetails();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [consultationId]);

  // Initialize Jitsi
  useEffect(() => {
    if (!appointment || error || isInitializedRef.current) return;

    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("Jitsi API not available");
        setError("Video conferencing not available. Please refresh the page.");
        setLoading(false);
        return;
      }

      // Prevent multiple initializations
      if (isInitializedRef.current || apiRef.current) {
        console.log("Jitsi already initialized, skipping...");
        return;
      }

      const container = containerRef.current;
      if (!container) {
        console.error("Container not found");
        setError("Failed to initialize video call.");
        setLoading(false);
        return;
      }

      try {
        isInitializedRef.current = true;
        
        // Clear container
        container.innerHTML = '';

        const displayName = user?.name || "Guest";
        const isDoctor = user?.role === "doctor";
        const participantName = isDoctor ? `Dr. ${displayName}` : displayName;
        const roomName = `healthpredict-${consultationId}`;

        console.log("Initializing Jitsi in room:", roomName);

        const options = {
          roomName: roomName,
          parentNode: container,
          width: "100%",
          height: "100%",
          configOverwrite: {
            // Audio/Video settings
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            
            // Disable prejoin to prevent issues
            prejoinPageEnabled: false,
            
            // P2P settings for 1-on-1 calls
            p2p: {
              enabled: true,
              stunServers: [
                { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
              ]
            },
            
            // Disable simulcast to prevent multiple streams
            disableSimulcast: true,
            
            // Resolution settings
            resolution: 720,
            constraints: {
              video: {
                height: {
                  ideal: 720,
                  max: 720,
                  min: 240
                }
              }
            },
            
            // Limit to 2 participants
            channelLastN: 2,
            
            // Disable features that might cause issues
            enableLayerSuspension: false,
            disableAudioLevels: true,
            disableThirdPartyRequests: true,
            disableLocalVideoFlip: true,
            
            // Room settings
            disableInviteFunctions: true,
            doNotStoreRoom: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableRemoteMute: true,
            requireDisplayName: false,
          },
          interfaceConfigOverwrite: {
            // Branding
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            
            // UI Settings
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            DISABLE_PRESENCE_STATUS: true,
            DISABLE_TRANSCRIPTION_SUBTITLES: true,
            
            // Video layout - Force large video view
            VERTICAL_FILMSTRIP: false,
            FILM_STRIP_MAX_HEIGHT: 90,
            VIDEO_LAYOUT_FIT: 'both',
            DISABLE_VIDEO_BACKGROUND: false,
            
            // Hide invite functionality
            HIDE_INVITE_MORE_HEADER: true,
            
            // Toolbar configuration
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'settings',
              'videoquality'
            ],
            
            // Settings sections
            SETTINGS_SECTIONS: ['devices', 'language'],
            
            // Disable unnecessary features
            DISABLE_FOCUS_INDICATOR: true,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
            DISABLE_RINGING: true,
            
            // Layout settings for 2-person call
            DEFAULT_BACKGROUND: '#474747',
            DEFAULT_LOCAL_DISPLAY_NAME: participantName,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Guest',
            
            // Filmstrip settings
            FILMSTRIP_DISPLAY_DISABLED: false,
            SHOW_TOOLBAR_PARTICIPANTS_VIDEO: true,
            
            // Mobile settings
            MOBILE_APP_PROMO: false,
            
            // Other UI settings
            MAXIMUM_ZOOMING_COEFFICIENT: 1,
            INITIAL_TOOLBAR_TIMEOUT: 20000,
            TOOLBAR_TIMEOUT: 4000,
            TOOLBAR_ALWAYS_VISIBLE: false,
            
            // Disable tile view for 1-on-1 calls
            TILE_VIEW_MAX_COLUMNS: 2,
            
            // Additional settings
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          },
          userInfo: {
            displayName: participantName,
            email: user?.email || "",
          },
          onload: () => {
            console.log("Jitsi iframe loaded");
          }
        };

        const api = new window.JitsiMeetExternalAPI("meet.jit.si", options);
        apiRef.current = api;

        // Event handlers
        api.addEventListener("videoConferenceJoined", () => {
          console.log("Successfully joined conference");
          setLoading(false);
          
          // Force proper video layout for 2-person call
          setTimeout(() => {
            if (apiRef.current) {
              // Disable tile view to show large video
              apiRef.current.executeCommand('setTileView', false);
              // Set video quality
              apiRef.current.executeCommand('setVideoQuality', 720);
            }
          }, 1000);
        });

        api.addEventListener("participantJoined", (participant) => {
          console.log("Participant joined:", participant);
          // Ensure we're not in tile view for 2-person calls
          setTimeout(() => {
            if (apiRef.current) {
              apiRef.current.executeCommand('setTileView', false);
            }
          }, 500);
        });

        api.addEventListener("videoConferenceLeft", () => {
          console.log("Left conference");
          handleEndCall();
        });

        api.addEventListener("readyToClose", () => {
          console.log("Ready to close");
          handleEndCall();
        });

        // Force hide loading after timeout
        setTimeout(() => {
          setLoading(false);
        }, 5000);

      } catch (err) {
        console.error("Error initializing Jitsi:", err);
        setError("Failed to start video call. Please refresh and try again.");
        setLoading(false);
        isInitializedRef.current = false;
      }
    };

    // Load Jitsi script if needed
    if (window.JitsiMeetExternalAPI) {
      console.log("Jitsi API already available");
      // Small delay to ensure DOM is ready
      setTimeout(initJitsi, 100);
    } else {
      console.log("Loading Jitsi script...");
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        console.log("Jitsi script loaded");
        setTimeout(initJitsi, 100);
      };
      script.onerror = () => {
        setError("Failed to load video conferencing. Check your internet connection.");
        setLoading(false);
      };
      document.body.appendChild(script);
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [appointment, error, consultationId, user]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await appointmentService.getAppointment(consultationId);
      
      if (response.appointment) {
        const userId = user?.id || user?._id;
        const doctorUserId = response.appointment.doctorId?.userId?._id;
        const patientUserId = response.appointment.patientId?.userId?._id;
        
        const isDoctor = user?.role === "doctor" && doctorUserId === userId;
        const isPatient = user?.role === "patient" && patientUserId === userId;

        if (!isDoctor && !isPatient) {
          setError("You are not authorized to join this consultation.");
          setLoading(false);
          return;
        }
        
        setAppointment(response.appointment);
      } else {
        setError("Appointment not found");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching appointment:", err);
      setError("Unable to load appointment details. Please try again.");
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    cleanup();
    
    if (user?.role === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="text-white mt-4 text-lg">
              Preparing your consultation room...
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Please ensure your camera and microphone are enabled
            </p>
          </div>
        </div>
      )}

      {/* Jitsi container */}
      <div 
        ref={containerRef}
        className="h-full w-full"
        style={{ 
          display: loading ? 'none' : 'block',
          position: 'relative'
        }}
      />

      {/* Header overlay */}
      {!loading && appointment && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 pointer-events-none z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-white">
              <h1 className="text-lg font-semibold">
                HealthPredict Video Consultation
              </h1>
              <p className="text-sm text-gray-300">
                {user?.role === "doctor"
                  ? `Patient: ${appointment.patientId?.userId?.name || 'Unknown'}`
                  : `Doctor: Dr. ${appointment.doctorId?.userId?.name || 'Unknown'}`}
              </p>
            </div>
            <div className="text-white text-sm bg-black/50 px-3 py-1 rounded">
              Room: {consultationId.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Exit button */}
      {!loading && (
        <button
          onClick={handleEndCall}
          className="absolute bottom-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Leave Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
