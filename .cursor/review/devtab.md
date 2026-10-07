---
description: DevTab review rules — client conventions, mock/Supabase parity, schema
---

# Review guide (DevTab)

Applied by the global `code-review` skill (and Claude's built-in `/code-review`) to every change in this repo.

## Before reviewing

1. Read [`.cursor/BUGBOT.md`](../BUGBOT.md) and [`.cursor/rules/devtab.mdc`](../rules/devtab.mdc) for review rules and conventions.
2. Compare against the PR base branch (usually `stage`) unless the user specifies otherwise.
3. From `client/`, run or remind:
   - `npm run lint`
   - `npm test` (when behavior changed)

## Checklist

- [ ] Lint (`npm run lint` in `client/`)
- [ ] Tests (`npm test` in `client/`) if behavior changed
- [ ] Mock mode and Supabase paths both considered when touching data hooks
- [ ] Forms use a single `<form>` element (no nested forms)

## Priority areas

| Area | Paths |
|------|--------|
| Auth & routing | `client/src/hooks/useAuth.tsx`, `ProtectedRoute.tsx`, `pages/Login.tsx` |
| Timer | `client/src/hooks/useTimer.ts`, `components/Timer.tsx`, `useTimerDocumentTitle.ts` |
| Clients & projects | `client/src/pages/Clients.tsx`, `components/ClientForm.tsx`, `ProjectForm.tsx`, `ModalAdd*.tsx` |
| Time entries | `client/src/pages/TimeEntries.tsx`, `components/TimeEntryForm.tsx` |
| Billing & invoices | `client/src/lib/billing.ts`, `pages/Invoices.tsx`, `components/InvoiceWizard.tsx`, `InvoicePdf.tsx` |
| Data layer | `client/src/hooks/use*.ts`, `client/src/lib/mockStore.ts` (keep mock/Supabase parity) |
| Schema | `supabase/migrations/` |

## DevTab-specific checks

- **Import groups** — external (no label) → Contexts → Hooks → Components → Pages → Utils → Types → Styles
- **Styled-components** — no inline `style` prop; page-local styles under `// Style Overrides`
- **Modals** — follow `ModalAddClient` / `ModalAddProject` pattern (form component + thin modal wrapper)
- **Mock mode** — `isMockMode` branches in hooks must stay in sync with Supabase mutations
- **Tests** — co-located in `__test__/` (not `__tests__/`)

## After local review

Remind the user: push PR → confirm Netlify branch deploy or production build passes as appropriate.
