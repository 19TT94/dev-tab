import { PDFViewer } from '@react-pdf/renderer'
import styled from 'styled-components'

// Types
import type { InvoiceWithDetails } from '../types/database'

// Components
import { Button } from './Button'
import { InvoiceDocument } from './InvoiceDocument'
import { downloadInvoicePdf } from './InvoicePdf'
import { ButtonRow, Modal } from './ui'

interface ModalInvoicePreviewProps {
  open: boolean
  invoice: InvoiceWithDetails
  onClose: () => void
}

export const ModalInvoicePreview = ({
  open,
  invoice,
  onClose,
}: ModalInvoicePreviewProps) => {
  const handleDownload = async () => {
    await downloadInvoicePdf(invoice)
  }

  return (
    <Modal
      open={open}
      title={`Preview — ${invoice.invoice_number}`}
      onClose={onClose}
      maxWidth="52rem"
    >
      <PreviewFrame>
        <PDFViewer width="100%" height="100%" showToolbar={false}>
          <InvoiceDocument invoice={invoice} />
        </PDFViewer>
      </PreviewFrame>
      <ButtonRow>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleDownload}>Download PDF</Button>
      </ButtonRow>
    </Modal>
  )
}

// Style Overrides
const PreviewFrame = styled.div`
  height: min(70vh, 42rem);
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};

  iframe {
    border: none;
  }
`
