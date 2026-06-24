import { describe, expect, it, vi, beforeEach } from 'vitest'
import { downloadInvoicePdf } from '../InvoicePdf'
import { makeClient } from '../../test/fixtures'
import type { InvoiceWithDetails } from '../../types/database'

vi.mock('@react-pdf/renderer', () => ({
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (styles: unknown) => styles },
  pdf: () => ({
    toBlob: async () => new Blob(['pdf'], { type: 'application/pdf' }),
  }),
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
    invoice_line_items: [
      {
        id: 'line-1',
        invoice_id: 'invoice-1',
        project_id: 'project-1',
        description: 'Work',
        hours: 1,
        rate: 100,
        amount: 100,
        projects: { id: 'project-1', name: 'Test Project' },
      },
    ],
  }
}

describe('downloadInvoicePdf', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  it('creates and clicks a download link', async () => {
    const click = vi.fn()
    const link = document.createElement('a')
    link.click = click
    vi.spyOn(document, 'createElement').mockReturnValue(link)

    await downloadInvoicePdf(makeInvoice(), 'custom.pdf')

    expect(click).toHaveBeenCalledOnce()
    expect(link.download).toBe('custom.pdf')
  })
})
