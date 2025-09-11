// // src/components/shared/AppointmentDetail.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   X, Calendar, Clock, User, MapPin, Phone, Mail, FileText, 
//   MessageSquare, Send, Image, Film, Paperclip, Download,
//   Video, AlertCircle, CheckCircle, Eye
// } from 'lucide-react';
// import { formatters } from '../utils/formatters';
// import { chatService } from '../services/chatService';
// import { appointmentService } from '../services/appointmentService';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import moment from 'moment';
// import io from 'socket.io-client';

// const AppointmentDetail = ({ appointment: initialAppointment, onClose, userRole, onUpdate }) => {
//   const [activeTab, setActiveTab] = useState('details');
//   const [appointment, setAppointment] = useState(initialAppointment);
//   const [chat, setChat] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [typingUsers, setTypingUsers] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [error, setError] = useState('');
//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const socketRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   const canAccessChat = appointment.chatEnabled && 
//     (appointment.status === 'confirmed' || appointment.status === 'in-progress');

//   useEffect(() => {
//     // Fetch full appointment details
//     fetchAppointmentDetails();

//     // Initialize socket connection
//     socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
//     socketRef.current.emit('join-appointment', appointment._id);

//     socketRef.current.on('new-message', (message) => {
//       setMessages(prev => [...prev, message]);
//       scrollToBottom();
//     });

//     socketRef.current.on('user-typing', ({ userId, isTyping }) => {
//       setTypingUsers(prev => {
//         if (isTyping) {
//           return [...prev.filter(id => id !== userId), userId];
//         } else {
//           return prev.filter(id => id !== userId);
//         }
//       });
//     });

//     return () => {
//       socketRef.current.emit('leave-appointment', appointment._id);
//       socketRef.current.disconnect();
//     };
//   }, [appointment._id]);

//   useEffect(() => {
//     if (canAccessChat && activeTab === 'chat') {
//       loadChat();
//     }
//   }, [activeTab, canAccessChat]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const fetchAppointmentDetails = async () => {
//     try {
//       const response = await appointmentService.getAppointment(appointment._id);
//       setAppointment(response.appointment);
//       if (response.appointment.chat) {
//         setChat(response.appointment.chat);
//         setMessages(response.appointment.chat.messages || []);
//       }
//     } catch (error) {
//       console.error('Error fetching appointment details:', error);
//     }
//   };

//   const loadChat = async () => {
//     if (chat) return; // Already loaded
    
//     setLoading(true);
//     try {
//       const response = await chatService.getChat(appointment._id);
//       setChat(response.chat);
//       setMessages(response.chat.messages || []);
      
//       // Mark messages as read
//       await chatService.markAsRead(appointment._id);
//     } catch (error) {
//       console.error('Error loading chat:', error);
//       setError('Unable to load chat');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//     const handleTyping = () => {
//     socketRef.current.emit('typing', {
//       appointmentId: appointment._id,
//       userId: chat?.participants.find(p => p._id === appointment.doctorId?.userId?._id || 
//                                            p._id === appointment.patientId?.userId?._id)?._id,
//       isTyping: true
//     });

//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => {
//       socketRef.current.emit('typing', {
//         appointmentId: appointment._id,
//         userId: chat?.participants.find(p => p._id === appointment.doctorId?.userId?._id || 
//                                              p._id === appointment.patientId?.userId?._id)?._id,
//         isTyping: false
//       });
//     }, 1000);
//   };

//   const sendMessage = async (e) => {
//     e?.preventDefault();
//     if ((!newMessage.trim() && !selectedFile) || sending) return;

//     setSending(true);
//     setError('');

//     try {
//       const formData = new FormData();
//       if (newMessage.trim()) {
//         formData.append('content', newMessage);
//       }
//       if (selectedFile) {
//         formData.append('attachment', selectedFile);
//       }

//       const response = await chatService.sendMessage(appointment._id, formData);
      
//       setMessages(prev => [...prev, response.message]);
//       socketRef.current.emit('send-message', {
//         appointmentId: appointment._id,
//         message: response.message
//       });
      
//       setNewMessage('');
//       setSelectedFile(null);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     } catch (error) {
//       setError('Failed to send message');
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleFileSelect = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const maxSize = 50 * 1024 * 1024; // 50MB
//     if (file.size > maxSize) {
//       setError('File size must be less than 50MB');
//       return;
//     }

//     setSelectedFile(file);
//   };

//   const downloadAttachment = async (messageId, attachmentIndex, fileName) => {
//     try {
//       const blob = await chatService.downloadAttachment(
//         appointment._id,
//         messageId,
//         attachmentIndex
//       );
      
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       a.download = fileName;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       setError('Failed to download file');
//     }
//   };

//   const downloadMedicalReport = async () => {
//     try {
//       const blob = await appointmentService.downloadMedicalReport(appointment._id);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.style.display = 'none';
//       a.href = url;
//       a.download = appointment.medicalReport.fileName;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       setError('Failed to download medical report');
//     }
//   };

//   const renderMessageContent = (message) => {
//     if (message.messageType === 'system') {
//       return (
//         <div className="text-center py-2">
//           <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
//             {message.content}
//           </span>
//         </div>
//       );
//     }

//     if (message.messageType === 'meeting-link') {
//       return (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center mb-2">
//             <Video className="h-5 w-5 text-blue-600 mr-2" />
//             <span className="font-medium text-blue-900">Video Consultation Started</span>
//           </div>
//           <p className="text-sm text-blue-800 mb-3">{message.content}</p>
//           <a
//             href={appointment.meetingLink}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Join Video Call
//           </a>
//         </div>
//       );
//     }

//     const isOwnMessage = message.sender._id === 
//       (userRole === 'doctor' ? appointment.doctorId?.userId?._id : appointment.patientId?.userId?._id);

//     return (
//       <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
//         <div className={`max-w-md ${
//           isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100'
//         } rounded-lg p-4`}>
//           {!isOwnMessage && (
//             <p className={`text-xs mb-1 ${
//               isOwnMessage ? 'text-blue-100' : 'text-gray-500'
//             }`}>
//               {message.sender.name}
//             </p>
//           )}
          
//           {message.content && (
//             <p className="mb-2 whitespace-pre-wrap">{message.content}</p>
//           )}
          
//           {message.attachments?.map((attachment, idx) => (
//             <div key={idx} className="mt-2">
//               {attachment.fileType === 'image' ? (
//                 <img
//                   src={attachment.fileUrl}
//                   alt={attachment.fileName}
//                   className="max-w-full rounded cursor-pointer"
//                   onClick={() => window.open(attachment.fileUrl, '_blank')}
//                 />
//               ) : (
//                 <div 
//                   className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
//                     isOwnMessage ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-200 hover:bg-gray-300'
//                   }`}
//                   onClick={() => downloadAttachment(message._id, idx, attachment.fileName)}
//                 >
//                   <Paperclip className="h-4 w-4" />
//                   <span className="text-sm truncate">{attachment.fileName}</span>
//                   <Download className="h-4 w-4" />
//                 </div>
//               )}
//             </div>
//           ))}
          
//           <p className={`text-xs mt-2 ${
//             isOwnMessage ? 'text-blue-100' : 'text-gray-400'
//           }`}>
//             {moment(message.createdAt).format('h:mm A')}
//           </p>
//         </div>
//       </div>
//     );
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
//       case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
//       case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
//           <div className="flex justify-between items-start">
//             <div>
//               <h2 className="text-2xl font-bold mb-2">Appointment Details</h2>
//               <div className="flex items-center space-x-4 text-blue-100">
//                 <span className="flex items-center">
//                   <Calendar className="h-4 w-4 mr-1" />
//                   {formatters.date(appointment.date)}
//                 </span>
//                 <span className="flex items-center">
//                   <Clock className="h-4 w-4 mr-1" />
//                   {appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}
//                 </span>
//                 <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
//                   {appointment.status}
//                 </span>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-gray-200 transition-colors"
//             >
//               <X className="h-6 w-6" />
//             </button>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b">
//           <div className="flex">
//             <button
//               onClick={() => setActiveTab('details')}
//               className={`px-6 py-3 font-medium transition-colors ${
//                 activeTab === 'details'
//                   ? 'text-blue-600 border-b-2 border-blue-600'
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//             >
//               Details
//             </button>
//             {canAccessChat && (
//               <button
//                 onClick={() => setActiveTab('chat')}
//                 className={`px-6 py-3 font-medium transition-colors flex items-center ${
//                   activeTab === 'chat'
//                     ? 'text-blue-600 border-b-2 border-blue-600'
//                     : 'text-gray-600 hover:text-gray-800'
//                 }`}
//               >
//                 <MessageSquare className="h-4 w-4 mr-2" />
//                 Chat
//                 {messages.filter(m => 
//                   !m.readBy?.some(r => r.user === (userRole === 'doctor' ? 
//                     appointment.doctorId?.userId?._id : 
//                     appointment.patientId?.userId?._id))
//                 ).length > 0 && (
//                   <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
//                     {messages.filter(m => 
//                       !m.readBy?.some(r => r.user === (userRole === 'doctor' ? 
//                         appointment.doctorId?.userId?._id : 
//                         appointment.patientId?.userId?._id))
//                     ).length}
//                   </span>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
//           {activeTab === 'details' ? (
//             <div className="p-6 space-y-6">
//               {/* Doctor/Patient Info */}
//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold mb-4">
//                   {userRole === 'patient' ? 'Doctor Information' : 'Patient Information'}
//                 </h3>
//                 {userRole === 'patient' ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="flex items-center space-x-3">
//                       <User className="h-5 w-5 text-gray-500" />
//                       <span>Dr. {appointment.doctorId?.userId?.name}</span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <Mail className="h-5 w-5 text-gray-500" />
//                       <span>{appointment.doctorId?.userId?.email}</span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <FileText className="h-5 w-5 text-gray-500" />
//                       <span>{appointment.doctorId?.specialization}</span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <MapPin className="h-5 w-5 text-gray-500" />
//                       <span>{appointment.doctorId?.clinicAddress}</span>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="flex items-center space-x-3">
//                       <User className="h-5 w-5 text-gray-500" />
//                       <span>{appointment.patientId?.userId?.name}</span>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <Mail className="h-5 w-5 text-gray-500" />
//                       <span>{appointment.patientId?.userId?.email}</span>
//                     </div>
//                     {appointment.patientId?.phone && (
//                       <div className="flex items-center space-x-3">
//                         <Phone className="h-5 w-5 text-gray-500" />
//                         <span>{appointment.patientId?.phone}</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Appointment Info */}
//               <div className="bg-gray-50 rounded-lg p-6">
//                 <h3 className="text-lg font-semibold mb-4">Appointment Information</h3>
//                 <div className="space-y-3">
//                   <div>
//                     <span className="font-medium text-gray-700">Consultation Type: </span>
//                     <span className="capitalize">{appointment.consultationType} Consultation</span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-700">Consultation Fee: </span>
//                     <span>${appointment.payment?.amount || 0}</span>
//                   </div>
//                   <div>
//                     <span className="font-medium text-gray-700">Reason for Visit: </span>
//                     <p className="mt-1 text-gray-600">{appointment.reason}</p>
//                   </div>
                  
//                   {/* Medical Report */}
//                   {appointment.medicalReport && (
//                     <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <FileText className="h-5 w-5 text-blue-600" />
//                           <div>
//                             <p className="font-medium text-gray-900">Medical Report</p>
//                             <p className="text-sm text-gray-600">{appointment.medicalReport.fileName}</p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={downloadMedicalReport}
//                           className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
//                         >
//                           <Download className="h-4 w-4" />
//                           <span className="text-sm">Download</span>
//                         </button>
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* Meeting Link */}
//                   {appointment.meetingLink && appointment.status === 'in-progress' && (
//                     <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <Video className="h-5 w-5 text-blue-600" />
//                           <span className="font-medium text-blue-900">Video Consultation Active</span>
//                         </div>
//                         <a
//                           href={appointment.meetingLink}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
//                         >
//                           Join Call
//                         </a>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {!canAccessChat && appointment.status === 'pending' && userRole === 'patient' && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <div className="flex items-start">
//                     <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
//                     <div>
//                       <p className="text-yellow-800 font-medium">Awaiting Doctor Approval</p>
//                       <p className="text-yellow-700 text-sm mt-1">
//                         Chat will be available once the doctor approves your appointment request.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex flex-col h-full">
//               {/* Chat Messages */}
//               <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
//                 {error && (
//                   <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center">
//                     <AlertCircle className="h-5 w-5 mr-2" />
//                     {error}
//                   </div>
//                 )}

//                 {loading ? (
//                   <div className="flex justify-center py-12">
//                     <LoadingSpinner />
//                   </div>
//                 ) : messages.length === 0 ? (
//                   <div className="text-center py-12 text-gray-500">
//                     <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                     <p>No messages yet. Start the conversation!</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {messages.map((message, index) => (
//                       <div key={index}>
//                         {renderMessageContent(message)}
//                       </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                   </div>
//                 )}

//                 {typingUsers.length > 0 && (
//                   <div className="flex items-center space-x-2 text-gray-500 text-sm mt-4">
//                     <div className="flex space-x-1">
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                     </div>
//                     <span>typing...</span>
//                   </div>
//                 )}
//               </div>

//               {/* Chat Input */}
//               <div className="border-t bg-white p-4">
//                 {selectedFile && (
//                   <div className="mb-3 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Paperclip className="h-4 w-4 text-gray-500" />
//                       <span className="text-sm text-gray-700">{selectedFile.name}</span>
//                       <span className="text-xs text-gray-500">
//                         ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
//                       </span>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setSelectedFile(null);
//                         if (fileInputRef.current) {
//                           fileInputRef.current.value = '';
//                         }
//                       }}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   </div>
//                 )}

//                 <form onSubmit={sendMessage} className="flex items-center space-x-2">
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     className="hidden"
//                     onChange={handleFileSelect}
//                     accept="image/*,video/*,.pdf,.doc,.docx"
//                   />
                  
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="text-gray-500 hover:text-gray-700 p-2"
//                     disabled={sending}
//                   >
//                     <Paperclip className="h-5 w-5" />
//                   </button>

//                   <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => {
//                       setNewMessage(e.target.value);
//                       handleTyping();
//                     }}
//                     placeholder="Type a message..."
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     disabled={sending}
//                   />

//                   <button
//                     type="submit"
//                     disabled={(!newMessage.trim() && !selectedFile) || sending}
//                     className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {sending ? (
//                       <LoadingSpinner size="small" color="white" />
//                     ) : (
//                       <Send className="h-5 w-5" />
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentDetail;
// src/components/shared/AppointmentDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Calendar, Clock, User, MapPin, Phone, Mail, FileText, 
  MessageSquare, Send, Image, Film, Paperclip, Download,
  Video, AlertCircle, CheckCircle, Eye
} from 'lucide-react';
import { formatters } from '../utils/formatters';
import { chatService } from '../services/chatService';
import { appointmentService } from '../services/appointmentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import moment from 'moment';
import io from 'socket.io-client';

const AppointmentDetail = ({ appointment: initialAppointment, onClose, userRole, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [appointment, setAppointment] = useState(initialAppointment);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Use Vite environment variable
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const canAccessChat = appointment.chatEnabled && 
    (appointment.status === 'confirmed' || appointment.status === 'in-progress');

  useEffect(() => {
    // Fetch full appointment details
    fetchAppointmentDetails();

    // ✅ Initialize socket connection
    socketRef.current = io(apiUrl);
    
    socketRef.current.emit('join-appointment', appointment._id);

    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('user-typing', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return [...prev.filter(id => id !== userId), userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    return () => {
      socketRef.current.emit('leave-appointment', appointment._id);
      socketRef.current.disconnect();
    };
  }, [appointment._id, apiUrl]);

  useEffect(() => {
    if (canAccessChat && activeTab === 'chat') {
      loadChat();
    }
  }, [activeTab, canAccessChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await appointmentService.getAppointment(appointment._id);
      setAppointment(response.appointment);
      if (response.appointment.chat) {
        setChat(response.appointment.chat);
        setMessages(response.appointment.chat.messages || []);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    }
  };

  const loadChat = async () => {
    if (chat) return; // Already loaded
    
    setLoading(true);
    try {
      const response = await chatService.getChat(appointment._id);
      setChat(response.chat);
      setMessages(response.chat.messages || []);
      
      // Mark messages as read
      await chatService.markAsRead(appointment._id);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Unable to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    socketRef.current.emit('typing', {
      appointmentId: appointment._id,
      userId: chat?.participants.find(p => p._id === appointment.doctorId?.userId?._id || 
                                           p._id === appointment.patientId?.userId?._id)?._id,
      isTyping: true
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', {
        appointmentId: appointment._id,
        userId: chat?.participants.find(p => p._id === appointment.doctorId?.userId?._id || 
                                             p._id === appointment.patientId?.userId?._id)?._id,
        isTyping: false
      });
    }, 1000);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);
    setError('');

    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const response = await chatService.sendMessage(appointment._id, formData);
      
      setMessages(prev => [...prev, response.message]);
      socketRef.current.emit('send-message', {
        appointmentId: appointment._id,
        message: response.message
      });
      
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
  };

  const downloadAttachment = async (messageId, attachmentIndex, fileName) => {
    try {
      const blob = await chatService.downloadAttachment(
        appointment._id,
        messageId,
        attachmentIndex
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download file');
    }
  };

  const downloadMedicalReport = async () => {
    try {
      const blob = await appointmentService.downloadMedicalReport(appointment._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = appointment.medicalReport.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download medical report');
    }
  };

  const renderMessageContent = (message) => {
    if (message.messageType === 'system') {
      return (
        <div className="text-center py-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    if (message.messageType === 'meeting-link') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Video className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Video Consultation Started</span>
          </div>
          <p className="text-sm text-blue-800 mb-3">{message.content}</p>
          <a
            href={appointment.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Join Video Call
          </a>
        </div>
      );
    }

    const isOwnMessage = message.sender._id === 
      (userRole === 'doctor' ? appointment.doctorId?.userId?._id : appointment.patientId?.userId?._id);

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-md ${
          isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100'
        } rounded-lg p-4`}>
          {!isOwnMessage && (
            <p className={`text-xs mb-1 ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.sender.name}
            </p>
          )}
          
          {message.content && (
            <p className="mb-2 whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.attachments?.map((attachment, idx) => (
            <div key={idx} className="mt-2">
              {attachment.fileType === 'image' ? (
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  className="max-w-full rounded cursor-pointer"
                  onClick={() => window.open(attachment.fileUrl, '_blank')}
                />
              ) : (
                <div 
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                    isOwnMessage ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  onClick={() => downloadAttachment(message._id, idx, attachment.fileName)}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm truncate">{attachment.fileName}</span>
                  <Download className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          
          <p className={`text-xs mt-2 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-400'
          }`}>
            {moment(message.createdAt).format('h:mm A')}
          </p>
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

 return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Appointment Details</h2>
              <div className="flex items-center space-x-4 text-blue-100">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatters.date(appointment.date)}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {appointment.timeSlot?.startTime} - {appointment.timeSlot?.endTime}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Details
            </button>
            {canAccessChat && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 font-medium transition-colors flex items-center ${
                  activeTab === 'chat'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
                {messages.filter(m => 
                  !m.readBy?.some(r => r.user === (userRole === 'doctor' ? 
                    appointment.doctorId?.userId?._id : 
                    appointment.patientId?.userId?._id))
                ).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {messages.filter(m => 
                      !m.readBy?.some(r => r.user === (userRole === 'doctor' ? 
                        appointment.doctorId?.userId?._id : 
                        appointment.patientId?.userId?._id))
                    ).length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'details' ? (
            <div className="p-6 space-y-6">
              {/* Doctor/Patient Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {userRole === 'patient' ? 'Doctor Information' : 'Patient Information'}
                </h3>
                {userRole === 'patient' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <span>Dr. {appointment.doctorId?.userId?.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span>{appointment.doctorId?.userId?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span>{appointment.doctorId?.specialization}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{appointment.doctorId?.clinicAddress}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <span>{appointment.patientId?.userId?.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span>{appointment.patientId?.userId?.email}</span>
                    </div>
                    {appointment.patientId?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <span>{appointment.patientId?.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Appointment Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Consultation Type: </span>
                    <span className="capitalize">{appointment.consultationType} Consultation</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Consultation Fee: </span>
                    <span>${appointment.payment?.amount || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reason for Visit: </span>
                    <p className="mt-1 text-gray-600">{appointment.reason}</p>
                  </div>
                  
                  {/* Medical Report */}
                  {appointment.medicalReport && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Medical Report</p>
                            <p className="text-sm text-gray-600">{appointment.medicalReport.fileName}</p>
                          </div>
                        </div>
                        <button
                          onClick={downloadMedicalReport}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                          <span className="text-sm">Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Meeting Link */}
                  {appointment.meetingLink && appointment.status === 'in-progress' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Video className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Video Consultation Active</span>
                        </div>
                        <a
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Join Call
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!canAccessChat && appointment.status === 'pending' && userRole === 'patient' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-yellow-800 font-medium">Awaiting Doctor Approval</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Chat will be available once the doctor approves your appointment request.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((message, index) => (
                      <div key={index}>
                        {renderMessageContent(message)}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {typingUsers.length > 0 && (
                  <div className="flex items-center space-x-2 text-gray-500 text-sm mt-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span>typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t bg-white p-4">
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={sendMessage} className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-gray-700 p-2"
                    disabled={sending}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />

                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedFile) || sending}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <LoadingSpinner size="small" color="white" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;

