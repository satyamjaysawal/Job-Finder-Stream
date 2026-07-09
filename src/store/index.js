import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import configReducer from "./slices/configSlice";
import scrapeJsonReducer from "./slices/scrapeJsonSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    config: configReducer,
    scrapeJson: scrapeJsonReducer,
  },
  devTools: import.meta.env.DEV,
});
