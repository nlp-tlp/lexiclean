import { Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import StyledCard from "../../shared/components/StyledCard";

const Settings = ({
  loading,
  data,
  downloadProject,
  downloadReplacements,
  deleteProject,
  disabled = false,
}) => {
  const [deleteName, setDeleteName] = useState("");

  return (
    <StyledCard
      title="Settings"
      id="dashboard-settings"
      caption="Project settings and actions"
    >
      <Box display="flex" flexDirection="column">
        <Box
          display="flex"
          justifyContent="space-between"
          mb={4}
          alignItems="center"
        >
          <Box>
            <Typography fontWeight="bold" color="text.secondary">
              Download Dataset
            </Typography>
            <Typography variant="caption">
              Click to download this projects annotation data as a JSON file.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={downloadProject}
            disabled={loading}
          >
            Download
          </Button>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={4}
          alignItems="center"
        >
          <Box>
            <Typography fontWeight="bold" color="text.secondary">
              Download Replacements
            </Typography>
            <Typography variant="caption">
              Click to download this projects replacements as a JSON file.
              Replacement freqencies are counted across all annotators.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={downloadReplacements}
            disabled={loading}
          >
            Download
          </Button>
        </Box>
        <Grid container alignItem="center">
          <Grid item xs={7}>
            <Box>
              <Typography fontWeight="bold" color="text.secondary">
                Delete Project
              </Typography>
              <Typography variant="caption">
                Enter the projects name and click 'delete' to permanently delete
                this project. This is irreversible.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                id="delete-textfield"
                placeholder={`Enter project name (${data.details.name})`}
                onChange={(e) => setDeleteName(e.target.value)}
                value={deleteName}
                size="small"
                error
                fullWidth
                disabled={disabled}
              />
              <Button
                id="delete-button"
                variant="contained"
                onClick={deleteProject}
                disabled={
                  loading || data.details.name !== deleteName || disabled
                }
                color="error"
              >
                Delete
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </StyledCard>
  );
};

export default Settings;
