import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionMenu } from '../ActionMenu'
import { renderWithProviders } from '../../test/render'

describe('ActionMenu', () => {
  it('opens a menu with edit and danger delete actions', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    renderWithProviders(
      <ActionMenu
        label="Row actions"
        items={[
          { label: 'Edit', onSelect: onEdit },
          { label: 'Delete', variant: 'danger', onSelect: onDelete },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Row actions' }))

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
