import React from "react";

export const Button = ({
  children,
  onClick,
  className = "",
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition ${className}`}
  >
    {children}
  </button>
);
