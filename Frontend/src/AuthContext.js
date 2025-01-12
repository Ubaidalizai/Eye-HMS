import { createContext, useContext, useEffect, useState } from "react";
import { BASE_URL } from "./config";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perDoctors, setPerDoctors] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastLoginTime");
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching

      const response = await fetch(`${BASE_URL}/user/doctorsHave-percentage`, {
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
      setPerDoctors(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
      setPerDoctors([]); // Clear doctors on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const signin = async (credentials, callback) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/user/login`, {
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
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("lastLoginTime", Date.now());
      callback();
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, signin, logout, loading, error, perDoctors };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
