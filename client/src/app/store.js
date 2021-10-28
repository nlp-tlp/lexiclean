import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "../features/project/projectSlice";
import textReducer from "../features/project/textSlice";
import tokenReducer from "../features/project/tokenSlice";
import userReducer from "../features/common/userSlice";
import feedReducer from "../features/project/feedSlice";


export default configureStore({
  reducer: {
    project: projectReducer,
    texts: textReducer,
    tokens: tokenReducer,
    user: userReducer,
    feed: feedReducer,
  },
});
