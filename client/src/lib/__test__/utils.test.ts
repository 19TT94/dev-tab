import { describe, expect, it, vi } from 'vitest'
import {
  downloadCsv,
  endOfDay,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatHours,
  generateInvoiceNumber,
  resolveRate,
  startOfDay,
  toDateInputValue,
} from '../utils'
import { INVOICE_NUMBER_START } from '../config'

describe('formatDuration', () => {
  it('formats seconds as HH:MM:SS', () => {
    expect(formatDuration(0)).toBe('00:00:00')
    expect(formatDuration(3661)).toBe('01:01:01')
    expect(formatDuration(9000)).toBe('02:30:00')
  })
})

describe('formatHours', () => {
  it('converts seconds to decimal hours', () => {
    expect(formatHours(3600)).toBe('1.00')
    expect(formatHours(5400)).toBe('1.50')
  })
})

describe('formatCurrency', () => {
  it('formats USD amounts', () => {
    expect(formatCurrency(100)).toBe('$100.00')
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })
})

describe('formatDate', () => {
  it('formats ISO date strings', () => {
    expect(formatDate('2024-06-15T12:00:00.000Z')).toMatch(/Jun 15, 2024/)
  })
})

describe('formatDateTime', () => {
  it('formats ISO date strings with time', () => {
    const result = formatDateTime('2024-06-15T14:30:00.000Z')
    expect(result).toMatch(/Jun 15, 2024/)
    expect(result).toMatch(/\d/)
  })
})

describe('toDateInputValue', () => {
  it('returns YYYY-MM-DD', () => {
    expect(toDateInputValue(new Date('2024-06-15T12:00:00.000Z'))).toBe(
      '2024-06-15',
    )
  })
})

describe('startOfDay / endOfDay', () => {
  it('sets time to start and end of day', () => {
    const date = new Date('2024-06-15T14:30:45.123Z')
    const start = startOfDay(date)
    const end = endOfDay(date)

    expect(start.getHours()).toBe(0)
    expect(start.getMinutes()).toBe(0)
    expect(start.getSeconds()).toBe(0)

    expect(end.getHours()).toBe(23)
    expect(end.getMinutes()).toBe(59)
    expect(end.getSeconds()).toBe(59)
  })
})

describe('resolveRate', () => {
  it('uses project rate when set', () => {
    expect(resolveRate(125, 100)).toBe(125)
  })

  it('falls back to client default rate', () => {
    expect(resolveRate(null, 100)).toBe(100)
  })
})

describe('downloadCsv', () => {
  it('creates and clicks a download link', () => {
    const click = vi.fn()
    const link = document.createElement('a')
    link.click = click
    vi.spyOn(document, 'createElement').mockReturnValue(link)
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:url')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    downloadCsv('test.csv', [
      ['Name', 'Amount'],
      ['Acme', '100'],
    ])

    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:url')
    expect(link.download).toBe('test.csv')
  })
})

describe('generateInvoiceNumber', () => {
  it('generates first invoice number in mock mode', async () => {
    const number = await generateInvoiceNumber('mock-user-id')
    const year = new Date().getFullYear()
    const start = String(INVOICE_NUMBER_START).padStart(3, '0')
    expect(number).toBe(`INV-${year}-${start}`)
  })
})
