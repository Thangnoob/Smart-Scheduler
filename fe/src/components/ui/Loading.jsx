import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(243, 244, 246, 0.8); /* Tailwind gray-100 opacity */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  border: 4px solid #d1d5db; /* Tailwind gray-300 */
  border-top: 4px solid #3b82f6; /* Tailwind blue-500 */
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  color: #374151; /* Tailwind gray-700 */
`;

const Loading = ({ text = "Đang tải..." }) => (
  <Overlay>
    <div style={{ textAlign: "center" }}>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </div>
  </Overlay>
);

export default Loading;
