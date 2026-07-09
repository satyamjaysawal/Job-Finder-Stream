# Job Finder Stream — Frontend

React job dashboard: **scraper settings**, **MongoDB scrape snapshots**, and **live stream UI**.

| Layer | Stack |
|-------|--------|
| **Frontend** | Vite 7 + React 19 + Redux Toolkit + Tailwind CSS 4 |
| **Backend** | FastAPI + MongoDB ([separate repo](https://github.com/satyamjaysawal/Job-Finder-Stream-Backend)) |

---

## Live production (Vercel)

| Service | URL |
|---------|-----|
| **Frontend** | https://job-finder-stream.vercel.app |
| **Backend API** | https://job-finder-stream-backend.vercel.app |
| **API base** | https://job-finder-stream-backend.vercel.app/api |
| **Health** | https://job-finder-stream-backend.vercel.app/api/health |
| **Swagger** | https://job-finder-stream-backend.vercel.app/docs |

**GitHub:** https://github.com/satyamjaysawal/Job-Finder-Stream  
**Vercel project:** `job-finder-stream` under [satyam-jaysawals-projects](https://vercel.com/satyam-jaysawals-projects)

---

## Features

- Config stored in MongoDB (queries, cities, countries, target, etc.)
- Scrape JSON runs — every search creates a new snapshot
- Select / view / delete any saved snapshot
- Live WebSocket job stream UI (best on local backend; see [limitations](#vercel-notes))
- Redux Toolkit global state
- Dark & light themes
- SPA routing via `vercel.json` rewrites

---

## File structure

```
frontend/
├── package.json
├── vite.config.js          # dev proxy /api → backend :5000
├── vercel.json             # SPA rewrites for Vercel
├── .env.example            # local + production env docs
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    ├── pages/
    ├── store/
    │   └── api.js          # API_BASE, BACKEND_URL, getWsUrl()
    └── utils/
```

---

## Environment variables

Copy `.env.example` → `.env` for local development.

### Local (`.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_HOST` | `127.0.0.1` | Dev server host |
| `VITE_PORT` | `5173` | Dev server port |
| `VITE_BASE_URL` | `http://127.0.0.1:5173` | Frontend origin |
| `VITE_BACKEND_URL` | `http://127.0.0.1:5000` | Backend origin |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:5000` | Vite `/api` proxy target |
| `VITE_API_BASE` | `/api` | Browser REST base (proxied in dev) |

### Production (Vercel project env)

| Variable | Value |
|----------|--------|
| `VITE_BASE_URL` | `https://job-finder-stream.vercel.app` |
| `VITE_BACKEND_URL` | `https://job-finder-stream-backend.vercel.app` |
| `VITE_API_BASE` | `https://job-finder-stream-backend.vercel.app/api` |

`VITE_*` values are baked into the client at **build** time.

---

## Local setup

**Prerequisites:** Node.js 20+, npm, backend running on port 5000.

```powershell
cd frontend
npm install
# copy .env.example → .env (defaults work for local)
npm run dev
```

Open: http://127.0.0.1:5173

| Service | URL | Notes |
|---------|-----|--------|
| Frontend (Vite) | http://127.0.0.1:5173 | `npm run dev` |
| API via proxy | http://127.0.0.1:5173/api/… | same-origin → backend `:5000` |
| Backend | http://127.0.0.1:5000 | separate repo / folder |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## Deploy on Vercel

1. Import this repo (or link folder) as project **`job-finder-stream`**.
2. Framework: **Vite** (auto-detected). Build: `npm run build`, output: `dist`.
3. Set Production env vars (table above).
4. Deploy:

```powershell
npm i -g vercel
vercel link --yes --project job-finder-stream
vercel env add VITE_API_BASE production --value "https://job-finder-stream-backend.vercel.app/api" --yes
vercel env add VITE_BACKEND_URL production --value "https://job-finder-stream-backend.vercel.app" --yes
vercel env add VITE_BASE_URL production --value "https://job-finder-stream.vercel.app" --yes
vercel deploy --prod
```

Ensure Git author email is a real address (Vercel rejects invalid noreply-only authors):

```powershell
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

---

## API usage (from the browser)

Production uses the **absolute** backend URL (`VITE_API_BASE`).  
Local dev uses **relative** `/api` via the Vite proxy.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health |
| GET/PUT | `/config` | Scraper config |
| POST/PUT/DELETE | `/config/queries` | Search queries |
| POST/PUT/DELETE | `/config/cities` | Cities |
| POST/PUT/DELETE | `/config/countries` | Countries |
| POST | `/scrape-jsons/search` | New snapshot |
| GET | `/scrape-jsons` | List snapshots |
| GET/DELETE | `/scrape-jsons/{id}` | Get / delete snapshot |
| WS | `/ws/jobs` | Live job stream |

Helpers live in `src/store/api.js` (`apiUrl`, `getWsUrl`, `API_BASE`).

---

## Vercel notes

- REST (config, snapshots, health) works in production.
- **WebSockets** are limited on Vercel serverless — live stream may not work reliably; use local backend for full WS streaming.
- Long scrapes may hit serverless timeouts on the backend.

---

## Dependencies

react, react-dom, @reduxjs/toolkit, react-redux, vite, tailwindcss, @tailwindcss/vite, @vitejs/plugin-react

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API Offline (local) | Start backend on `:5000` before `npm run dev` |
| CORS errors (prod) | Backend `CORS_ORIGINS` / `FRONTEND_URL` must include this frontend origin |
| Wrong API host in prod | Rebuild after setting `VITE_API_BASE` on Vercel |
| Blank routes on refresh | `vercel.json` SPA rewrite must map `/(.*)` → `/index.html` |
| Port in use | Change `VITE_PORT` in `.env` |
