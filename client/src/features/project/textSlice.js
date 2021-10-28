import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/api-interceptor";

const initialState = {
  status: "idle",
  error: null,
  page: 1,
  pageLimit: 10,
  totalPages: null,
  saveReplacementsOnly: false,
  tokenizeTextId: null,
};

export const getTotalPages = createAsyncThunk(
  "/texts/getTotalPages",
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

export const updateAnnotationStates = createAsyncThunk(
  "/texts/updateAnnotationStates",
  async ({ textIds, saveReplacementsOnly }) => {
    const response = await axios.patch("/api/text/save/annotations", {
      textIds: textIds,
      replacements_only: saveReplacementsOnly,
    });
    return response.data;
  }
);

export const patchSingleAnnotationState = createAsyncThunk(
  "/texts/patchSingleAnnotationState",
  async ({ textId, value }) => {
    const response = await axios.patch(`/api/text/save/annotations/${textId}`, {
      value: value,
    });
    return {
      response: response.data,
      details: {
        textId: textId,
      },
    };
  }
);

export const textSlice = createSlice({
  name: "texts",
  initialState: initialState,
  reducers: {
    setIdle: (state, action) => {
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
    builder.addCase(getTotalPages.fulfilled, (state, action) => {
      state.totalPages = action.payload.totalPages;
    })
  },
});

export const { setIdle, setPageLimit, setPage, setTokenizeTextId } =
  textSlice.actions;

export const selectPageLimit = (state) => state.texts.pageLimit;
export const selectPage = (state) => state.texts.page;
export const selectTokenizeTextId = (state) => state.texts.tokenizeTextId;
export const selectTotalPages = (state) => state.texts.totalPages;

export default textSlice.reducer;
