# Vercel and Neon Spike

Small reproducible spike to validate a minimal Next.js app deployed on Vercel, then add Neon-backed read/write persistence.

## Goal

1. Start with a very simple Next app ("Hello World").
2. Validate client/server path with a reverse-text API endpoint.
3. Add Neon integration next (one write endpoint, one read endpoint).
4. Verify locally and on Vercel that persistence survives requests and redeploys.

## Current status

Implemented now:

1. Next.js app with `Hello World` UI.
2. Text input + button that calls `POST /api/reverse`.
3. Server returns reversed text (`foo` -> `oof`).
4. Neon-backed endpoints:
   1. `POST /api/messages` (write)
   2. `GET /api/messages` (read)
5. Initial SQL migration file: `migrations/001_create_messages.sql`.

## Repo layout

1. `app/page.tsx`: Hello World UI + reverse form.
2. `app/api/reverse/route.ts`: reverse text API endpoint.
3. `app/api/messages/route.ts`: Neon-backed read/write endpoint.
4. `lib/db.ts`: Neon database client helper.
5. `migrations/001_create_messages.sql`: creates `messages` table.
6. `app/layout.tsx`, `app/globals.css`: minimal app shell/styles.

## Local setup

1. Install Node.js 20+ (recommended for Next 15).
2. Install dependencies:

```bash
npm install
```

3. Start local dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Quick local validation

UI path:

1. Enter `foo` in the text box.
2. Click `Reverse Text`.
3. Confirm response shows `oof`.

API path:

```bash
curl -X POST http://localhost:3000/api/reverse \
  -H "content-type: application/json" \
  -d '{"text":"foo"}'
```

Expected response:

```json
{"reversed":"oof"}
```

## Branch and PR workflow

1. Create branch:

```bash
git switch -c spike/neon-vercel
```

2. Commit and push:

```bash
git add .
git commit -m "Phase 1: minimal Next app and reverse endpoint"
git push -u origin spike/neon-vercel
```

3. Open GitHub PR from `spike/neon-vercel` to `main`.
4. Merge in GitHub (recommended: squash merge for spike phases).
5. Sync local `main`:

```bash
git fetch origin
git switch main
git pull origin main
```

## Vercel setup (current phase)

1. In Vercel, import this GitHub repo.
2. Use root directory: `.` (repo root).
3. Framework preset: Next.js (auto-detected).
4. Deploy.
5. Verify deployed app shows Hello World and reverse feature works.

## Neon setup (manual web UI step)

This is done in Neon web UI, not in local code.

1. Go to Neon Console and create a new project.
2. Choose:
   1. Region close to Vercel deployment region (to reduce latency).
   2. Postgres version default/recommended by Neon.
3. Use the default branch (`main`) initially.
4. Create or keep default database (`neondb` is fine for spike).
5. Open project connection details and copy the connection string.
6. Prefer pooled connection string for serverless usage when available.
7. Keep credentials secret; never commit the raw URL.

Planned env var name:

1. `DATABASE_URL` (for local `.env.local` and Vercel project env vars).

## Apply migration (local machine -> Neon)

```bash
psql "$DATABASE_URL" -f migrations/001_create_messages.sql
```

## Validate Neon endpoints locally

1. Start app:

```bash
npm run dev
```

2. Write:

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "content-type: application/json" \
  -d '{"text":"hello neon"}'
```

3. Read:

```bash
curl http://localhost:3000/api/messages
```

## Next phase lifecycle (validation + deploy checks)

1. Run migration against Neon using `DATABASE_URL`.
2. Validate locally:
   1. Write works.
   2. Read works.
   3. Data persists after app restart.
3. Configure `DATABASE_URL` in Vercel and redeploy.
4. Validate on deployed URL:
   1. Write works.
   2. Read works.
   3. Data persists across redeployments.
5. Add one smoke test against deployed URL.

## Notes

1. Do not commit `.env.local`.
2. Keep this spike intentionally minimal; optimize for learning and repeatability over architecture polish.

## Spike Summary

### 1) Schema + migration approach

1. Schema is SQL-first and intentionally minimal for the spike.
2. Migration file: `migrations/001_create_messages.sql`.
3. Table created:
   1. `messages.id` as `bigserial primary key`
   2. `messages.text` as `text not null`
   3. `messages.created_at` as `timestamptz not null default now()`
4. Migration execution pattern:
   1. Manual apply from local machine with `psql`
   2. Command: `psql "$DATABASE_URL" -f migrations/001_create_messages.sql`

### 2) Connection method used

1. Driver: Neon serverless driver (`@neondatabase/serverless`).
2. Dependency location: `package.json` under `"dependencies"`.
3. Configuration pattern:
   1. Env var: `DATABASE_URL`
   2. Helper module: `lib/db.ts`
   3. `getSql()` lazily initializes Neon client with `neon(process.env.DATABASE_URL)`.
4. Endpoint usage:
   1. `app/api/messages/route.ts` imports `getSql()`
   2. Executes parameterized SQL for `GET` (read) and `POST` (write).

### 3) Vercel DB connection configuration/storage

1. In Vercel project: `Settings` -> `Environment Variables`.
2. Add variable:
   1. Name: `DATABASE_URL`
   2. Value: Neon connection string (prefer pooled string for serverless).
3. Scope:
   1. Set for `Production`
   2. Optionally set for `Preview` and `Development` if needed.
4. Storage model:
   1. Stored as encrypted project env vars in Vercel.
   2. Not committed in git.
5. Runtime behavior:
   1. Next.js API routes read `process.env.DATABASE_URL` at runtime.
   2. New/updated env vars require redeploy to take effect.
