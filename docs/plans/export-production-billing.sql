-- Run in Supabase SQL Editor before migration.
-- Paste results into docs/plans/project-scoped-billing.md (Production table)
-- or save as docs/plans/production-billing-snapshot.md

select
  id,
  name,
  default_hourly_rate,
  retainer_enabled,
  retainer_hours_per_month,
  retainer_hourly_rate,
  retainer_overage_rate
from public.clients
order by name;

select
  p.id,
  p.client_id,
  c.name as client_name,
  p.name,
  p.hourly_rate,
  p.billable,
  p.archived
from public.projects p
join public.clients c on c.id = p.client_id
order by c.name, p.name;

select
  c.name as client_name,
  p.name as project_name,
  count(*) as uninvoiced_entries,
  round(sum(te.duration_seconds) / 3600.0, 2) as uninvoiced_hours
from public.time_entries te
join public.projects p on p.id = te.project_id
join public.clients c on c.id = p.client_id
where te.billable = true
  and te.invoice_id is null
group by c.name, p.name
order by c.name, p.name;
