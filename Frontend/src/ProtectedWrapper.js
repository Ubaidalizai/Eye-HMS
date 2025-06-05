import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingScreen from './components/LoadingScreen';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { navigateByRole } from './utils/roleNavigation';

function ProtectedWrapper({ children, allowedRoles }) {
  const { user, loading, authStatus, isTokenValid } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only handle role-based navigation if authenticated and haven't redirected yet
    if (
      authStatus === 'authenticated' &&
      user &&
      !allowedRoles.includes(user.role) &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;

      // Get the target route for the user's role
      const getTargetRoute = (userRole) => {
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

      const targetRoute = getTargetRoute(user.role);

      // Only redirect if we're not already on the target route
      if (location.pathname !== targetRoute) {
        navigateByRole(user, navigate);
      }
    }
  }, [user, authStatus, allowedRoles, navigate, location.pathname]);

  // Reset redirect flag when user changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [user?.id]);

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
