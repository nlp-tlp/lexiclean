import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null,
  preferences: {},
  token: null,
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
    },
    logout: (state) => {
      // https://stackoverflow.com/questions/59061161/how-to-reset-state-of-redux-store-when-using-configurestore-from-reduxjs-toolki
      // From here we can take action only at this "counter" state
      // But, as we have taken care of this particular "logout" action
      // in rootReducer, we can use it to CLEAR the complete Redux Store's state
    },
  },
});

export const { setUsername, setToken, logout } = userSlice.actions;

export const selectUsername = (state) => state.user.username;
export const selectToken = (state) => state.user.token;

export default userSlice.reducer;
