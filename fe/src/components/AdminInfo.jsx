import { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../api/api.js";
import Cookies from "js-cookie";
import { clearTokens } from "../utils/auth.js";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
`;

const Wrapper = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 32rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1f2937;
`;

const Message = styled.p`
  margin-bottom: 1rem;
  text-align: center;
  color: #dc2626;
`;

const InfoCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #f9fafb;
`;

const InfoLabel = styled.p`
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.p`
  color: #1f2937;
`;

const Button = styled.button`
  width: 100%;
  background-color: #ef4444;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #dc2626;
  }
`;

function AdminInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    api
      .get("/user/info", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUserInfo(response.data))
      .catch((error) => {
        if (error.response?.status === 403) {
          setMessage("Access denied: Admin role required");
        } else {
          setMessage(
            "Error fetching user info: " +
              (error.response?.data?.message || "Unknown error")
          );
        }
      });
  }, []);

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  return (
    <Container>
      <Wrapper>
        <Title>Admin - Information</Title>
        {message && <Message>{message}</Message>}
        {userInfo && (
          <InfoCard>
            <InfoLabel>Username</InfoLabel>
            <InfoValue>{userInfo.username}</InfoValue>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{userInfo.email}</InfoValue>
            <InfoLabel>Role</InfoLabel>
            <InfoValue>{userInfo.role}</InfoValue>
          </InfoCard>
        )}
        <Button onClick={handleLogout}>Log Out</Button>
      </Wrapper>
    </Container>
  );
}

export default AdminInfo;
