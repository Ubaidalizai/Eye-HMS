import {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { BASE_URL } from './config';

// Create a key for localStorage
const AUTH_STATUS_KEY = 'auth_status';

const AuthContext = createContext(null);

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
  const [categories, setCategories] = useState([]);
  const [authStatus, setAuthStatus] = useState('checking'); // "checking", "authenticated", "unauthenticated"
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Use useCallback for functions to prevent unnecessary re-renders
  const isTokenValid = useCallback(() => {
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    if (!lastLoginTime) return false;

    const currentTime = Date.now();
    const timeDifference = currentTime - parseInt(lastLoginTime, 10);
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference < 24;
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
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
      setDoctorsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/categories`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch Categories: ${response.status} ${
            response.statusText
          } - ${errorData?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      setCategories(data.data);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'An unknown error occurred');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const signin = useCallback(async (credentials, callback) => {
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
      setAuthStatus('authenticated');
      localStorage.setItem(AUTH_STATUS_KEY, 'authenticated');
      localStorage.setItem('lastLoginTime', Date.now().toString());
      callback(data); // Pass the user object here
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(
    async (redirect = false) => {
      // Prevent multiple logout calls
      if (authStatus === 'unauthenticated' || loading) {
        return;
      }

      console.log('Logging out...');
      setLoading(true);
      setError(null);

      try {
        // Update state first
        setUser(null);
        setPerDoctors([]);
        setAuthStatus('unauthenticated');

        // Update localStorage
        localStorage.setItem(AUTH_STATUS_KEY, 'logged_out');

        // Then call the backend to invalidate the session
        await fetch(`${BASE_URL}/user/logout`, {
          method: 'POST',
          credentials: 'include',
        });

        // Redirect if needed
        if (redirect) {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Error during logout:', err);
        setError(err.message || 'An unknown error occurred');

        // Still redirect on error
        if (redirect) {
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    },
    [authStatus, loading]
  );

  useEffect(() => {
    // Only run the auth check once when the component mounts
    const initializeAuth = async () => {
      try {
        const storedStatus = localStorage.getItem(AUTH_STATUS_KEY);

        if (storedStatus === 'logged_out') {
          setAuthStatus('unauthenticated');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/user/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to authenticate user');
        }

        const currentUser = await res.json();
        setUser(currentUser);
        setAuthStatus('authenticated');
        localStorage.setItem(AUTH_STATUS_KEY, 'authenticated');

        // Only fetch if user is admin
        if (currentUser.role === 'admin') {
          await fetchDoctors();
          await fetchCategories();
        }
      } catch (err) {
        console.error('Auth init error:', err.message);
        setAuthStatus('unauthenticated');
        localStorage.setItem(AUTH_STATUS_KEY, 'unauthenticated');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchCategories, fetchDoctors]);

  // Use useMemo to prevent unnecessary re-renders of consuming components
  const value = useMemo(
    () => ({
      user,
      signin,
      logout,
      loading,
      error,
      perDoctors,
      categories,
      authStatus,
      isTokenValid,
      doctorsLoading,
      categoriesLoading,
      fetchDoctors,
      fetchCategories,
    }),
    [
      user,
      signin,
      logout,
      loading,
      error,
      perDoctors,
      categories,
      authStatus,
      isTokenValid,
      doctorsLoading,
      categoriesLoading,
      fetchDoctors,
      fetchCategories,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
