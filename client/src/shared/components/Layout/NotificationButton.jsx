import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled } from "@mui/material/styles";
import { truncateText } from "../../utils/general";

import { PRIMARY_SIDEBAR_WIDTH } from "../../constants/layout";
import ThemeToggleButton from "./ThemeToggleButton";
import { useAppContext } from "../../context/AppContext";
import { useLocation, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import useProjectActions from "../../hooks/api/project";
import useApi from "../../hooks/useApi";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import useNotificationActions from "../../hooks/api/notification";

const getNotificationTitle = (count) => {
  if (count === 0) {
    return "You have no unread notifications";
  } else if (count === 1) {
    return "You have 1 unread notification";
  } else {
    return `You have ${count} unread notifications`;
  }
};

const NotificationButton = () => {
  const { state } = useAppContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadNotificationsCount = state.notifications.filter(
    (n) => !n.read
  ).length;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Tooltip title={getNotificationTitle(unreadNotificationsCount)} arrow>
          <Badge badgeContent={unreadNotificationsCount} color="primary">
            <NotificationsIcon />
          </Badge>
        </Tooltip>
      </IconButton>
      <NotificationMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

const NotificationMenu = ({ anchorEl, open, handleClose }) => {
  const { state } = useAppContext();
  //   const navigate = useNavigate();

  const notifications = state.notifications;
  const hasNotifications = notifications.length > 0;

  return (
    <Menu
      anchorEl={anchorEl}
      id="notification-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box display="flex" flexDirection="column" p="0.5rem 1rem">
        Notifications
      </Box>
      <Divider />
      {hasNotifications ? (
        notifications.map((n) => (
          <NotificationMenuItem key={n.id} notification={n} />
        ))
      ) : (
        <MenuItem>No notifications</MenuItem>
      )}
      {/* <MenuItem onClick={() => navigate("/account")}>
      </MenuItem>
      <MenuItem onClick={logout}>
      <ListItemIcon>
      <Logout fontSize="small" />
      </ListItemIcon>
      Logout
      </MenuItem> */}
    </Menu>
  );
};

const NotificationMenuItem = ({ notification }) => {
  const { acceptNotification, declineNotification } = useNotificationActions();

  return (
    <MenuItem sx={{ width: 400 }}>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column" sx={{ flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            <strong>{notification.sender.username}</strong> wants to invite you
            to project <strong>{notification.project.name}</strong>
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="caption">
              sent {moment.utc(notification.created_at).fromNow()}
            </Typography>
            {notification.status !== "pending" && (
              <Typography variant="caption">
                You {notification.status} this.
              </Typography>
            )}
            {notification.read && (
              <Typography variant="caption" color="textSecondary">
                (Read)
              </Typography>
            )}
          </Stack>
        </Box>
        {notification.status === "pending" && (
          <Stack direction="row" spacing={2} mt={1}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={() => acceptNotification(notification._id)}
            >
              Accept
            </Button>
            <Button variant="outlined" size="small" startIcon={<CloseIcon />}>
              Reject
            </Button>
          </Stack>
        )}
      </Box>
    </MenuItem>
  );
};

export default NotificationButton;
