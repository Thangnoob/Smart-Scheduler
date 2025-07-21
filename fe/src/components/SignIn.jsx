import { useState } from "react";
import styled from "styled-components";
import api from "../api/api.js";
import { saveTokens } from "../utils/auth.js";
import { useNotification } from "../context/NotificationContext";
import { Link, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6; /* Gray-100 */
`;

// Left image section
const Left = styled.div`
  flex: 1;
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }

  img {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100vh;
    object-fit: cover;
  }
`;

// Right form section
const Right = styled.div`
  flex: 1;
  width: 100%;
  padding: 2rem;
  background-color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 640px) {
    padding: 5rem 2rem;
  }

  @media (min-width: 768px) {
    padding: 8rem 4rem;
  }

  @media (min-width: 1024px) {
    padding: 9rem 3rem;
  }
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937; /* Gray-800 */
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Message = styled.p`
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  color: #374151; /* Gray-700 */
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #111827;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
    outline: none;
  }
`;

const RememberContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  label {
    margin-left: 0.5rem;
    color: #4b5563; /* Gray-600 */
    font-size: 0.95rem;
  }

  input {
    accent-color: #3b82f6;
  }
`;

const ForgotPassword = styled.div`
  margin-bottom: 1.5rem;
  text-align: right;

  a {
    color: #3b82f6;
    font-size: 0.95rem;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Button = styled.button`
  width: 100%;
  background-color: #3b82f6;
  color: white;
  padding: 0.65rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #4b5563;

  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function SignIn() {
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
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

      // Lấy role người dùng
      const userInfoResponse = await api.get("/user/info");
      const role = userInfoResponse.data.role;

      notify("Đăng nhập thành công!", "success");
      console.log(userInfoResponse.data);

      setTimeout(() => {
        if (role === "ADMIN") navigate("/admin/dashboard", { replace: true });
        else if (role === "USER")
          navigate("/user/dashboard", { replace: true });
        else setMessage("Unknown role");
      }, 1000);
    } catch (error) {
      notify(
        "Đăng nhập thất bại: " +
          (error.response?.data?.message || "Sai email hoặc mật khẩu"),
        "error"
      );
    }
  };

  return (
    <Wrapper>
      <Left>
        <img
          src="https://placehold.co/800x/667fff/ffffff.png?text=Your+Image&font=Montserrat"
          alt="Login Illustration"
        />
      </Left>
      <Right>
        <FormWrapper>
          <Title>Đăng nhập</Title>
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

            <ForgotPassword>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </ForgotPassword>
            <Button type="submit">Đăng nhập</Button>
          </form>
          <LinkText>
            Bạn chưa có tài khoản? <Link to="/signup">Đăng ký ở đây</Link>
          </LinkText>
        </FormWrapper>
      </Right>
    </Wrapper>
  );
}

export default SignIn;
