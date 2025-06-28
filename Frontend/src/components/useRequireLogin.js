import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const useRequireLogin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // console.log(user);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const lastLoginTime = localStorage.getItem("lastLoginTime");
    if (
      !lastLoginTime ||
      Date.now() - parseInt(lastLoginTime, 10) > TOKEN_EXPIRATION_TIME
    ) {
      // Clear user data
      localStorage.removeItem("user");
      localStorage.removeItem("lastLoginTime");
      navigate("/login", { replace: true });
    }
  }, [navigate, user]);
};

export default useRequireLogin;
