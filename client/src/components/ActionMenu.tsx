import { useEffect, useId, useRef, useState } from 'react'
import styled from 'styled-components'

export interface ActionMenuItem {
  label: string
  onSelect: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  label?: string
  disabled?: boolean
}

export const ActionMenu = ({
  items,
  label = 'Actions',
  disabled = false,
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <Root ref={rootRef}>
      <Trigger
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Dots aria-hidden>⋮</Dots>
      </Trigger>
      {open && (
        <Menu id={menuId} role="menu" aria-label={label}>
          {items.map((item) => (
            <MenuItem
              key={item.label}
              type="button"
              role="menuitem"
              $variant={item.variant ?? 'default'}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Root>
  )
}

const Root = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
`

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Dots = styled.span`
  font-size: 1.25rem;
  line-height: 1;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  z-index: 20;
  min-width: 8rem;
  padding: 0.25rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.tertiary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const MenuItem = styled.button<{ $variant: 'default' | 'danger' }>`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.secondary};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
