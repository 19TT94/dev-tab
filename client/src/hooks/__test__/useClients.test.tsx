import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useClients, useClientMutations } from '../useClients'
import { AuthProvider } from '../AuthProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '../../test/render'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('useClients', () => {
  it('fetches clients in mock mode', async () => {
    const { result } = renderHook(() => useClients(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThan(0)
  })
})

describe('useClientMutations', () => {
  it('creates and removes a client', async () => {
    const { result } = renderHook(
      () => ({
        clients: useClients(),
        mutations: useClientMutations(),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.clients.isSuccess).toBe(true))

    const created = await result.current.mutations.create.mutateAsync({
      name: 'Hook Client',
      default_hourly_rate: 175,
    })

    expect(created.name).toBe('Hook Client')

    await result.current.mutations.remove.mutateAsync(created.id)
    await waitFor(() =>
      expect(
        result.current.clients.data?.find((c) => c.id === created.id),
      ).toBeUndefined(),
    )
  })
})
