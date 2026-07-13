import { describe, expect, it, vi } from 'vitest'
import {
  downloadCsv,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatHours,
  formatInvoiceHours,
  formatInvoiceLabel,
  formatInvoicePeriodDate,
  formatInvoiceRate,
  formatWebsiteHref,
  generateInvoiceNumber,
  resolveRate,
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

describe('formatInvoicePeriodDate', () => {
  it('formats dates as MM/DD/YYYY', () => {
    expect(formatInvoicePeriodDate('2026-05-01')).toBe('05/01/2026')
    expect(formatInvoicePeriodDate('2026-05-31')).toBe('05/31/2026')
  })
})

describe('formatInvoiceHours', () => {
  it('formats decimal hours as H:MM', () => {
    expect(formatInvoiceHours(15)).toBe('15:00')
    expect(formatInvoiceHours(8.9)).toBe('8:54')
  })
})

describe('formatInvoiceRate', () => {
  it('omits cents for whole-dollar rates', () => {
    expect(formatInvoiceRate(150)).toBe('$150')
    expect(formatInvoiceRate(175)).toBe('$175')
  })

  it('keeps cents for fractional rates', () => {
    expect(formatInvoiceRate(150.5)).toBe('$150.50')
  })
})

describe('formatInvoiceLabel', () => {
  it('formats invoice numbers with a hash prefix', () => {
    expect(formatInvoiceLabel('INV-2026-262')).toBe('INVOICE #262')
    expect(formatInvoiceLabel('INV-2026-001')).toBe('INVOICE #1')
  })
})

describe('formatWebsiteHref', () => {
  it('adds https when missing', () => {
    expect(formatWebsiteHref('www.ttobin.com')).toBe('https://www.ttobin.com')
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
