import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Components
import { InvoiceWizard } from '../InvoiceWizard'

// Utils
import { renderWithProviders } from '../../test/render'
import { makeClient, makeTimeEntry } from '../../test/fixtures'
import { toDateInputValue } from '../../lib/dateUtils'

const mockCreate = vi.fn()
const useTimeEntriesMock = vi.fn()

vi.mock('../../hooks/useClients', () => ({
  useClients: () => ({
    data: [makeClient({ id: 'client-1', name: 'Acme Corp' })],
  }),
}))

vi.mock('../../hooks/useInvoices', () => ({
  useInvoiceMutations: () => ({
    create: { mutateAsync: mockCreate, isPending: false },
  }),
}))

vi.mock('../../hooks/useTimeEntries', () => ({
  useTimeEntries: (filters: unknown) => useTimeEntriesMock(filters),
}))

describe('InvoiceWizard', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    useTimeEntriesMock.mockReset()
    useTimeEntriesMock.mockReturnValue({
      data: [
        makeTimeEntry({
          id: 'entry-1',
          description: 'Ticket work',
          started_at: '2024-06-15T12:00:00.000Z',
          ended_at: '2024-06-15T13:00:00.000Z',
        }),
      ],
      isLoading: false,
    })
  })

  it('keeps the selected period end date after loading entries', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InvoiceWizard onClose={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText('Client'), 'client-1')

    const endInput = screen.getByLabelText('Period end')
    await user.clear(endInput)
    await user.type(endInput, '2024-06-30')

    expect(endInput).toHaveValue('2024-06-30')

    await user.click(screen.getByRole('button', { name: /Load 1 entries/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Invoice/i })).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Period end')).toHaveValue('2024-06-30')
    expect(screen.getByLabelText('Period end')).not.toHaveValue(
      toDateInputValue(new Date()),
    )
  })

  it('creates the invoice with the selected period dates', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({})
    renderWithProviders(<InvoiceWizard onClose={vi.fn()} />)

    await user.selectOptions(screen.getByLabelText('Client'), 'client-1')

    const startInput = screen.getByLabelText('Period start')
    const endInput = screen.getByLabelText('Period end')
    await user.clear(startInput)
    await user.type(startInput, '2024-06-01')
    await user.clear(endInput)
    await user.type(endInput, '2024-06-30')

    await user.click(screen.getByRole('button', { name: /Load 1 entries/i }))
    await user.click(await screen.findByRole('button', { name: /Create Invoice/i }))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          period_start: '2024-06-01',
          period_end: '2024-06-30',
        }),
      )
    })
  })
})
