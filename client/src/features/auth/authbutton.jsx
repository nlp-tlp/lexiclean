import React, { useContext } from "react";
import { AuthContext } from "./authcontext";
import history from "../utils/history";

import { logout } from "./userSlice";
import { useDispatch } from "react-redux";

export const AuthButton = ({ style }) => {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useContext(AuthContext);

  const logoutHandler = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    dispatch(logout());
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
};
