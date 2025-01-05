import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, perDoctors, fetchDoctors }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const signin = async (credentials, callback) => {
    console.log("welcome");
    try {
      setLoading(true);
      setError(null);

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
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("lastLoginTime", Date.now());

      if (typeof callback === "function") {
        callback();
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message);
      throw err; // Re-throw the error so it can be caught in the Login component
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const checkLoggedIn = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/check-auth`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Error checking authentication status:", err);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    signin,
    logout,
    loading,
    error,
    perDoctors,
    fetchDoctors,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
