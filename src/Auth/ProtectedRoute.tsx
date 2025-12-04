// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../services/common/Auth.services';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  // Check authentication on every render
  const isAuthenticated = AuthService.isAuthenticated();

  // Set up token expiry check interval
  useEffect(() => {
    const checkTokenExpiry = () => {
      if (!AuthService.isAuthenticated()) {
        // Token expired or invalid, will trigger re-render and redirect
        window.location.href = '/login';
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;