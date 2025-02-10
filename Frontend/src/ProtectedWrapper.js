import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import UnauthorizedPage from './pages/UnauthorizedPage';

function ProtectedWrapper({ children, allowedRoles }) {
  const { user, isTokenValid, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isTokenValid()) {
    return <Navigate to='/login' replace />;
  }

  // Check if user has a required role
  if (!allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return children;
}

export default ProtectedWrapper;
