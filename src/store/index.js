import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import configReducer from "./slices/configSlice";
import scrapeJsonReducer from "./slices/scrapeJsonSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    config: configReducer,
    scrapeJson: scrapeJsonReducer,
  },
  devTools: import.meta.env.DEV,
});
