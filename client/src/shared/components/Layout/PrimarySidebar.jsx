import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CreateIcon from "@mui/icons-material/Create";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import { Link, useLocation } from "react-router-dom";
import { PRIMARY_SIDEBAR_WIDTH } from "../../constants/layout";
import BrandToolbar from "./BrandToolbar";

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    border: "0px",
    position: "relative",
    whiteSpace: "nowrap",
    width: PRIMARY_SIDEBAR_WIDTH,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const PrimarySidebar = ({ drawerOpen, handleDrawerToggle }) => {
  const location = useLocation();

  const activeStyle = (path) => ({
    color: location.pathname === path ? "text.active" : "text.secondary",
    fontWeight: location.pathname === path && "bold",
    backgroundColor: location.pathname === path && "background.active",
    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
      // Directly style the children
      color: "inherit", // Ensures that both text and icons inherit the ListItem color
    },
  });

  return (
    <Drawer variant="permanent" open={drawerOpen}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
          color: "text.secondary",
          backgroundColor: "background.default",
        }}
      >
        <Box
          display="flex"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <BrandToolbar />
          <IconButton onClick={handleDrawerToggle} color="text.secondary">
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Divider flexItem />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
        sx={{ backgroundColor: "background.default" }}
      >
        <Box p={2}>
          <List>
            <ListItem
              component={Link}
              to="/projects"
              sx={activeStyle("/projects")}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary={"Projects"} />
            </ListItem>
            <ListItem
              component={Link}
              to="/project/create"
              sx={activeStyle("/project/create")}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText primary={"New Project"} />
            </ListItem>
            <ListItemButton
              component={Link}
              disabled={!process.env.REACT_APP_DOCS_URL}
              to={process.env.REACT_APP_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "text.secondary",
              }}
            >
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText primary={"Documentation"} />
            </ListItemButton>
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};
export default PrimarySidebar;
