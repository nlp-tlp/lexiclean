import React, { useState, useEffect, createContext } from "react";
import axios from "../utils/api-interceptor";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Checks if token is still valid - if it is authentication will be true
    // This helps persist over reloads which resets the react context state
    // rather than setting isAuthenticated into localstorage

    const checkToken = async () => {
      // console.log("Checking token status");
      await axios
        .get("/api/auth/token/validate")
        .then(function (response) {
          // console.log(`AuthContext: ${response.data.valid}`);
          if (response.data.valid) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            window.localStorage.removeItem("token");
          }
        })
        .catch(function () {
          setIsAuthenticated(false);
          window.localStorage.removeItem("token");
        });
    };

    const token = window.localStorage.getItem("token");
    if (token != null && token.length > 0) {
      checkToken().catch((error) => console.debug(error));
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={[isAuthenticated, setIsAuthenticated]}>
      {children}
    </AuthContext.Provider>
  );
};
