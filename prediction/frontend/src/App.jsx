// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Public pages
import Home from "./pages/Home";
import HeartPrediction from "./pages/HeartPrediction";
import LiverPrediction from "./pages/LiverPrediction";
import DoctorRecommendation from "./pages/DoctorRecommendation";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Consultation from "./pages/Consultation";
import UserProfile from "./pages/UserProfile";
import VideoCall from "./pages/VideoCall";

// Admin pages
import Admin from "./admin/Admin";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        
        <main className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/heart-prediction" element={<HeartPrediction />} />
            <Route path="/liver-prediction" element={<LiverPrediction />} />
            <Route path="/doctor-recommendation" element={<DoctorRecommendation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Patient Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="patient">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/consultation" element={
              <ProtectedRoute role="patient">
                <Consultation />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* Protected Doctor Routes */}
            <Route path="/doctor-dashboard" element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Video Call Route - Accessible to both doctor and patient */}
            <Route path="/video-call/:consultationId" element={
              <ProtectedRoute allowedRoles={['doctor', 'patient']}>
                <VideoCall />
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
