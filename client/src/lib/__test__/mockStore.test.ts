import { beforeEach, describe, expect, it } from 'vitest'
import { mockStore } from '../mockStore'
import { INVOICE_NUMBER_START, MOCK_USER_ID } from '../config'

const STORAGE_KEY = 'personal-invoice-mock-data'
const seq = (offset: number) =>
  String(INVOICE_NUMBER_START + offset).padStart(3, '0')

describe('mockStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('seeds data on first load', () => {
    const clients = mockStore.getClients()
    expect(clients.length).toBeGreaterThanOrEqual(2)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('creates, updates, and deletes clients', () => {
    const created = mockStore.createClient({
      name: 'New Client',
      default_hourly_rate: 200,
    })
    expect(created.name).toBe('New Client')
    expect(created.user_id).toBe(MOCK_USER_ID)

    const updated = mockStore.updateClient({
      id: created.id,
      name: 'Renamed Client',
      default_hourly_rate: 225,
    })
    expect(updated.name).toBe('Renamed Client')

    mockStore.deleteClient(created.id)
    expect(mockStore.getClients().find((c) => c.id === created.id)).toBeUndefined()
  })

  it('creates projects and filters archived', () => {
    const client = mockStore.createClient({
      name: 'Project Client',
      default_hourly_rate: 100,
    })
    const project = mockStore.createProject({
      client_id: client.id,
      name: 'Active Project',
    })
    mockStore.updateProject({
      id: project.id,
      name: 'Archived Project',
      archived: true,
    })

    const active = mockStore.getProjects(false)
    const all = mockStore.getProjects(true)
    expect(active.find((p) => p.id === project.id)).toBeUndefined()
    expect(all.find((p) => p.id === project.id)?.archived).toBe(true)
  })

  it('manages time entries with filters', () => {
    const clients = mockStore.getClients()
    const projects = mockStore.getProjects(true)
    const project = projects[0]

    const entry = mockStore.createTimeEntry({
      project_id: project.id,
      started_at: '2024-06-01T09:00:00.000Z',
      ended_at: '2024-06-01T10:00:00.000Z',
      duration_seconds: 3600,
      billable: true,
    })

    const byProject = mockStore.getTimeEntries({ projectId: project.id })
    expect(byProject.some((e) => e.id === entry.id)).toBe(true)

    const byDate = mockStore.getTimeEntries({
      startDate: '2024-06-01',
      endDate: '2024-06-01',
    })
    expect(byDate.some((e) => e.id === entry.id)).toBe(true)

    mockStore.updateTimeEntry({
      id: entry.id,
      project_id: project.id,
      started_at: entry.started_at,
      ended_at: entry.ended_at,
      duration_seconds: 7200,
      billable: false,
    })

    const billableOnly = mockStore.getTimeEntries({ billableOnly: true })
    expect(billableOnly.some((e) => e.id === entry.id)).toBe(false)

    mockStore.deleteTimeEntry(entry.id)
    expect(mockStore.getTimeEntries({}).some((e) => e.id === entry.id)).toBe(
      false,
    )

    expect(clients.length).toBeGreaterThan(0)
  })

  it('manages active timer lifecycle', () => {
    const project = mockStore.getProjects(true)[0]

    expect(mockStore.getActiveTimer()).toBeNull()

    const timer = mockStore.upsertActiveTimer({
      project_id: project.id,
      description: 'Working',
    })
    expect(mockStore.getActiveTimer()?.project_id).toBe(project.id)

    mockStore.createTimeEntry({
      project_id: timer.project_id,
      description: timer.description ?? undefined,
      started_at: timer.started_at,
      ended_at: new Date().toISOString(),
      duration_seconds: 60,
    })
    mockStore.deleteActiveTimer()
    expect(mockStore.getActiveTimer()).toBeNull()
  })

  it('creates invoices and links time entries', () => {
    const client = mockStore.getClients()[0]
    const project = mockStore
      .getProjects(true)
      .find((p) => p.client_id === client.id)!

    const entry = mockStore.createTimeEntry({
      project_id: project.id,
      started_at: '2024-06-01T09:00:00.000Z',
      ended_at: '2024-06-01T10:00:00.000Z',
      duration_seconds: 3600,
    })

    const invoice = mockStore.createInvoice({
      client_id: client.id,
      period_start: '2024-06-01',
      period_end: '2024-06-30',
      line_items: [
        {
          project_id: project.id,
          project_name: project.name,
          description: project.name,
          hours: 1,
          rate: 100,
          amount: 100,
          time_entry_ids: [entry.id],
        },
      ],
    })

    expect(invoice.invoice_number).toMatch(
      new RegExp(`^INV-\\d{4}-${seq(0)}$`),
    )
    expect(mockStore.getInvoices()).toHaveLength(1)

    const details = mockStore.getInvoice(invoice.id)
    expect(details.invoice_line_items).toHaveLength(1)

    mockStore.updateInvoiceStatus({ id: invoice.id, status: 'sent' })
    expect(mockStore.getInvoice(invoice.id).status).toBe('sent')

    mockStore.deleteInvoice(invoice.id)
    expect(mockStore.getInvoices()).toHaveLength(0)
  })

  it('increments invoice numbers', () => {
    const client = mockStore.getClients()[0]
    const project = mockStore.getProjects(true)[0]

    const first = mockStore.createInvoice({
      client_id: client.id,
      period_start: '2024-06-01',
      period_end: '2024-06-30',
      line_items: [
        {
          project_id: project.id,
          project_name: project.name,
          description: 'Line 1',
          hours: 1,
          rate: 100,
          amount: 100,
          time_entry_ids: [],
        },
      ],
    })

    const secondNumber = mockStore.generateInvoiceNumber()
    expect(secondNumber).not.toBe(first.invoice_number)
    expect(secondNumber.endsWith(seq(1))).toBe(true)
  })
})
