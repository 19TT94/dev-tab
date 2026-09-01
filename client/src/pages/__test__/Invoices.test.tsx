import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

// Pages
import InvoicesPage from '../Invoices'

// Utils
import { renderWithProviders } from '../../test/render'

describe('InvoicesPage', () => {
  it('renders invoices page', async () => {
    renderWithProviders(<InvoicesPage />)

    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Invoice' })).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    )
  })
})
