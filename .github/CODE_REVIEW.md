# Code review workflow

We use a **two-pass** Cursor review: Agent Review in the editor before you push, then **Bugbot** on the pull request. Automated **lint, test, and build** run in CI on every PR.

| Pass | Where | When |
| ---- | ----- | ---- |
| 1 | **Cursor Agent Review** | Before you open or update a PR — local branch diff |
| 2 | **Cursor Bugbot** | After the PR is open — automatic review on GitHub |
| Gate | **GitHub Actions** (`Pull request / lint`, `test`, `build`) | On every push to the PR |

AI review is **advisory** by default. Require the **Pull request / test** check (and optionally `lint` and `build`) in branch protection at minimum.

---

## Pass 1: Run a review (before the PR)

Use this on your feature branch. Team rules: [`.cursor/BUGBOT.md`](../.cursor/BUGBOT.md).

**Option A — Slash command**

1. Open **Agent** chat → `/agent-review` (or use the `code-review` skill).

**Option B — Source Control (recommended)**

1. Open **Source Control**.
2. Run **Agent Review** against `stage` (or your PR base branch).
3. Use **Deep** for auth, billing, and data-layer changes; **Quick** for small fixes.

### Verify locally

Run from `client/`:

```bash
npm run lint
npm test
npm run build
```

### Fallback prompt (Ask mode)

```text
Review all changes on this branch compared to stage. Do not edit files.

Focus on: correctness, React hooks, mock/Supabase parity, nested forms,
and regressions in time tracking, billing, and invoicing flows.

Output numbered findings with severity (blocker / suggestion / nit), file:line,
and a one-line fix suggestion. Skip style issues already covered by ESLint.
```

---

## Checklist before engineer review

- [ ] Cursor Agent Review run against the PR base branch (`stage` / `main`)
- [ ] `npm run lint`, `npm test`, and `npm run build` pass locally (from `client/`)
- [ ] PR opened; **Pull request / lint**, **test**, and **build** green on GitHub
- [ ] Bugbot review completed (or `cursor review` triggered)
- [ ] PR description filled out ([pull_request_template.md](pull_request_template.md))
