import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/api-interceptor";

const initialState = {
  status: "idle",
  error: null,
  metricsStatus: "idle",
  metricsError: null,
  projects: null,
  projectMetrics: null,
  activeProject: null,
  deletingProject: false,
};

export const fetchProjects = createAsyncThunk(
  "/feed/fetchProjects",
  async () => {
    const response = await axios.get("/api/project/");
    return response.data;
  }
);

export const fetchProjectMetrics = createAsyncThunk(
  "/feed/fetchProjectsMetrics",
  async () => {
    const response = await axios.get("/api/project/feed");
    return response.data;
  }
);

export const deleteProject = createAsyncThunk(
  "/feed/deleteProject",
  async ({ projectId }) => {
    const response = await axios.delete(`/api/project/${projectId}`);
    return { response: response.data, details: { projectId: projectId } };
  }
);

export const feedSlice = createSlice({
  name: "feed",
  initialState: initialState,
  reducers: {
    setActiveProject: (state, action) => {
      // console.log("active project payload", action.payload);
      state.activeProject = action.payload;
    },
    setIdle: (state, action) => {
      state.status = "idle";
    },
    setProjectMetrics: (state, action) => {
      state.metricsStatus = "idle";
      state.projectMetrics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add fetched data to projects
        state.projects = action.payload;
      })
      .addCase(fetchProjects.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchProjectMetrics.fulfilled, (state, action) => {
        state.metricsStatus = "succeeded";
        // Add fetched data to metrics
        state.projectMetrics = Object.assign(
          {},
          ...action.payload
            .flat()
            .map((projectMetrics) => ({ [projectMetrics._id]: projectMetrics }))
        );

        // state.projectMetrics = Object.assign({}, ...action.payload);
      })
      .addCase(fetchProjectMetrics.pending, (state, action) => {
        state.metricsStatus = "loading";
      })
      .addCase(fetchProjectMetrics.rejected, (state, action) => {
        state.metricsStatus = "failed";
        state.metricsError = action.error.message;
      })
      .addCase(deleteProject.pending, (state, action) => {
        state.deletingProject = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        const details = action.payload.details;

        // Remove project from list and reset active project
        state.projects = state.projects.filter(
          (project) => project._id !== details.projectId
        );
        state.activeProject = null;

        state.deletingProject = false;
      });
  },
});

export const { setActiveProject, setIdle, setProjectMetrics } =
  feedSlice.actions;

export const selectFeedStatus = (state) => state.feed.status;
export const selectFeedError = (state) => state.feed.error;
export const selectFeedMetricsStatus = (state) => state.feed.metricsStatus;
export const selectFeedMetricsError = (state) => state.feed.metricsError;

export const selectProjects = (state) => state.feed.projects;
export const selectProjectMetrics = (state) => state.feed.projectMetrics;

export const selectActiveProject = (state) => state.feed.activeProject;
export const selectDeletingProject = (state) => state.feed.deletingProject;

export default feedSlice.reducer;
