import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Layout } from '../Layout'
import { renderWithProviders } from '../../test/render'
import * as useAuthModule from '../../hooks/useAuth'

describe('Layout', () => {
  it('renders navigation and children', () => {
    renderWithProviders(
      <Layout>
        <div>Page content</div>
      </Layout>,
    )

    expect(screen.getByText('DevTab')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Time Entries')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getByText(/Mock mode/)).toBeInTheDocument()
  })

  it('calls signOut when sign out is clicked', async () => {
    const user = userEvent.setup()
    const signOut = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      session: { user: { id: '1' } } as never,
      user: { id: '1' } as never,
      loading: false,
      signIn: vi.fn(),
      signOut,
    })

    renderWithProviders(
      <Layout>
        <div>Content</div>
      </Layout>,
    )

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signOut).toHaveBeenCalledOnce()
  })
})
