
// // src/pages/VideoCall.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import { appointmentService } from "../services/appointmentService";
// import LoadingSpinner from "../components/common/LoadingSpinner";

// const VideoCall = () => {
//   const { consultationId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const jitsiContainerRef = useRef(null);
//   const apiRef = useRef(null);
// console.log("backend");
//   const [loading, setLoading] = useState(true);
//   const [appointment, setAppointment] = useState(null);
//   const [error, setError] = useState(null);

//   // 🔹 Fetch appointment details
//   useEffect(() => {
//     fetchAppointmentDetails();
//   }, [consultationId]);

//   // 🔹 Initialize Jitsi once appointment is verified
//   useEffect(() => {
//     if (!appointment || error) return;
//     if (!jitsiContainerRef.current) return;

//     const loadJitsi = () => {
//       if (window.JitsiMeetExternalAPI) {
//         console.log("backend");

//         initializeJitsi();
//       } else {
//         setError("Jitsi API not available. Please refresh.");
//         setLoading(false);
//       }
//     };

//     // ✅ Avoid duplicate script injection
//     if (!document.getElementById("jitsi-script")) {
//       const script = document.createElement("script");
//       script.id = "jitsi-script";
//       script.src = "https://meet.jit.si/external_api.js";
//       script.async = true;
//       script.onload = loadJitsi;
//       script.onerror = () => {
//         setError("Failed to load video conferencing script.");
//         setLoading(false);
//       };
//       document.body.appendChild(script);
//     } else {
//       loadJitsi();
//     }

//     return () => {
//       if (apiRef.current) {
//         apiRef.current.dispose();
//         apiRef.current = null;
//       }
//     };
//   }, [appointment]);

//   const fetchAppointmentDetails = async () => {
//     try {
//       const response = await appointmentService.getAppointment(consultationId);

//       if (response.appointment) {
//         const isDoctor =
//           user?.role === "doctor" &&
//           response.appointment.doctorId?.userId?._id === user.id;
//         const isPatient =
//           user?.role === "patient" &&
//           response.appointment.patientId?.userId?._id === user.id;

//         if (!isDoctor && !isPatient) {
//           setError("You are not authorized to join this consultation.");
//           setLoading(false);
//           return;
//         }
//         setAppointment(response.appointment);
//       } else {
//         setError("Appointment not found");
//         setLoading(false);
//       }
//     } catch (err) {
//       console.error("Error fetching appointment:", err);
//       if (err.response?.status === 404) {
//         setError("Appointment not found. Please check the link.");
//       } else {
//         setError("Unable to load appointment details. Please try again.");
//       }
//       setLoading(false);
//     }
//   };

//   const initializeJitsi = () => {
//     try {
//       if (!jitsiContainerRef.current) {
//         console.error("❌ Jitsi container not found");
//         return;
//       }
// console.log("Jitsi API object:", apiRef.current);

//       const displayName = user?.name || "Guest";
//       const isDoctor = user?.role === "doctor";
//       const participantName = isDoctor ? `Dr. ${displayName}` : displayName;

//       const domain = "meet.jit.si";
//       const options = {
//         roomName: `healthpredict-consultation-${consultationId}`,
//         parentNode: jitsiContainerRef.current,
//         width: "100%",
//         height: "100%",
//         configOverwrite: {
//           startWithAudioMuted: false,
//           startWithVideoMuted: false,
//           enableWelcomePage: false,
//           prejoinPageEnabled: false,
//           disableInviteFunctions: true,
//         },
//         interfaceConfigOverwrite: {
//           SHOW_JITSI_WATERMARK: false,
//           TOOLBAR_BUTTONS: [
//             "microphone",
//             "camera",
//             "desktop",
//             "fullscreen",
//             "fodeviceselection",
//             "hangup",
//             "chat",
//             "settings",
//             "videoquality",
//             "filmstrip",
//             "tileview",
//             "help",
//           ],
//         },
//         userInfo: {
//           displayName: participantName,
//           email: user?.email || "",
//         },
//       };

//       console.log("✅ Initializing Jitsi with room:", options.roomName);
//       const api = new window.JitsiMeetExternalAPI(domain, options);
//       apiRef.current = api;

//       api.addEventListener("videoConferenceJoined", () => {
//         console.log("✅ User joined the conference");
//         setLoading(false);
//       });

//       api.addEventListener("readyToClose", () => {
//         handleEndCall();
//       });

//       api.addEventListener("videoConferenceLeft", () => {
//         handleEndCall();
//       });

//       // ✅ Fallback: force hide loading after 5s
//       setTimeout(() => {
//         if (loading) {
//           console.warn("⚠️ Jitsi event not fired, forcing loading=false");
//           setLoading(false);
//         }
//       }, 5000);

//       api.executeCommand("displayName", participantName);
//     } catch (err) {
//       console.error("Error initializing Jitsi:", err);
//       setError("Failed to initialize video call. Please refresh and try again.");
//       setLoading(false);
//     }
//   };

//   const handleEndCall = () => {
//     if (user?.role === "doctor") {
//       navigate("/doctor-dashboard");
//     } else {
//       navigate("/dashboard");
//     }
//   };

//   // 🔹 Error UI
//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center bg-gray-800 p-8 rounded-lg">
//           <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // 🔹 Loading UI
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center">
//           <LoadingSpinner size="large" />
//           <p className="text-white mt-4 text-lg">
//             Preparing your consultation room...
//           </p>
//           <p className="text-gray-400 mt-2 text-sm">
//             Please ensure your camera and microphone are enabled
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // 🔹 Jitsi Container UI
//   return (
//     <div className="h-screen bg-gray-900 relative">
//       <div ref={jitsiContainerRef} className="h-full w-full" />

//       <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 pointer-events-none">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="text-white">
//             <h1 className="text-lg font-semibold">
//               HealthPredict Video Consultation
//             </h1>
//             <p className="text-sm text-gray-300">
//               {appointment?.patientId?.userId?.name &&
//                 appointment?.doctorId?.userId?.name && (
//                   <>
//                     {user?.role === "doctor"
//                       ? `Patient: ${appointment.patientId.userId.name}`
//                       : `Doctor: Dr. ${appointment.doctorId.userId.name}`}
//                   </>
//                 )}
//             </p>
//           </div>
//           <div className="text-white text-sm">
//             Room ID: {consultationId.slice(-6).toUpperCase()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;

// src/pages/VideoCall.jsx
import React, { useEffect, useState } from "react";
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
  const [jitsiApi, setJitsiApi] = useState(null);

  // Fetch appointment details first
  useEffect(() => {
    fetchAppointmentDetails();
  }, [consultationId]);

  // Load Jitsi script and initialize after appointment is loaded
  useEffect(() => {
    if (!appointment || error) return;

    let api = null;

    // Function to initialize Jitsi
    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("Jitsi API not available");
        setError("Video conferencing not available. Please refresh the page.");
        setLoading(false);
        return;
      }

      const container = document.getElementById("jitsi-container");
      if (!container) {
        console.error("Container not found");
        setError("Failed to initialize video call.");
        setLoading(false);
        return;
      }

      try {
        const displayName = user?.name || "Guest";
        const isDoctor = user?.role === "doctor";
        const participantName = isDoctor ? `Dr. ${displayName}` : displayName;
        const roomName = `healthpredict-${consultationId}`;

        console.log("Initializing Jitsi in room:", roomName);

        api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName: roomName,
          parentNode: container,
          width: "100%",
          height: "100%",
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: false,
            enableWelcomePage: false,
            prejoinPageEnabled: true,
            disableInviteFunctions: true,
            enableInsecureRoomNameWarning: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO: false,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "help",
              "mute-everyone",
            ],
          },
          userInfo: {
            displayName: participantName,
            email: user?.email || "",
          },
        });

        setJitsiApi(api);

        // Add event listeners
        api.addEventListener("videoConferenceJoined", () => {
          console.log("Joined conference");
          setLoading(false);
        });

        api.addEventListener("readyToClose", handleEndCall);

        // Set a timeout to force hide loading
        setTimeout(() => {
          setLoading(false);
        }, 3000);

      } catch (err) {
        console.error("Error initializing Jitsi:", err);
        setError("Failed to start video call. Please refresh and try again.");
        setLoading(false);
      }
    };

    // Check if Jitsi script is already loaded
    if (window.JitsiMeetExternalAPI) {
      console.log("Jitsi API already loaded");
      setTimeout(initJitsi, 100); // Small delay to ensure DOM is ready
    } else {
      console.log("Loading Jitsi script");
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

    // Cleanup function
    return () => {
      if (api) {
        try {
          console.log("Disposing Jitsi API");
          api.dispose();
        } catch (e) {
          console.error("Error disposing:", e);
        }
      }
    };
  }, [appointment, error, consultationId, user]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await appointmentService.getAppointment(consultationId);
      
      if (response.appointment) {
        // Check authorization
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
    if (jitsiApi) {
      try {
        jitsiApi.dispose();
      } catch (e) {
        console.error("Error disposing:", e);
      }
    }
    
    if (user?.role === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-white mb-4">{error}</p>
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

  return (
    <div className="h-screen bg-gray-900 relative">
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

      {/* Jitsi container - Always render this */}
      <div 
        id="jitsi-container"
        className="h-full w-full"
        style={{ display: loading ? 'none' : 'block' }}
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
          className="absolute bottom-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Leave Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;
