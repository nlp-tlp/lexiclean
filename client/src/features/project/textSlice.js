import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../common/utils/api-interceptor";

const initialState = {
  status: "idle",
  error: null,
  page: 1,
  pageLimit: 5,
  totalPages: null,
  currentTexts: [],
  saveReplacementsOnly: false,
  tokenizeTextId: null,
};

export const getTotalPages = createAsyncThunk(
  "texts/getTotalPages",
  async (payload) => {
    const response = await axios.post(
      "/api/text/filter",
      {
        project_id: payload.project_id,
        get_pages: payload.get_pages,
        search_term: payload.search_term !== "" ? payload.search_term : null,
      },
      {
        params: { limit: payload.page_limit },
      }
    );
    return response.data;
  }
);

export const fetchTexts = createAsyncThunk(
  "texts/fetchTexts",
  async (payload) => {
    const response = await axios.post(
      "/api/text/filter",
      {
        project_id: payload.project_id,
        search_term: payload.search_term !== "" ? payload.search_term : null,
      },
      {
        params: { page: payload.page, limit: payload.page_limit },
      }
    );
    return response.data;
  }
);

// Unsure whether need to pass in payload or can access text state directly.
export const updateAnnotationStates = createAsyncThunk(
  "texts/updateAnnotationStates",
  async (payload) => {
    const response = await axios.patch("/api/text/annotations/update", {
      textIds: payload.currentTexts.map((text) => text._id),
      replacements_only: payload.saveReplacementsOnly,
    });
    return response.data;
  }
);

export const textSlice = createSlice({
  name: "texts",
  initialState: initialState,
  reducers: {
    setIdle: (state, action) => {
      // TODO: rename to 'refresh'
      state.status = "idle";
    },
    setPageLimit: (state, action) => {
      state.pageLimit = Number(action.payload);
    },
    setPage: (state, action) => {
      state.page = Number(action.payload);
    },
    setTokenizeTextId: (state, action) => {
      state.tokenizeTextId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTexts.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTexts.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Add fetched project to details
        state.currentTexts = action.payload;
      })
      .addCase(fetchTexts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(getTotalPages.fulfilled, (state, action) => {
        state.totalPages = action.payload.totalPages;
      });
  },
});

export const { setIdle, setPageLimit, setPage, setTokenizeTextId } =
  textSlice.actions;

export const selectCurrentTexts = (state) => state.texts.currentTexts;
export const selectPageLimit = (state) => state.texts.pageLimit;
export const selectPage = (state) => state.texts.page;
export const selectTokenizeTextId = (state) => state.texts.tokenizeTextId;

export default textSlice.reducer;
