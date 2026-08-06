# SentinelCut

AI-powered audio/video profanity censorship platform. Upload a file, get back a
censored version with beep/mute applied at the correct timestamps, plus a transcript
and detection metadata — with strong multilingual detection across English, Hindi,
and Hinglish (including slang, stretched-out spellings, and symbol substitution).

See `docs/` for full documentation (Product Vision, PRD, SRS, Architecture, etc.).
See `docs/SentinelCut_MVP_Scope.md` for what's actually in scope for the MVP build.
See `TEAM_PLAN.md` for ownership, integration contract, and milestones.

## Team

| Person | Owns |
|---|---|
| P1 — AI/ML | Whisper STT + language handling + full detection pipeline |
| P2 — Backend + Audio/Video (team lead) | FastAPI, Postgres schema, Celery/Redis queue, auth, FFmpeg/PyDub censorship, export |
| P3 — Frontend | Upload UI, dashboard, transcript/timeline viewer |

## Stack

- **Frontend:** Next.js (JavaScript, not TypeScript) — App Router, Zod for schema validation
- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Database / Auth:** Supabase (Postgres + Supabase Auth)
- **Queue:** Celery + Redis *(Step 6 — not yet built)*
- **AI Pipeline:** Faster-Whisper (ASR) + dictionary/regex/fuzzy profanity detection
- **Media processing:** FFmpeg / PyDub

## Backend Setup (`backend/`)

### Prerequisites

- Python 3.12
- A Supabase project (Postgres + Auth already provisioned)
- `pip`

### 1. Install dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Environment variables

Create `backend/.env` (never commit this — it's git-ignored) with:

```dotenv
DATABASE_URL=postgresql://postgres:<url-encoded-password>@<your-project>.supabase.co:5432/postgres
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_JWT_SECRET=<from Supabase dashboard → Project Settings → API>
SUPABASE_SERVICE_KEY=<the "service_role" secret key — NOT the anon/public key>
```

**Where to find each value:** Supabase dashboard → **Project Settings → API**.

⚠️ `SUPABASE_SERVICE_KEY` is the `service_role` key — it bypasses Row Level Security.
Backend-only. Never expose it to the frontend or commit it.

⚠️ If your DB password contains special characters (e.g. `#`, `%`, `@`), it must be
URL-encoded in `DATABASE_URL` (e.g. `#` → `%23`).

### 3. Supabase Storage bucket

Create a bucket named **`uploads`** in Supabase dashboard → **Storage** → New bucket.
Keep it **private** (not public) — files are served back out through authenticated
export endpoints, not direct public URLs.

### 4. Run database migrations

```powershell
alembic upgrade head
```

This creates `files`, `jobs`, `detections`, `custom_words`. Note: the `profiles` table
is intentionally **not** managed by Alembic — it's owned by Supabase (auto-created via
a trigger on `auth.users` at signup). `backend/alembic/env.py` explicitly excludes it
via `include_name`. Don't remove that exclusion.

### 5. Run the server

```powershell
uvicorn app.main:app --reload
```

Server runs at `http://localhost:8000`. Check `http://localhost:8000/docs` for the
interactive Swagger UI — the easiest way to test endpoints manually (upload a file via
browser instead of fighting curl/PowerShell syntax).

### 6. Getting a test auth token

Auth (signup/login) happens via Supabase directly, not through this backend. To get a
token for testing protected endpoints:

- **Via frontend:** log in through the Next.js app, then check browser DevTools →
  Application/Storage → the `sb-<project-ref>-auth-token` entry → copy `access_token`.
- **Via script:** use the Supabase Python client with your `anon` key (not the service
  key) and `sign_in_with_password(...)` / `sign_up(...)`.

## Architecture notes / gotchas

- **Frontend is JavaScript, not TypeScript.** Type safety comes from PropTypes
  (component props) + Zod (`src/schemas/`, API/form validation) instead of compile-time
  types. `jsconfig.json` still gives working import aliases (`@/components/...`).
- **`profiles` vs `users`:** there is no `users` table. Supabase's built-in `auth.users`
  plus an auto-populated `profiles` table (via signup trigger) is the source of truth
  for user identity. All `user_id` foreign keys point to `profiles.id`.
- **Repository pattern:** all DB access goes through `app/repositories/`, which inherit
  from the generic `BaseRepository` (`app/repositories/base_repository.py`). Don't query
  SQLAlchemy models directly from services or routes.
- **Detection JSON contract is locked** — see `/schemas/detection.json` at the repo
  root. Any shape change is a team discussion, not a solo decision. Backend, frontend,
  and the AI pipeline all depend on this exact shape.

## Git Workflow

- `main` is always working/demoable. Never push broken code directly.
- One branch per person per feature: `p1-detection-pipeline`, `p2-celery-export`,
  `p3-timeline-ui`, etc.
- PR into `main` at the end of each week. Team lead (P2) reviews using this checklist:
  - Does it match the detection JSON schema (if touching detections)?
  - Does it run without crashing on the demo test file?
  - Any new env vars / setup steps documented here in the README?

## Current status

✅ Auth (Supabase-backed, JWT verification via JWKS/ES256), DB connection, migrations
(`files`, `jobs`, `detections`, `custom_words`), file upload endpoint
(`POST /api/v1/files/upload`).

🔧 In progress: verifying upload end-to-end (Storage write + DB row).

❌ Not started: Celery/Redis job queue, detection ingestion, FFmpeg/PyDub censorship,
timeline edit endpoints, export endpoints, dashboard endpoint, full integration test.

See `TEAM_PLAN.md` §4 for the full milestone breakdown.