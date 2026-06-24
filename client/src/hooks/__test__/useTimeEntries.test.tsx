import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { useTimeEntries, useTimeEntryMutations } from '../useTimeEntries'
import { useProjects } from '../useProjects'
import { AuthProvider } from '../useAuth'
import { createTestQueryClient } from '../../test/render'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}

describe('useTimeEntries', () => {
  it('fetches time entries in mock mode', async () => {
    const { result } = renderHook(() => useTimeEntries(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})

describe('useTimeEntryMutations', () => {
  it('creates and deletes a time entry', async () => {
    const { result } = renderHook(
      () => ({
        projects: useProjects(true),
        entries: useTimeEntries(),
        mutations: useTimeEntryMutations(),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.projects.isSuccess).toBe(true))
    const projectId = result.current.projects.data![0].id

    const entry = await result.current.mutations.create.mutateAsync({
      project_id: projectId,
      started_at: '2024-07-01T09:00:00.000Z',
      ended_at: '2024-07-01T10:00:00.000Z',
      duration_seconds: 3600,
    })

    await waitFor(() =>
      expect(
        result.current.entries.data?.some((e) => e.id === entry.id),
      ).toBe(true),
    )

    await result.current.mutations.remove.mutateAsync(entry.id)
    await waitFor(() =>
      expect(
        result.current.entries.data?.some((e) => e.id === entry.id),
      ).toBe(false),
    )
  })
})
