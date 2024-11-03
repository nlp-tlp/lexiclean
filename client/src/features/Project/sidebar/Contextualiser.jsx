import { useContext, useEffect, useState } from "react";
import {
  Typography,
  Stack,
  Chip,
  Box,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import { ProjectContext } from "../../../shared/context/ProjectContext";
import useMiscActions from "../../../shared/hooks/api/misc";
import { useParams } from "react-router-dom";
import { StyledChip } from "../../Dashboard/Details";

const Contextualiser = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const [data, setData] = useState();
  const { getTokenContext } = useMiscActions();
  const { projectId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTokenContext({
        projectId,
        tokenValue: state.selectedToken.value,
      });

      setData(data);
    };

    if (state.selectedToken && state.selectedToken.value) {
      fetchData();
    }
  }, [state.selectedToken]);

  return (
    <Box
      as={Paper}
      elevation={0}
      variant="outlined"
      mt={2}
      sx={{ backgroundColor: "background.default" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{ whiteSpace: "normal", overflowWrap: "break-word" }}
      >
        <Box p={2}>
          <Typography fontWeight="bold" color="text.secondary">
            Contextualiser
          </Typography>
          <Typography variant="caption">
            This section provides contextual information about the selected
            token
          </Typography>
        </Box>
        <Divider />
        <Box>
          {state.selectedToken ? (
            <>
              <Box p="0.5rem 1rem 0rem 1rem">
                <Typography variant="caption" fontWeight="bold">
                  Details
                </Typography>
                <Stack direction="column" spacing={1}>
                  <Typography variant="caption">
                    Current value: {state.selectedToken.current_value}
                  </Typography>
                  {state.selectedToken.current_value !==
                    state.selectedToken.value && (
                    <Typography variant="caption">
                      Original value: {state.selectedToken.value}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          ) : (
            <Box
              p={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Alert severity="info">
                Select a token to view contextual information.
              </Alert>
            </Box>
          )}
          {state.selectedToken && data && (
            <>
              <Box p="0.5rem 1rem 1rem 1rem">
                <Typography variant="caption" fontWeight="bold">
                  Actions performed on similar tokens
                </Typography>
                <Stack direction="column" spacing={1} pt={1}>
                  {data.length === 0 ? (
                    <Typography variant="caption">Nothing found</Typography>
                  ) : (
                    data.map((d) => (
                      <>
                        <Typography
                          variant="caption"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {d.type}s {d.suggested && "(suggested)"}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            flexWrap: "wrap",
                            gap: 0.5,
                            justifyContent: "flex-start",
                          }}
                        >
                          {Object.entries(d.values).map(([name, count]) => (
                            <StyledChip
                              label={`${
                                d.type === "tag"
                                  ? state.project.tags.find(
                                      (t) => t._id === name
                                    ).name
                                  : name
                              }: ${count}`}
                              size="small"
                            />
                          ))}
                        </Stack>
                      </>
                    ))
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Contextualiser;
