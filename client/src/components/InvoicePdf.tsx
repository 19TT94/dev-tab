import { pdf } from '@react-pdf/renderer'

// Components
import { InvoiceDocument } from './InvoiceDocument'

// Types
import type { InvoiceWithDetails } from '../types/database'

export const downloadInvoicePdf = async (
  invoice: InvoiceWithDetails,
  filename?: string,
): Promise<void> => {
  const blob = await pdf(<InvoiceDocument invoice={invoice} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename ?? `${invoice.invoice_number}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
