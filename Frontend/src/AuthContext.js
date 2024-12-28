import { createContext, useContext, useEffect, useState } from "react";

// Create AuthContext
const AuthContext = createContext();

// Custom Hook to Use Auth Context
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);

  // Fetch user data from API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching
      console.log("Fetching doctors...");

      const response = await fetch("http://localhost:4000/api/v1/user", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse error response (if applicable)
        throw new Error(
          `Failed to fetch doctors data: ${response.status} ${
            response.statusText
          } - ${errorData?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      setDoctors(data);
      console.log("Fetched doctors:", data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
      setDoctors([]); // Clear doctors on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);
  // Signin function
  const signin = async (credentials, callback) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const response = await fetch("http://localhost:4000/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Login failed");
      }

      const data = await response.json();
      setUser(data); // Set the logged-in user in context
      localStorage.setItem("user", JSON.stringify(data)); // Store user in localStorage
      // Store in localStorage
      localStorage.setItem("lastLoginTime", Date.now()); // Store login time
      callback(); // Execute callback (e.g., navigate after login)
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);
  // Logout function
  const logout = async () => {
    try {
      await fetch("http://localhost:4000/api/v1/user/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null); // Clear the user state
      localStorage.removeItem("user"); // Remove from localStorage
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // Context value
  const value = { user, signin, logout, loading, error, doctors };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
