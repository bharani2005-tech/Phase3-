import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext({});

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  // Set axios authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('auth_token', access_token);
      
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const verifyOTP = async (otpData) => {
    try {
      const response = await axios.post('/auth/verify-otp', otpData);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'OTP verification failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await axios.post('/auth/resend-otp', { email });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to resend OTP';
      toast.error(message);
      throw new Error(message);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to send reset code';
      toast.error(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await axios.post('/auth/reset-password', resetData);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Password reset failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    loading,
    token,
    register,
    login,
    logout,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
