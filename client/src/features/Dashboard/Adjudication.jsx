import React, { useState, useEffect } from "react";
import StyledCard from "../../shared/components/StyledCard";
import {
  Chip,
  Divider,
  Grid,
  Pagination,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Tooltip,
  AlertTitle,
  Alert,
  Skeleton,
} from "@mui/material";
import { getColor, getContrastYIQ } from "../../shared/utils/dashboard";
import { useTheme, alpha } from "@mui/material/styles";
import useDashboardActions from "../../shared/hooks/api/dashboard";
import { useParams } from "react-router-dom";
import { grey } from "@mui/material/colors";
import FeatureNotAvailableAlert from "../../shared/components/FeatureNotAvailableAlert";

const getMaxTokenSizes = (data) => {
  // Iterates over input tokens and annotations to find the max token widths for each token index
  const maxSizes = data.input.map((token) => token.length); // Initialize with lengths of input tokens

  // Iterate through each annotator
  Object.values(data.annotations).forEach((annotator) => {
    annotator.tokens.forEach((token, index) => {
      // Ensure we don't go out of bounds if annotator.tokens is longer than input
      if (index < maxSizes.length) {
        maxSizes[index] = Math.max(maxSizes[index], token.length);
      } else {
        // Handle the case where annotator.tokens has more tokens than input
        maxSizes.push(token.length);
      }
    });
  });

  return maxSizes;
};

const Adjudication = () => {
  const [showTags, setShowTags] = useState(true);
  const [page, setPage] = useState(1);
  const [maxTokenSizes, setMaxTokenSizes] = useState([]);
  const { getAdjudication } = useDashboardActions();

  const [loading, setLoading] = useState(true);
  const { projectId } = useParams();
  const [data, setData] = useState();
  const [count, setCount] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (loading) {
        const adjData = await getAdjudication({ projectId, page });
        setData(adjData.data);
        setCount(adjData.count);
        setLoading(false);
      }
    };

    fetchData();
  }, [loading]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setLoading(true);
  };

  useEffect(() => {
    if (data) {
      setMaxTokenSizes(getMaxTokenSizes(data));
    }
  }, [data]);

  return (
    <StyledCard title="Adjudication" id="dashboard-adjudication">
      <Box p={"0rem 0.5rem 1rem 0.5rem"}>
        {import.meta.env.VITE_DISABLE_COLLABORATION === "true" ? (
          <FeatureNotAvailableAlert />
        ) : (
          <Alert severity="info">
            <AlertTitle>Project Adjudication Overview</AlertTitle>
            <strong>Adjudication</strong> is essential in the natural language
            annotation process, enabling a thorough evaluation of annotator
            consensus. This feature provides the tools to:
            <ul>
              <li>Examine project texts and annotations.</li>
              <li>
                Analyse consensus levels and pinpoint areas for improvement.
              </li>
              <li>Identify well-aligned annotations.</li>
            </ul>
            Navigate documents using the pagination controls. Terms explained:
            <ul>
              <li>
                <strong>Input:</strong> The original text.
              </li>
              <li>
                <strong>Compiled:</strong> The consensus-derived text,
                highlighting token-level agreement. A "changed" label under a
                token signifies modification from the "input" based on majority
                agreement.
              </li>
              <li>
                User-applied flags are displayed beneath their usernames,
                offering additional context.
              </li>
            </ul>
            Use the tag toggle button to display or conceal annotator tags,
            offering deeper insights into the adjudication process. These will
            appear below user tokens.
          </Alert>
        )}
      </Box>
      {import.meta.env.VITE_DISABLE_COLLABORATION === "true" ? null : loading ||
        !data ? (
        <Skeleton height={240} />
      ) : (
        <>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            m="0rem 0.5rem"
            mb={1}
          >
            <Chip
              label={`Document IAA: ${Math.round(data.scores.doc)}%`}
              size="large"
              color="primary"
              variant="outlined"
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowTags(!showTags)}
            >
              {showTags ? "Hide" : "Show"} Tags
            </Button>
          </Box>
          <Paper sx={{ width: "100%", overflow: "hidden" }} variant="outlined">
            <AnnotationGrid
              data={data}
              showTags={showTags}
              maxTokenSizes={maxTokenSizes}
            />
            <Divider />
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={count}
                page={page}
                onChange={handleChangePage}
              />
            </Box>
          </Paper>
        </>
      )}
    </StyledCard>
  );
};

const AnnotationGrid = ({ data, showTags, maxTokenSizes }) => {
  const ROW_HEIGHT = 100;
  // const COMPILED_BG_COLOR = alpha(teal[50], 0.75);

  return (
    <>
      <Grid container>
        {/* User Cells Column */}
        <Grid
          item
          xs={2}
          sx={{ borderRight: "1px solid", borderColor: "divider" }}
        >
          <UserCell
            title={"Input"}
            helper="These are the tokens of the original input text"
            rowHeight={ROW_HEIGHT}
          />
          {Object.keys(data.annotations).map((user, index) => (
            <UserCell
              title={user}
              flags={data.annotations[user].flags}
              helper={`Flags: ${
                data.annotations[user].flags.length === 0
                  ? "none applied"
                  : data.annotations[user].flags.join(", ")
              }`}
              rowHeight={ROW_HEIGHT}
              addDivider={true}
            />
          ))}
          <UserCell
            title={"Compiled"}
            helper="This is the compiled output based on token-level agreement scores"
            rowHeight={ROW_HEIGHT}
            addDivider={true}
            // bgColor={COMPILED_BG_COLOR}
          />
        </Grid>
        {/* Annotation Cells Column */}
        <Grid item xs={10} sx={{ width: "100%", overflowX: "auto" }}>
          <AnnotationCell
            title="input"
            key={"annotation-cell-input"}
            tokens={data.input}
            maxTokenSizes={maxTokenSizes}
            rowHeight={ROW_HEIGHT}
            addDivider={false}
          />
          {Object.keys(data.annotations).map((user, index) => (
            <AnnotationCell
              title={user}
              key={`annotation-cell-${user}`}
              tokens={data.annotations[user].tokens}
              tags={data.annotations[user].tags}
              showTags={showTags}
              maxTokenSizes={maxTokenSizes}
              rowHeight={ROW_HEIGHT}
              addDivider={true}
            />
          ))}
          <AnnotationCell
            title="compiled"
            key={"annotation-cell-compiled"}
            tokens={data.compiled.tokens}
            showTags={showTags}
            tokenScores={data.scores.tokens}
            maxTokenSizes={maxTokenSizes}
            rowHeight={ROW_HEIGHT}
            addDivider={true}
          />
        </Grid>
      </Grid>
    </>
  );
};

const AnnotationCell = ({
  title,
  tokens,
  tags = [],
  showTags,
  tokenScores = [],
  maxTokenSizes,
  rowHeight = 64,
  addDivider = false,
}) => {
  const theme = useTheme();

  return (
    <React.Fragment key={`annotation-cell-${title}`}>
      {addDivider && <Divider />}
      <Box
        display="flex"
        alignItems="center"
        width="100%"
        sx={{
          height: rowHeight,
        }}
        p={1}
      >
        <Stack direction="row" spacing={1}>
          {tokens.map((token, index) => {
            const tokenTags = tags.slice(index, index + 1).flatMap((t) => t);
            const hasTags = tokenTags.length > 0;

            const tokenIAA = Math.round(tokenScores.slice(index, index + 1));
            const tokenIAABgColor = getColor(tokenIAA);
            const tokenIAATextColor = getContrastYIQ(tokenIAABgColor);

            return (
              <Stack
                direction="column"
                spacing={0.5}
                sx={{ textAlign: "center" }}
              >
                <Box
                  sx={{
                    border: "1px solid lightgrey",
                    borderRadius: 1,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      border: tokenIAA ? 1 : 0,
                      borderColor: "lightgrey",
                      borderStyle: "solid",
                      borderTopLeftRadius: 1,
                      borderTopRightRadius: 1,
                      backgroundColor: tokenIAABgColor,
                      color: tokenIAATextColor,
                    }}
                  >
                    {tokenScores.length > 0 && (
                      <Tooltip
                        placement="top"
                        arrow
                        title={`This token has an average IAA of ${tokenIAA}`}
                      >
                        <Typography fontSize={10} sx={{ cursor: "help" }}>
                          {tokenIAA}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>
                  <Box
                    p={0.5}
                    sx={{
                      width: `${maxTokenSizes[index] + 1 || 0}ch`,
                      minWidth: "4ch",
                      height: 32,
                      backgroundColor:
                        (token?.value ?? token) === "" &&
                        alpha(theme.palette.token.empty, 0.5),
                      borderBottomRightRadius: 1,
                      borderBottomLeftRadius: 1,
                    }}
                  >
                    <Typography sx={{ fontFamily: "monospace" }}>
                      {token?.value ?? token}
                    </Typography>
                  </Box>
                  {token.changed && (
                    <Tooltip
                      title="This token is different from the input due to majority agreement."
                      placement="bottom"
                      arrow
                    >
                      <Box
                        sx={{
                          height: 16,
                          width: "100%",
                          borderTop: "1px solid lightgrey",
                          cursor: "help",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.25
                          ),
                        }}
                      >
                        <Typography fontSize={10}>changed</Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
                {showTags && hasTags
                  ? tokenTags
                      .filter((t) => t.length > 0) // Filter out empty arrays
                      .map((t) => (
                        <Tooltip
                          title={`${title} added the label '${t}' to this token.`}
                          arrow
                          placement="bottom"
                        >
                          <Box
                            sx={{
                              backgroundColor: alpha(grey[100], 0.25),
                              height: 20,
                              userSelect: "none",
                              cursor: "help",
                              margin: "0 4px",
                              border: "1px solid",
                              borderRadius: "4px",
                              borderColor: alpha(grey[500], 0.5),
                            }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Typography sx={{ fontSize: 10 }}>{t}</Typography>
                          </Box>
                        </Tooltip>
                      ))
                  : null}
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </React.Fragment>
  );
};

const UserCell = ({
  title,
  helper,
  rowHeight = 64,
  addDivider = false,
  bgColor,
}) => {
  return (
    <React.Fragment>
      {addDivider && <Divider />}
      <Box
        key={`user-cell-${title}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          height: rowHeight,
          textAlign: "center",
          backgroundColor: bgColor,
        }}
        p={1}
      >
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography gutterBottom fontWeight="bold" color="text.secondary">
            {title}
          </Typography>
          {helper && <Typography fontSize={10}>{helper}</Typography>}
        </Stack>
      </Box>
    </React.Fragment>
  );
};

export default Adjudication;
