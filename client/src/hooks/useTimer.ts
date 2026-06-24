import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { isMockMode } from '../lib/config'
import { mockStore } from '../lib/mockStore'
import { supabase } from '../lib/supabase'
import type { ActiveTimer } from '../types/database'
import { useAuth } from './useAuth'

const LOCAL_TIMER_KEY = 'active_timer'

export function useTimer() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [elapsed, setElapsed] = useState(0)

  const { data: activeTimer, isLoading } = useQuery({
    queryKey: ['active_timer', user?.id],
    queryFn: async () => {
      if (isMockMode) return mockStore.getActiveTimer()
      const { data, error } = await supabase
        .from('active_timers')
        .select('*')
        .maybeSingle()
      if (error) throw error
      return data as ActiveTimer | null
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0)
      localStorage.removeItem(LOCAL_TIMER_KEY)
      return
    }

    localStorage.setItem(LOCAL_TIMER_KEY, JSON.stringify(activeTimer))

    const tick = () => {
      const start = new Date(activeTimer.started_at).getTime()
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeTimer])

  const start = useMutation({
    mutationFn: async (input: { project_id: string; description?: string }) => {
      if (activeTimer) throw new Error('A timer is already running')

      if (isMockMode) return mockStore.upsertActiveTimer(input)

      const { data, error } = await supabase
        .from('active_timers')
        .upsert(
          {
            user_id: user!.id,
            project_id: input.project_id,
            description: input.description ?? null,
            started_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single()
      if (error) throw error
      return data as ActiveTimer
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['active_timer'] }),
  })

  const stop = useMutation({
    mutationFn: async () => {
      if (!activeTimer) throw new Error('No active timer')

      const endedAt = new Date()
      const startedAt = new Date(activeTimer.started_at)
      const durationSeconds = Math.floor(
        (endedAt.getTime() - startedAt.getTime()) / 1000,
      )

      if (isMockMode) {
        mockStore.createTimeEntry({
          project_id: activeTimer.project_id,
          description: activeTimer.description ?? undefined,
          started_at: activeTimer.started_at,
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
          billable: true,
        })
        mockStore.deleteActiveTimer()
        return
      }

      const { error: entryError } = await supabase.from('time_entries').insert({
        user_id: user!.id,
        project_id: activeTimer.project_id,
        description: activeTimer.description,
        started_at: activeTimer.started_at,
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
        billable: true,
      })
      if (entryError) throw entryError

      const { error: timerError } = await supabase
        .from('active_timers')
        .delete()
        .eq('user_id', user!.id)
      if (timerError) throw timerError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_timer'] })
      queryClient.invalidateQueries({ queryKey: ['time_entries'] })
    },
  })

  return { activeTimer, elapsed, isLoading, start, stop }
}
