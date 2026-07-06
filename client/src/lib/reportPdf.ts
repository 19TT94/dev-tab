import type { BilledSegment, RetainerUsageSummary } from './billing'
import { entryBillableAmount } from './billing'
import type { TimeEntryWithProject } from '../types/database'
import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatHours,
} from './utils'

function formatReportPeriodDate(date: string): string {
  const [year, month, day] = date.slice(0, 10).split('-')
  return `${month}/${day}/${year}`
}

export interface ReportPdfEntry {
  id: string
  clientName: string
  projectName: string
  description: string
  date: string
  duration: string
  amount: string
}

export interface ReportPdfData {
  periodStart: string
  periodEnd: string
  clientLabel: string
  projectLabel: string
  billableOnly: boolean
  totalHours: string
  billableHours: string
  revenue: string
  retainerSummaries: RetainerUsageSummary[]
  entries: ReportPdfEntry[]
}

export function buildReportPdfData(input: {
  entries: TimeEntryWithProject[]
  segmentsByEntryId: Map<string, BilledSegment[]>
  startDate: string
  endDate: string
  clientLabel: string
  projectLabel: string
  billableOnly: boolean
  totalSeconds: number
  billableSeconds: number
  revenue: number
  retainerSummaries: RetainerUsageSummary[]
}): ReportPdfData {
  const {
    entries,
    segmentsByEntryId,
    startDate,
    endDate,
    clientLabel,
    projectLabel,
    billableOnly,
    totalSeconds,
    billableSeconds,
    revenue,
    retainerSummaries,
  } = input

  return {
    periodStart: formatReportPeriodDate(startDate),
    periodEnd: formatReportPeriodDate(endDate),
    clientLabel,
    projectLabel,
    billableOnly,
    totalHours: formatHours(totalSeconds),
    billableHours: formatHours(billableSeconds),
    revenue: formatCurrency(revenue),
    retainerSummaries,
    entries: entries.map((entry) => {
      const segments = segmentsByEntryId.get(entry.id) ?? []
      const amount = entry.billable
        ? entryBillableAmount(entry, segments)
        : 0

      return {
        id: entry.id,
        clientName: entry.projects.clients.name,
        projectName: entry.projects.name,
        description: entry.description?.trim() ?? '',
        date: formatDate(entry.started_at),
        duration: formatDuration(entry.duration_seconds),
        amount: entry.billable ? formatCurrency(amount) : '—',
      }
    }),
  }
}

export function reportPdfFilename(startDate: string, endDate: string): string {
  return `time-report-${startDate}-to-${endDate}.pdf`
}
