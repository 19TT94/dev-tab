import type {
  Client,
  DraftLineItem,
  TimeEntryWithProject,
} from '../types/database'
import { resolveRate } from './utils'

export type ClientBillingInfo = Pick<
  Client,
  | 'retainer_enabled'
  | 'retainer_hours_per_month'
  | 'retainer_hourly_rate'
  | 'retainer_overage_rate'
  | 'default_hourly_rate'
>

export interface BilledSegment {
  entry_id: string
  project_id: string
  project_name: string
  hours: number
  rate: number
  amount: number
  tier: 'standard' | 'retainer' | 'overage'
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function roundHours(value: number): number {
  return Math.round(value * 100) / 100
}

export function hasRetainerBilling(client: ClientBillingInfo): boolean {
  return (
    client.retainer_enabled &&
    client.retainer_hours_per_month != null &&
    client.retainer_hours_per_month > 0 &&
    client.retainer_hourly_rate != null &&
    client.retainer_overage_rate != null
  )
}

export function billTimeEntries(
  entries: TimeEntryWithProject[],
  client?: ClientBillingInfo,
): BilledSegment[] {
  const billable = entries.filter((entry) => entry.billable)
  if (billable.length === 0) return []

  if (client && hasRetainerBilling(client)) {
    return billWithRetainer(billable, client)
  }

  return billable.map((entry) => {
    const hours = entry.duration_seconds / 3600
    const rate = resolveRate(
      entry.projects.hourly_rate,
      entry.projects.clients.default_hourly_rate,
    )

    return {
      entry_id: entry.id,
      project_id: entry.project_id,
      project_name: entry.projects.name,
      hours,
      rate,
      amount: hours * rate,
      tier: 'standard' as const,
    }
  })
}

function billWithRetainer(
  entries: TimeEntryWithProject[],
  client: ClientBillingInfo,
): BilledSegment[] {
  const retainerHours = client.retainer_hours_per_month!
  const retainerRate = client.retainer_hourly_rate!
  const overageRate = client.retainer_overage_rate!
  let retainerRemaining = retainerHours
  const segments: BilledSegment[] = []

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  )

  for (const entry of sorted) {
    const totalHours = entry.duration_seconds / 3600
    const retainerPortion = Math.min(totalHours, retainerRemaining)
    const overagePortion = totalHours - retainerPortion
    retainerRemaining -= retainerPortion

    if (retainerPortion > 0) {
      segments.push({
        entry_id: entry.id,
        project_id: entry.project_id,
        project_name: entry.projects.name,
        hours: retainerPortion,
        rate: retainerRate,
        amount: retainerPortion * retainerRate,
        tier: 'retainer',
      })
    }

    if (overagePortion > 0) {
      segments.push({
        entry_id: entry.id,
        project_id: entry.project_id,
        project_name: entry.projects.name,
        hours: overagePortion,
        rate: overageRate,
        amount: overagePortion * overageRate,
        tier: 'overage',
      })
    }
  }

  return segments
}

export function segmentsToLineItems(segments: BilledSegment[]): DraftLineItem[] {
  const groups = new Map<string, DraftLineItem>()

  for (const segment of segments) {
    const key = `${segment.project_id}:${segment.rate}:${segment.tier}`
    const description =
      segment.tier === 'retainer'
        ? `${segment.project_name} — retainer`
        : segment.tier === 'overage'
          ? `${segment.project_name} — overage`
          : segment.project_name

    const existing = groups.get(key)
    if (existing) {
      existing.hours += segment.hours
      existing.amount += segment.amount
      if (!existing.time_entry_ids.includes(segment.entry_id)) {
        existing.time_entry_ids.push(segment.entry_id)
      }
    } else {
      groups.set(key, {
        project_id: segment.project_id,
        project_name: segment.project_name,
        description,
        hours: segment.hours,
        rate: segment.rate,
        amount: segment.amount,
        time_entry_ids: [segment.entry_id],
      })
    }
  }

  return Array.from(groups.values()).map((item) => ({
    ...item,
    hours: roundHours(item.hours),
    amount: roundMoney(item.amount),
  }))
}

export function groupEntriesIntoLineItems(
  entries: TimeEntryWithProject[],
  client?: ClientBillingInfo,
): DraftLineItem[] {
  return segmentsToLineItems(billTimeEntries(entries, client))
}

export function entryBillableAmount(
  entry: TimeEntryWithProject,
  segments: BilledSegment[],
): number {
  return roundMoney(
    segments
      .filter((segment) => segment.entry_id === entry.id)
      .reduce((sum, segment) => sum + segment.amount, 0),
  )
}

export function totalRevenueFromEntries(
  entries: TimeEntryWithProject[],
): number {
  const byClient = new Map<string, TimeEntryWithProject[]>()

  for (const entry of entries) {
    if (!entry.billable) continue
    const clientId = entry.projects.client_id
    const group = byClient.get(clientId) ?? []
    group.push(entry)
    byClient.set(clientId, group)
  }

  let revenue = 0
  for (const clientEntries of byClient.values()) {
    const client = clientEntries[0].projects.clients
    revenue += billTimeEntries(clientEntries, client).reduce(
      (sum, segment) => sum + segment.amount,
      0,
    )
  }

  return roundMoney(revenue)
}

export function billEntriesForReport(
  entries: TimeEntryWithProject[],
): Map<string, BilledSegment[]> {
  const byClient = new Map<string, TimeEntryWithProject[]>()

  for (const entry of entries) {
    if (!entry.billable) continue
    const clientId = entry.projects.client_id
    const group = byClient.get(clientId) ?? []
    group.push(entry)
    byClient.set(clientId, group)
  }

  const segmentsByEntryId = new Map<string, BilledSegment[]>()

  for (const clientEntries of byClient.values()) {
    const client = clientEntries[0].projects.clients
    for (const segment of billTimeEntries(clientEntries, client)) {
      const existing = segmentsByEntryId.get(segment.entry_id) ?? []
      existing.push(segment)
      segmentsByEntryId.set(segment.entry_id, existing)
    }
  }

  return segmentsByEntryId
}
