import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import ReportsPage from '../Reports'
import { renderWithProviders } from '../../test/render'

describe('ReportsPage', () => {
  it('renders reports filters and summary', async () => {
    renderWithProviders(<ReportsPage />)

    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument()
    expect(screen.getByLabelText('Client')).toBeInTheDocument()
    expect(screen.getByLabelText('Project')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument(),
    )

    expect(screen.getByRole('button', { name: 'Preview PDF' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument()
  })
})
