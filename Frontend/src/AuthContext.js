import React, { createContext, useState, useEffect, useContext } from 'react';
import { BASE_URL } from './config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perDoctors, setPerDoctors] = useState([]);

  function isTokenValid() {
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    if (!lastLoginTime) return false;

    const currentTime = Date.now();
    const timeDifference = currentTime - parseInt(lastLoginTime, 10);
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference < 24;
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && isTokenValid()) {
        setUser(JSON.parse(storedUser));
        await fetchDoctors();
      } else {
        logout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signin = async (credentials, callback) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to login';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('lastLoginTime', Date.now().toString());
      await fetchDoctors();
      callback();
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPerDoctors([]);
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginTime');
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/user/doctorsHave-percentage`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch doctors data: ${response.status} ${
            response.statusText
          } - ${errorData?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      setPerDoctors(data);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'An unknown error occurred');
      setPerDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    signin,
    logout,
    loading,
    error,
    perDoctors,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
