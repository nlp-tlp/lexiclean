import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null,
  preferences: {},
  token: null
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    }
  },
});

export const { setUsername, setToken } = userSlice.actions;

export const selectUsername = (state) => state.user.username;
export const selectToken = (state) => state.user.token;


export default userSlice.reducer;
