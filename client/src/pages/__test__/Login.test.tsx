import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../Login'
import { renderWithProviders } from '../../test/render'

describe('Login', () => {
  it('renders sign-in form', () => {
    renderWithProviders(<Login />)
    expect(screen.getByRole('heading', { name: 'DevTab' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText(/Mock mode/)).toBeInTheDocument()
  })

  it('submits credentials in mock mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />, {
      routerProps: { initialEntries: ['/login'] },
    })

    await user.type(screen.getByLabelText('Email'), 'user@test.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Signing in...' })).not.toBeInTheDocument(),
    )
  })
})
