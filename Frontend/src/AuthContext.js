import { createContext, useContext, useEffect, useState } from 'react';

// Create AuthContext
const AuthContext = createContext();

// Custom Hook to Use Auth Context
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]); // Store user data
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors

  // Fetch user data from API
  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/doctors/doctorsHave-percentage',
        {
          credentials: 'include', // To handle cookies/sessions
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch doctors data');
      }

      const data = await response.json();
      setDoctors(data); // Set fetched doctors data
    } catch (err) {
      setError(err.message); // Store error message
      setDoctors(null); // Clear doctors on error
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Logout function
  const logout = () => {
    setDoctors(null); // Clear doctors data
    // Perform logout API call if needed
  };

  // Context value to provide globally
  const value = { doctors, loading, error, fetchDoctors, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
