// Components
import { InvoiceWizard } from './InvoiceWizard'
import { Modal } from './ui'

interface ModalAddInvoiceProps {
  open: boolean
  onClose: () => void
}

export const ModalAddInvoice = ({ open, onClose }: ModalAddInvoiceProps) => {
  return (
    <Modal open={open} title="New Invoice" onClose={onClose} maxWidth="42rem">
      <InvoiceWizard onClose={onClose} />
    </Modal>
  )
}
