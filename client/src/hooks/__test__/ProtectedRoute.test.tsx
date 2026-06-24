import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { renderWithProviders } from '../../test/render'
import * as useAuthModule from '../useAuth'

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth is loading', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      session: null,
      user: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
    )

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('redirects to login when unauthenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      session: null,
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/time"
          element={
            <ProtectedRoute>
              <div>Protected</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/time'] } },
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      session: { user: { id: '1' } } as never,
      user: { id: '1' } as never,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
