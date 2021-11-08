import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/api-interceptor";

const initialState = {
  details: {},
  id: null,
  status: "idle",
  error: null,
  filter: { searchTerm: "", annotated: "all", candidates: "all" },
  bgColourMap: null,
  activeMaps: null,
  savePending: false,
  metrics: null,
  metricsStatus: "idle",
  activeModal: null,
  modalInfo: null,
  schema: null,
};

export const fetchProject = createAsyncThunk(
  "/project/fetchProject",
  async ({ projectId }) => {
    const response = await axios.get(`/api/project/${projectId}`);
    return response.data;
  }
);

export const fetchProjectMaps = createAsyncThunk(
  "/project/fetchProjectMaps",
  async ({ projectId }) => {
    const response = await axios.get(`/api/map/${projectId}`);
    return response.data;
  }
);

export const fetchMetrics = createAsyncThunk(
  "/project/fetchMetrics",
  async ({ projectId }) => {
    console.log("metrics id", projectId);
    const response = await axios.get(`/api/project/metrics/${projectId}`);
    return response.data;
  }
);

export const patchProjectSchema = createAsyncThunk(
  "/project/patchProjectSchema",
  async ({ projectId, metaTag, colour }) => {
    const response = await axios.post("/api/map", {
      project_id: projectId,
      type: metaTag,
      colour: colour,
    });
    return {
      response: response.data,
      details: {
        metaTag: metaTag,
        colour: colour,
      },
    };
  }
);

export const changeMetaTagStatus = createAsyncThunk(
  "/project/changeMetaTagActivation",
  async ({ mapId, metaTag, status }) => {
    const response = await axios.post(`/api/map/status/${mapId}`, {
      activeStatus: status,
    });
    return {
      response: response.data,
      details: {
        metaTag: metaTag,
        status: status,
      },
    };
  }
);

export const projectSlice = createSlice({
  name: "project",
  initialState: initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    resetFilter: (state, action) => {
      state.filter = initialState.filter;
    },
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    setModalInfo: (state, action) => {
      state.modalInfo = action.payload;
    },
    setProject: (state, action) => {
      state.metrics = null;
      state.details = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProject.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add fetched project to details
        state.details = action.payload;
        state.id = action.payload._id;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchProjectMaps.fulfilled, (state, action) => {
        state.bgColourMap = action.payload.colour_map;
        state.activeMaps = Object.keys(action.payload.contents).filter(
          (key) => action.payload.contents[key].active
        );
        state.schema = action.payload; // Entire maps object
      })
      .addCase(fetchMetrics.pending, (state, action) => {
        state.metricsStatus = "loading";
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        // Fetches aggregate metrics of project progess
        state.metricsStatus = "succeeded";
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.metricsStatus = "failed";
      })
      .addCase(patchProjectSchema.fulfilled, (state, action) => {
        // Adds a new meta tag to the project schema

        const details = action.payload.details;

        // Note: payload
        //   {
        //     "response": {
        //         "tokens": [],
        //         "replacements": [],
        //         "active": true,
        //         "_id": "61766f15951978012488c6ba",
        //         "type": "dog",
        //         "colour": "#fa28ff",
        //         "last_modified": "2021-10-25T08:47:17.158Z",
        //         "__v": 0
        //     },
        //     "details": {
        //         "metaTag": "dog",
        //         "colour": "#fa28ff"
        //     }
        // }

        state.schema.contents = {
          ...state.schema.contents,
          [details.metaTag]: action.payload.response,
        };
        state.schema.map_keys = [...state.schema.map_keys, details.metaTag];
        state.schema.colour_map = {
          ...state.schema_colour_map,
          [details.metaTag]: details.colour,
        };

        // Need to update other dependent state values... (this is redudant...)
        state.bgColourMap = {
          ...state.bgColourMap,
          [details.metaTag]: details.colour,
        };
        state.activeMaps = [...state.activeMaps, details.metaTag];
      })
      .addCase(changeMetaTagStatus.fulfilled, (state, action) => {
        // Changes the state of a tag in the project schema (active/inactive)

        console.log(action.payload);

        const details = action.payload.details;

        // update state
        state.schema.contents = {
          ...state.schema.contents,
          [details.metaTag]: {
            ...state.schema.contents[details.metaTag],
            active: details.status,
          },
        };
        if (details.status) {
          state.activeMaps = [...state.activeMaps, details.metaTag];
        } else {
          state.activeMaps = state.activeMaps.filter(
            (map) => map !== details.metaTag
          );
        }
      });
  },
});

export const {
  setActiveModal,
  setModalInfo,
  setProject,
  setFilter,
  resetFilter,
} = projectSlice.actions;

export const selectProject = (state) => state.project.details;
export const selectBgColourMap = (state) => state.project.bgColourMap;
export const selectActiveMaps = (state) => state.project.activeMaps;
export const selectProjectMetrics = (state) => state.project.metrics;
export const selectProjectMetricsStatus = (state) =>
  state.project.metricsStatus;
export const selectActiveModal = (state) => state.project.activeModal;
export const selectProjectSchema = (state) => state.project.schema;
export const selectFilter = (state) => state.project.filter;

export default projectSlice.reducer;
