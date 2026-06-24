import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeEntryForm } from '../TimeEntryForm'
import { renderWithProviders } from '../../test/render'

describe('TimeEntryForm', () => {
  it('submits a new time entry', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <TimeEntryForm onSubmit={onSubmit} />,
    )

    await waitFor(() =>
      expect(screen.getByLabelText('Project').children.length).toBeGreaterThan(1),
    )

    const select = screen.getByLabelText('Project')
    const projectId = (select as HTMLSelectElement).options[1].value
    await user.selectOptions(select, projectId)
    await user.click(screen.getByRole('button', { name: 'Add Entry' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      project_id: projectId,
      billable: true,
      duration_seconds: 3600,
    })
  })

  it('shows update label when editing', async () => {
    const entry = {
      id: 'entry-1',
      user_id: 'mock-user-id',
      project_id: 'seed-project-1',
      description: 'Existing',
      started_at: '2024-06-15T09:00:00.000Z',
      ended_at: '2024-06-15T10:00:00.000Z',
      duration_seconds: 3600,
      billable: true,
      invoice_id: null,
      created_at: '2024-06-15T00:00:00.000Z',
      updated_at: '2024-06-15T00:00:00.000Z',
      projects: {
        id: 'seed-project-1',
        user_id: 'mock-user-id',
        client_id: 'seed-client-1',
        name: 'Website Redesign',
        hourly_rate: null,
        billable: true,
        archived: false,
        created_at: '2024-01-01T00:00:00.000Z',
        clients: {
          id: 'seed-client-1',
          name: 'Acme Corp',
          default_hourly_rate: 150,
          retainer_enabled: true,
          retainer_hours_per_month: 15,
          retainer_hourly_rate: 150,
          retainer_overage_rate: 175,
        },
      },
    }

    renderWithProviders(
      <TimeEntryForm entry={entry} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Update Entry' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
  })
})
