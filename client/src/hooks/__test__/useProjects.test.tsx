import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { useProjects, useProjectMutations } from '../useProjects'
import { useClients } from '../useClients'
import { AuthProvider } from '../useAuth'
import { createTestQueryClient } from '../../test/render'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('useProjects', () => {
  it('fetches projects in mock mode', async () => {
    const { result } = renderHook(() => useProjects(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThan(0)
  })
})

describe('useProjectMutations', () => {
  it('creates a project for a client', async () => {
    const { result } = renderHook(
      () => ({
        clients: useClients(),
        projects: useProjects(true),
        mutations: useProjectMutations(),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.clients.isSuccess).toBe(true))
    const clientId = result.current.clients.data![0].id

    const project = await result.current.mutations.create.mutateAsync({
      client_id: clientId,
      name: 'Hook Project',
    })

    expect(project.name).toBe('Hook Project')
    await waitFor(() =>
      expect(
        result.current.projects.data?.some((p) => p.id === project.id),
      ).toBe(true),
    )
  })
})
