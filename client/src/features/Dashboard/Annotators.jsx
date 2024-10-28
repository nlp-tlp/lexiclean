import { useState } from "react";
import StyledCard from "../../shared/components/StyledCard";
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useNotificationActions from "../../shared/hooks/api/notification";
import useDashboardActions from "../../shared/hooks/api/dashboard";
import { StyledChip } from "./Details";
import FeatureNotAvailableAlert from "../../shared/components/FeatureNotAvailableAlert";

const EnabledAlert = () => (
  <Alert severity="info">
    <AlertTitle>Project Annotators</AlertTitle>
    This area allows you invite annotators to your project. Annotators will have
    access to all texts associated with the project. To remove annotators from
    your project, simply click the "x" icon. Removal is permanent and
    irreverible, all annotation artifacts for the annotator will also be
    removed.
  </Alert>
);

const Annotators = ({ projectId, loading, data, handleUpdate, disabled }) => {
  return (
    <StyledCard title="Annotators" id="dashboard-annotators">
      <Box p="0rem 1rem">
        {process.env.REACT_APP_DISABLE_COLLABORATION === "true" ? (
          <FeatureNotAvailableAlert />
        ) : (
          <EnabledAlert />
        )}
      </Box>
      {process.env.REACT_APP_DISABLE_COLLABORATION === "false" && (
        <>
          <InviteForm
            data={data}
            disabled={disabled}
            handleUpdate={handleUpdate}
          />
          <AnnotatorTable
            projectId={projectId}
            data={data.details.annotators}
            ownerUsername={data.details.ownerUsername}
            disabled={disabled}
            handleUpdate={handleUpdate}
          />
        </>
      )}
    </StyledCard>
  );
};

const InviteForm = ({ data, disabled, handleUpdate }) => {
  const { inviteNotification } = useNotificationActions();
  const [usernames, setUsernames] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateUsernames = (value) => {
    setUsernames(value);
  };

  const handleInvite = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      console.log("Calling inviteNotification with:", { usernames });
      const result = await inviteNotification(usernames);
      console.log("Result from inviteNotification:", result);

      if (result.success) {
        setSuccessMessage("Invitation(s) sent successfully.");
        setUsernames([]);
        // if (handleUpdate) {
        //   await handleUpdate({ newAnnotators: result.data.invited });
        // }
      } else {
        console.log("Error in handleInvite:", result.error);
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("Error in handleInvite:", error);
      setErrorMessage(
        "An unexpected error occurred. Please check the console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const handleInvite = async () => {
  //   try {
  //     // Assuming inviteNotification returns a Promise
  //     console.log("usernames:", usernames);
  //     const data = await inviteNotification(usernames);
  //     console.log("data:", data);

  //     // let messages = [];
  //     // if (data.invited && data.invited.length > 0) {
  //     //   messages.push(
  //     //     `Invited: ${data.invited.map((a) => a.username).join(", ")}`
  //     //   );

  //     //   //
  //     //   await handleUpdate({
  //     //     newAnnotators: data.invited,
  //     //   });
  //     //   setUsernames("");
  //     // }

  //     // let errors = [];
  //     // if (data.alreadyInProject && data.alreadyInProject.length > 0) {
  //     //   errors.push(
  //     //     `${data.alreadyInProject
  //     //       .map((a) => a.username)
  //     //       .join(", ")} are already in the project.`
  //     //   );
  //     // }
  //     // if (data.invalidUsernames && data.invalidUsernames.length > 0) {
  //     //   errors.push(
  //     //     `${data.invalidUsernames
  //     //       .map((a) => a.username)
  //     //       .join(", ")} are invalid usernames.`
  //     //   );
  //     // }
  //     // if (data.alreadyInvited && data.alreadyInvited.length > 0) {
  //     //   errors.push(
  //     //     `${data.alreadyInvited
  //     //       .map((a) => a.username)
  //     //       .join(", ")} have already been invited.`
  //     //   );
  //     // }

  //     // // Setting the success and error messages
  //     // if (messages.length > 0) setSuccessMessage(messages.join(" "));
  //     // if (errors.length > 0) setErrorMessage(errors.join(" "));
  //   } catch (error) {
  //     console.error(error);
  //     setErrorMessage("Failed to invite annotators. Please try again.");
  //   }
  // };

  return (
    <Box p={2}>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Typography variant="body1" gutterBottom>
          Invite annotators to this project
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <Stack spacing={1} direction="row" alignItems="center">
          <Autocomplete
            clearIcon={false}
            size="small"
            options={[]}
            freeSolo
            fullWidth
            multiple
            value={usernames}
            onChange={(e, value) => {
              updateUsernames(value);
            }}
            renderTags={(value, props) =>
              value.map((option, index) => (
                <StyledChip label={option} {...props({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                placeholder="Type the names of users to invite pressing Enter after each"
                {...params}
              />
            )}
          />
          <Button
            onClick={handleInvite}
            disabled={usernames.length === 0 || disabled || isLoading}
            variant="contained"
          >
            {isLoading ? "Inviting..." : "Invite"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

const AnnotatorTable = ({
  projectId,
  data,
  ownerUsername,
  disabled,
  handleUpdate,
}) => {
  const [deleteAnnotator, setDeleteAnnotator] = useState(null);
  const [confirmName, setConfirmName] = useState("");
  const { removeAnnotator } = useDashboardActions();

  const handleDeleteClick = (username) => {
    if (deleteAnnotator === username) {
      setDeleteAnnotator(null);
    } else {
      setDeleteAnnotator(username);
    }
  };

  const handleConfirmNameChange = (event) => {
    setConfirmName(event.target.value);
  };

  const handleDeleteConfirm = async () => {
    if (confirmName === deleteAnnotator) {
      const annotatorId = data.find((a) => a.username === deleteAnnotator)._id;
      await removeAnnotator({
        projectId,
        annotatorId,
      });

      // Reset state after deletion
      setDeleteAnnotator(null);
      setConfirmName("");

      handleUpdate({ newAnnotators: [{ _id: annotatorId }] });
    }
  };

  const getColor = (status) => {
    if (status === "accepted") return "success";
    if (status === "declined") return "error";
    return "default";
  };

  if (data) {
    return (
      <Box p={2} sx={{ textAlign: "center" }}>
        <Paper sx={{ p: 2 }} variant="outlined">
          {deleteAnnotator && (
            <Box display="flex" justifyContent="center" mb={2}>
              <Stack spacing={1} direction="row" alignItems="center">
                <TextField
                  size="small"
                  placeholder="Confirm username"
                  value={confirmName}
                  onChange={handleConfirmNameChange}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteConfirm}
                  size="small"
                  disabled={disabled || confirmName !== deleteAnnotator}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDeleteAnnotator(null);
                    setConfirmName("");
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          )}

          {data.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {data.map((a) => (
                <Chip
                  variant={
                    a.username === deleteAnnotator ? "contained" : "outlined"
                  }
                  label={`${a.username}: ${
                    a.username === ownerUsername ? "owner" : a.status
                  }`}
                  color={getColor(a.status)}
                  onDelete={
                    !disabled && a.username !== ownerUsername
                      ? () => handleDeleteClick(a.username)
                      : undefined
                  }
                />
              ))}
            </Stack>
          ) : (
            <Typography>This project has no additional annotators</Typography>
          )}
        </Paper>
      </Box>
    );
  } else {
    return <Typography>Loading...</Typography>;
  }
};

export default Annotators;
