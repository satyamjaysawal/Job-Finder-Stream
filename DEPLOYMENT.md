# Job Finder Stream — Deployment Runbook

This checklist covers both repositories. Deploy only committed, tested code and keep public URLs stable.

## Repositories

| Service | Local folder | GitHub | Vercel project | Production URL |
| --- | --- | --- | --- | --- |
| Frontend | `C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream` | [Job-Finder-Stream](https://github.com/satyamjaysawal/Job-Finder-Stream) | `job-finder-stream` | https://job-finder-stream.vercel.app |
| Backend | `C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream-Backend` | [Job-Finder-Stream-Backend](https://github.com/satyamjaysawal/Job-Finder-Stream-Backend) | `job-finder-stream-backend` | https://job-finder-stream-backend.vercel.app |

Vercel scope: `satyam-jaysawals-projects` (`team_NKnxGvq9toz7xCCe6RahKPeE`).

## One-time setup

```powershell
npm install -g vercel
vercel login
```

Never commit `.env`, `.env.local`, `.vercel`, `node_modules`, or `dist`. Store production secrets in Vercel Project Settings → Environment Variables.

## 1. Frontend: test, commit, and push to GitHub

```powershell
cd "C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream"
npm test
npm run build
git diff --check
git status --short
git add <only-files-changed-in-frontend>
git commit -m "Describe the frontend change"
git push -u origin main
git status --short
```

Verify the link with `Get-Content .vercel\project.json`; if needed run `vercel link --yes --project job-finder-stream --scope satyam-jaysawals-projects`.

GitHub: <https://github.com/satyamjaysawal/Job-Finder-Stream>

## 2. Backend: test, commit, and push to GitHub

```powershell
cd "C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream-Backend"
pytest
git diff --check
git status --short
git add <only-files-changed-in-backend>
git commit -m "Describe the backend change"
git push -u origin main
git status --short
```

Verify the link with `Get-Content .vercel\project.json`; if needed run `vercel link --yes --project job-finder-stream-backend --scope satyam-jaysawals-projects`.

GitHub: <https://github.com/satyamjaysawal/Job-Finder-Stream-Backend>

## 3. Production environment variables

Frontend:

```text
VITE_BASE_URL=https://job-finder-stream.vercel.app
VITE_BACKEND_URL=https://job-finder-stream-backend.vercel.app
VITE_API_BASE=https://job-finder-stream-backend.vercel.app/api
```

Backend (set in Vercel, never commit values):

```text
BASE_URL=https://job-finder-stream-backend.vercel.app
FRONTEND_URL=https://job-finder-stream.vercel.app
CORS_ORIGINS=https://job-finder-stream.vercel.app,https://job-finder-stream-satyam-jaysawals-projects.vercel.app
DATABASE_NAME=job_portal
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
RELOAD=false
```

## 4. Deploy backend first (Vercel)

```powershell
cd "C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream-Backend"
vercel --prod --yes --no-wait --scope satyam-jaysawals-projects
vercel inspect <backend-deployment-url> --scope satyam-jaysawals-projects
```

Wait for `status ● Ready`; never alias `Building`, `Queued`, `Blocked`, `Error`, or `UNKNOWN`. Then run:

```powershell
vercel alias <backend-deployment-url> job-finder-stream-backend.vercel.app --scope satyam-jaysawals-projects
vercel alias ls --scope satyam-jaysawals-projects
```

## 5. Deploy frontend (Vercel)

```powershell
cd "C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream"
vercel --prod --yes --no-wait --scope satyam-jaysawals-projects
vercel inspect <frontend-deployment-url> --scope satyam-jaysawals-projects
```

After `Ready`, run:

```powershell
vercel alias <frontend-deployment-url> job-finder-stream.vercel.app --scope satyam-jaysawals-projects
vercel alias ls --scope satyam-jaysawals-projects
```

Vercel dashboard: <https://vercel.com/satyam-jaysawals-projects>

For automatic deployments, import both GitHub repositories in Vercel and keep
the root directory at the repository root. Pushes to `main` will then deploy
according to each Vercel project's settings; the CLI flow above is the manual
production fallback.

## 6. Verify production

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://job-finder-stream.vercel.app"
Invoke-WebRequest -UseBasicParsing -Uri "https://job-finder-stream-backend.vercel.app/api/health"
```

Expected: frontend HTTP `200`; backend HTTP `200` with `status: ok`, database `job_portal`, and production frontend CORS configured. Check Live Scraper Console on desktop/mobile: header/actions aligned, first desktop viewport fits, and long logs/jobs scroll inside panels.

## Troubleshooting

- `Building`/`UNKNOWN`: wait and inspect logs; do not alias.
- `Blocked`: check Deployment Protection and public access in Vercel.
- API/CORS failure: verify backend variables, redeploy backend, then frontend if `VITE_*` changed.
- WebSockets may be limited on serverless deployments; use the local backend for long live-stream sessions.
