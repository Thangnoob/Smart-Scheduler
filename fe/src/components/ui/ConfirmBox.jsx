import React from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Dialog = styled.div`
  background-color: #fff;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.2s ease-out;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #4b5563;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  ${({ variant }) =>
    variant === "confirm"
      ? `
    background-color: #17a101ff;
    color: white;

    &:hover {
      background-color: #117f00ff;
    }
  `
      : `
    background-color: #e5e7eb;
    color: #111827;

    &:hover {
      background-color: #d1d5db;
    }
  `}
`;

const ConfirmBox = ({
  open,
  message = "Bạn chắc chắn?",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <Overlay>
      <Dialog>
        <Title>Xác nhận hành động</Title>
        <Message>{message}</Message>
        <ButtonRow>
          <Button variant="confirm" onClick={onConfirm}>
            Xác nhận
          </Button>
          <Button variant="cancel" onClick={onCancel}>
            Hủy
          </Button>
        </ButtonRow>
      </Dialog>
    </Overlay>
  );
};

export default ConfirmBox;
