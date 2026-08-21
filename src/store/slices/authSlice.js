import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl, apiError, parseJson, getToken, setSession, clearSession, readStoredUser } from "../api";

export const restoreSession = createAsyncThunk("auth/restore", async (_, { rejectWithValue }) => {
  const token = getToken();
  if (!token) return rejectWithValue("no_token");
  try {
    const res = await fetch(apiUrl("auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await parseJson(res);
    if (!res.ok) {
      clearSession();
      return rejectWithValue(apiError(data, "Session expired"));
    }
    setSession(token, data.user);
    return { token, user: data.user };
  } catch {
    return rejectWithValue("Session restore failed");
  }
});

export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl("auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJson(res);
    if (!res.ok) return rejectWithValue(apiError(data, "Invalid email or password"));
    setSession(data.token, data.user);
    return data;
  } catch {
    return rejectWithValue("Could not reach the auth service.");
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password, name, role }, { rejectWithValue }) => {
    try {
      const res = await fetch(apiUrl("auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await parseJson(res);
      if (!res.ok) return rejectWithValue(apiError(data, "Could not create account"));
      setSession(data.token, data.user);
      return data;
    } catch {
      return rejectWithValue("Could not reach the auth service.");
    }
  }
);

export const continueAsUser = createAsyncThunk("auth/anonymous", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl("auth/anonymous"), { method: "POST" });
    const data = await parseJson(res);
    if (!res.ok) return rejectWithValue(apiError(data, "Could not start a user session"));
    setSession(data.token, data.user);
    return data;
  } catch {
    return rejectWithValue("Could not reach the auth service.");
  }
});

export const fetchUsers = createAsyncThunk("auth/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl("auth/users"), { headers: { Authorization: `Bearer ${getToken()}` } });
    const data = await parseJson(res);
    if (!res.ok) return rejectWithValue(apiError(data, "Could not load users"));
    return Array.isArray(data.users) ? data.users : [];
  } catch {
    return rejectWithValue("Could not load users");
  }
});

export const deleteUser = createAsyncThunk("auth/deleteUser", async (userId, { dispatch, rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl(`auth/users/${encodeURIComponent(userId)}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await parseJson(res);
    if (!res.ok) return rejectWithValue(apiError(data, "Could not delete user"));
    dispatch(fetchUsers());
    return data;
  } catch {
    return rejectWithValue("Could not delete user");
  }
});

export const deleteAllUsers = createAsyncThunk("auth/deleteAllUsers", async (_, { dispatch, rejectWithValue }) => {
  try {
    const res = await fetch(apiUrl("auth/users"), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await parseJson(res);
    if (!res.ok) return rejectWithValue(apiError(data, "Could not delete users"));
    dispatch(fetchUsers());
    return data;
  } catch {
    return rejectWithValue("Could not delete users");
  }
});

const storedUser = readStoredUser();
const storedToken = getToken();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: storedToken,
    user: storedUser,
    status: storedToken ? "authenticated" : "unauthenticated",
    error: null,
    users: [],
    usersStatus: "idle",
  },
  reducers: {
    logout(state) {
      clearSession();
      state.token = "";
      state.user = null;
      state.status = "unauthenticated";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.status = "loading";
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.status = "authenticated";
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    };
    const rejected = (state, action) => {
      if (action.payload === "no_token") {
        state.status = "unauthenticated";
        return;
      }
      state.status = "unauthenticated";
      state.token = "";
      state.user = null;
      state.error = action.payload || "Auth failed";
    };

    builder
      .addCase(restoreSession.pending, (state) => {
        if (!state.token || state.user) return;
        state.status = "loading";
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, fulfilled)
      .addCase(restoreSession.rejected, (state, action) => {
        if (action.payload === "no_token") {
          state.status = "unauthenticated";
          return;
        }
        rejected(state, action);
      })
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(continueAsUser.pending, pending)
      .addCase(continueAsUser.fulfilled, fulfilled)
      .addCase(continueAsUser.rejected, rejected)
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersStatus = "ready";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.usersStatus = "ready";
      })
      .addCase(deleteUser.pending, (state) => {
        state.usersStatus = "loading";
      })
      .addCase(deleteAllUsers.pending, (state) => {
        state.usersStatus = "loading";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
