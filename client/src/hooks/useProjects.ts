import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isMockMode } from '../lib/config'
import { mockStore } from '../lib/mockStore'
import { supabase } from '../lib/supabase'
import type { Project, ProjectWithClient } from '../types/database'
import { useAuth } from './useAuth'

export function useProjects(includeArchived = false) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['projects', user?.id, includeArchived],
    queryFn: async () => {
      if (isMockMode) return mockStore.getProjects(includeArchived)
      let query = supabase
        .from('projects')
        .select(
          '*, clients(id, name, default_hourly_rate, retainer_enabled, retainer_hours_per_month, retainer_hourly_rate, retainer_overage_rate)',
        )
        .order('name')

      if (!includeArchived) {
        query = query.eq('archived', false)
      }

      const { data, error } = await query
      if (error) throw error
      return data as ProjectWithClient[]
    },
    enabled: !!user,
  })
}

export function useProjectMutations() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] })

  const create = useMutation({
    mutationFn: async (input: {
      client_id: string
      name: string
      hourly_rate?: number | null
      billable?: boolean
    }) => {
      if (isMockMode) return mockStore.createProject(input)
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...input, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Project
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async (input: {
      id: string
      name: string
      hourly_rate?: number | null
      billable?: boolean
      archived?: boolean
    }) => {
      if (isMockMode) return mockStore.updateProject(input)
      const { id, ...rest } = input
      const { data, error } = await supabase
        .from('projects')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Project
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isMockMode) return mockStore.deleteProject(id)
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
