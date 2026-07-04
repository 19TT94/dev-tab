import type { Client, TimeEntryWithProject } from '../types/database'
import type { ClientBillingInfo } from '../lib/billing'

export function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'client-1',
    user_id: 'mock-user-id',
    name: 'Test Client',
    email: null,
    address: null,
    default_hourly_rate: 100,
    retainer_enabled: false,
    retainer_hours_per_month: null,
    retainer_hourly_rate: null,
    retainer_overage_rate: null,
    created_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeRetainerClient(
  overrides: Partial<Client> = {},
): ClientBillingInfo {
  return {
    retainer_enabled: true,
    retainer_hours_per_month: 10,
    retainer_hourly_rate: 100,
    retainer_overage_rate: 150,
    default_hourly_rate: 100,
    ...overrides,
  }
}

export function makeTimeEntry(
  overrides: Partial<TimeEntryWithProject> = {},
): TimeEntryWithProject {
  const client = makeClient()
  return {
    id: 'entry-1',
    user_id: 'mock-user-id',
    project_id: 'project-1',
    description: null,
    started_at: '2024-01-01T09:00:00.000Z',
    ended_at: '2024-01-01T10:00:00.000Z',
    duration_seconds: 3600,
    billable: true,
    invoice_id: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    projects: {
      id: 'project-1',
      user_id: 'mock-user-id',
      client_id: client.id,
      name: 'Test Project',
      hourly_rate: null,
      billable: true,
      archived: false,
      created_at: '2024-01-01T00:00:00.000Z',
      clients: {
        id: client.id,
        name: client.name,
        default_hourly_rate: client.default_hourly_rate,
        retainer_enabled: client.retainer_enabled,
        retainer_hours_per_month: client.retainer_hours_per_month,
        retainer_hourly_rate: client.retainer_hourly_rate,
        retainer_overage_rate: client.retainer_overage_rate,
      },
    },
    ...overrides,
  }
}
