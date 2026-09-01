import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Components
import { TimeEntryForm } from '../TimeEntryForm'

// Utils
import { renderWithProviders } from '../../test/render'
import { makeTimeEntry } from '../../test/fixtures'

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
    const entry = makeTimeEntry({
      project_id: 'seed-project-1',
      description: 'Existing',
      started_at: '2024-06-15T09:00:00.000Z',
      ended_at: '2024-06-15T10:00:00.000Z',
    })

    renderWithProviders(
      <TimeEntryForm entry={entry} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Update Entry' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
  })

  it('prefills edit fields with local date and time', () => {
    const startedAt = new Date(2024, 5, 15, 9, 0, 0)
    const endedAt = new Date(2024, 5, 15, 10, 0, 0)
    const entry = makeTimeEntry({
      project_id: 'seed-project-1',
      description: 'Existing',
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
    })

    renderWithProviders(
      <TimeEntryForm entry={entry} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    )

    expect(screen.getByLabelText('Date')).toHaveValue('2024-06-15')
    expect(screen.getByLabelText('Start time')).toHaveValue('09:00')
    expect(screen.getByLabelText('End time')).toHaveValue('10:00')
  })

  it('preserves the original times when saving an edit unchanged', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const startedAt = new Date(2024, 5, 15, 9, 0, 0)
    const endedAt = new Date(2024, 5, 15, 10, 0, 0)
    const entry = makeTimeEntry({
      project_id: 'seed-project-1',
      description: 'Existing',
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: 3600,
    })

    renderWithProviders(
      <TimeEntryForm entry={entry} onSubmit={onSubmit} onCancel={vi.fn()} />,
    )

    await waitFor(() =>
      expect(screen.getByLabelText('Project').children.length).toBeGreaterThan(1),
    )
    await user.selectOptions(screen.getByLabelText('Project'), 'seed-project-1')
    await user.click(screen.getByRole('button', { name: 'Update Entry' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: 3600,
    })
  })
})
