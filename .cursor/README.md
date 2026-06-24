# Cursor project configuration

This folder configures Cursor for the **DevTab** repo (time tracking, billing, and invoicing).

| Path | Purpose |
|------|---------|
| [`BUGBOT.md`](BUGBOT.md) | Review rules for **Agent Review** and **Bugbot** on GitHub |
| [`rules/devtab.mdc`](rules/devtab.mdc) | Agent rules: imports, styled-components, page structure, theme |
| [`skills/code-review/`](skills/code-review/) | Agent skill: review a branch/PR against DevTab conventions |
| [`skills/pr-prepare/`](skills/pr-prepare/) | Agent skill: lint, test, build checklist before opening a PR |

## Quick commands

Run from `client/`:

```bash
npm run lint
npm test
npm run build
```

## Branches & deploy

- **`stage`** — integration branch; Netlify branch deploys use mock data
- **`main`** — production; uses Supabase via Netlify env vars
- PRs: feature branches → `stage`, then `stage` → `main`

## Human-facing docs

- App setup and workflow: [`README.md`](../README.md) (repo root)
- Supabase schema: [`supabase/migrations/`](../supabase/migrations/)
