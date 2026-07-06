import { describe, expect, it } from 'vitest'
import { buildReportPdfData, reportPdfFilename } from '../reportPdf'
import { makeTimeEntry } from '../../test/fixtures'

describe('buildReportPdfData', () => {
  it('builds formatted report rows from entries', () => {
    const entry = makeTimeEntry({
      description: 'Feature work',
      duration_seconds: 7200,
      started_at: '2024-06-15T14:00:00.000Z',
      projects: {
        ...makeTimeEntry().projects,
        name: 'Website',
        clients: {
          ...makeTimeEntry().projects.clients,
          name: 'Acme Corp',
        },
      },
    })

    const report = buildReportPdfData({
      entries: [entry],
      segmentsByEntryId: new Map([
        [
          entry.id,
          [
            {
              entry_id: entry.id,
              project_id: entry.project_id,
              project_name: entry.projects.name,
              entry_description: entry.description,
              hours: 2,
              rate: 100,
              amount: 200,
              tier: 'standard',
            },
          ],
        ],
      ]),
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      clientLabel: 'All clients',
      projectLabel: 'All projects',
      billableOnly: false,
      totalSeconds: 7200,
      billableSeconds: 7200,
      revenue: 200,
      retainerSummaries: [],
    })

    expect(report.periodStart).toBe('06/01/2024')
    expect(report.periodEnd).toBe('06/30/2024')
    expect(report.totalHours).toBe('2.00')
    expect(report.revenue).toBe('$200.00')
    expect(report.entries).toHaveLength(1)
    expect(report.entries[0]).toMatchObject({
      clientName: 'Acme Corp',
      projectName: 'Website',
      description: 'Feature work',
      amount: '$200.00',
    })
  })
})

describe('reportPdfFilename', () => {
  it('uses the selected date range', () => {
    expect(reportPdfFilename('2024-06-01', '2024-06-30')).toBe(
      'time-report-2024-06-01-to-2024-06-30.pdf',
    )
  })
})
