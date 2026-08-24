import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE, EMPTY_CONFIG, apiError, parseJson, authHeaders } from "../api";
import { setBackendOnline } from "./uiSlice";
import { notifyError, notifySuccess } from "../notify";

export const fetchConfig = createAsyncThunk(
  "config/fetch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/config`, { headers: authHeaders() });
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
        headers: authHeaders({ "Content-Type": "application/json" }),
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
      headers: authHeaders({ "Content-Type": "application/json" }),
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
  async (payload, { dispatch, getState, rejectWithValue }) => {
    const isObject = payload && typeof payload === "object";
    const q = String(isObject ? payload.query : payload || "").trim();
    const group = isObject ? payload.group : undefined;
    if (!q) {
      const msg = "Enter a search query first.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const existing = getState().config.config.search_queries || [];
    if (existing.some((item) => String(item).toLowerCase() === q.toLowerCase())) {
      const msg = "Query already exists in config collection.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const body = { query: q };
    if (group) body.group = String(group);
    return listMutate({
      path: "/config/queries",
      method: "POST",
      body,
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

export const addQueryGroup = createAsyncThunk(
  "config/addQueryGroup",
  async (group, { dispatch, getState, rejectWithValue }) => {
    const g = String(group || "").trim().toLowerCase();
    if (!g) {
      const msg = "Enter a department name first.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    if (g === "developer" || g === "hr") {
      const msg = `"${g}" is a built-in department.`;
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const existing = getState().config.config.custom_query_groups || [];
    if (existing.some((item) => String(item).toLowerCase() === g)) {
      const msg = "Department already exists in config collection.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    return listMutate({
      path: "/config/groups",
      method: "POST",
      body: { group: g },
      successMsg: "Department added to database.",
      failMsg: "Failed to add department.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const removeQueryGroup = createAsyncThunk(
  "config/removeQueryGroup",
  async (group, { dispatch, rejectWithValue }) =>
    listMutate({
      path: "/config/groups",
      method: "DELETE",
      body: { group: String(group || "").trim() },
      successMsg: "Department removed from database.",
      failMsg: "Failed to remove department.",
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
    if (existing.some((item) => String(item).toLowerCase() === c.toLowerCase())) {
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
    if (existing.some((item) => String(item).toLowerCase() === c.toLowerCase())) {
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

export const addCompany = createAsyncThunk(
  "config/addCompany",
  async (company, { dispatch, getState, rejectWithValue }) => {
    const c = String(company || "").trim();
    if (!c) {
      const msg = "Enter a company first.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    const existing = getState().config.config.top_companies || [];
    if (existing.some((item) => String(item).toLowerCase() === c.toLowerCase())) {
      const msg = "Company already exists in config collection.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    return listMutate({
      path: "/config/companies",
      method: "POST",
      body: { company: c },
      successMsg: "Company added to database.",
      failMsg: "Failed to add company.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const editCompany = createAsyncThunk(
  "config/editCompany",
  async ({ oldValue, newValue }, { dispatch, getState, rejectWithValue }) => {
    const old_value = String(oldValue || "").trim();
    const new_value = String(newValue || "").trim();
    if (!old_value || !new_value) {
      const msg = "Old and new company values are required.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
    if (old_value === new_value) return getState().config.config;
    return listMutate({
      path: "/config/companies",
      method: "PUT",
      body: { old_value, new_value },
      successMsg: "Company updated in database.",
      failMsg: "Failed to edit company.",
      dispatch,
      rejectWithValue,
    });
  }
);

export const removeCompany = createAsyncThunk(
  "config/removeCompany",
  async (company, { dispatch, rejectWithValue }) =>
    listMutate({
      path: "/config/companies",
      method: "DELETE",
      body: { company },
      successMsg: "Company removed from database.",
      failMsg: "Failed to remove company.",
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
      .addCase(addQueryGroup.fulfilled, applyConfig)
      .addCase(removeQueryGroup.fulfilled, applyConfig)
      .addCase(addCity.fulfilled, applyConfig)
      .addCase(editCity.fulfilled, applyConfig)
      .addCase(removeCity.fulfilled, applyConfig)
      .addCase(addCountry.fulfilled, applyConfig)
      .addCase(editCountry.fulfilled, applyConfig)
      .addCase(removeCountry.fulfilled, applyConfig)
      .addCase(addCompany.fulfilled, applyConfig)
      .addCase(editCompany.fulfilled, applyConfig)
      .addCase(removeCompany.fulfilled, applyConfig);
  },
});

export default configSlice.reducer;
