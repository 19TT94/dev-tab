import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTimerDocumentTitle } from '../useTimerDocumentTitle'
import * as useTimerModule from '../useTimer'

describe('useTimerDocumentTitle', () => {
  afterEach(() => {
    document.title = 'DevTab'
    vi.restoreAllMocks()
  })

  it('sets the default title when no timer is active', () => {
    vi.spyOn(useTimerModule, 'useTimer').mockReturnValue({
      activeTimer: null,
      elapsed: 0,
      isLoading: false,
      start: {} as never,
      stop: {} as never,
    })

    renderHook(() => useTimerDocumentTitle())

    expect(document.title).toBe('DevTab')
  })

  it('shows elapsed time in the title when a timer is active', () => {
    vi.spyOn(useTimerModule, 'useTimer').mockReturnValue({
      activeTimer: {
        id: '1',
        user_id: '1',
        project_id: '1',
        description: null,
        started_at: new Date().toISOString(),
      },
      elapsed: 3661,
      isLoading: false,
      start: {} as never,
      stop: {} as never,
    })

    renderHook(() => useTimerDocumentTitle())

    expect(document.title).toBe('01:01:01 · DevTab')
  })

  it('resets the title on unmount', () => {
    vi.spyOn(useTimerModule, 'useTimer').mockReturnValue({
      activeTimer: {
        id: '1',
        user_id: '1',
        project_id: '1',
        description: null,
        started_at: new Date().toISOString(),
      },
      elapsed: 90,
      isLoading: false,
      start: {} as never,
      stop: {} as never,
    })

    const { unmount } = renderHook(() => useTimerDocumentTitle())

    expect(document.title).toBe('00:01:30 · DevTab')

    unmount()

    expect(document.title).toBe('DevTab')
  })
})
