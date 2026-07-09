import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE, EMPTY_CONFIG, apiError, parseJson } from "../api";
import { setBackendOnline } from "./uiSlice";
import { notifyError, notifySuccess } from "../notify";

export const fetchConfig = createAsyncThunk(
  "config/fetch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (!res.ok) {
        const data = await parseJson(res);
        const msg = apiError(data, `Failed to load config (HTTP ${res.status})`);
        notifyError(dispatch, msg);
        dispatch(setBackendOnline(false));
        return rejectWithValue(msg);
      }
      const data = await res.json();
      dispatch(setBackendOnline(true));
      return data;
    } catch {
      const msg = "Could not load configuration from the database.";
      notifyError(dispatch, msg);
      dispatch(setBackendOnline(false));
      return rejectWithValue(msg);
    }
  }
);

/** Update any fields on the single MongoDB `config` document. */
export const saveConfigScalars = createAsyncThunk(
  "config/saveScalars",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseJson(res);
      if (!res.ok) {
        const msg = apiError(data, "Config update failed");
        notifyError(dispatch, msg);
        return rejectWithValue(msg);
      }
      notifySuccess(dispatch, "Config updated in database.");
      dispatch(setBackendOnline(true));
      return data.config;
    } catch {
      const msg = "Failed to save configuration to database.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
  }
);

async function listMutate({
  path,
  method,
  body,
  successMsg,
  failMsg,
  dispatch,
  rejectWithValue,
}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await parseJson(res);
    if (!res.ok) {
      const msg = apiError(data, failMsg);
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    notifySuccess(dispatch, successMsg);
    dispatch(setBackendOnline(true));
    return data.config;
  } catch {
    notifyError(dispatch, failMsg);
    return rejectWithValue(failMsg);
  }
}

export const addQuery = createAsyncThunk(
  "config/addQuery",
  async (query, { dispatch, getState, rejectWithValue }) => {
    const q = String(query || "").trim();
    if (!q) {
      const msg = "Enter a search query first.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const existing = getState().config.config.search_queries || [];
    if (existing.includes(q)) {
      const msg = "Query already exists in config collection.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    return listMutate({
      path: "/config/queries",
      method: "POST",
      body: { query: q },
      successMsg: "Query added to database.",
      failMsg: "Failed to add query.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const editQuery = createAsyncThunk(
  "config/editQuery",
  async ({ oldValue, newValue }, { dispatch, getState, rejectWithValue }) => {
    const old_value = String(oldValue || "").trim();
    const new_value = String(newValue || "").trim();
    if (!old_value || !new_value) {
      const msg = "Old and new query values are required.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    if (old_value === new_value) return getState().config.config;
    return listMutate({
      path: "/config/queries",
      method: "PUT",
      body: { old_value, new_value },
      successMsg: "Query updated in database.",
      failMsg: "Failed to edit query.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const removeQuery = createAsyncThunk(
  "config/removeQuery",
  async (query, { dispatch, rejectWithValue }) =>
    listMutate({
      path: "/config/queries",
      method: "DELETE",
      body: { query },
      successMsg: "Query removed from database.",
      failMsg: "Failed to remove query.",
      dispatch,
      rejectWithValue,
    })
);

export const addCity = createAsyncThunk(
  "config/addCity",
  async (city, { dispatch, getState, rejectWithValue }) => {
    const c = String(city || "").trim();
    if (!c) {
      const msg = "Enter a city first.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const existing = getState().config.config.cities || [];
    if (existing.includes(c)) {
      const msg = "City already exists in config collection.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    return listMutate({
      path: "/config/cities",
      method: "POST",
      body: { city: c },
      successMsg: "City added to database.",
      failMsg: "Failed to add city.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const editCity = createAsyncThunk(
  "config/editCity",
  async ({ oldValue, newValue }, { dispatch, getState, rejectWithValue }) => {
    const old_value = String(oldValue || "").trim();
    const new_value = String(newValue || "").trim();
    if (!old_value || !new_value) {
      const msg = "Old and new city values are required.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    if (old_value === new_value) return getState().config.config;
    return listMutate({
      path: "/config/cities",
      method: "PUT",
      body: { old_value, new_value },
      successMsg: "City updated in database.",
      failMsg: "Failed to edit city.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const removeCity = createAsyncThunk(
  "config/removeCity",
  async (city, { dispatch, rejectWithValue }) =>
    listMutate({
      path: "/config/cities",
      method: "DELETE",
      body: { city },
      successMsg: "City removed from database.",
      failMsg: "Failed to remove city.",
      dispatch,
      rejectWithValue,
    })
);

export const addCountry = createAsyncThunk(
  "config/addCountry",
  async (country, { dispatch, getState, rejectWithValue }) => {
    const c = String(country || "").trim();
    if (!c) {
      const msg = "Enter a country first.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const existing = getState().config.config.countries || [];
    if (existing.includes(c)) {
      const msg = "Country already exists in config collection.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    return listMutate({
      path: "/config/countries",
      method: "POST",
      body: { country: c },
      successMsg: "Country added to database.",
      failMsg: "Failed to add country.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const editCountry = createAsyncThunk(
  "config/editCountry",
  async ({ oldValue, newValue }, { dispatch, getState, rejectWithValue }) => {
    const old_value = String(oldValue || "").trim();
    const new_value = String(newValue || "").trim();
    if (!old_value || !new_value) {
      const msg = "Old and new country values are required.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    if (old_value === new_value) return getState().config.config;
    return listMutate({
      path: "/config/countries",
      method: "PUT",
      body: { old_value, new_value },
      successMsg: "Country updated in database.",
      failMsg: "Failed to edit country.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const removeCountry = createAsyncThunk(
  "config/removeCountry",
  async (country, { dispatch, rejectWithValue }) =>
    listMutate({
      path: "/config/countries",
      method: "DELETE",
      body: { country },
      successMsg: "Country removed from database.",
      failMsg: "Failed to remove country.",
      dispatch,
      rejectWithValue,
    })
);

const applyConfig = (state, action) => {
  if (action.payload) {
    state.config = { ...EMPTY_CONFIG, ...action.payload };
  }
};

const configSlice = createSlice({
  name: "config",
  initialState: {
    config: { ...EMPTY_CONFIG },
    loading: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        applyConfig(state, action);
      })
      .addCase(fetchConfig.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveConfigScalars.fulfilled, applyConfig)
      .addCase(addQuery.fulfilled, applyConfig)
      .addCase(editQuery.fulfilled, applyConfig)
      .addCase(removeQuery.fulfilled, applyConfig)
      .addCase(addCity.fulfilled, applyConfig)
      .addCase(editCity.fulfilled, applyConfig)
      .addCase(removeCity.fulfilled, applyConfig)
      .addCase(addCountry.fulfilled, applyConfig)
      .addCase(editCountry.fulfilled, applyConfig)
      .addCase(removeCountry.fulfilled, applyConfig);
  },
});

export default configSlice.reducer;
