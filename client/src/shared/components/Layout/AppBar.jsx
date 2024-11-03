import {
  Avatar,
  Box,
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
import { styled } from "@mui/material/styles";
import { truncateText } from "../../utils/general";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { PRIMARY_SIDEBAR_WIDTH } from "../../constants/layout";
import ThemeToggleButton from "./ThemeToggleButton";
import { useAppContext } from "../../context/AppContext";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useProjectActions from "../../hooks/api/project";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import NotificationButton from "./NotificationButton";
import DocumentationItemButton from "./DocumentationItemButton";
import GitHubItemButton from "./GithubItemButton";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: PRIMARY_SIDEBAR_WIDTH,
    width: `calc(100% - ${PRIMARY_SIDEBAR_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const CustomAppBar = ({ drawerOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const { projectId } = useParams();
  const { getProjectName } = useProjectActions();
  const [currentPageContext, setCurrentPageContext] = useState("Loading...");
  const locationSlugs = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = "/ " + locationSlugs.join(" / ");

  useEffect(() => {
    const fetchProjectDetail = async () => {
      // Assuming the 'dashboard' segment in the URL indicates viewing a specific project
      if (location.pathname.includes("/dashboard/") && projectId) {
        try {
          const name = await getProjectName({ projectId });
          setCurrentPageContext(name);
        } catch (error) {
          console.error("Failed to fetch project name:", error);
          setCurrentPageContext("Dashboard"); // Fallback text
        }
      } else {
        // Update currentPageContext based on the last segment of the URL or a specific rule
        setCurrentPageContext(
          locationSlugs[
            location.pathname.includes("/dashboard")
              ? locationSlugs.findIndex((slug) => slug === "dashboard") + 1
              : locationSlugs.length - 1
          ]
        );
      }
    };

    fetchProjectDetail();
  }, [location, projectId]);

  return (
    <AppBar
      position="absolute"
      open={drawerOpen}
      elevation={0}
      color="secondary"
      sx={{
        backgroundColor: "background.default",
      }}
    >
      <Toolbar
        sx={{
          pr: "24px", // keep right padding when drawer closed
          color: "text.secondary",
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            marginRight: "36px",
            ...(drawerOpen && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Stack sx={{ flexGrow: 1 }}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ textTransform: "capitalize" }}
          >
            {currentPageContext}
          </Typography>
          <Typography fontSize={10}>{breadcrumbs}</Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <GitHubItemButton />
          <DocumentationItemButton />
          <NotificationButton />
          <ThemeToggleButton />
          <UserMenuButtonIcon />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export const UserMenuButtonIcon = () => {
  const { state } = useAppContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getAvatarContent = () => {
    if (state.user && state.user.name) {
      return state.user.name[0].toUpperCase();
    }
    return "?"; // Default avatar content when name is null/undefined
  };

  return (
    <>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "transparent",
              color: "text.primary",
            }}
          >
            {getAvatarContent()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <UserMenu anchorEl={anchorEl} open={open} handleClose={handleClose} />
    </>
  );
};

const UserMenu = ({ anchorEl, open, handleClose }) => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const { logoutWithRedirect } = useAuthRedirect();

  const userName = state.user?.name || "Guest";
  const userEmail = state.user?.email || "";

  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Box display="flex" flexDirection="column" p={2}>
        <Typography variant="body1">
          Hi, {truncateText(userName, 25)}
        </Typography>
        <Typography variant="caption">{truncateText(userEmail, 25)}</Typography>
      </Box>
      <Divider />
      <MenuItem onClick={() => navigate("/account")}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Account Settings
      </MenuItem>
      <MenuItem onClick={logoutWithRedirect}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default CustomAppBar;
