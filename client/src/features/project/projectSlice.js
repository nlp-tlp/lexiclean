import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../common/utils/api-interceptor";

const initialState = {
  details: {},
  id: null,
  status: "idle",
  error: null,
  searchTerm: "",
  metaTagSuggestionMap: null,
  bgColourMap: null,
  activeMaps: null,
  savePending: false,
};

export const fetchProject = createAsyncThunk(
  "project/fetchProject",
  async () => {
    const response = await axios.get("/api/project/6162558c19b1ca02599da934");
    return response.data;
  }
);

export const fetchProjectMaps = createAsyncThunk(
  "project/fetchProjectMaps",
  async () => {
    const response = await axios.get("/api/map/6162558c19b1ca02599da934");
    return response.data;
  }
);

export const projectSlice = createSlice({
  name: "project",
  initialState: initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
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
        state.metaTagSuggestionMap = Object.fromEntries(
          action.payload.map_keys.map((key) => [[key], {}])
        );
        state.bgColourMap = action.payload.colour_map;
        state.activeMaps = Object.keys(action.payload.contents).filter(
          (key) => action.payload.contents[key].active
        );
      });
  },
});

export const { setSearchTerm } = projectSlice.actions;

export const selectProject = (state) => state.project.details;
export const selectSearchTerm = (state) => state.project.searchTerm;
export const selectBgColourMap = (state) => state.project.bgColourMap;

export default projectSlice.reducer;
