import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Camera,
  Settings,
  Users,
  MessageSquare,
  FileText,
  Clock,
  User,
  Calendar
} from 'lucide-react';

const VideoConsultation = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const videoRef = useRef(null);

  const upcomingConsultations = [
    {
      id: 1,
      patient: {
        name: 'John Smith',
        age: 45,
        avatar:
          'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        condition: 'Heart Disease Follow-up'
      },
      scheduledTime: '10:00 AM',
      duration: '30 min',
      status: 'ready',
      notes: 'Patient reported chest pain episodes'
    },
    {
      id: 2,
      patient: {
        name: 'Sarah Wilson',
        age: 38,
        avatar:
          'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        condition: 'Liver Function Review'
      },
      scheduledTime: '2:00 PM',
      duration: '45 min',
      status: 'waiting',
      notes: 'Elevated ALT levels discussion'
    },
    {
      id: 3,
      patient: {
        name: 'Emily Davis',
        age: 29,
        avatar:
          'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        condition: 'Preventive Screening'
      },
      scheduledTime: '4:00 PM',
      duration: '30 min',
      status: 'scheduled',
      notes: 'First-time consultation'
    }
  ];

  const [consultations, setConsultations] = useState(upcomingConsultations);

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const startCall = async patient => {
    setCurrentPatient(patient);
    setIsCallActive(true);
    setCallDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCurrentPatient(null);
    setCallDuration(0);
    setShowChat(false);
    setChatMessages([]);

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (videoRef.current?.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !isVideoEnabled;
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (videoRef.current?.srcObject) {
      const audioTrack = videoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !isAudioEnabled;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const message = {
      id: Date.now(),
      sender: 'doctor',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = status => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // --- Render Call Interface ---
  if (isCallActive && currentPatient) {
    return (
      <div className="h-screen bg-gray-900 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Doctor Video */}
          <div className="relative bg-gray-800">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg">
              You
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <VideoOff className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Patient Video */}
          <div className="relative bg-gray-700 flex items-center justify-center">
            <div className="text-center text-white">
              <img
                src={currentPatient.patient.avatar}
                alt={currentPatient.patient.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-xl font-semibold">{currentPatient.patient.name}</p>
              <p className="text-gray-300">{currentPatient.patient.condition}</p>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 p-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="text-white flex items-center space-x-4">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatDuration(callDuration)}</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${
                  isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full ${
                  isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>

              <button
                onClick={() => setShowChat(!showChat)}
                className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageSquare className="h-6 w-6" />
              </button>

              <button className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 text-white">
                <Settings className="h-6 w-6" />
              </button>

              <button onClick={endCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white">
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Video Consultations</h2>
      <p className="text-gray-600">Manage your video consultations and online appointments</p>
      {/* Quick Stats, Upcoming Consultations, Call Setup & History */}
      {/* You can add them here like before in JSX */}
    </div>
  );
};

export default VideoConsultation;
