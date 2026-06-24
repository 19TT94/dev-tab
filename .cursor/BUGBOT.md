# Code review rules (Cursor Agent Review + Bugbot)

Project rules for [Cursor Agent Review](https://cursor.com/docs/agent/agent-review) (local, before push) and [Bugbot](https://cursor.com/docs/bugbot) (GitHub PR reviews). Conventions live in [`rules/devtab.mdc`](rules/devtab.mdc).

## Repo layout

- **Client:** `client/src/` — React + TypeScript + Vite + styled-components + TanStack Query
- **Database:** `supabase/migrations/`
- **Deploy:** Netlify (`client/netlify.toml`, base directory `client`)

## Always check

- Correctness and regressions in time tracking, clients/projects, billing, and invoicing flows
- React hooks (`exhaustive-deps`, stale closures, missing cleanup)
- **Mock mode vs Supabase parity** — hooks in `client/src/hooks/` must handle both `isMockMode` and real Supabase mutations consistently
- API/mutation error handling and user-visible feedback (alerts, loading states)
- **Forms** — exactly one `<form>` per form UI; no nested forms (e.g. `Panel as="form"` wrapping `FormStack`)
- Auth/session behavior in `useAuth.tsx` and `ProtectedRoute.tsx`
- Retainer billing logic in `client/src/lib/billing.ts` when touching clients, time entries, or invoices

## Prefer

- Existing patterns in neighboring files over new abstractions
- `ModalAddClient` / `ModalAddProject` pattern: thin modal wrapper + dedicated form component
- `npm run lint` and `npm test` clean in `client/` before opening a PR
- Tests co-located in `__test__/` when behavior changes
- Styled-components and `theme.colors` tokens — no inline `style` prop unless truly dynamic

## Deprioritize in review

- Style nits already enforced by ESLint
- Suggesting refactors outside the PR scope unless they fix a real bug
- Bundle-size warnings from Vite (known; not blocking)

## Security-sensitive areas

Flag blockers for:

- Auth/session handling in `client/src/hooks/useAuth.tsx` and `pages/Login.tsx`
- Supabase RLS assumptions — client must not bypass server-side policies
- Secrets or credentials in client code, `.env.example`, or committed env files
- `supabase/.temp/` or `.env.local` accidentally committed

## Priority paths

| Area | Paths |
|------|--------|
| Auth & routing | `hooks/useAuth.tsx`, `hooks/ProtectedRoute.tsx`, `pages/Login.tsx` |
| Timer | `hooks/useTimer.ts`, `components/Timer.tsx`, `hooks/useTimerDocumentTitle.ts` |
| Clients & projects | `pages/Clients.tsx`, `components/ClientForm.tsx`, `ProjectForm.tsx`, `ModalAdd*.tsx` |
| Time entries | `pages/TimeEntries.tsx`, `components/TimeEntryForm.tsx` |
| Billing & invoices | `lib/billing.ts`, `pages/Invoices.tsx`, `components/InvoiceWizard.tsx`, `InvoicePdf.tsx` |
| Data layer | `hooks/use*.ts`, `lib/mockStore.ts` |
| Schema | `supabase/migrations/` |

## Branch & deploy context

- Feature/fix PRs target **`stage`**; production releases merge **`stage` → `main`**
- Branch deploys and PR previews use mock data (`VITE_USE_MOCK_DATA=true` in `client/netlify.toml`)
- Production uses real Supabase env vars in Netlify
