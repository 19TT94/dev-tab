import type {
  ActiveTimer,
  Client,
  DraftLineItem,
  Invoice,
  InvoiceLineItem,
  InvoiceWithDetails,
  Project,
  ProjectWithClient,
  TimeEntry,
  TimeEntryWithProject,
} from '../types/database'
import { INVOICE_NUMBER_START, MOCK_USER_ID } from './config'
import { toIsoEndOfLocalDay, toIsoStartOfLocalDay } from './dateUtils'

const STORAGE_KEY = 'personal-invoice-mock-data'

interface MockData {
  clients: Client[]
  projects: Project[]
  timeEntries: TimeEntry[]
  activeTimer: ActiveTimer | null
  invoices: Invoice[]
  invoiceLineItems: InvoiceLineItem[]
}

function now() {
  return new Date().toISOString()
}

function id() {
  return crypto.randomUUID()
}

function entryAtDaysAgo(
  daysAgo: number,
  startHour: number,
  durationHours: number,
): Pick<TimeEntry, 'started_at' | 'ended_at' | 'duration_seconds'> {
  const start = new Date()
  start.setHours(startHour, 0, 0, 0)
  start.setDate(start.getDate() - daysAgo)
  const end = new Date(start.getTime() + durationHours * 3600 * 1000)

  return {
    started_at: start.toISOString(),
    ended_at: end.toISOString(),
    duration_seconds: durationHours * 3600,
  }
}

function createSeedData(): MockData {
  const client1Id = 'seed-client-1'
  const client2Id = 'seed-client-2'
  const project1Id = 'seed-project-1'
  const project2Id = 'seed-project-2'
  const project3Id = 'seed-project-3'
  const createdAt = now()

  const clients: Client[] = [
    {
      id: client1Id,
      user_id: MOCK_USER_ID,
      name: 'Company 1',
      email: 'billing@company1.example',
      address: '650 Leanna Dr, Arroyo Grande, CA 93420',
      default_hourly_rate: 150,
      retainer_enabled: true,
      retainer_hours_per_month: 15,
      retainer_hourly_rate: 150,
      retainer_overage_rate: 175,
      created_at: createdAt,
    },
    {
      id: client2Id,
      user_id: MOCK_USER_ID,
      name: 'Company 2',
      email: null,
      address: null,
      default_hourly_rate: 125,
      retainer_enabled: false,
      retainer_hours_per_month: null,
      retainer_hourly_rate: null,
      retainer_overage_rate: null,
      created_at: createdAt,
    },
  ]

  const projects: Project[] = [
    {
      id: project1Id,
      user_id: MOCK_USER_ID,
      client_id: client1Id,
      name: 'Website Redesign',
      hourly_rate: null,
      billable: true,
      archived: false,
      created_at: createdAt,
    },
    {
      id: project2Id,
      user_id: MOCK_USER_ID,
      client_id: client1Id,
      name: 'Internal Tools',
      hourly_rate: 100,
      billable: true,
      archived: false,
      created_at: createdAt,
    },
    {
      id: project3Id,
      user_id: MOCK_USER_ID,
      client_id: client2Id,
      name: 'MVP Development',
      hourly_rate: null,
      billable: true,
      archived: false,
      created_at: createdAt,
    },
  ]

  // Company 1 retainer (15 hr/mo): retainer-only → partial overage → full overage → non-billable
  // Company 2: standard hourly billing
  const timeEntries: TimeEntry[] = [
    {
      id: 'seed-entry-1',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Retainer — discovery & wireframes',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(14, 9, 4),
    },
    {
      id: 'seed-entry-2',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Retainer — visual design',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(12, 9, 4),
    },
    {
      id: 'seed-entry-3',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Retainer — homepage build',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(10, 9, 4),
    },
    {
      id: 'seed-entry-4',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Partial overage — 3 hr retainer + 2 hr overage',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(8, 9, 5),
    },
    {
      id: 'seed-entry-5',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Full overage — retainer exhausted',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(6, 9, 2),
    },
    {
      id: 'seed-entry-6',
      user_id: MOCK_USER_ID,
      project_id: project2Id,
      description: 'Full overage — internal tools (project rate $100)',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(4, 10, 2.5),
    },
    {
      id: 'seed-entry-7',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Non-billable — internal planning',
      billable: false,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(2, 14, 3),
    },
    {
      id: 'seed-entry-8',
      user_id: MOCK_USER_ID,
      project_id: project1Id,
      description: 'Today — full overage (retainer already used)',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(0, 9, 2),
    },
    {
      id: 'seed-entry-9',
      user_id: MOCK_USER_ID,
      project_id: project3Id,
      description: 'Standard billing — MVP sprint',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(13, 9, 3),
    },
    {
      id: 'seed-entry-10',
      user_id: MOCK_USER_ID,
      project_id: project3Id,
      description: 'Non-billable — stakeholder sync',
      billable: false,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(11, 11, 1.5),
    },
    {
      id: 'seed-entry-11',
      user_id: MOCK_USER_ID,
      project_id: project3Id,
      description: 'Standard billing — API integration',
      billable: true,
      invoice_id: null,
      created_at: createdAt,
      updated_at: createdAt,
      ...entryAtDaysAgo(7, 9, 2),
    },
  ]

  return {
    clients,
    projects,
    timeEntries,
    activeTimer: null,
    invoices: [],
    invoiceLineItems: [],
  }
}

function normalizeClient(
  client: Partial<Client> &
    Pick<Client, 'id' | 'user_id' | 'name' | 'default_hourly_rate' | 'created_at'>,
): Client {
  return {
    ...client,
    email: client.email ?? null,
    address: client.address ?? null,
    retainer_enabled: client.retainer_enabled ?? false,
    retainer_hours_per_month: client.retainer_hours_per_month ?? null,
    retainer_hourly_rate: client.retainer_hourly_rate ?? null,
    retainer_overage_rate: client.retainer_overage_rate ?? null,
  } as Client
}

function load(): MockData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw) as MockData
      data.clients = data.clients.map((client) => normalizeClient(client))
      return data
    }
  } catch {
    // ignore corrupt storage
  }
  const seed = createSeedData()
  save(seed)
  return seed
}

function save(data: MockData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function withClient(project: Project, clients: Client[]): ProjectWithClient {
  const client = clients.find((c) => c.id === project.client_id)!
  return {
    ...project,
    clients: {
      id: client.id,
      name: client.name,
      default_hourly_rate: client.default_hourly_rate,
      retainer_enabled: client.retainer_enabled,
      retainer_hours_per_month: client.retainer_hours_per_month,
      retainer_hourly_rate: client.retainer_hourly_rate,
      retainer_overage_rate: client.retainer_overage_rate,
    },
  }
}

function withProject(entry: TimeEntry, data: MockData): TimeEntryWithProject {
  const project = data.projects.find((p) => p.id === entry.project_id)!
  return {
    ...entry,
    projects: withClient(project, data.clients),
  }
}

export const mockStore = {
  reset(): void {
    save(createSeedData())
  },

  getClients(): Client[] {
    const data = load()
    return [...data.clients].sort((a, b) => a.name.localeCompare(b.name))
  },

  createClient(input: {
    name: string
    email?: string
    address?: string
    default_hourly_rate: number
    retainer_enabled?: boolean
    retainer_hours_per_month?: number | null
    retainer_hourly_rate?: number | null
    retainer_overage_rate?: number | null
  }): Client {
    const data = load()
    const client: Client = normalizeClient({
      id: id(),
      user_id: MOCK_USER_ID,
      name: input.name,
      email: input.email ?? null,
      address: input.address ?? null,
      default_hourly_rate: input.default_hourly_rate,
      retainer_enabled: input.retainer_enabled ?? false,
      retainer_hours_per_month: input.retainer_hours_per_month ?? null,
      retainer_hourly_rate: input.retainer_hourly_rate ?? null,
      retainer_overage_rate: input.retainer_overage_rate ?? null,
      created_at: now(),
    })
    data.clients.push(client)
    save(data)
    return client
  },

  updateClient(input: {
    id: string
    name: string
    email?: string
    address?: string
    default_hourly_rate: number
    retainer_enabled?: boolean
    retainer_hours_per_month?: number | null
    retainer_hourly_rate?: number | null
    retainer_overage_rate?: number | null
  }): Client {
    const data = load()
    const idx = data.clients.findIndex((c) => c.id === input.id)
    if (idx === -1) throw new Error('Client not found')
    data.clients[idx] = normalizeClient({
      ...data.clients[idx],
      name: input.name,
      email: input.email ?? null,
      address: input.address ?? null,
      default_hourly_rate: input.default_hourly_rate,
      retainer_enabled: input.retainer_enabled ?? false,
      retainer_hours_per_month: input.retainer_hours_per_month ?? null,
      retainer_hourly_rate: input.retainer_hourly_rate ?? null,
      retainer_overage_rate: input.retainer_overage_rate ?? null,
    })
    save(data)
    return data.clients[idx]
  },

  deleteClient(clientId: string): void {
    const data = load()
    data.clients = data.clients.filter((c) => c.id !== clientId)
    data.projects = data.projects.filter((p) => p.client_id !== clientId)
    save(data)
  },

  getProjects(includeArchived: boolean): ProjectWithClient[] {
    const data = load()
    return data.projects
      .filter((p) => includeArchived || !p.archived)
      .map((p) => withClient(p, data.clients))
      .sort((a, b) => a.name.localeCompare(b.name))
  },

  createProject(input: {
    client_id: string
    name: string
    hourly_rate?: number | null
    billable?: boolean
  }): Project {
    const data = load()
    const project: Project = {
      id: id(),
      user_id: MOCK_USER_ID,
      client_id: input.client_id,
      name: input.name,
      hourly_rate: input.hourly_rate ?? null,
      billable: input.billable ?? true,
      archived: false,
      created_at: now(),
    }
    data.projects.push(project)
    save(data)
    return project
  },

  updateProject(input: {
    id: string
    name: string
    hourly_rate?: number | null
    billable?: boolean
    archived?: boolean
  }): Project {
    const data = load()
    const idx = data.projects.findIndex((p) => p.id === input.id)
    if (idx === -1) throw new Error('Project not found')
    data.projects[idx] = { ...data.projects[idx], ...input }
    save(data)
    return data.projects[idx]
  },

  deleteProject(projectId: string): void {
    const data = load()
    data.projects = data.projects.filter((p) => p.id !== projectId)
    save(data)
  },

  getTimeEntries(filters: {
    projectId?: string
    clientId?: string
    startDate?: string
    endDate?: string
    billableOnly?: boolean
    uninvoicedOnly?: boolean
  }): TimeEntryWithProject[] {
    const data = load()
    let entries = data.timeEntries.map((e) => withProject(e, data))

    if (filters.projectId) {
      entries = entries.filter((e) => e.project_id === filters.projectId)
    }
    if (filters.startDate) {
      entries = entries.filter(
        (e) => e.started_at >= toIsoStartOfLocalDay(filters.startDate!),
      )
    }
    if (filters.endDate) {
      entries = entries.filter(
        (e) => e.started_at <= toIsoEndOfLocalDay(filters.endDate!),
      )
    }
    if (filters.billableOnly) {
      entries = entries.filter((e) => e.billable)
    }
    if (filters.uninvoicedOnly) {
      entries = entries.filter((e) => e.invoice_id === null)
    }
    if (filters.clientId) {
      entries = entries.filter(
        (e) => e.projects.client_id === filters.clientId,
      )
    }

    return entries.sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    )
  },

  createTimeEntry(input: {
    project_id: string
    description?: string
    started_at: string
    ended_at: string
    duration_seconds: number
    billable?: boolean
  }): TimeEntry {
    const data = load()
    const entry: TimeEntry = {
      id: id(),
      user_id: MOCK_USER_ID,
      project_id: input.project_id,
      description: input.description ?? null,
      started_at: input.started_at,
      ended_at: input.ended_at,
      duration_seconds: input.duration_seconds,
      billable: input.billable ?? true,
      invoice_id: null,
      created_at: now(),
      updated_at: now(),
    }
    data.timeEntries.push(entry)
    save(data)
    return entry
  },

  updateTimeEntry(input: {
    id: string
    project_id: string
    description?: string
    started_at: string
    ended_at: string
    duration_seconds: number
    billable: boolean
  }): TimeEntry {
    const data = load()
    const idx = data.timeEntries.findIndex((e) => e.id === input.id)
    if (idx === -1) throw new Error('Time entry not found')
    data.timeEntries[idx] = {
      ...data.timeEntries[idx],
      ...input,
      description: input.description ?? null,
      updated_at: now(),
    }
    save(data)
    return data.timeEntries[idx]
  },

  deleteTimeEntry(entryId: string): void {
    const data = load()
    data.timeEntries = data.timeEntries.filter((e) => e.id !== entryId)
    save(data)
  },

  getActiveTimer(): ActiveTimer | null {
    return load().activeTimer
  },

  upsertActiveTimer(input: {
    project_id: string
    description?: string
  }): ActiveTimer {
    const data = load()
    const timer: ActiveTimer = {
      id: data.activeTimer?.id ?? id(),
      user_id: MOCK_USER_ID,
      project_id: input.project_id,
      description: input.description ?? null,
      started_at: new Date().toISOString(),
    }
    data.activeTimer = timer
    save(data)
    return timer
  },

  updateActiveTimerDescription(description?: string): ActiveTimer {
    const data = load()
    if (!data.activeTimer) throw new Error('No active timer')
    data.activeTimer = {
      ...data.activeTimer,
      description: description ?? null,
    }
    save(data)
    return data.activeTimer
  },

  deleteActiveTimer(): void {
    const data = load()
    data.activeTimer = null
    save(data)
  },

  getInvoices() {
    const data = load()
    return data.invoices
      .map((invoice) => ({
        ...invoice,
        clients: data.clients.find((c) => c.id === invoice.client_id)!,
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
  },

  getInvoice(invoiceId: string): InvoiceWithDetails {
    const data = load()
    const invoice = data.invoices.find((i) => i.id === invoiceId)
    if (!invoice) throw new Error('Invoice not found')
    const client = data.clients.find((c) => c.id === invoice.client_id)!
    const lineItems = data.invoiceLineItems
      .filter((li) => li.invoice_id === invoiceId)
      .map((li) => ({
        ...li,
        projects: {
          id: li.project_id,
          name: data.projects.find((p) => p.id === li.project_id)!.name,
        },
      }))
    return { ...invoice, clients: client, invoice_line_items: lineItems }
  },

  generateInvoiceNumber(): string {
    const data = load()
    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`
    const matching = data.invoices
      .filter((i) => i.invoice_number.startsWith(prefix))
      .sort((a, b) => b.invoice_number.localeCompare(a.invoice_number))
    if (!matching.length) {
      return `${prefix}${String(INVOICE_NUMBER_START).padStart(3, '0')}`
    }
    const num = parseInt(matching[0].invoice_number.replace(prefix, ''), 10)
    return `${prefix}${String(num + 1).padStart(3, '0')}`
  },

  createInvoice(input: {
    client_id: string
    period_start: string
    period_end: string
    notes?: string
    line_items: DraftLineItem[]
  }): Invoice {
    const data = load()
    const subtotal = input.line_items.reduce((sum, li) => sum + li.amount, 0)
    const invoice: Invoice = {
      id: id(),
      user_id: MOCK_USER_ID,
      client_id: input.client_id,
      invoice_number: mockStore.generateInvoiceNumber(),
      period_start: input.period_start,
      period_end: input.period_end,
      status: 'draft',
      subtotal,
      notes: input.notes ?? null,
      created_at: now(),
    }
    data.invoices.push(invoice)

    for (const li of input.line_items) {
      data.invoiceLineItems.push({
        id: id(),
        invoice_id: invoice.id,
        project_id: li.project_id,
        description: li.description,
        hours: li.hours,
        rate: li.rate,
        amount: li.amount,
      })
      for (const entryId of li.time_entry_ids) {
        const entry = data.timeEntries.find((e) => e.id === entryId)
        if (entry) entry.invoice_id = invoice.id
      }
    }

    save(data)
    return invoice
  },

  updateInvoiceStatus(input: {
    id: string
    status: 'draft' | 'sent' | 'paid'
  }): Invoice {
    const data = load()
    const idx = data.invoices.findIndex((i) => i.id === input.id)
    if (idx === -1) throw new Error('Invoice not found')
    data.invoices[idx] = { ...data.invoices[idx], status: input.status }
    save(data)
    return data.invoices[idx]
  },

  deleteInvoice(invoiceId: string): void {
    const data = load()
    for (const entry of data.timeEntries) {
      if (entry.invoice_id === invoiceId) entry.invoice_id = null
    }
    data.invoiceLineItems = data.invoiceLineItems.filter(
      (li) => li.invoice_id !== invoiceId,
    )
    data.invoices = data.invoices.filter((i) => i.id !== invoiceId)
    save(data)
  },
}
