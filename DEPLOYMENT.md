# Job Finder Stream — Release and Vercel Deployment Guide

This file documents the safe deployment workflow for this frontend. It does not run commands or modify Vercel by itself.

## Production services

| Part | Value |
| --- | --- |
| Local folder | `C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream` |
| GitHub repository | `satyamjaysawal/Job-Finder-Stream` |
| Vercel team | `satyam-jaysawals-projects` (`team_NKnxGvq9toz7xCCe6RahKPeE`) |
| Vercel project | `job-finder-stream` (`prj_kG4LcnAhWv5kDyI5soxfRXqJEvVI`) |
| Canonical frontend URL | `https://job-finder-stream.vercel.app` |
| Canonical backend URL | `https://job-finder-stream-backend.vercel.app` |
| Backend API base | `https://job-finder-stream-backend.vercel.app/api` |

> URL policy: keep `https://job-finder-stream.vercel.app` as the public frontend URL. Do not create a replacement project or rename the canonical URL.

## Required release order

1. Build and review the local change.
2. Commit and push it to `main`.
3. Confirm the working tree is clean.
4. Deploy the already-linked `job-finder-stream` Vercel project.
5. Wait until the new deployment is **Ready**.
6. Only then move `job-finder-stream.vercel.app` to the new deployment.
7. Verify the live app and the API connection.

Do not deploy uncommitted code. Do not move the canonical alias to a deployment whose state is `Building`, `Queued`, `Blocked`, `Error`, or `UNKNOWN`.

## 1. Verify and push the code

Run from the project folder:

```powershell
cd "C:\Users\Dell 5400\OneDrive\Desktop\job-board\Job-Finder-Stream"
npm run build
git status --short
git diff --check
git add <only-the-files-you-changed>
git commit -m "Describe the change"
git push origin main
git status --short
```

`git status --short` must be empty before deployment. Never add `.env`, `.env.local`, `.vercel`, `node_modules`, or `dist`.

## 2. Link the correct Vercel project

This folder is linked to `job-finder-stream`. If the link is missing, restore it explicitly:

```powershell
vercel link --yes --project job-finder-stream --scope satyam-jaysawals-projects
```

Confirm the project link before deploying:

```powershell
Get-Content .vercel\project.json
```

It must show project name `job-finder-stream`; never link this frontend to the backend project.

## 3. Check production environment variables

The frontend bakes `VITE_*` values into the bundle at build time. In the Vercel `job-finder-stream` project, production values must be:

| Variable | Required value |
| --- | --- |
| `VITE_BASE_URL` | `https://job-finder-stream.vercel.app` |
| `VITE_BACKEND_URL` | `https://job-finder-stream-backend.vercel.app` |
| `VITE_API_BASE` | `https://job-finder-stream-backend.vercel.app/api` |

After changing any of these, redeploy the frontend. Do not commit actual environment values to Git.

## 4. Create a production deployment

```powershell
vercel --prod --yes --no-wait --scope satyam-jaysawals-projects
```

Copy the printed deployment URL, for example:

```text
https://job-finder-stream-<deployment-id>-satyam-jaysawals-projects.vercel.app
```

Inspect it until the status is `Ready`:

```powershell
vercel inspect <new-deployment-url> --scope satyam-jaysawals-projects
```

## 5. Move the canonical alias — only when Ready

Once `vercel inspect` says `Ready`, assign the existing canonical URL:

```powershell
vercel alias <new-deployment-url> job-finder-stream.vercel.app --scope satyam-jaysawals-projects
vercel alias ls --scope satyam-jaysawals-projects
```

The alias list must show `job-finder-stream.vercel.app` sourced from the new deployment. This preserves the public URL while serving the new release.

## If Vercel says BLOCKED or UNKNOWN

Do **not** run `vercel alias` yet. A deployment must be Ready before Vercel accepts an alias assignment.

1. Check the deployment in the Vercel dashboard using the inspector URL printed by the CLI.
2. Review deployment/build logs and resolve the reported issue.
3. Check whether Deployment Protection is blocking access. A protected deployment may appear healthy to an authenticated Vercel user but is not a public app release.
4. Trigger a new production deployment only after resolving the issue, then wait for `Ready` again.

The previously Ready production deployment and `https://job-finder-stream.vercel.app` remain live until an alias is successfully changed.

## 6. Verify the live release

```powershell
Invoke-WebRequest -UseBasicParsing -Uri "https://job-finder-stream.vercel.app"
Invoke-WebRequest -UseBasicParsing -Uri "https://job-finder-stream-backend.vercel.app/api/health"
```

Also verify in a browser:

1. Homepage opens first.
2. Dashboard loads collections and filters.
3. Live Stream opens configuration and shows connection status.
4. Theme switching works in light and dark mode.
5. The frontend is serving the app bundle, not a Vercel Deployment Protection page.

## Notes

- `vercel.json` contains the SPA rewrite needed for direct-route refreshes.
- WebSockets can be limited on Vercel serverless deployments; use the local backend for full live-stream testing when required.
- Do not delete the Vercel project to redeploy. Project deletion also removes environment variables, aliases, and deployment history.
