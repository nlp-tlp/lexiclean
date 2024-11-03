import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Skeleton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { truncateText } from "../../utils/general";

const UserDetail = ({ drawerOpen = true, handleDrawerToggle }) => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const UserAvatar = (showTooltip = false) => (
    <Tooltip
      title={
        showTooltip && `Logged in as ${state.user.name} (${state.user.email})`
      }
    >
      <Avatar
        alt={`${state.user.name} avatar`}
        src={state.user.avatar || "/static/default-avatar.png"}
        aria-label="user-avatar"
        sx={{ cursor: showTooltip && "help" }}
      >
        {!state.user.avatar && state.user.name ? state.user.name[0] : ""}
      </Avatar>
    </Tooltip>
  );

  if (drawerOpen) {
    return (
      <Stack direction="row" alignItems="center" spacing={2}>
        {state.user ? (
          <>
            <UserAvatar />
            <Stack>
              <Tooltip title={state.user.name}>
                <Typography
                  variant="subtitle"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {truncateText(state.user.name, 25)}
                </Typography>
              </Tooltip>
              <Tooltip title={state.user.email}>
                <Typography
                  variant="subtitle"
                  color="text.secondary"
                  fontSize={12}
                  sx={{ cursor: "help" }}
                >
                  {truncateText(state.user.email, 25)}
                </Typography>
              </Tooltip>
            </Stack>
            <Tooltip title="Click to view account settings">
              <IconButton onClick={() => navigate("/account")}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Skeleton width={200} height={60} />
        )}
      </Stack>
    );
  } else {
    return (
      <Box>
        <UserAvatar />
      </Box>
    );
  }
};

export default UserDetail;
