import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";

const useDashboardActions = () => {
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();

  const fetchProjectSummaryById = async (id) => {
    try {
      const data = await callApi(`/projects/${id}/summary`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error(`Error fetching project dashboard info: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to fetch project dashboard information`,
        severity: "error",
      });

      throw error;
    }
  };

  const downloadProjectData = async (id) => {
    try {
      const data = await callApi(`/projects/download/${id}?type=project`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error(`Error downloading project data: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Error downloading project data`,
        severity: "error",
      });

      throw error;
    }
  };

  const deleteProjectById = async (id) => {
    try {
      const data = await callApi(`/projects/${id}`, {
        method: "DELETE",
      });

      return data;
    } catch (error) {
      console.error(`Error deleting project: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: "Error deleting project.",
        severity: "error",
      });

      throw error;
    }
  };

  const addProjectTag = async ({ projectId, tag }) => {
    try {
      const data = await callApi(`/projects/${projectId}/tags`, {
        method: "POST",
        data: tag,
      });
      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to add tag on project: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  const updateProjectTag = async ({ projectId, tagId, tag }) => {
    try {
      const data = await callApi(`/projects/${projectId}/tags/${tagId}`, {
        method: "PATCH",
        data: tag,
      });
      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to update tag on project: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  const deleteProjectTag = async ({ projectId, tagId }) => {
    try {
      const data = await callApi(`/projects/${projectId}/tags/${tagId}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to delete tag on project: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  const addProjectFlag = async ({ projectId, flag }) => {
    /**
     * Add new flag to project
     */
    try {
      const data = await callApi(`/projects/${projectId}/flags`, {
        method: "POST",
        data: flag,
      });
      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to add flag on project: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  const updateProjectFlag = async ({ projectId, flagId, flag }) => {
    /**
     * Update existing flag on project
     */
    try {
      const data = await callApi(`/projects/${projectId}/flags/${flagId}`, {
        method: "PATCH",
        data: flag,
      });
      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to update flag on project: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  const deleteProjectFlag = async ({ projectId, flagId }) => {
    /**
     * Delete an existing flag on project
     */
    try {
      const data = await callApi(`/projects/${projectId}/flags/${flagId}`, {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to delete flag on project: ${error.response.data.detail}`,
        severity: "error",
      });
    }
  };

  const updateProjectSchema = async ({ projectId, newTag }) => {
    // Update value associated with project (name, description) including schema.

    try {
      const data = await callApi(`/projects/${projectId}/tags`, {
        method: "POST",
        data: newTag,
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to modify project schema: ${error}`,
        severity: "error",
      });
    }
  };

  const updateProjectDetail = async ({ projectId, name, description }) => {
    try {
      const data = await callApi(`/projects/${projectId}`, {
        method: "PATCH",
        data: {
          name,
          description,
        },
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to modify project details: ${error}`,
        severity: "error",
      });
    }
  };

  const updateProjectFlags = async ({ projectId, flags }) => {
    try {
      const data = await callApi(`/api/project/${projectId}/flags`, {
        method: "PATCH",
        data: {
          projectId,
          flags,
        },
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to modify project flags: ${error}`,
        severity: "error",
      });
    }
  };

  const getAdjudication = async ({ projectId, page }) => {
    try {
      const data = await callApi(`/projects/${projectId}/adjudication`, {
        method: "GET",
        params: { skip: page - 1 },
      });

      if (data) {
        return data;
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to get adjudicated text: ${error.response.data.detail}`,
        severity: "error",
      });
      return;
    }
  };

  const removeAnnotator = async ({ projectId, annotatorId }) => {
    try {
      const data = await callApi("/api/project/annotator/remove", {
        method: "PATCH",
        data: { projectId, annotatorId },
      });

      if (data) {
        snackbarDispatch({
          type: "SHOW",
          message: `Successfully removed annotator`,
          severity: "success",
        });
        return data;
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to remove annotator: ${error}`,
        severity: "error",
      });
      return;
    }
  };

  const downloadReplacementData = async (id) => {
    try {
      const data = await callApi(`/projects/download/${id}?type=replacements`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error(`Error downloading project replacements: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Error downloading project replacements`,
        severity: "error",
      });

      throw error;
    }
  };

  return {
    fetchProjectSummaryById,
    downloadProjectData,
    deleteProjectById,
    updateProjectSchema,
    updateProjectDetail,
    updateProjectFlags,
    addProjectTag,
    updateProjectTag,
    deleteProjectTag,
    addProjectFlag,
    updateProjectFlag,
    deleteProjectFlag,
    getAdjudication,
    removeAnnotator,
    downloadReplacementData,
  };
};

export default useDashboardActions;
