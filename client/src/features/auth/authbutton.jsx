import React, { useContext } from "react";
import { AuthContext } from "./authcontext";
import history from "../utils/history";

import { logout } from "./userSlice";
import { useDispatch } from "react-redux";

export const AuthButton = ({ style, variant }) => {
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

  let textLogin;
  let textLogout;
  if (variant && isAuthenticated) {
    textLogout = variant;
  } else if (variant && !isAuthenticated) {
    textLogin = variant;
  } else {
    textLogin = "login";
    textLogout = "logout";
  }

  return (
    <p onClick={isAuthenticated ? logoutHandler : loginHandler} style={style}>
      {isAuthenticated ? textLogout : textLogin}
    </p>
  );
};
