'use client';

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../AuthContext.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

/**
 * RouteGuard component for protecting routes based on user roles
 * This component eliminates the need for nested ProtectedWrapper components
 */
function RouteGuard({ children, allowedRoles, redirectTo = '/login' }) {
  const { user, loading, authStatus, isTokenValid } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated and token is valid
  const isAuthenticated = authStatus === 'authenticated' && user && isTokenValid();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    localStorage.removeItem('lastLoginTime');
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user.role);

  // If user doesn't have required role, redirect to their default route
  if (!hasRequiredRole) {
    const getDefaultRoute = (userRole) => {
      switch (userRole) {
        case 'receptionist':
          return '/pharmacy';
        case 'doctor':
          return '/doctor-finance';
        case 'admin':
          return '/';
        default:
          return '/not-found';
      }
    };

    const defaultRoute = getDefaultRoute(user.role);
    
    // Only redirect if we're not already on the default route
    if (location.pathname !== defaultRoute) {
      return <Navigate to={defaultRoute} replace />;
    }
    
    // If we're on the default route but don't have access, show nothing
    return null;
  }

  return children;
}

export default RouteGuard;
