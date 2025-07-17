import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Cookies from "js-cookie";
import Loading from "../ui/Loading";

// Component dành cho các route chỉ dành cho khách (guest) chưa đăng nhập
const GuestRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <Loading />;
  }

  // Nếu đã đăng nhập ➜ redirect theo role
  if (user) {
    if (user.role === "ADMIN")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "USER") return <Navigate to="/user/info" replace />;
    return <Navigate to="/" replace />;
  }

  // Nếu chưa đăng nhập ➜ cho phép truy cập route
  return children;
};

export default GuestRoute;
