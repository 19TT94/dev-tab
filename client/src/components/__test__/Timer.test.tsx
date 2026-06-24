import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timer } from '../Timer'
import { renderWithProviders } from '../../test/render'

describe('Timer', () => {
  it('renders timer display and start controls', async () => {
    renderWithProviders(<Timer />)

    expect(screen.getByText('00:00:00')).toBeInTheDocument()
    expect(screen.getByLabelText('Project')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
  })

  it('starts timer when project is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Timer />)

    await waitFor(() =>
      expect(screen.getByLabelText('Project').children.length).toBeGreaterThan(1),
    )

    const select = screen.getByLabelText('Project')
    const firstProject = (select as HTMLSelectElement).options[1].value
    await user.selectOptions(select, firstProject)

    const startButton = screen.getByRole('button', { name: 'Start' })
    expect(startButton).not.toBeDisabled()
    await user.click(startButton)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Stop Timer' })).toBeInTheDocument(),
    )
  })
})
