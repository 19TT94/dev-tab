---
name: pr-prepare
description: >-
  Prepares a DevTab branch for pull request: lint, tests, build, and PR description hints.
  Use when the user is about to open a PR, asks to prepare for merge, or wants a pre-PR checklist.
disable-model-invocation: true
---

# Prepare pull request

## Repo layout

- **Client app:** `client/` (React + Vite + TypeScript)
- **Database:** `supabase/migrations/`
- **Netlify:** `client/netlify.toml` (base directory must be `client`)

## Checklist (run in order)

All commands run from `client/`:

1. **Lint**
   ```bash
   cd client && npm run lint
   ```

2. **Tests**
   ```bash
   cd client && npm test
   ```
   Add or update tests in `__test__/` when behavior changes.

3. **Build**
   ```bash
   cd client && npm run build
   ```

4. **Agent Review** (Cursor)
   - Source Control → Agent Review vs `stage` (or PR base)
   - Or use the `code-review` skill

5. **Open PR**
   - Feature/fix branches → target **`stage`**
   - `stage` → **`main`** for production releases
   - Title: short imperative summary (e.g. `Fix project form nested submit`)

6. **On GitHub / Netlify**
   - Branch deploys (`stage`, PR previews) use mock data via `client/netlify.toml`
   - Production (`main`) uses real Supabase env vars in Netlify

## PR description hints

Include:

- What changed and why (bug fix / feature / refactor)
- Root cause bullets for bugfixes
- Testing: `npm test`, manual steps, mock vs Supabase if relevant
- Migration note if `supabase/migrations/` changed

## Do not

- Commit secrets (`.env`, `.env.local`, `client/.env.local`)
- Commit `supabase/.temp/` (local CLI state)
- Reference `frontend/` paths — the app directory is `client/`
