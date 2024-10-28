import { useState, useContext } from "react";
import { Typography, Popover, Box, Divider } from "@mui/material";
import { alpha, styled, getContrastRatio } from "@mui/material/styles";
import { ProjectContext } from "../../shared/context/ProjectContext";
import TagPopover from "./TagPopover";
import { teal } from "@mui/material/colors";

function getContrastColor(hexColor) {
  const blackContrast = getContrastRatio(hexColor, "#000000");
  const whiteContrast = getContrastRatio(hexColor, "#ffffff");
  // Return black or white based on higher contrast ratio
  return blackContrast > whiteContrast ? "black" : "white";
}

const TagSpanComponent = styled(Typography)((props) => ({
  userSelect: "none",
  zIndex: 1000,
  cursor: "pointer",
  height: "20px",
  margin: "0 4px",
  fontSize: 10,
  textAlign: "center",
  padding: 2,
  backgroundColor: alpha(props.color, 0.75),
  border: "1px solid",
  borderRadius: "4px",
  color: getContrastColor(alpha(props.color, 0.75)),
  borderColor: props.color,
  "&:hover": {
    backgroundColor: alpha(props.color, 0.5),
    color: getContrastColor(alpha(props.color, 0.5)),
    borderColor: alpha(props.color, 0.75),
  },
}));

const SpanEntityAnnotation = ({ textId, tokenId, tagId }) => {
  const [state, dispatch] = useContext(ProjectContext);

  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const handleTagPopoverOpen = (event) => {
    setTagAnchorEl(event.currentTarget);
  };
  const handleTagPopoverClose = () => {
    setTagAnchorEl(null);
  };
  const tagOpen = Boolean(tagAnchorEl);

  if (!state.project || !tagId) {
    // Optionally, return a placeholder, error message, or null to render nothing
    return <div>Project data or label ID is missing.</div>; // Or return null to render nothing
  }

  const tagDetails = state.project.tags.find((tag) => tag._id === tagId);

  return (
    <>
      <TagSpanComponent
        color={tagDetails ? tagDetails.color : teal[500]}
        onClick={handleTagPopoverOpen}
      >
        {tagDetails ? tagDetails.name : "Undefined Label"}
      </TagSpanComponent>
      <Popover
        id="tag-span-popover"
        open={tagOpen}
        anchorEl={tagAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handleTagPopoverClose}
        disableRestoreFocus
        disableAutoFocus={true}
        disableEnforceFocus={true}
        elevation={0}
        PaperProps={{
          sx: {
            display: "flex",
            border: "1px solid",
            borderColor: tagDetails ? alpha(tagDetails.color, 0.5) : teal[300],
          },
        }}
      >
        <Box display="flex" flexDirection="column">
          <Box
            sx={{
              textAlign: "center",
              backgroundColor: alpha(tagDetails.color, 0.5),
            }}
          >
            <Typography
              variant="body2"
              color={tagDetails.color}
              fontWeight="bold"
            >
              {tagDetails.name}
            </Typography>
          </Box>
          <Divider />
          <TagPopover textId={textId} tokenId={tokenId} tagId={tagId} />
        </Box>
      </Popover>
    </>
  );
};

export default SpanEntityAnnotation;
