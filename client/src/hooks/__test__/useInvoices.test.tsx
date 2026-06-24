import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  useInvoices,
  useInvoiceMutations,
} from '../useInvoices'
import { useClients } from '../useClients'
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

describe('useInvoices', () => {
  it('fetches invoices in mock mode', async () => {
    const { result } = renderHook(() => useInvoices(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})

describe('useInvoiceMutations', () => {
  it('creates and deletes an invoice', async () => {
    const { result } = renderHook(
      () => ({
        clients: useClients(),
        projects: useProjects(true),
        invoices: useInvoices(),
        mutations: useInvoiceMutations(),
      }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.clients.isSuccess).toBe(true))
    const client = result.current.clients.data![0]
    const project = result.current.projects.data!.find(
      (p) => p.client_id === client.id,
    )!

    const invoice = await result.current.mutations.create.mutateAsync({
      client_id: client.id,
      period_start: '2024-07-01',
      period_end: '2024-07-31',
      line_items: [
        {
          project_id: project.id,
          project_name: project.name,
          description: project.name,
          hours: 2,
          rate: 100,
          amount: 200,
          time_entry_ids: [],
        },
      ],
    })

    await waitFor(() =>
      expect(
        result.current.invoices.data?.some((i) => i.id === invoice.id),
      ).toBe(true),
    )

    await result.current.mutations.remove.mutateAsync(invoice.id)
    await waitFor(() =>
      expect(
        result.current.invoices.data?.some((i) => i.id === invoice.id),
      ).toBe(false),
    )
  })
})
