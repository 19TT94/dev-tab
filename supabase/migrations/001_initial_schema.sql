-- Personal Invoice initial schema

create extension if not exists "pgcrypto";

-- Clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  default_hourly_rate numeric(10, 2) not null default 0,
  retainer_enabled boolean not null default false,
  retainer_hours_per_month numeric(10, 2),
  retainer_hourly_rate numeric(10, 2),
  retainer_overage_rate numeric(10, 2),
  created_at timestamptz not null default now()
);

create index clients_user_id_idx on public.clients (user_id);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  hourly_rate numeric(10, 2),
  billable boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);
create index projects_client_id_idx on public.projects (client_id);

-- Time entries
create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  description text,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  billable boolean not null default true,
  invoice_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index time_entries_user_id_idx on public.time_entries (user_id);
create index time_entries_project_id_idx on public.time_entries (project_id);
create index time_entries_started_at_idx on public.time_entries (started_at);
create index time_entries_invoice_id_idx on public.time_entries (invoice_id);

-- Active timers (one per user)
create table public.active_timers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  description text,
  started_at timestamptz not null default now()
);

-- Invoices
create type public.invoice_status as enum ('draft', 'sent', 'paid');

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_number text not null,
  period_start date not null,
  period_end date not null,
  status public.invoice_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, invoice_number)
);

create index invoices_user_id_idx on public.invoices (user_id);
create index invoices_client_id_idx on public.invoices (client_id);

-- Invoice line items
create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  description text not null,
  hours numeric(10, 2) not null,
  rate numeric(10, 2) not null,
  amount numeric(12, 2) not null
);

create index invoice_line_items_invoice_id_idx on public.invoice_line_items (invoice_id);

-- FK from time_entries to invoices (added after invoices table exists)
alter table public.time_entries
  add constraint time_entries_invoice_id_fkey
  foreign key (invoice_id) references public.invoices(id) on delete set null;

-- Updated_at trigger for time_entries
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger time_entries_updated_at
  before update on public.time_entries
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;
alter table public.active_timers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;

create policy "Users manage own clients"
  on public.clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own time entries"
  on public.time_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own active timers"
  on public.active_timers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own invoices"
  on public.invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own invoice line items"
  on public.invoice_line_items for all
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.user_id = auth.uid()
    )
  );
