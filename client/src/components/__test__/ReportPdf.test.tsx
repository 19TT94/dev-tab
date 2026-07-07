import { describe, expect, it, vi, beforeEach } from 'vitest'
import { downloadReportPdf } from '../ReportPdf'
import type { ReportPdfData } from '../../lib/reportPdf'

vi.mock('@react-pdf/renderer', () => ({
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (styles: unknown) => styles },
  pdf: () => ({
    toBlob: async () => new Blob(['pdf'], { type: 'application/pdf' }),
  }),
}))

function makeReport(): ReportPdfData {
  return {
    periodStart: '06/01/2024',
    periodEnd: '06/30/2024',
    clientLabel: 'All clients',
    projectLabel: 'All projects',
    billableOnly: false,
    totalHours: '2.00',
    billableHours: '2.00',
    revenue: '$200.00',
    retainerSummaries: [],
    entries: [],
  }
}

describe('downloadReportPdf', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  it('creates and clicks a download link', async () => {
    const click = vi.fn()
    const link = document.createElement('a')
    link.click = click
    vi.spyOn(document, 'createElement').mockReturnValue(link)

    await downloadReportPdf(makeReport(), '2024-06-01', '2024-06-30')

    expect(click).toHaveBeenCalledOnce()
    expect(link.download).toBe('time-report-2024-06-01-to-2024-06-30.pdf')
  })
})
