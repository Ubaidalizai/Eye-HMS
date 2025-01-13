import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedWrapper({ children }) {
  const { user, isTokenValid, loading } = useAuth();

  useEffect(() => {
    console.log("ProtectedWrapper - User:", user);
    console.log("ProtectedWrapper - isTokenValid:", isTokenValid());
    console.log("ProtectedWrapper - Loading:", loading);
  }, [user, isTokenValid, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isTokenValid()) {
    console.log("ProtectedWrapper - Redirecting to login");
    return <Navigate to='/login' replace />;
  }

  return children;
}

export default ProtectedWrapper;
