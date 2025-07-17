import { useState } from "react";
import styled from "styled-components";
import api from "../api/api.js";
import { Link } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
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

const nameRegex = /^[a-zA-Z0-9 ]+$/;

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Vui lòng nhập tên")
    .matches(nameRegex, "Tên không được chứa ký tự đặc biệt"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});
function SignUp() {
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/signup", data);
      setMessage("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (error) {
      setMessage(
        "Đăng ký thất bại: " +
          (error.response?.data?.message || "Lỗi không xác định")
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
          <Title>Đăng ký</Title>
          {message && <Message>{message}</Message>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label>Tên</Label>
              <Input type="text" {...register("name")} />
              {errors.name && <Message>{errors.name.message}</Message>}
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <Message>{errors.email.message}</Message>}
            </FormGroup>
            <FormGroup>
              <Label>Mật khẩu</Label>
              <Input type="password" {...register("password")} />
              {errors.password && <Message>{errors.password.message}</Message>}
            </FormGroup>
            <Button type="submit">Đăng ký</Button>
          </form>
          <LinkText>
            Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </LinkText>
        </FormWrapper>
      </Right>
    </Wrapper>
  );
}

export default SignUp;
