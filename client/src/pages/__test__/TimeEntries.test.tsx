import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
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
})
