// Create a new file for axios interceptor setup
import axios from 'axios';
import { BASE_URL } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of auth-related endpoints that should not trigger logout on 401
const authEndpoints = ['/user/me', '/user/login', '/user/logout'];

// Add a response interceptor
api.interceptors.response.use(
  (response) => response, // Return successful responses as-is
  (error) => {
    // Check if this is a 401 error and not from an auth endpoint
    if (
      error.response &&
      error.response.status === 401 &&
      !authEndpoints.some((endpoint) => error.config.url.includes(endpoint))
    ) {
      // Prevent handling if already in progress
      if (localStorage.getItem('auth_check_in_progress') !== 'true') {
        localStorage.setItem('auth_check_in_progress', 'true');

        // Clear auth state
        localStorage.setItem('auth_status', 'unauthenticated');
        localStorage.removeItem('token_expiry');

        // Clear the in-progress flag after a short delay
        setTimeout(() => {
          localStorage.removeItem('auth_check_in_progress');
          window.location.href = '/login';
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;
