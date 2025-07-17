import React, { createContext, useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api.js";
import Cookies from "js-cookie";
import { clearTokens } from "../utils/auth.js";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/user/info");

        setUser(res.data);
      } catch (error) {
        setError(error);
        console.error("Failed to fetch user info:", error);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const logout = () => {
    clearTokens();
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
