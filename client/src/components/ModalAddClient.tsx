// Types
import type { Client } from '../types/database'

// Components
import { ClientForm, type ClientFormData } from './ClientForm'
import { Modal } from './ui'

interface ModalAddClientProps {
  open: boolean
  client?: Client
  onSave: (data: ClientFormData) => Promise<void>
  onClose: () => void
}

export const ModalAddClient = ({ open, client, onSave, onClose }: ModalAddClientProps) => {
  return (
    <Modal open={open} title={client ? 'Edit Client' : 'New Client'} onClose={onClose}>
      <ClientForm client={client} onSave={onSave} onCancel={onClose} />
    </Modal>
  )
}
