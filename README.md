# DevTab

A stripped-down time tracking and invoicing app for billing contract clients. Built with React, Supabase, and deployed on Netlify.

## Features

- **Live timer** — start/stop tracking with project selection
- **Manual time entries** — add, edit, and delete entries
- **Clients & projects** — manage clients with hourly rates, optional monthly retainers, and nested projects
- **Reports** — filter by client, project, and date range; export CSV
- **Invoices** — generate invoices from billable time, download PDF, track status (draft → sent → paid)

## Tech stack

- React + TypeScript (Vite)
- Styled Components
- Supabase (Postgres + Auth + Row Level Security)
- TanStack Query
- @react-pdf/renderer for invoice PDFs
- Netlify for hosting

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the **SQL Editor** and run [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
3. Go to **Authentication → Providers** and ensure Email is enabled
4. Go to **Authentication → Settings** and **disable** "Enable sign ups" (solo user)
5. Go to **Authentication → Users** and manually create your user account

### 2. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cd client
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BUSINESS_NAME=Your Name LLC
VITE_BUSINESS_ADDRESS=123 Main St, City, ST 12345
```

Find your Supabase URL and anon key under **Project Settings → API**.

### 3. Run locally

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with the user you created in Supabase.

### 4. Deploy to Netlify

1. Push this repo to GitHub
2. In Netlify, create a new site from the repo
3. Set the **base directory** to `client`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables in Netlify (same as `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BUSINESS_NAME`
   - `VITE_BUSINESS_ADDRESS`

The included [`client/netlify.toml`](client/netlify.toml) handles SPA routing and enables mock data for deploy previews and branch deploys.

## Usage workflow

1. **Add clients** — create clients with default hourly rates; optionally enable a monthly retainer (hours, retainer rate, overage rate)
2. **Add projects** — create projects under each client (optional rate override)
3. **Track time** — use the dashboard timer or add manual entries
4. **Review reports** — filter and export time data
5. **Create invoices** — select client + date range, review line items, generate PDF

## Project structure

```
devtab/
├── client/            # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   └── netlify.toml
├── supabase/
│   └── migrations/
└── README.md
```

## Notes

- Supabase free tier pauses after 1 week of inactivity — use the app regularly or upgrade
- Time entries linked to an invoice cannot be edited or deleted until the invoice is deleted
- Invoice numbers auto-increment per year (e.g. `INV-2026-001`)
