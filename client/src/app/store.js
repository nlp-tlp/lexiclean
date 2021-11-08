import { configureStore, combineReducers } from "@reduxjs/toolkit";
import projectReducer from "../features/project/projectSlice";
import textReducer from "../features/project/textSlice";
import tokenReducer from "../features/project/tokenSlice";
import userReducer from "../features/auth/userSlice";
import feedReducer from "../features/feed/feedSlice";
import createStepReducer from "../features/project/create/createStepSlice"

const combinedReducer = combineReducers({
  project: projectReducer,
  texts: textReducer,
  tokens: tokenReducer,
  user: userReducer,
  feed: feedReducer,
  create: createStepReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "user/logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

export default configureStore({
  reducer: rootReducer,
  // reducer: {
  // project: projectReducer,
  // texts: textReducer,
  // tokens: tokenReducer,
  // user: userReducer,
  // feed: feedReducer,
  // },
});
