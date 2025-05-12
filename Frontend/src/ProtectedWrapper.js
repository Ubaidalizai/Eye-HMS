import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingScreen from './components/LoadingScreen';
import UnauthorizedPage from './pages/UnauthorizedPage';

function ProtectedWrapper({ children, allowedRoles }) {
  const { user, isTokenValid, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !isTokenValid()) {
    return <Navigate to='/login' replace />;
  }

  // Check if user has a required role
  if (!allowedRoles.includes(user.role)) {
    console.log(allowedRoles, user.role);
    return <UnauthorizedPage />;
  }

  return children;
}

export default ProtectedWrapper;
