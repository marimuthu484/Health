// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const storedUser = authService.getCurrentUser();
      
      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await authService.getMe();
          setUser({
            ...response.user,
            id: response.user.id || response.user._id
          });
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear storage
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // In AuthContext.jsx login function
const login = async (email, password, type) => {
  try {
    const response = await authService.login(email, password, type);
    setUser({
      ...response.user,
      id: response.user.id || response.user._id // Ensure ID is available
    });
    setIsAuthenticated(true);
    return { success: true, user: response.user };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
};


  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (userData.role !== 'doctor') {
        setUser({
          ...response.user,
          id: response.user.id || response.user._id
        });
        setIsAuthenticated(true);
      }
      return { success: true, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const isDoctor = () => user?.role === "doctor";
  const isPatient = () => user?.role === "patient";
  const isAdmin = () => user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        login, 
        logout, 
        register, 
        isDoctor, 
        isPatient,
        isAdmin 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
