import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isMockMode } from '../lib/config'
import { mockStore } from '../lib/mockStore'
import { supabase } from '../lib/supabase'
import { toIsoEndOfLocalDay, toIsoStartOfLocalDay } from '../lib/dateUtils'
import type { TimeEntryWithProject } from '../types/database'
import { useAuth } from './useAuth'

interface TimeEntryFilters {
  projectId?: string
  clientId?: string
  startDate?: string
  endDate?: string
  billableOnly?: boolean
  uninvoicedOnly?: boolean
}

export function useTimeEntries(filters: TimeEntryFilters = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['time_entries', user?.id, filters],
    queryFn: async () => {
      if (isMockMode) return mockStore.getTimeEntries(filters)
      let query = supabase
        .from('time_entries')
        .select(
          '*, projects(*, clients(id, name, default_hourly_rate, retainer_enabled, retainer_hours_per_month, retainer_hourly_rate, retainer_overage_rate))',
        )
        .order('started_at', { ascending: false })

      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId)
      }
      if (filters.startDate) {
        query = query.gte('started_at', toIsoStartOfLocalDay(filters.startDate))
      }
      if (filters.endDate) {
        query = query.lte('started_at', toIsoEndOfLocalDay(filters.endDate))
      }
      if (filters.billableOnly) {
        query = query.eq('billable', true)
      }
      if (filters.uninvoicedOnly) {
        query = query.is('invoice_id', null)
      }

      const { data, error } = await query
      if (error) throw error

      let entries = data as TimeEntryWithProject[]

      if (filters.clientId) {
        entries = entries.filter(
          (e) => e.projects.client_id === filters.clientId,
        )
      }

      return entries
    },
    enabled: !!user,
  })
}

export function useTimeEntryMutations() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['time_entries'] })

  const create = useMutation({
    mutationFn: async (input: {
      project_id: string
      description?: string
      started_at: string
      ended_at: string
      duration_seconds: number
      billable?: boolean
    }) => {
      if (isMockMode) return mockStore.createTimeEntry(input)
      const { data, error } = await supabase
        .from('time_entries')
        .insert({ ...input, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async (input: {
      id: string
      project_id: string
      description?: string
      started_at: string
      ended_at: string
      duration_seconds: number
      billable: boolean
    }) => {
      if (isMockMode) return mockStore.updateTimeEntry(input)
      const { id, ...rest } = input
      const { data, error } = await supabase
        .from('time_entries')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isMockMode) return mockStore.deleteTimeEntry(id)
      const { error } = await supabase.from('time_entries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
