export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  default_hourly_rate: number
  retainer_enabled: boolean
  retainer_hours_per_month: number | null
  retainer_hourly_rate: number | null
  retainer_overage_rate: number | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id: string
  name: string
  hourly_rate: number | null
  billable: boolean
  archived: boolean
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  project_id: string
  description: string | null
  started_at: string
  ended_at: string
  duration_seconds: number
  billable: boolean
  invoice_id: string | null
  created_at: string
  updated_at: string
}

export interface ActiveTimer {
  id: string
  user_id: string
  project_id: string
  description: string | null
  started_at: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  period_start: string
  period_end: string
  status: InvoiceStatus
  subtotal: number
  notes: string | null
  created_at: string
}

export interface InvoiceLineItem {
  id: string
  invoice_id: string
  project_id: string
  description: string
  hours: number
  rate: number
  amount: number
}

export interface ProjectWithClient extends Project {
  clients: Pick<
    Client,
    | 'id'
    | 'name'
    | 'default_hourly_rate'
    | 'retainer_enabled'
    | 'retainer_hours_per_month'
    | 'retainer_hourly_rate'
    | 'retainer_overage_rate'
  >
}

export interface TimeEntryWithProject extends TimeEntry {
  projects: ProjectWithClient
}

export interface InvoiceWithDetails extends Invoice {
  clients: Client
  invoice_line_items: (InvoiceLineItem & {
    projects: Pick<Project, 'id' | 'name'>
  })[]
}

export interface DraftLineItem {
  project_id: string
  project_name: string
  description: string
  hours: number
  rate: number
  amount: number
  time_entry_ids: string[]
}
