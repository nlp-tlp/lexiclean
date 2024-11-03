import { useState, useContext, useEffect } from "react";
import {
  Grid,
  Stack,
  Box,
  Typography,
  Button,
  Paper,
  Tooltip,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { grey, green, yellow, teal, orange } from "@mui/material/colors";
import { Text } from "./Text";
import { ProjectContext } from "../../shared/context/ProjectContext";
import { getTokenWidth } from "../../shared/utils/token";
import ActionTray from "./ActionTray";
import useAnnotationActions from "../../shared/hooks/api/annotation";

export const TextContainer = ({ text, textIndex }) => {
  const [state, dispatch] = useContext(ProjectContext);

  return (
    <Grid
      container
      item
      as={Paper}
      variant="outlined"
      elevation={0}
      m="1rem 0rem"
      xs={12}
      id={`text-container-${textIndex}`}
      sx={{
        display: "flex",
        flexDirection: "row",
        userSelect: "none",
        minHeight: 140,
        backgroundColor: "background.default",
      }}
    >
      <Grid
        item
        xs={12}
        p={2}
        // sx={{ borderBottom: "1px solid rgba(0,0,0,.1)" }}
      >
        <ActionTray text={text} textIndex={textIndex} />
      </Grid>
      <Grid item xs={12} p={2}>
        <Box
          component="div"
          key={textIndex}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          <Box display="flex" flexDirection="column">
            {state.showReferences && (
              <Typography variant="caption" sx={{ color: grey[500] }} pb={1}>
                {text.reference}
              </Typography>
            )}
            {state.tokenizeTextId == text._id ? (
              <TokenizedText textId={text._id} tokens={text.tokens} />
            ) : (
              <Text text={text} />
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

const TokenizedText = ({ textId, tokens }) => {
  const { tokenizeTokensAction } = useAnnotationActions();
  const [valid, setValid] = useState(false);
  const [tokenIndexes, setTokenIndexes] = useState(new Set());
  const [tokenIndexGroups, setTokenIndexGroups] = useState([]);

  const handleIndex = (index) => {
    if (tokenIndexes.has(index)) {
      setTokenIndexes((prev) => new Set([...prev].filter((x) => x !== index)));
    } else {
      setTokenIndexes((prev) => new Set(prev.add(index)));
    }
  };

  useEffect(() => {
    const indexes = Array.from(tokenIndexes).sort((a, b) => {
      return a - b;
    });

    const groups = indexes.reduce((r, n) => {
      // https://stackoverflow.com/questions/47906850/javascript-group-the-numbers-from-an-array-with-series-of-consecutive-numbers
      const lastSubArray = r[r.length - 1];
      if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
        r.push([]);
      }
      r[r.length - 1].push(n);
      return r;
    }, []);
    setTokenIndexGroups(groups);
    // Check all sub arrays are greater than 1 in length
    const validSelection = groups.filter((l) => l.length === 1).length === 0;
    setValid(validSelection);
  }, [tokenIndexes]);

  const handleReset = () => {
    setTokenIndexes(new Set());
  };

  const handleTokenize = async () => {
    try {
      await tokenizeTokensAction({ textId, tokenIndexGroups });
    } finally {
      handleReset();
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="left">
      <Box
        key={`tokenize-text-${textId}`}
        sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
      >
        {tokens &&
          Object.keys(tokens).map((tokenIndex) => {
            const token = tokens[tokenIndex];
            const color = tokenIndexes.has(parseInt(tokenIndex)) && teal[200];
            const width = getTokenWidth(token.currentValue);

            return (
              <Typography
                sx={{
                  textAlign: "center",
                  backgroundColor: color && alpha(color, 0.75),
                  width: width,
                }}
                onClick={() => handleIndex(parseInt(tokenIndex))}
              >
                {token.currentValue}
              </Typography>
            );
          })}
      </Box>
      <Stack direction="row" mt={2} spacing={2}>
        <Tooltip title="Click to tokenize">
          <Button
            size="small"
            disabled={tokenIndexes.size <= 1 || !valid}
            onClick={handleTokenize}
            variant="outlined"
          >
            Apply
          </Button>
        </Tooltip>
        <Tooltip title="Click to clear selection">
          <Button
            size="small"
            disabled={tokenIndexes.size === 0}
            onClick={handleReset}
            variant="outlined"
          >
            Clear
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  );
};
