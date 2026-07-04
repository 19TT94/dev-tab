import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { ModalInvoicePreview } from '../ModalInvoicePreview'
import { makeClient } from '../../test/fixtures'
import { theme } from '../../styles/theme'
import type { InvoiceWithDetails } from '../../types/database'

vi.mock('../InvoiceDocument', () => ({
  InvoiceDocument: () => <div data-testid="invoice-document" />,
}))

vi.mock('@react-pdf/renderer', () => ({
  PDFViewer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-viewer">{children}</div>
  ),
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (styles: unknown) => styles },
}))

vi.mock('../InvoicePdf', () => ({
  downloadInvoicePdf: vi.fn(),
}))

function makeInvoice(): InvoiceWithDetails {
  const client = makeClient()
  return {
    id: 'invoice-1',
    user_id: 'mock-user-id',
    client_id: client.id,
    invoice_number: 'INV-2024-001',
    period_start: '2024-06-01',
    period_end: '2024-06-30',
    status: 'draft',
    subtotal: 100,
    notes: null,
    created_at: '2024-06-30T00:00:00.000Z',
    clients: client,
    invoice_line_items: [],
  }
}

const renderPreview = (open = true) =>
  render(
    <ThemeProvider theme={theme}>
      <ModalInvoicePreview
        open={open}
        invoice={makeInvoice()}
        onClose={vi.fn()}
      />
    </ThemeProvider>,
  )

describe('ModalInvoicePreview', () => {
  it('renders the PDF viewer when open', () => {
    renderPreview()
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Preview — INV-2024-001',
    )
  })

  it('does not render when closed', () => {
    renderPreview(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Close is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(
      <ThemeProvider theme={theme}>
        <ModalInvoicePreview
          open
          invoice={makeInvoice()}
          onClose={onClose}
        />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
