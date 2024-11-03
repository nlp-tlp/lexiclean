import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import { getReadableString } from "../../shared/utils/dashboard";
import StyledCard from "../../shared/components/StyledCard";
import { useEffect, useState } from "react";
import { lighten, styled } from "@mui/material/styles";

export const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.accent,
  color: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.background.active,
  },
}));

const Details = ({ loading, data, handleUpdate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUnchanged, setIsUnchanged] = useState(true);

  useEffect(() => {
    if (!loading) {
      setName(data.details.name);
      setDescription(data.details.description);
    }
  }, [loading]);

  useEffect(() => {
    // Check if current state matches the initial data to determine button state
    setIsUnchanged(
      name === data.details.name && description === data.details.description
    );
  }, [name, description, data.details.name, data.details.description]);

  return (
    <StyledCard
      title="Details"
      caption="Details of the project including set up conditions"
      id="dashboard-details"
    >
      <Box>
        <Box mb={2}>
          <Stack direction="column" spacing={2}>
            <Box
              key="textfield-details-name"
              display="flex"
              alignItems="left"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary">Project Name</Typography>
              </Box>
              <TextField
                value={name.toString()}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            <Box
              key={"textfield-details-description"}
              display="flex"
              alignItems="left"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary">
                  Project Description
                </Typography>
              </Box>
              <TextField
                value={description.toString()}
                onChange={(e) => setDescription(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            <Box
              key={"textfield-details-owner"}
              display="flex"
              alignItems="left"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary">Project Owner</Typography>
              </Box>
              <TextField
                value={data.details.ownerUsername ?? "Not available"}
                placeholder="Project owners username"
                size="small"
                fullWidth
                disabled
                autoComplete="false"
              />
            </Box>
          </Stack>
        </Box>
        <Box display="flex" justifyContent="right" mt={2}>
          <Tooltip title="Click to apply changes to the projects name and/or description">
            <Button
              variant="contained"
              onClick={() => handleUpdate(name, description)}
              disabled={isUnchanged}
            >
              Update
            </Button>
          </Tooltip>
        </Box>
        <Box mb={2}>
          <Stack>
            <Typography color="text.secondary" gutterBottom>
              Special Tokens
            </Typography>
            <Typography variant="caption">
              Special tokens are used to represent specific tokens in the
              dataset
            </Typography>
          </Stack>
          <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
            {data && data.details.specialTokens.length > 0 ? (
              data.details.specialTokens.map((t, index) => (
                <StyledChip key={index} label={t} />
              ))
            ) : (
              <StyledChip label="No special tokens defined" />
            )}
          </Stack>
        </Box>
        <Box mb={2}>
          <Stack>
            <Typography color="text.secondary" gutterBottom>
              Preprocessing
            </Typography>
            <Typography variant="caption">
              Preprocessing steps applied to the dataset
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} mt={1}>
            {data &&
              Object.entries(data.details.preprocessing).map(
                ([k, v], index) => (
                  <StyledChip
                    key={`preprocessing-chip-${index}`}
                    label={`${getReadableString(k)}: ${v.toString()}`}
                    sx={{ textTransform: "capitalize" }}
                  />
                )
              )}
          </Stack>
        </Box>
        <Box>
          <Stack>
            <Typography color="text.secondary" gutterBottom>
              Other
            </Typography>
            <Typography variant="caption">
              Other details about the project
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} mt={1}>
            {data &&
              ["createdAt", "parallelCorpus"].map((i, index) => (
                <StyledChip
                  key={`detail-chip-${i}`}
                  label={`${getReadableString(i)}: ${
                    i === "createdAt"
                      ? moment.utc(data.details[i]).format("Do MMM YY")
                      : data.details[i].toString()
                  }`}
                  sx={{ textTransform: "capitalize" }}
                />
              ))}
          </Stack>
        </Box>
      </Box>
    </StyledCard>
  );
};

export default Details;
