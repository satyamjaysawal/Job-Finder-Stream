import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE, apiError, parseJson } from "../api";
import { setBackendOnline } from "./uiSlice";
import { notifyError, notifySuccess, notifyInfo } from "../notify";

function normalizeJobs(list, sourceId = null, sourceName = null) {
  if (!Array.isArray(list)) return [];
  return list.map((job, i) => ({
    ...job,
    _id: job._id || job.job_url || `${sourceId || "col"}-${i}`,
    source_json_id: job.source_json_id || sourceId,
    source_json_name: job.source_json_name || sourceName,
  }));
}

export const fetchScrapeJsonList = createAsyncThunk(
  "scrapeJson/fetchList",
  async (opts, { dispatch, rejectWithValue }) => {
    const quiet = opts?.quiet === true;
    try {
      const res = await fetch(`${API_BASE}/scrape-jsons`);
      if (!res.ok) {
        const data = await parseJson(res);
        const msg = apiError(
          data,
          `Failed to load collections (HTTP ${res.status})`
        );
        notifyError(dispatch, msg);
        dispatch(setBackendOnline(false));
        return rejectWithValue(msg);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      dispatch(setBackendOnline(true));
      if (!quiet) {
        notifySuccess(
          dispatch,
          `Loaded ${list.length} collection${list.length === 1 ? "" : "s"} from database.`
        );
      }
      return list;
    } catch (err) {
      console.error(err);
      const msg = "Could not load job collections from the database.";
      notifyError(dispatch, msg);
      dispatch(setBackendOnline(false));
      return rejectWithValue(msg);
    }
  }
);

/**
 * Open a collection: fetch full document + all jobs from MongoDB collection.
 */
export const openJsonCard = createAsyncThunk(
  "scrapeJson/open",
  async (id, { dispatch, rejectWithValue }) => {
    if (!id) {
      const msg = "Missing collection id.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }

    try {
      const res = await fetch(
        `${API_BASE}/scrape-jsons/${encodeURIComponent(id)}`
      );
      if (!res.ok) {
        const err = await parseJson(res);
        if (res.status === 404) {
          notifyError(dispatch, "Job collection not found in database.");
          await dispatch(fetchScrapeJsonList({ quiet: true }));
        } else {
          notifyError(dispatch, apiError(err, "Failed to open collection"));
        }
        return rejectWithValue("open_fail");
      }

      const doc = await res.json();
      const colName = doc.collection_name || doc.name;
      const jobs = normalizeJobs(doc.jobs || [], doc.id, colName);
      const jobCount = doc.job_count ?? jobs.length;

      dispatch(setBackendOnline(true));
      notifySuccess(
        dispatch,
        `Loaded ${jobs.length} job${jobs.length === 1 ? "" : "s"} from ${colName}.`
      );

      return {
        selectedJsonId: doc.id,
        openCardId: doc.id,
        view: "jobs",
        activeJobs: jobs,
        activeJsonMeta: {
          id: doc.id,
          name: colName,
          collection_name: colName,
          job_count: jobCount,
          created_at: doc.created_at,
          completed_at: doc.completed_at,
          search_term: doc.search_term,
          filters: doc.filters,
          config_snapshot: doc.config_snapshot,
          source: doc.source || "search",
          status: doc.status || "completed",
          is_live: doc.source === "live_stream",
        },
      };
    } catch (err) {
      console.error(err);
      dispatch(setBackendOnline(false));
      notifyError(dispatch, "Could not open job collection (network error).");
      return rejectWithValue("network");
    }
  }
);

export const deleteScrapeJson = createAsyncThunk(
  "scrapeJson/delete",
  async ({ id, name }, { getState, dispatch, rejectWithValue }) => {
    try {
      notifyInfo(dispatch, `Deleting collection ${name || id} from MongoDB...`);
      const res = await fetch(`${API_BASE}/scrape-jsons/${id}`, {
        method: "DELETE",
      });
      const data = await parseJson(res);
      if (!res.ok) {
        const msg = apiError(data, "Delete failed");
        notifyError(dispatch, msg);
        return rejectWithValue(msg);
      }
      const remaining = data.list || [];
      notifySuccess(
        dispatch,
        `Deleted collection ${name || id} from database.`
      );
      const { selectedJsonId, openCardId } = getState().scrapeJson;
      if (selectedJsonId === id || openCardId === id) {
        dispatch(clearActiveJson());
      }
      dispatch(setBackendOnline(true));
      return remaining;
    } catch (err) {
      console.error(err);
      const msg = "Failed to delete collection from database.";
      notifyError(dispatch, msg);
      return rejectWithValue(msg);
    }
  }
);

const scrapeJsonSlice = createSlice({
  name: "scrapeJson",
  initialState: {
    list: [],
    selectedJsonId: null,
    openCardId: null,
    openingId: null,
    deletingId: null,
    activeJsonMeta: null,
    activeJobs: [],
    view: "list",
    refreshingList: false,
  },
  reducers: {
    toggleOpenCard(state, action) {
      const key = action.payload;
      state.openCardId = state.openCardId === key ? null : key;
    },
    clearActiveJson(state) {
      state.selectedJsonId = null;
      state.openCardId = null;
      state.activeJsonMeta = null;
      state.activeJobs = [];
      state.view = "list";
      state.openingId = null;
    },
    backToCollections(state) {
      state.view = "list";
      state.activeJobs = [];
      state.selectedJsonId = null;
      state.activeJsonMeta = null;
      state.openingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScrapeJsonList.pending, (state) => {
        state.refreshingList = true;
      })
      .addCase(fetchScrapeJsonList.fulfilled, (state, action) => {
        state.refreshingList = false;
        state.list = action.payload;
      })
      .addCase(fetchScrapeJsonList.rejected, (state) => {
        state.refreshingList = false;
      })
      .addCase(openJsonCard.pending, (state, action) => {
        state.openingId = action.meta.arg || null;
        state.activeJobs = [];
      })
      .addCase(openJsonCard.fulfilled, (state, action) => {
        state.openingId = null;
        state.selectedJsonId = action.payload.selectedJsonId;
        state.openCardId = action.payload.openCardId;
        state.activeJsonMeta = action.payload.activeJsonMeta;
        state.activeJobs = action.payload.activeJobs || [];
        state.view = action.payload.view || "jobs";
      })
      .addCase(openJsonCard.rejected, (state) => {
        state.openingId = null;
      })
      .addCase(deleteScrapeJson.pending, (state, action) => {
        state.deletingId = action.meta.arg.id;
      })
      .addCase(deleteScrapeJson.fulfilled, (state, action) => {
        state.deletingId = null;
        state.list = action.payload;
      })
      .addCase(deleteScrapeJson.rejected, (state) => {
        state.deletingId = null;
      });
  },
});

export const { toggleOpenCard, clearActiveJson, backToCollections } =
  scrapeJsonSlice.actions;

export default scrapeJsonSlice.reducer;
