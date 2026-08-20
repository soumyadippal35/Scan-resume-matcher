# SCAN — Resume × JD Match Engine

An ambient 3D resume-to-job-description match tool. Upload a resume (PDF/DOCX), paste a job
description, and get a keyword score (computed locally, instantly) blended with an AI semantic
fit score (via a Claude API call on the backend).

Tabs: **Scan** · **Compare** (rank one resume against several JDs) · **History** (saved locally
in your browser) · **My Resume** (a live-rendered copy of the resume used to build this, with a
`.docx` download).

Stack: React + TypeScript + Vite, react-three-fiber/Three.js for the 3D background, pdfjs-dist +
mammoth for in-browser file parsing, jsPDF for report export, and a Vercel serverless function
(`/api/match`) calling the Anthropic API for the semantic score.

## 1. Run it locally

```bash
npm install
npm run dev
```

This starts the frontend at `http://localhost:5173`. The **Scan** and **Compare** tabs will still
work for keyword scoring without a backend — the semantic score will just silently fall back to
keyword-only if `/api/match` isn't available (which it won't be under plain `vite dev`, since that
doesn't run serverless functions).

To test the real backend locally, install the Vercel CLI and run:

```bash
npm install -g vercel
cp .env.example .env      # then edit .env and paste in your real key
vercel dev
```

## 2. Get an Anthropic API key

Go to https://console.anthropic.com/settings/keys, create a key, and make sure the account has
billing/credit attached (Settings → Billing). **This is almost certainly why the old deployment
stopped working** — a free-tier key runs out of credit and every `/api/match` call then fails.
The site is built to degrade gracefully (keyword-only score) when that happens, but semantic
scoring needs a funded key.

## 3. Push to a new GitHub repo

```bash
git init
git add .
git commit -m "Initial commit: SCAN 3D resume matcher"
git branch -M main
git remote add origin https://github.com/<your-username>/<new-repo-name>.git
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to https://vercel.com → **Add New → Project** → import your new GitHub repo.
2. Framework preset: **Vite** (should auto-detect).
3. Before the first deploy (or right after, then redeploy), go to **Project Settings →
   Environment Variables** and add:
   - `ANTHROPIC_API_KEY` = your key from step 2
4. Deploy. `/api/match.js` is auto-detected by Vercel as a serverless function — no extra config
   needed beyond the env var.

That's it — no separate backend server to host. The React app and the API function deploy
together as one Vercel project.

## Notes

- All resume parsing happens **in the browser** — the raw file never leaves the user's machine,
  only the extracted text is sent to `/api/match` for the semantic check.
- History is stored in `localStorage`, so it's per-browser, not per-account.
- The 3D background respects `prefers-reduced-motion` and falls back to a static gradient.
