import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, register, continueAsUser } from "../store/slices/authSlice";

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");

  const busy = status === "loading";

  const submit = (event) => {
    event.preventDefault();
    if (mode === "login") {
      dispatch(login({ email, password }));
    } else {
      dispatch(register({ email, password, name, role }));
    }
  };

  return (
    <div className="home-hero relative flex min-h-[100dvh] w-full items-center justify-center px-4 py-10">
      <form
        className="relative z-10 w-full max-w-md space-y-3 rounded-3xl border border-white/10 bg-slate-950/55 p-6 text-slate-100 backdrop-blur-xl sm:p-7"
        onSubmit={submit}
      >
        <div className="flex items-center gap-2.5 pb-1 font-semibold text-white">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-600 text-sm font-bold text-white">
            J
          </span>
          JobRadar
        </div>
        <h1 className="text-xl font-bold text-white">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        {mode === "register" && (
          <>
            <label className="block text-sm text-indigo-100/70">
              Name
              <input
                className="input-field mt-1 border-white/15 bg-white/5 text-white placeholder:text-slate-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="block text-sm text-indigo-100/70">
              Role
              <select
                className="input-field mt-1 border-white/15 bg-white/5 text-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user" className="text-slate-900">
                  User
                </option>
                <option value="admin" className="text-slate-900">
                  Admin
                </option>
              </select>
            </label>
          </>
        )}

        <label className="block text-sm text-indigo-100/70">
          Email
          <input
            className="input-field mt-1 border-white/15 bg-white/5 text-white placeholder:text-slate-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm text-indigo-100/70">
          Password
          <input
            className="input-field mt-1 border-white/15 bg-white/5 text-white placeholder:text-slate-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <button className="btn-primary w-full max-w-none py-2.5" type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Continue" : "Create account"}
        </button>

        <button
          type="button"
          className="w-full cursor-pointer text-center text-sm text-indigo-100/60 transition-colors hover:text-white"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account?" : "Have an account?"}
        </button>

        <div className="flex items-center gap-3 text-xs text-indigo-100/50 before:h-px before:flex-1 before:bg-white/15 after:h-px after:flex-1 after:bg-white/15">
          <span>or</span>
        </div>

        <button
          type="button"
          disabled={busy}
          className="flex w-full cursor-pointer flex-col items-center rounded-xl border border-indigo-400/40 bg-indigo-400/10 py-2.5 text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => dispatch(continueAsUser())}
        >
          Continue as user — no login
          <small className="text-[11px] font-normal text-indigo-100/50">
            Full access (dashboard, live stream, snapshots) · No sign-up required
          </small>
        </button>
      </form>
    </div>
  );
}
