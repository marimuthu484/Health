// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If specific role is required, check it
  if (role && user?.role !== role) {
    // For video call, allow both doctor and patient
    if (window.location.pathname.includes('/video-call/')) {
      if (user?.role === 'doctor' || user?.role === 'patient') {
        return children;
      }
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
