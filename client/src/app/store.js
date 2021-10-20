import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "../features/project/projectSlice";
import textReducer from "../features/project/textSlice";
import tokenReducer from "../features/project/tokenSlice";

export default configureStore({
  reducer: {
    project: projectReducer,
    texts: textReducer,
    tokens: tokenReducer
  },
});
