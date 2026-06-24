import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { useTimer } from '../useTimer'
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

describe('useTimer', () => {
  it('starts and stops a timer in mock mode', async () => {
    const { result } = renderHook(
      () => ({
        timer: useTimer(),
        projects: useProjects(true),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.projects.isSuccess).toBe(true))
    const projectId = result.current.projects.data![0].id

    await act(async () => {
      await result.current.timer.start.mutateAsync({ project_id: projectId })
    })

    await waitFor(() => expect(result.current.timer.activeTimer).not.toBeNull())
    expect(result.current.timer.activeTimer?.project_id).toBe(projectId)

    await act(async () => {
      await result.current.timer.stop.mutateAsync()
    })

    await waitFor(() => expect(result.current.timer.activeTimer).toBeNull())
  })

  it('prevents starting a second timer', async () => {
    const { result } = renderHook(
      () => ({
        timer: useTimer(),
        projects: useProjects(true),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.projects.isSuccess).toBe(true))
    const projectId = result.current.projects.data![0].id

    await act(async () => {
      await result.current.timer.start.mutateAsync({ project_id: projectId })
    })

    await waitFor(() => expect(result.current.timer.activeTimer).not.toBeNull())

    await expect(
      result.current.timer.start.mutateAsync({ project_id: projectId }),
    ).rejects.toThrow('A timer is already running')
  })
})
