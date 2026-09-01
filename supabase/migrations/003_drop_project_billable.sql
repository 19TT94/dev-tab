-- Billable status is tracked on time_entries only, not projects.
alter table public.projects drop column if exists billable;
