import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { downloadFile } from "../../shared/utils/dashboard";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import Schema from "./Schema";
import Settings from "./Settings";
import Overview from "./Overview";
import Details from "./Details";
import Annotators from "./Annotators";
import useDashboardActions from "../../shared/hooks/api/dashboard";
import LoadingButton from "@mui/lab/LoadingButton";
import Flags from "./Flags";
import Replacements from "./Replacements";
import Adjudication from "./Adjudication";

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const { dispatch: snackbarDispatch } = useSnackbar();
  const {
    fetchProjectSummaryById,
    downloadProjectData,
    downloadReplacementData,
    deleteProjectById,
    updateProjectDetail,
    updateProjectFlags,
    addProjectTag,
    updateProjectTag,
    deleteProjectTag,
    addProjectFlag,
    updateProjectFlag,
    deleteProjectFlag,
  } = useDashboardActions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await fetchProjectSummaryById(projectId);
        setDisabled(!projectData.is_admin);
        setData(projectData);
      } catch (error) {
        setError({ message: error.response.data.detail });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const downloadProject = async () => {
    const data = await downloadProjectData(projectId);
    downloadFile({ data: data, name: `${data.metadata.name}-annotations` });
  };

  const downloadReplacements = async () => {
    const content = await downloadReplacementData(projectId);
    downloadFile({ data: content, name: `${data.details.name}-replacements` });
  };

  const deleteProject = async () => {
    await deleteProjectById(projectId);
    navigate("/projects");
  };

  const createProjectTagFunction = async (key, newValue) => {
    console.log("createProjectTag", key, newValue);
    const data = await addProjectTag({ projectId, tag: newValue });

    if (data) {
      setData((prevState) => {
        const updatedData = { ...prevState };
        updatedData.details.tags = [...updatedData.details.tags, data];
        return updatedData;
      });
      snackbarDispatch({
        type: "SHOW",
        message: `Succesfully created project schema tag`,
        severity: "success",
      });
    }
  };

  const updateProjectTagFunction = async (key, value) => {
    console.log("updateProjectTag", key, value);
    const data = await updateProjectTag({
      projectId,
      tagId: value._id,
      tag: value,
    });

    if (data) {
      setData((prevState) => {
        const updatedData = { ...prevState };
        const tagIndex = updatedData.details.tags.findIndex(
          (tag) => tag._id === value._id
        );

        if (tagIndex !== -1) {
          updatedData.details.tags[tagIndex] = data;
        }

        return updatedData;
      });
      snackbarDispatch({
        type: "SHOW",
        message: `Succesfully updated project schema tag`,
        severity: "success",
      });
    }
  };

  const deleteProjectTagFunction = async (tagId) => {
    console.log("deleteProjectTagFunction", tagId);
    const data = await deleteProjectTag({ projectId, tagId });
    if (data) {
      setData((prevState) => {
        const updatedData = { ...prevState };
        updatedData.details.tags = updatedData.details.tags.filter(
          (tag) => tag._id !== tagId
        );
        return updatedData;
      });
      snackbarDispatch({
        type: "SHOW",
        message: `Succesfully deleted project schema tag`,
        severity: "success",
      });
    }
  };

  const addProjectFlagFunction = async (flagName) => {
    console.log("addProjectFlagFunction", flagName);
    const newFlag = await addProjectFlag({
      projectId,
      flag: { name: flagName },
    });
    console.log("newFlag", newFlag);
    if (newFlag) {
      setData((prevState) => {
        const updatedData = { ...prevState };
        updatedData.details.flags = [...updatedData.details.flags, newFlag];
        return updatedData;
      });
      snackbarDispatch({
        type: "SHOW",
        message: `Succesfully created project flag`,
        severity: "success",
      });
    }
  };

  const deleteProjectFlagFunction = async (flagName) => {
    console.log("deleteProjectFlagFunction", flagName);
    const flagId = data.details.flags.find(
      (flag) => flag.name === flagName
    )._id;
    console.log("flagId", flagId);
    const flagToRemove = await deleteProjectFlag({ projectId, flagId });
    console.log("flagToRemove", flagToRemove);

    if (flagToRemove) {
      setData((prevState) => {
        const updatedData = { ...prevState };
        updatedData.details.flags = updatedData.details.flags.filter(
          (flag) => flag._id !== flagToRemove._id
        );
        return updatedData;
      });
      snackbarDispatch({
        type: "SHOW",
        message: `Succesfully deleted project flag`,
        severity: "success",
      });
    }
  };
  const updateProjectFlagFunction = async (currentFlagName, newFlagName) => {
    console.log("updateProjectFlagFunction", currentFlagName, newFlagName);
    const flagId = data.details.flags.find(
      (flag) => flag.name === currentFlagName
    )._id;
    console.log("flagId", flagId);

    const updatedFlag = await updateProjectFlag({
      projectId,
      flagId,
      flag: { name: newFlagName },
    });

    if (updatedFlag) {
      setData((prevState) => {
        const updatedData = { ...prevState };
        const flagIndex = updatedData.details.flags.findIndex(
          (flag) => flag._id === flagId
        );

        if (flagIndex !== -1) {
          updatedData.details.flags[flagIndex] = updatedFlag;
        }

        return updatedData;
      });
      snackbarDispatch({
        type: "SHOW",
        message: `Succesfully updated project flag`,
        severity: "success",
      });
    }
  };

  const handleUpdateDetails = async (name, description) => {
    const data = await updateProjectDetail({ projectId, name, description });
    if (data) {
      setData((prevState) => ({
        ...prevState,
        details: {
          ...prevState.details,
          name: name,
          description: description,
        },
      }));
      snackbarDispatch({
        type: "SHOW",
        message: "Succesfully updated project details",
        severity: "success",
      });
    }
  };

  const handleUpdateFlags = async (_, flags) => {
    // Flags are provided by name, need to find their _id to send to backend to ensure
    // no conflicts occur.
    const updateFlags = flags.map((flag) => {
      if (data.details.flags.includes(flag.name)) {
        // Flag to be removed
        return flag;
      } else {
        return flag;
      }
    });

    // Send to backend
    const updatedFlags = await updateProjectFlags({
      projectId,
      flags: updateFlags,
    });

    if (updateFlags) {
      setData((prevState) => ({
        ...prevState,
        details: {
          ...prevState.details,
          flags: updatedFlags,
        },
      }));
      snackbarDispatch({
        type: "SHOW",
        message: "Succesfully updated project flags",
        severity: "success",
      });
    }
  };

  const handleUpdateAnnotators = async ({ newAnnotators }) => {
    // setData((prevState) => {
    //   const updatedData = { ...prevState };
    //   // Assuming `newAnnotators` is an array of annotators to be toggled
    //   for (const newAnnotator of newAnnotators) {
    //     const annotatorId = newAnnotator._id.toString();
    //     const index = updatedData.details.annotators.findIndex(
    //       (a) => a._id.toString() === annotatorId
    //     );
    //     if (index > -1) {
    //       // Annotator exists, remove them
    //       console.log("removing existing annotator");
    //       updatedData.details.annotators.splice(index, 1);
    //     } else {
    //       // Annotator does not exist, add them
    //       console.log("adding new annotator");
    //       updatedData.details.annotators.push(newAnnotator);
    //     }
    //   }
    //   return updatedData;
    // });
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" width="100%" mt={16}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ height: "100vh", margin: "auto" }} pt={4}>
        <Alert severity="error">Error: {error.message}</Alert>
      </Box>
    );

  return (
    <Grid
      container
      direction="column"
      sx={{ height: "calc(100vh - 128px)", overflow: "hidden" }}
    >
      <Grid
        container
        item
        xs
        sx={{ overflow: "auto" }}
        spacing={4}
        mt={1}
        mb={1}
      >
        <Grid item xs={12}>
          <Overview loading={loading} data={data} />
        </Grid>
        <Grid item xs={12}>
          <Details
            loading={loading}
            data={data}
            handleUpdate={handleUpdateDetails}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Replacements loading={loading} data={data} />
        </Grid>
        <Grid item xs={12}>
          <Annotators
            projectId={projectId}
            loading={loading}
            data={data}
            handleUpdate={handleUpdateAnnotators}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Schema
            loading={loading}
            data={data}
            handleUpdateSchema={() => {}}
            updateFunction={updateProjectTagFunction}
            createFunction={createProjectTagFunction}
            deleteFunction={deleteProjectTagFunction}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Flags
            loading={loading}
            data={data}
            handleUpdate={handleUpdateFlags}
            createFunction={addProjectFlagFunction}
            updateFunction={updateProjectFlagFunction}
            deleteFunction={deleteProjectFlagFunction}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Adjudication loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <Settings
            loading={loading}
            data={data}
            downloadProject={downloadProject}
            downloadReplacements={downloadReplacements}
            deleteProject={deleteProject}
            disabled={disabled}
          />
        </Grid>
      </Grid>

      {/* STICKY FOOTER */}
      <Grid item xs="auto">
        <Paper variant="outlined">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p="0.5rem 1rem"
            spacing={1}
          >
            <Typography variant="body2">
              To begin annotating, simply click "Annotate."
            </Typography>
            {/* Save changes with "Update," or */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                component={Link}
                to={`/project/${projectId}`}
              >
                Annotate
              </Button>
              {/* TODO: integrate change detection and unified update into this button from all component */}
              {/* <LoadingButton
                variant="contained"
                // loading={isSubmitting}
                // onClick={handleSubmit}
                disabled={true}
              >
                Update
              </LoadingButton> */}
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
