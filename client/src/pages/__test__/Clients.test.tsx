import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import ClientsPage from '../Clients'
import { renderWithProviders } from '../../test/render'

describe('ClientsPage', () => {
  it('renders clients page with seed data', async () => {
    renderWithProviders(<ClientsPage />)

    expect(screen.getByRole('heading', { name: 'Clients & Projects' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Company 1')).toBeInTheDocument()
      expect(screen.getByText('Company 2')).toBeInTheDocument()
    })
  })
})
