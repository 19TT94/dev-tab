// Types
import type { ProjectWithClient } from '../types/database'

// Components
import { ProjectForm, type ProjectFormPayload } from './ProjectForm'
import { Modal } from './ui'

interface ModalAddProjectProps {
  open: boolean
  clientId: string
  project?: ProjectWithClient
  onSave: (data: ProjectFormPayload) => Promise<void>
  onClose: () => void
}

export const ModalAddProject = ({ open, clientId, project, onSave, onClose }: ModalAddProjectProps) => {
  return (
    <Modal open={open} title={project ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <ProjectForm clientId={clientId} project={project} onSave={onSave} onCancel={onClose} />
    </Modal>
  )
}
