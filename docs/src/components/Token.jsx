import { styled, alpha } from "@mui/material/styles";
import { Typography, TextField, Stack, Box } from "@mui/material";
import { blue, green, red, orange } from "@mui/material/colors";
import { useColorMode } from "@docusaurus/theme-common";
// import { TokenInputComponent } from "../../../client/src/shared/components/annotation/TokenInputComponent";
// import { ThemeProvider } from "../../../client/src/shared/context/ThemeContext";

export const SpanComponent = styled(Typography)((props) => ({
  userSelect: "none",
  zIndex: 1000,
  cursor: "pointer",
  height: "3px",
  margin: "0 4px",
  backgroundColor: alpha(props.color, 0.75),
  "&:hover": {
    backgroundColor: props.color,
  },
}));

// Mocked EditPopover component for demonstration
const EditPopover = ({ children }) => <div>{children}</div>;

const TOKEN_COLORS = {
  dark: {
    iv: "rgba(255, 255, 255, 0.7)",
    oov: orange[500],
    suggestion: blue[500],
    editing: green[500],
    strike: red[500],
    replacement: green[500],
    empty: red[500],
  },
  light: {
    iv: "#616161",
    oov: orange[500],
    suggestion: blue[500],
    editing: green[500],
    strike: red[500],
    replacement: green[500],
    empty: red[500],
  },
};

export const Token = ({
  token = null,
  editing = false,
  isSelected = false,
}) => {
  const { colorMode } = useColorMode();

  console.log(token);
  console.log(token.currentValue);

  if (!token) {
    return;
  }

  const hasReplacement = token.replacement !== null || token.replacement === "";
  const hasSuggestion = token.suggestion !== null || token.suggestion === "";
  const isOutOfVocab = !token.en;
  const tokenHasSpan = editing || hasReplacement || hasSuggestion;

  const tokenIsEmpty = token.currentValue === "";

  // Simplify token width calculation for demonstration
  const minWidth = 3;
  const getTokenWidth = (value) => `${Math.max(value.length + 1, minWidth)}ch`;

  const getBaseColor = () => {
    if (tokenIsEmpty) return TOKEN_COLORS[colorMode].empty;
    if (editing) return TOKEN_COLORS[colorMode].editing;
    if (hasReplacement) return TOKEN_COLORS[colorMode].replacement;
    if (hasSuggestion) return TOKEN_COLORS[colorMode].suggestion;
    if (isOutOfVocab) return TOKEN_COLORS[colorMode].oov;
    return TOKEN_COLORS[colorMode].iv;
  };

  const getOpacity = () => {
    return isSelected ? 1 : 0.25;
  };

  const getBgColor = (tokenColor) => {
    if (isSelected) return alpha(tokenColor, 0.1);
    if (tokenIsEmpty) return alpha(TOKEN_COLORS[colorMode].empty, 0.2);
    return;
  };

  const tokenColor = alpha(getBaseColor(), getOpacity());
  const tokenBgColor = getBgColor(tokenColor);

  return (
    // <ThemeProvider>
    <Stack direction="column">
      <TextField
        variant="standard"
        value={token.currentValue}
        autoComplete="off"
        inputProps={{
          style: {
            textAlign: "center",
            width: getTokenWidth(token.currentValue),
            color: tokenColor,
            backgroundColor: tokenBgColor,
            borderRadius: 4,
          },
        }}
        InputProps={{
          disableUnderline: true,
        }}
        title={`value: ${token.value} | replacement: ${token.replacement} | suggestion: ${token.suggestion}`}
      />
      {tokenHasSpan && (
        <SpanComponent
          color={tokenColor}
          // onClick={(e) => handlePrimaryPopoverOpen(e)}
          title="Click to modify"
        />
      )}
      {/* Static demonstration of EditPopover */}
      {/* <EditPopover>
        <Box textAlign="center">Edit Popover Content Here</Box>
      </EditPopover> */}
    </Stack>
    // </ThemeProvider>
  );
};
