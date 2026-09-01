# Supabase

DevTab uses a hosted Supabase project (Postgres + Auth + RLS). Schema lives in [`supabase/migrations/`](../supabase/migrations/). Apply it with the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) — do not paste SQL into the dashboard on a linked project.

Official reference: [Database migrations](https://supabase.com/docs/guides/deployment/database-migrations).

## One-time CLI setup

From the **repo root**:

```bash
# https://supabase.com/docs/guides/local-development/cli/getting-started
brew install supabase/tap/supabase   # or see other install options

supabase login
supabase init                        # skip if supabase/config.toml already exists
supabase link --project-ref <project-id>
```

`<project-id>` is the id in the dashboard URL: `https://supabase.com/dashboard/project/<project-id>`.

`supabase init` writes `supabase/config.toml` (commit it). Link state lives under `supabase/.temp/` (gitignored).

## New project

Follow [README setup](../README.md#1-create-a-supabase-project) for Auth and env vars. For schema, after `login` + `link`:

```bash
supabase db push
```

That applies every file in `supabase/migrations/` that the remote has not recorded yet, in filename order.

## Adding a migration

1. Create a file (timestamp prefix, from repo root):

   ```bash
   supabase migration new short_description
   ```

2. Put additive SQL in the generated file. Prefer `if not exists` / `if exists`.
3. Dry-run, then push to the linked remote:

   ```bash
   supabase db push --dry-run
   supabase db push
   ```

4. Keep the client in sync:
   - [`client/src/types/database.ts`](../client/src/types/database.ts)
   - Mock seed data in [`client/src/lib/mockStore.ts`](../client/src/lib/mockStore.ts)
   - Fixtures in [`client/src/test/fixtures.ts`](../client/src/test/fixtures.ts)
5. On the PR, check **Migration note included** and say which file was added and that `db push` ran.

Existing files use `001_`, `002_`, … prefixes. Leave those as-is; new files should come from `migration new`.

Branch deploys and PR previews use mock data (`VITE_USE_MOCK_DATA`). Production (`main`) uses the live database — `db push` before or with the deploy that depends on the new columns.

## If history is out of sync

The CLI tracks applied files in `supabase_migrations.schema_migrations`. `db push` only runs files not in that table.

This repo’s early migrations were applied in the SQL Editor, so the first `db push` may try to re-run them. Check status, then mark already-applied versions without re-running SQL:

```bash
supabase migration list
supabase migration repair --status applied 001 002   # versions as listed
supabase db push
```

`repair` updates the history table only. Use `--status reverted` if a version was recorded but never actually run.

If you changed the remote schema in the dashboard instead of a migration file:

```bash
supabase db pull
```

That writes a new migration capturing remote drift. Prefer not to do this going forward.

## Useful commands

| Command | What it does |
| --- | --- |
| `supabase link` | Attach this repo to the hosted project |
| `supabase migration new <name>` | Add a timestamped SQL file under `supabase/migrations/` |
| `supabase db push --dry-run` | Show which local files would be applied |
| `supabase db push` | Apply pending local migrations to the linked remote |
| `supabase migration list` | Local vs remote history |
| `supabase migration repair --status applied \| reverted <version>` | Fix history without running SQL |
| `supabase db pull` | Capture remote schema into a new migration |

Local Docker stack (`supabase start` / `supabase db reset`) is optional and not required for this app.

## Do not

- Edit the remote schema in the SQL Editor or Table Editor after the project is linked — `db push` will desync
- Edit old migration files that may already have been applied; add a new file instead
- Commit `supabase/.temp/` or `.env` / `.env.local`
