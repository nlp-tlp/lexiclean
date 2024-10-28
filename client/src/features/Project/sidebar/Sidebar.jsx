import { useContext } from "react";
import {
  Stack,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Toolbar,
  ListItem,
  Paper,
  IconButton,
  Badge,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import HomeIcon from "@mui/icons-material/Home";
import { ProjectContext } from "../../../shared/context/ProjectContext";
import EntitySelector from "./EntitySelector";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { styled } from "@mui/material/styles";
import UserDetail from "../../../shared/components/Layout/UserDetail";
import BrandToolbar from "../../../shared/components/Layout/BrandToolbar";
import Contextualiser from "./Contextualiser";
import LogoutButton from "../../../shared/components/Layout/LogoutButton";
import { ANNOTATION_SIDEBAR_WIDTH } from "../../../shared/constants/layout";
import useProjectActions from "../../../shared/hooks/api/project";

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: ANNOTATION_SIDEBAR_WIDTH,
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

const Sidebar = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [state, dispatch] = useContext(ProjectContext);
  const { saveTexts } = useProjectActions();

  const unsavedItemsCount = state.texts
    ? Object.values(state.texts).length -
      Object.values(state.texts).filter((text) => text.saved).length
    : 0;

  const savePending = unsavedItemsCount !== 0;

  const handlePageSave = async () => {
    await saveTexts({
      projectId,
      textIds: state.texts.map((text) => text._id),
      save: true,
    });
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-evenly"
        p={2}
        mb={2}
        as={Paper}
        elevation={0}
        variant="outlined"
        sx={{ backgroundColor: "background.default" }}
      >
        <IconButton onClick={() => navigate("/projects")}>
          <Tooltip title="Click to navigate to the projects page.">
            <HomeIcon />
          </Tooltip>
        </IconButton>
        <IconButton onClick={() => navigate(`/dashboard/${projectId}`)}>
          <Tooltip title="Click to navigate to the projects dashboard.">
            <DashboardIcon />
          </Tooltip>
        </IconButton>
        <Badge badgeContent={unsavedItemsCount} color="primary">
          <IconButton onDoubleClick={handlePageSave} disabled={!savePending}>
            <Tooltip
              title={`Double click to save ${unsavedItemsCount} items on page`}
            >
              <SaveIcon />
            </Tooltip>
          </IconButton>
        </Badge>
      </Box>
      <EntitySelector />
      <Contextualiser />
      {/* <Box>
          <Box component="nav" p="1rem 1rem 1rem 0rem">
            <List>
              {state.project && state.project.parallelCorpus && (
                <Tooltip
                  title="Click to toggle reference text visibility"
                  placement="right"
                >
                  <ListItemButton
                    onClick={() =>
                      dispatch({
                        type: "SET_VALUE",
                        payload: { showReferences: !state.showReferences },
                      })
                    }
                    sx={{ color: "text.secondary" }}
                    key="reference-switch-btn"
                  >
                    <ListItemIcon>
                      {state.showReferences ? (
                        <ToggleOnIcon />
                      ) : (
                        <ToggleOffIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${
                        state.showReferences ? "Hide" : "Show"
                      } Reference Texts`}
                    />
                  </ListItemButton>
                </Tooltip>
              )}
            </List>
          </Box>
        </Box> */}
    </>
  );
};

export default Sidebar;
