import styled, { keyframes } from "styled-components";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";

const slideIn = keyframes`
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const PopupContainer = styled.div`
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  background-color: ${(props) =>
    props.type === "error" ? "#fee2e2" : "#d1fae5"};
  color: ${(props) => (props.type === "error" ? "#b91c1c" : "#065f46")};
  border-left: 6px solid
    ${(props) => (props.type === "error" ? "#dc2626" : "#10b981")};
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  min-width: 240px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: ${slideIn} 0.4s ease-out forwards, ${fadeOut} 0.3s ease-in forwards;
  animation-delay: 0s, 2.7s;
  animation-fill-mode: forwards;
`;

const Message = styled.div`
  flex: 1;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background-color: ${(props) =>
    props.type === "error" ? "#dc2626" : "#10b981"};
  animation: progress 3s linear forwards;

  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

const NotificationPopup = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <PopupContainer type={type}>
      {type === "error" ? (
        <FaTimesCircle size={20} />
      ) : (
        <FaCheckCircle size={20} />
      )}
      <Message>{message}</Message>
      <ProgressBar type={type} />
    </PopupContainer>
  );
};

export default NotificationPopup;
