import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { useUser } from "../../context/UserContext";
import Loading from "../ui/Loading";

const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  color: #b91c1c;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  max-width: 500px;
  margin: 4rem auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 0.5rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #2563eb;
  }
`;

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, logout } = useUser();
  const token = Cookies.get("token");
  const navigate = useNavigate();

  if (loading) return <Loading text="Đang tải dữ liệu..." />;

  if (!token || !user) {
    // Không có token hoặc user ➜ redirect login
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return (
      <ErrorContainer>
        <h2>Bạn không có quyền truy cập trang này</h2>
        <p>Vui lòng quay lại trang đăng nhập hoặc liên hệ quản trị viên.</p>
        <Button onClick={() => navigate("/login")}>
          Quay lại trang đăng nhập
        </Button>
      </ErrorContainer>
    );
  }

  return children;
};
export default ProtectedRoute;
