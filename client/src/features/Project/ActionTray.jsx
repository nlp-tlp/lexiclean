import {
  Stack,
  Tooltip,
  Chip,
  Typography,
  Divider,
  CircularProgress,
  Box,
  Menu,
  MenuList,
  MenuItem,
  Badge,
  IconButton,
  Alert,
  Link,
  ListItemIcon,
  Popover,
} from "@mui/material";
import {
  Save as SaveIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { useContext, useState } from "react";
import { ProjectContext } from "../../shared/context/ProjectContext";
import JoinFullIcon from "@mui/icons-material/JoinFull";
import { useModal } from "../../shared/context/ModalContext";
import { teal } from "@mui/material/colors";
import useProjectActions from "../../shared/hooks/api/project";
import FlagIcon from "@mui/icons-material/Flag";
import { useParams } from "react-router-dom";
import useAnnotationActions from "../../shared/hooks/api/annotation";
import InfoIcon from "@mui/icons-material/Info";
import { StyledChip } from "../Dashboard/Details";
import useTextActions from "../../shared/hooks/api/text";
import { truncateText } from "../../shared/utils/general";

const ActionTray = ({ text, textIndex }) => {
  const [state, dispatch] = useContext(ProjectContext);
  const tokenCount = text.tokens.length ?? 0;
  const { openModal } = useModal();
  const { saveTexts } = useProjectActions();
  const { projectId } = useParams();
  const { getAISuggestion } = useTextActions();
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "info-popover" : undefined;

  const handleSave = async () => {
    await saveTexts({
      projectId,
      textIds: [text._id],
      save: !text.saved,
    });
  };

  const handleTokenizeText = () => {
    dispatch({
      type: "SET_VALUE",
      payload: {
        tokenizeTextId: state.tokenizeTextId === text._id ? null : text._id,
      },
    });
  };

  const handleAISuggestion = async () => {
    try {
      setLoadingSuggestion(true);

      const response = await getAISuggestion({ textId: text._id });
      const llmResponse = TextSuggestions({ suggestions: response });

      openModal(llmResponse, "AI Suggestion");
    } catch (error) {
      console.error("handleAISuggestion error:", error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(text._id);
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={2}>
        <Tooltip
          title={text.saved ? "Click to unsave" : "Click to save"}
          placement="top"
        >
          <Chip
            label={text.saved ? "Unsave" : "Save"}
            size="small"
            icon={<SaveIcon />}
            color={text.saved ? "primary" : "warning"}
            variant={text.saved ? "contained" : "outlined"}
            clickable
            onClick={handleSave}
          />
        </Tooltip>
        <Tooltip
          title={
            "Concatenation is currently unavailable"
            // state.tokenizeTextId === textId
            //   ? "Click to cancel concatenation"
            //   : "Click to concatenate tokens"
          }
          placement="top"
        >
          <span>
            <Chip
              clickable
              disabled
              // disabled={
              //   state.tokenizeTextId !== null && state.tokenizeTextId !== textId
              // }
              label="Concatenate"
              size="small"
              icon={<JoinFullIcon />}
              color={state.tokenizeTextId === text._id ? "primary" : "default"}
              variant={
                state.tokenizeTextId === text._id ? "contained" : "outlined"
              }
              onClick={handleTokenizeText}
            />
          </span>
        </Tooltip>
        <TrayFlagChip text={text} />
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Click to get AI suggestion" placement="top">
          <StyledChip
            clickable
            label="AI Suggestion"
            size="small"
            color="primary"
            icon={
              loadingSuggestion ? (
                <CircularProgress size={16} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={handleAISuggestion}
          />
        </Tooltip>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      >
        <Typography
          fontSize="inherit"
          sx={{
            fontWeight: 900,
          }}
        >
          {textIndex + 1 + (state.pageNumber - 1) * state.pageLimit}
        </Typography>
        <Tooltip title="Click to show more information" arrow placement="top">
          <IconButton
            sx={{ height: 24, width: 24 }}
            aria-describedby={id}
            onClick={handleClick}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <Stack direction="column" spacing={1} p={1}>
            <StyledChip label={`Tokens: ${tokenCount}`} />
            <StyledChip
              label={`Identifier(s):
              ${
                text.identifiers === undefined
                  ? "Unavailable"
                  : text.identifiers.join(", ")
              }`}
            />
            <StyledChip label={`Rank: ${text.rank}`} />
            <StyledChip
              label={`Weight: ${Math.round(text.weight * 1000) / 1000}`}
            />
            <Tooltip title={`Click to copy to clipboard: ${text._id}`} arrow>
              <StyledChip
                label={truncateText(text._id, 6, true)}
                sx={{ cursor: "help" }}
                onClick={handleCopyToClipboard}
              />
            </Tooltip>
          </Stack>
        </Popover>
      </Stack>
    </Stack>
  );
};

const TrayFlagChip = ({ text }) => {
  const { projectId } = useParams();
  const [state, dispatch] = useContext(ProjectContext);
  const { addFlag, deleteFlag } = useAnnotationActions();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFlagClick = async (event) => {
    const flagIndex = event.target.value;

    const flagId = state.project.flags[flagIndex]._id;

    if (text.flags.includes(flagId)) {
      // if flag exists, delete
      await deleteFlag({ textId: text._id, flagId });
    } else {
      // if flag doesn't exist, add
      await addFlag({ textId: text._id, flagId });
    }
  };

  return (
    <>
      <Tooltip title="Click to add/remove flag(s) on this text" placement="top">
        <Badge badgeContent={text.flags.length} max={9} color="primary">
          <StyledChip
            clickable
            label="Flags"
            size="small"
            icon={<FlagIcon color="inherit" />}
            // variant={"outlined"}
            onClick={handleOpen}
          />
        </Badge>
      </Tooltip>
      <Menu
        id="flag-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuList dense>
          {state.project.flags.length > 0 ? (
            state.project.flags.map((option, index) => (
              <FlagMenuItem
                state={state}
                text={text}
                option={option._id}
                label={option.name}
                onClick={handleFlagClick}
                index={index}
              />
            ))
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
            >
              <Alert severity="info">
                No flags available.{" "}
                <Link color="inherit" href={`/dashboard/${projectId}`}>
                  Visit project dashboard to create.
                </Link>
              </Alert>
            </Box>
          )}
        </MenuList>
      </Menu>
    </>
  );
};

const FlagMenuItem = ({ text, option, label, onClick, index }) => {
  const hasFlag = text.flags.includes(option);

  return (
    <Tooltip
      title={`Click to ${hasFlag ? "remove" : "apply"} '${label}' flag`}
      placement="right"
      arrow
    >
      <MenuItem
        onClick={onClick}
        sx={{ textTransform: "capitalize", color: "primary.main" }}
        value={index}
        selected={hasFlag}
      >
        <ListItemIcon sx={{ color: "inherit" }}>
          <FlagIcon fontSize="small" sx={{ color: "inherit" }} />
        </ListItemIcon>
        {label}
      </MenuItem>
    </Tooltip>
  );
};

const TextSuggestions = ({ suggestions }) => {
  const input_text = suggestions.map((t) => t[0]).join(" ");
  const output_text = suggestions.map((t) => t[1]).join(" ");

  return (
    <>
      <Typography gutterBottom>
        Suggestion for input:{" "}
        <span style={{ color: teal[900] }}>{input_text}</span>
      </Typography>
      <Box
        margin="auto"
        sx={{
          overflow: "auto",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          padding: "16px",
          maxHeight: 400,
        }}
      >
        <Typography
          component="pre"
          variant="body2"
          style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
        >
          <code>{output_text}</code>
        </Typography>
      </Box>
    </>
  );
};

export default ActionTray;
