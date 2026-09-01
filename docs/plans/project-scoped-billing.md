# Project-scoped billing & retainer

**Status:** Planned  
**Epic:** [#19 — Project-scoped billing & retainer](https://github.com/19TT94/dev-tab/issues/19)  
**Target:** Before January 2026 retainer engagement (or as soon as hourly → retainer transition is needed)

## Goal

Move billing terms from **clients** to **projects** so each engagement can have its own rate and retainer settings. A single client can have:

- An **hourly** project (no retainer) for one contract period
- A **retainer** project starting later, without retroactively changing how uninvoiced or historical work is billed

Invoices remain **per client** (one invoice can include line items from multiple projects).

## Motivation (real scenario)

1. **Now → December 2025:** New engagement billed **hourly only** (no retainer).
2. **January 2026+:** Possibly a **new project** under the same client with a monthly retainer.
3. **Requirement:** Past invoices stay accurate; uninvoiced hourly work must not pick up retainer rules when the retainer project starts.

Today, retainer is configured on the **client** and applied to **all** billable time for that client in chronological order. Turning on a client retainer in January would incorrectly affect any still-uninvoiced hourly entries from the fall.

## Current model (today)

| Entity | Billing fields |
|--------|----------------|
| **Client** | `default_hourly_rate`, `retainer_enabled`, `retainer_hours_per_month`, `retainer_hourly_rate`, `retainer_overage_rate` |
| **Project** | `hourly_rate` (optional override), `billable` |
| **Time entry** | No billing snapshot — amounts computed at invoice/report time from **current** client/project settings |
| **Invoice line item** | **Snapshot** of `hours`, `rate`, `amount` at invoice creation |

Billing engine (`client/src/lib/billing.ts`):

- Groups uninvoiced/report entries by **client**
- One shared retainer pool per client across all projects
- Standard rate: `project.hourly_rate ?? client.default_hourly_rate`

## Target model

| Entity | Billing fields |
|--------|----------------|
| **Client** | Contact/billing identity only (`name`, `email`, `address`) — **no** rate or retainer fields |
| **Project** | `hourly_rate`, retainer fields (same five as client today), `billable`, `archived` |
| **Time entry** | Still no snapshot (optional future enhancement) |
| **Invoice line item** | Unchanged — still the source of truth for billed history |

Billing engine:

- Groups by **project** for retainer pooling
- Each project with retainer enabled has its **own** monthly allowance
- Standard rate: `project.hourly_rate` (required or default at project creation)

## Billing rules (target)

1. **Standard hourly:** If project has no retainer (or retainer disabled), bill at `project.hourly_rate`.
2. **Retainer:** If project has retainer enabled and fully configured, bill that project's entries in chronological order against **that project's** monthly allowance only.
3. **Overage:** Hours beyond the project allowance use `project.retainer_overage_rate`.
4. **Cross-project:** Time on Project A does not consume Project B's retainer, even under the same client.
5. **Invoicing:** Invoice wizard still selects a **client** and period; line items are built from all uninvoiced billable entries for that client's projects, each billed under its project's terms.
6. **Reports:** Retainer usage summaries become **per project** (optionally grouped by client in the UI).

## What we do not change

- **Existing invoices** (`invoices`, `invoice_line_items`) — never rewrite billed history.
- **Invoiced time entries** (`invoice_id` set) — already tied to frozen line items.
- **Invoice PDFs** — generated from stored line items.

Uninvoiced entries will use **new** project-level rules once the feature ships. **Invoice all hourly work through December** before enabling retainer on a January project, unless the migration script and new code are already live.

---

## Current data inventory

### Production (Supabase)

Snapshot: [`production-billing-snapshot.md`](./production-billing-snapshot.md) (2025-09-01). Re-export with [`export-production-billing.sql`](./export-production-billing.sql) before running `--apply`.

| Client | Project | IDs | `hourly_rate` today | Client billing today | Uninvoiced | Target after migration |
|--------|---------|-----|---------------------|----------------------|------------|------------------------|
| Fluid Resource Managment | Hero Builder | client `bb05eb7e…`, project `fd28d43e…` | $0 (falls back to $150) | 40 hr/mo retainer @ $150, $175 overage | 59 entries / **68.28 hr** | **Retainer on project:** copy client retainer fields; set `hourly_rate` = **150** |
| Wiere Weddings | Wiere Weddings | client `c4398661…`, project `32096433…` | $0 (falls back to $150) | Hourly only ($150 default) | none | **Hourly project:** `hourly_rate` = **150**, retainer **off** |

**Notes on production data:**

- Both projects have `hourly_rate` = `0.00`; billing today uses `client.default_hourly_rate` ($150). Migration should set explicit `hourly_rate` = 150 on each project.
- **Hero Builder** is `billable: false` but has **59 billable time entries** (68.28 uninvoiced hours). Confirm whether new entries should default non-billable; existing billable entries should still invoice. Invoice this backlog **before** any billing rule change if you want amounts frozen under current client-level retainer math.
- **Wiere Weddings** matches the planned hourly engagement (no retainer). A **new project** under this client (or FRM) in January can get retainer fields without affecting Wiere Weddings hourly history.
- **FRM** already has client-level retainer today. Migration is straightforward (one project → copy retainer to Hero Builder). See [`migration-overrides.json`](./migration-overrides.json).

### Planned engagements (forward-looking)

| Client | Project | Contract | Effective | Action |
|--------|---------|----------|-----------|--------|
| Wiere Weddings | Wiere Weddings | Hourly @ $150 | Now – Dec 2025 | Keep retainer off; invoice monthly |
| _TBD_ | _New project name_ | Retainer (terms TBD) | Jan 2026+ | Create new project with retainer fields after feature ships; do not enable client-level retainer |

### Mock seed (reference example)

Used in development (`mockStore` seed data). Documents how migration mapping should work.

| Client | Project | `hourly_rate` | Client billing today | Proposed target |
|--------|---------|---------------|----------------------|-----------------|
| Company 1 | Website Redesign | `null` → $150 | 15 hr/mo retainer @ $150, $175 overage | **Retainer project:** copy full retainer fields + `hourly_rate` 150 |
| Company 1 | Internal Tools | $100 | (shared client retainer pool) | **Hourly project:** `hourly_rate` 100, retainer **off** — was using client pool before; see note below |
| Company 2 | MVP Development | `null` → $125 | Hourly only | **Hourly project:** `hourly_rate` 125, retainer off |

**Seed migration note:** Company 1 currently has one **client-level** 15 hr retainer shared across Website Redesign and Internal Tools. After migration, the default mapping is:

- Put retainer on **Website Redesign** only (primary billable project).
- **Internal Tools** stays hourly at $100 with retainer disabled.

Override via `migration-overrides.json` if production data differs (see below).

---

## Migration strategy

### Phase 1 — Schema

Add to `projects`:

- `retainer_enabled boolean not null default false`
- `retainer_hours_per_month numeric(10, 2)`
- `retainer_hourly_rate numeric(10, 2)`
- `retainer_overage_rate numeric(10, 2)`

Keep client columns temporarily for backfill, then drop in a follow-up migration after script + app deploy.

### Phase 2 — Application

Ship billing engine, forms, queries, reports against project fields.

### Phase 3 — Data script

`scripts/migrate-billing-to-projects.ts` (or SQL script):

```bash
# Dry run — print planned updates only
npm run migrate:billing -- --dry-run

# Apply with optional overrides file
npm run migrate:billing -- --apply --overrides docs/plans/migration-overrides.json
```

**Default rules:**

1. For each client with `retainer_enabled = true` and exactly **one** project → copy all retainer fields to that project.
2. For each client with retainer and **multiple** projects → copy retainer to the project named in overrides, or the **oldest non-archived** project if no override.
3. Other projects under that client → retainer off; set `hourly_rate` from existing override or `client.default_hourly_rate`.
4. For hourly-only clients → set `project.hourly_rate` from project override or `client.default_hourly_rate` where null.
5. Clear client retainer fields and `default_hourly_rate` only after verification (or in final migration).

See [`migration-overrides.json`](./migration-overrides.json) (production) and [`migration-overrides.example.json`](./migration-overrides.example.json) (template).

### Phase 4 — Verify

- [ ] Existing invoices unchanged (spot-check amounts)
- [ ] Uninvoiced hourly entries invoice at project hourly rate
- [ ] Retainer project bills against its own pool only
- [ ] Reports show per-project retainer usage
- [ ] Mock mode seed matches new model

---

## Implementation tasks

Tracked in GitHub ([#19](https://github.com/19TT94/dev-tab/issues/19)):

| # | Issue | Area |
|---|-------|------|
| 20 | [Schema: add billing columns to projects](https://github.com/19TT94/dev-tab/issues/20) | DB migration |
| 21 | [Script: migrate client billing data to projects](https://github.com/19TT94/dev-tab/issues/21) | Data backfill |
| 22 | [Billing engine: group retainer and rates by project](https://github.com/19TT94/dev-tab/issues/22) | `billing.ts` |
| 23 | [UI: move retainer and rate fields to ProjectForm](https://github.com/19TT94/dev-tab/issues/23) | Forms |
| 24 | [Queries: load project billing fields on time entries](https://github.com/19TT94/dev-tab/issues/24) | Hooks |
| 25 | [Reports & PDF: per-project retainer summaries](https://github.com/19TT94/dev-tab/issues/25) | Reports |
| 26 | [Tests: billing and mock seed for project-scoped model](https://github.com/19TT94/dev-tab/issues/26) | Tests |
| 27 | [Docs: update README for project-scoped billing](https://github.com/19TT94/dev-tab/issues/27) | README |

---

## Open questions

- [ ] Should `hourly_rate` be **required** on every project, or keep a client-level default as fallback during transition?
- [ ] Archive old hourly project when retainer project starts, or keep both active?
- [ ] Reports UI: list retainers per project, or roll up under client headers?

## References

- Schema: `supabase/migrations/001_initial_schema.sql`
- Billing: `client/src/lib/billing.ts`
- Client form: `client/src/components/ClientForm.tsx`
- Project form: `client/src/components/ProjectForm.tsx`
- Invoice wizard: `client/src/components/InvoiceWizard.tsx`
