import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { deleteAllUsers, deleteUser, fetchUsers } from "../store/slices/authSlice";

export default function UsersAdminPage() {
  const dispatch = useAppDispatch();
  const { users, usersStatus, user: me } = useAppSelector((s) => s.auth);
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const others = users.filter((u) => u.user_id !== me?.user_id);

  return (
    <section className="page-shell">
      <div className="page-header workspace-hero">
        <div>
          <p className="page-kicker">Admin</p>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">
            Delete one account at a time, or remove every user except your admin session.
          </p>
        </div>
        {confirmAll ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-rose-300">Delete all other users?</span>
            <button
              type="button"
              className="btn-danger"
              disabled={usersStatus === "loading"}
              onClick={() => {
                dispatch(deleteAllUsers());
                setConfirmAll(false);
              }}
            >
              Yes, delete all
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={() => setConfirmAll(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-danger"
            disabled={!others.length || usersStatus === "loading"}
            onClick={() => setConfirmAll(true)}
          >
            Delete all users
          </button>
        )}
      </div>

      {usersStatus === "loading" && users.length === 0 ? (
        <div className="empty-state">
          <p className="text-sm font-bold">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p className="text-sm font-bold">No users found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((item) => {
            const self = item.user_id === me?.user_id;
            return (
              <article key={item.user_id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-200">
                    {(item.name || item.email || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {item.name || "User"}
                      {self && <span className="ml-2 text-[10px] uppercase tracking-wider text-indigo-300">You</span>}
                    </p>
                    <p className="truncate text-xs text-slate-400">{item.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    {item.anonymous ? "Anonymous user" : item.role}
                  </span>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={self || usersStatus === "loading"}
                    onClick={() => dispatch(deleteUser(item.user_id))}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
