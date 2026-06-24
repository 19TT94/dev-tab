import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isMockMode } from '../lib/config'
import { mockStore } from '../lib/mockStore'
import { supabase } from '../lib/supabase'
import type { DraftLineItem, InvoiceWithDetails } from '../types/database'
import { generateInvoiceNumber } from '../lib/utils'
import { useAuth } from './useAuth'

export function useInvoices() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (isMockMode) return mockStore.getInvoices()
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useInvoice(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (isMockMode) return mockStore.getInvoice(id!)
      const { data, error } = await supabase
        .from('invoices')
        .select(
          '*, clients(*), invoice_line_items(*, projects(id, name))',
        )
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as InvoiceWithDetails
    },
    enabled: !!user && !!id,
  })
}

export function useInvoiceMutations() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    queryClient.invalidateQueries({ queryKey: ['time_entries'] })
  }

  const create = useMutation({
    mutationFn: async (input: {
      client_id: string
      period_start: string
      period_end: string
      notes?: string
      line_items: DraftLineItem[]
    }) => {
      if (isMockMode) return mockStore.createInvoice(input)

      const invoiceNumber = await generateInvoiceNumber(user!.id)
      const subtotal = input.line_items.reduce((sum, li) => sum + li.amount, 0)

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user!.id,
          client_id: input.client_id,
          invoice_number: invoiceNumber,
          period_start: input.period_start,
          period_end: input.period_end,
          status: 'draft',
          subtotal,
          notes: input.notes ?? null,
        })
        .select()
        .single()
      if (invoiceError) throw invoiceError

      const lineItems = input.line_items.map((li) => ({
        invoice_id: invoice.id,
        project_id: li.project_id,
        description: li.description,
        hours: li.hours,
        rate: li.rate,
        amount: li.amount,
      }))

      const { error: lineError } = await supabase
        .from('invoice_line_items')
        .insert(lineItems)
      if (lineError) throw lineError

      const allEntryIds = input.line_items.flatMap((li) => li.time_entry_ids)
      if (allEntryIds.length > 0) {
        const { error: entryError } = await supabase
          .from('time_entries')
          .update({ invoice_id: invoice.id })
          .in('id', allEntryIds)
        if (entryError) throw entryError
      }

      return invoice
    },
    onSuccess: invalidate,
  })

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: 'draft' | 'sent' | 'paid' }) => {
      if (isMockMode) return mockStore.updateInvoiceStatus(input)
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: input.status })
        .eq('id', input.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isMockMode) return mockStore.deleteInvoice(id)
      await supabase
        .from('time_entries')
        .update({ invoice_id: null })
        .eq('invoice_id', id)

      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, updateStatus, remove }
}
