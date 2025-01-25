import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedWrapper({ children }) {
  const { user, isTokenValid, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isTokenValid()) {
    console.log('ProtectedWrapper - Redirecting to login');
    return <Navigate to='/login' replace />;
  }

  return children;
}

export default ProtectedWrapper;
