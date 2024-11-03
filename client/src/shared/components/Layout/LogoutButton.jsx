import { Button, IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useAuth } from "../../context/AuthContext";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

const LogoutButton = ({ drawerOpen = true }) => {
  const { isAuthenticated, logout } = useAuth();
  const { loginWithRedirect } = useAuthRedirect();

  if (drawerOpen) {
    return (
      <Button
        variant="outlined"
        startIcon={isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
        onClick={
          isAuthenticated
            ? () => logout({ returnTo: window.location.origin })
            : loginWithRedirect
        }
      >
        Log{isAuthenticated ? "out" : "in"}
      </Button>
    );
  } else {
    return (
      <Tooltip title={`Click to ${isAuthenticated ? "logout" : "login"}`}>
        <IconButton
          onClick={
            isAuthenticated
              ? () => logout({ returnTo: window.location.origin })
              : loginWithRedirect
          }
        >
          {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
        </IconButton>
      </Tooltip>
    );
  }
};

export default LogoutButton;
