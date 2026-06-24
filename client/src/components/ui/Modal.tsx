import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { CardTitle } from './Card'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  maxWidth?: string
  children: ReactNode
}

export const Modal = ({ open, title, onClose, maxWidth, children }: ModalProps) => {
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <Backdrop onClick={onClose} role="presentation">
      <Dialog
        $maxWidth={maxWidth}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <CardTitle id="modal-title">{title}</CardTitle>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
      </Dialog>
    </Backdrop>,
    document.body,
  )
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.secondary} 40%, transparent);
`

const Dialog = styled.div<{ $maxWidth?: string }>`
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth ?? '28rem'};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.tertiary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const DialogHeader = styled.div`
  padding: 1.25rem 1.25rem 0;
`

const DialogBody = styled.div`
  padding: 1rem 1.25rem 1.25rem;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
`
