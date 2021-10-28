import React, { useEffect, useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import axios from "../utils/api-interceptor";
import { AuthContext } from "./authcontext";
import { toast } from "react-toastify";
import history from "../utils/history";

export const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [, setIsAuthenticated] = useContext(AuthContext);

  // Trigger a call to the api. This will force the session to expire
  // even if no API calls exist on the protected route.
  useEffect(() => {
    const checkToken = async () => {
      const expiredToastId = "session-expired-toast-id";
      return axios.get("/api/auth/token/validate").then(function (response) {
        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          window.localStorage.removeItem("token");
          toast.info("Session expired. Please log in.", {
            toastId: expiredToastId,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: 0,
          });
          history.push("/");
        }
      });
    };
    checkToken().catch((error) => console.debug(error));
  });

  const token = window.localStorage.getItem("token");
  if (token != null && token.length > 0) {
    return <Route {...rest} />;
  } else {
    return <Redirect to="/unauthorized" />;
  }
};
