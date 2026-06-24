import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isMockMode } from '../lib/config'
import { mockStore } from '../lib/mockStore'
import { supabase } from '../lib/supabase'
import type { Client } from '../types/database'
import { useAuth } from './useAuth'

export function useClients() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (isMockMode) return mockStore.getClients()
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Client[]
    },
    enabled: !!user,
  })
}

export function useClientMutations() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['clients'] })

  const create = useMutation({
    mutationFn: async (input: {
      name: string
      email?: string
      default_hourly_rate: number
      retainer_enabled?: boolean
      retainer_hours_per_month?: number | null
      retainer_hourly_rate?: number | null
      retainer_overage_rate?: number | null
    }) => {
      if (isMockMode) return mockStore.createClient(input)
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...input, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Client
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async (input: {
      id: string
      name: string
      email?: string
      default_hourly_rate: number
      retainer_enabled?: boolean
      retainer_hours_per_month?: number | null
      retainer_hourly_rate?: number | null
      retainer_overage_rate?: number | null
    }) => {
      if (isMockMode) return mockStore.updateClient(input)
      const { id, ...rest } = input
      const { data, error } = await supabase
        .from('clients')
        .update(rest)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Client
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isMockMode) return mockStore.deleteClient(id)
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
