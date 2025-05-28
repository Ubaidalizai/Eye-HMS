'use client';

import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingScreen from './components/LoadingScreen';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { navigateByRole } from './utils/roleNavigation';

function ProtectedWrapper({ children, allowedRoles }) {
  const { user, loading, authStatus, isTokenValid } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only handle role-based navigation if authenticated
    if (
      authStatus === 'authenticated' &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      navigateByRole(user, navigate); // Redirect based on role
    }
  }, [user, authStatus, allowedRoles, navigate]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (authStatus !== 'authenticated' || !user || !isTokenValid()) {
    // Clear user data and redirect to login
    localStorage.removeItem('lastLoginTime');
    return <Navigate to='/login' replace />;
  }

  // Handle role-based access
  if (!allowedRoles.includes(user.role)) {
    return null; // Prevent flash before redirect
  }

  return children;
}

export default ProtectedWrapper;
