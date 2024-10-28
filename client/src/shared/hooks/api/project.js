import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";

const useProjectActions = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();
  const navigate = useNavigate();

  const createProject = async (payload) => {
    // TODO: put some validation on the payload...
    try {
      const data = await callApi("/projects", {
        method: "POST",
        data: payload,
      });

      if (data) {
        navigate("/projects");
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await callApi("/projects");
      return data;
    } catch (error) {
      console.log(`error fetching projects: ${error}`);
      throw error;
    }
  };

  const getProjectProgress = async ({ projectId }) => {
    try {
      const data = await callApi(`/projects/${projectId}/progress`, {
        method: "GET",
      });

      if (data) {
        dispatch({ type: "SET_VALUE", payload: { progress: data } });
      }
    } catch (error) {
      console.log(`error fetching project progress: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to fetch project progress`,
        severity: "error",
      });
      throw error;
    }
  };

  const getProject = async ({ projectId }) => {
    try {
      const data = await callApi(`/projects/${projectId}`, {
        method: "GET",
      });

      if (data) {
        dispatch({ type: "SET_PROJECT", payload: data });
      }
    } catch (error) {
      console.log(`error fetching project: ${error}`);
      throw error; // Rethrow to handle it in the calling function
    }
  };

  const getProjectName = async ({ projectId }) => {
    try {
      const data = await callApi(`/api/project/${projectId}`, {
        method: "GET",
      });
      if (data) {
        return data.name;
      }
    } catch (error) {
      console.log(`error fetching project: ${error}`);
      throw error; // Rethrow to handle it in the calling function
    }
  };

  const getTexts = async ({ projectId, filters = {}, page, limit }) => {
    /**
     * projectId : project id
     * filters: object of filters (not implemented)
     * page : page number
     * limit : page limit
     */

    console.log("page", page, "limit", limit);

    try {
      const data = await callApi(`/texts/${projectId}`, {
        method: "GET",
        data: { projectId, filters },
        params: { skip: limit * (page - 1), limit: limit },
      });

      if (data) {
        dispatch({ type: "SET_TEXTS", payload: data });
      }
    } catch (error) {
      console.log(`error fetching texts: ${error}`);
    }
  };

  const saveTexts = async ({ projectId, textIds, save }) => {
    try {
      const data = await callApi("/texts/save", {
        method: "PATCH",
        data: { ids: textIds, save, project_id: projectId },
      });

      if (data) {
        dispatch({
          type: "SAVE_TEXTS",
          payload: {
            textIds: textIds,
            saveState: save,
            project_id: projectId,
          },
        });
        // Update progress
        snackbarDispatch({
          type: "SHOW",
          message: "Successfully updated save state.",
          severity: "success",
        });
        await getProjectProgress({ projectId });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: "Failed to update save state.",
        severity: "error",
      });
    }
  };

  return {
    createProject,
    fetchProjects,
    getProjectProgress,
    getProject,
    getTexts,
    saveTexts,
    getProjectName,
  };
};

export default useProjectActions;
