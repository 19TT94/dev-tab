// Types
import type { TimeEntryWithProject } from '../types/database'

// Components
import { TimeEntryForm } from './TimeEntryForm'
import { Modal } from './ui'

interface ModalAddEntryProps {
  open: boolean
  entry?: TimeEntryWithProject
  onSubmit: (data: {
    project_id: string
    description?: string
    started_at: string
    ended_at: string
    duration_seconds: number
    billable: boolean
  }) => Promise<void>
  onClose: () => void
}

export const ModalAddEntry = ({ open, entry, onSubmit, onClose }: ModalAddEntryProps) => {
  return (
    <Modal open={open} title={entry ? 'Edit Entry' : 'New Entry'} onClose={onClose}>
      <TimeEntryForm entry={entry} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  )
}
