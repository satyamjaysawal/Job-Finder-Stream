import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, register, continueAsUser } from "../store/slices/authSlice";

const AUTH_FIELD =
  "mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-indigo-100/35 outline-none transition-colors focus:border-indigo-400/70";

function MarketingHero() {
  return (
    <section className="hidden max-w-xl flex-col gap-6 lg:flex">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-[10px] font-extrabold tracking-[.18em] text-indigo-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_#4ade80]" />
        Job marketing command center
      </span>
      <h1 className="m-0 text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-5xl">
        Find the right roles.
        <br />
        <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
          Move your career forward.
        </span>
      </h1>
      <p className="m-0 max-w-lg text-sm leading-relaxed text-slate-200/80 xl:text-base">
        JobRadar is a focused workspace for discovering opportunities, organising MongoDB job snapshots, and watching fresh matches arrive live.
      </p>
      <ul className="m-0 grid list-none gap-3 p-0 text-sm text-slate-100/90">
        <li className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">📡</span>
          Live scrape signals over WebSockets
        </li>
        <li className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">🗂️</span>
          Database snapshots for every search run
        </li>
        <li className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">🎯</span>
          Smart filters by city, company, and role
        </li>
        <li className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">👤</span>
          User and admin roles with a generated session email
        </li>
      </ul>
    </section>
  );
}

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const busy = status === "loading";

  const submit = (event) => {
    event.preventDefault();
    if (mode === "login") {
      dispatch(login({ email, password }));
    } else {
      dispatch(register({ email, password, name }));
    }
  };

  return (
    <div className="home-hero relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-4 py-10 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1025] via-transparent to-[#0b1025]/55" />
      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
        <MarketingHero />
        <form
          className="w-full max-w-md justify-self-center space-y-3 rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-slate-100 backdrop-blur-xl sm:p-7 lg:justify-self-end"
          onSubmit={submit}
        >
          <div className="flex items-center gap-2.5 pb-1 font-semibold text-white">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-600 text-sm font-bold text-white">
              J
            </span>
            JobRadar
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>

          {mode === "register" && (
            <>
              <label className="block text-sm text-indigo-100/70">
                Name
                <input
                  className={AUTH_FIELD}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
            </>
          )}

          <label className="block text-sm text-indigo-100/70">
            Email
            <input
              className={AUTH_FIELD}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-indigo-100/70">
            Password
            <input
              className={AUTH_FIELD}
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
              Full access · generated email like anon-75e80212@anonymous.local
            </small>
          </button>
        </form>
      </div>
    </div>
  );
}
