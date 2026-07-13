import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import Dashboard from '../Dashboard'
import { renderWithProviders } from '../../test/render'

describe('Dashboard', () => {
  it('renders dashboard heading and timer', async () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
    expect(screen.getByText('This week')).toBeInTheDocument()
    expect(screen.getByText('This month')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByText(/Today's entries|No time logged today yet/)).toBeInTheDocument(),
    )
  })
})
