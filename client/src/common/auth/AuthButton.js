import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import history from "../utils/history";

export default function AuthButton({ style }) {
  const [isAuthenticated, setIsAuthenticated] = useContext(AuthContext);

  const logoutHandler = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    localStorage.removeItem("replacements");
    history.push("/"); // redirect to landing
  };

  const loginHandler = () => {
    history.push("/login");
  };

  return (
    <p onClick={isAuthenticated ? logoutHandler : loginHandler} style={style}>
      {isAuthenticated ? "Log out" : "Log in"}
    </p>
  );
}
