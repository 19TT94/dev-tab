import { INVOICE_NUMBER_START, isMockMode } from './config'
import { mockStore } from './mockStore'
import { supabase } from './supabase'

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function formatHours(seconds: number): string {
  return (seconds / 3600).toFixed(2)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function resolveRate(
  projectRate: number | null,
  clientDefaultRate: number,
): number {
  return projectRate ?? clientDefaultRate
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function generateInvoiceNumber(userId: string): Promise<string> {
  if (isMockMode) return mockStore.generateInvoiceNumber()

  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`

  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  if (!data?.length) {
    return `${prefix}${String(INVOICE_NUMBER_START).padStart(3, '0')}`
  }

  const last = data[0].invoice_number
  const num = parseInt(last.replace(prefix, ''), 10)
  return `${prefix}${String(num + 1).padStart(3, '0')}`
}
