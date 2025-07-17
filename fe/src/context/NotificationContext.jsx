import React, { createContext, useContext, useState } from "react";
import NotificationPopup from "../components/ui/NotificationPopup";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // success | error | info
  });

  const notify = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const close = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification.show && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={close}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
