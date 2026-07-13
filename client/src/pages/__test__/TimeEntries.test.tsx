import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimeEntriesPage from '../TimeEntries'
import { renderWithProviders } from '../../test/render'

describe('TimeEntriesPage', () => {
  it('renders page and entry list', async () => {
    renderWithProviders(<TimeEntriesPage />)

    expect(screen.getByRole('heading', { name: 'Time Entries' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    )
  })

  it('applies date range filters from the URL', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/time" element={<TimeEntriesPage />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [
            { pathname: '/time', search: '?startDate=2026-07-01&endDate=2026-07-13' },
          ],
        },
      },
    )

    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit filters' })).toBeInTheDocument()
      expect(screen.getByText(/Jul 1, 2026/)).toBeInTheDocument()
    })
  })

  it('opens the filter modal with the current date range', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/time" element={<TimeEntriesPage />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [
            { pathname: '/time', search: '?startDate=2026-07-06&endDate=2026-07-13' },
          ],
        },
      },
    )

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit filters' })).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Edit filters' }))

    expect(screen.getByRole('dialog', { name: 'Filter entries' })).toBeInTheDocument()
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-07-06')
    expect(screen.getByLabelText('End date')).toHaveValue('2026-07-13')
  })
})
