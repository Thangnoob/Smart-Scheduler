import { useState } from "react";
import styled from "styled-components";
import api from "../api/api.js";
import Cookies from "js-cookie";
import { saveTokens } from "../utils/auth.js";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
`;

const FormWrapper = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Message = styled.p`
  margin-bottom: 1rem;
  text-align: center;
  color: #dc2626;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #2563eb;
  }
`;

const LinkText = styled.p`
  margin-top: 1rem;
  text-align: center;
  a {
    color: #3b82f6;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const signInResponse = await api.post("/auth/signin", formData);
      const { token, refreshToken } = signInResponse.data;
      saveTokens(token, refreshToken);

      // Get user info to determine role
      const userInfoResponse = await api.get("/user/info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = userInfoResponse.data.role;

      setMessage("Login successful!");
      setTimeout(() => {
        if (role === "ADMIN") {
          window.location.href = "/admin/info";
        } else if (role === "USER") {
          window.location.href = "/user/info";
        } else {
          setMessage("Unknown role");
        }
      }, 2000);
    } catch (error) {
      setMessage(
        "Error during login: " +
          (error.response?.data?.message || "Invalid email or password")
      );
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>Log In</Title>
        {message && <Message>{message}</Message>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <Button type="submit">Log In</Button>
        </form>
        <LinkText>
          Don't have an account? <a href="/signup">Sign up</a>
        </LinkText>
      </FormWrapper>
    </Container>
  );
}

export default SignIn;
