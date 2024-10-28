// ErrorBoundaryContext.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { createContext, useContext } from "react";

export const ErrorBoundaryContext = createContext(null);

export const useErrorBoundary = () => useContext(ErrorBoundaryContext);

export const ErrorBoundaryProvider = ({ children }) => {
  const navigate = useNavigate();

  const handleError = (error) => {
    // Check for a specific error (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      navigate("/unauthorized");
    }
    // Handle other types of errors as needed
  };

  return (
    <ErrorBoundaryContext.Provider value={{ handleError }}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};
