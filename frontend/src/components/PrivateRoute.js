import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'pio':
        return <Navigate to="/pio-dashboard" />;
      case 'appellate':
        return <Navigate to="/appeal-dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default PrivateRoute;