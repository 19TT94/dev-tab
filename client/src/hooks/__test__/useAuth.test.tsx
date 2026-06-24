import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../AuthProvider'
import { useAuth } from '../useAuth'
import { renderWithProviders } from '../../test/render'

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider',
    )
  })

  it('provides mock session in mock mode', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user?.email).toBe('dev@localhost')
    expect(result.current.session).not.toBeNull()
  })

  it('signs in and out in mock mode', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      const response = await result.current.signIn('test@example.com', 'pass')
      expect(response.error).toBeNull()
    })

    expect(result.current.user?.email).toBe('test@example.com')

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.session).toBeNull()
  })
})

describe('AuthProvider integration', () => {
  it('renders children', () => {
    const { getByText } = renderWithProviders(<div>Child content</div>)
    expect(getByText('Child content')).toBeInTheDocument()
  })
})
