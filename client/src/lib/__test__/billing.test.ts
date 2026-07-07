import { describe, expect, it } from 'vitest'
import {
  billEntriesForReport,
  billTimeEntries,
  entryBillableAmount,
  entryHasOverage,
  entryOverageSeconds,
  emptyRetainerSummary,
  groupEntriesIntoLineItems,
  hasRetainerBilling,
  isOverageLineItem,
  segmentsToLineItems,
  summaryLineItemDescription,
  summarizeRetainerUsage,
  totalRevenueFromEntries,
} from '../billing'
import { makeRetainerClient, makeTimeEntry } from '../../test/fixtures'

describe('hasRetainerBilling', () => {
  it('returns true when retainer is fully configured', () => {
    expect(hasRetainerBilling(makeRetainerClient())).toBe(true)
  })

  it('returns false when retainer is disabled', () => {
    expect(
      hasRetainerBilling(
        makeRetainerClient({ retainer_enabled: false }),
      ),
    ).toBe(false)
  })

  it('returns false when retainer hours are missing', () => {
    expect(
      hasRetainerBilling(
        makeRetainerClient({ retainer_hours_per_month: null }),
      ),
    ).toBe(false)
  })
})

describe('billTimeEntries', () => {
  it('returns empty array for no billable entries', () => {
    expect(
      billTimeEntries([
        makeTimeEntry({ billable: false }),
      ]),
    ).toEqual([])
  })

  it('bills standard rate using client default', () => {
    const segments = billTimeEntries([makeTimeEntry()])
    expect(segments).toHaveLength(1)
    expect(segments[0]).toMatchObject({
      hours: 1,
      rate: 100,
      amount: 100,
      tier: 'standard',
    })
  })

  it('uses project hourly rate when set', () => {
    const entry = makeTimeEntry()
    entry.projects.hourly_rate = 150
    const segments = billTimeEntries([entry])
    expect(segments[0].rate).toBe(150)
    expect(segments[0].amount).toBe(150)
  })

  it('splits retainer and overage across entries chronologically', () => {
    const client = makeRetainerClient({ retainer_hours_per_month: 1 })
    const entry1 = makeTimeEntry({
      id: 'entry-1',
      started_at: '2024-01-01T09:00:00.000Z',
      duration_seconds: 3600,
    })
    const entry2 = makeTimeEntry({
      id: 'entry-2',
      started_at: '2024-01-01T11:00:00.000Z',
      duration_seconds: 7200,
    })

    const segments = billTimeEntries([entry2, entry1], client)
    const retainer = segments.filter((s) => s.tier === 'retainer')
    const overage = segments.filter((s) => s.tier === 'overage')

    expect(retainer).toHaveLength(1)
    expect(overage).toHaveLength(1)
    expect(retainer.reduce((sum, s) => sum + s.hours, 0)).toBe(1)
    expect(overage[0].hours).toBe(2)
    expect(overage[0].rate).toBe(150)
  })
})

describe('segmentsToLineItems', () => {
  it('groups segments by project, rate, and tier', () => {
    const segments = billTimeEntries([
      makeTimeEntry({ id: 'e1', duration_seconds: 1800 }),
      makeTimeEntry({
        id: 'e2',
        started_at: '2024-01-01T11:00:00.000Z',
        duration_seconds: 1800,
      }),
    ])

    const items = segmentsToLineItems(segments)
    expect(items).toHaveLength(1)
    expect(items[0].hours).toBe(1)
    expect(items[0].time_entry_ids).toEqual(['e1', 'e2'])
    expect(items[0].description).toBe('')
  })
})

describe('summaryLineItemDescription', () => {
  it('returns tier labels for retainer and overage', () => {
    expect(summaryLineItemDescription('standard')).toBe('')
    expect(summaryLineItemDescription('retainer')).toBe('Retainer')
    expect(summaryLineItemDescription('overage')).toBe('Overage')
  })
})

describe('groupEntriesIntoLineItems', () => {
  it('produces draft line items from entries', () => {
    const items = groupEntriesIntoLineItems([makeTimeEntry()])
    expect(items[0]).toMatchObject({
      project_name: 'Test Project',
      hours: 1,
      rate: 100,
      amount: 100,
      tier: 'standard',
      description: '',
    })
  })

  it('uses summary descriptions for overage line items', () => {
    const client = makeRetainerClient({ retainer_hours_per_month: 0.01 })
    const entry = makeTimeEntry({
      duration_seconds: 3600,
      description: 'Emergency fix',
    })
    const items = groupEntriesIntoLineItems([entry], client)
    const overageItem = items.find((item) => item.tier === 'overage')
    expect(overageItem).toBeDefined()
    expect(overageItem!.tier).toBe('overage')
    expect(overageItem!.description).toBe('Overage')
  })
})

describe('entryBillableAmount', () => {
  it('sums segment amounts for an entry', () => {
    const client = makeRetainerClient({ retainer_hours_per_month: 0.5 })
    const entry = makeTimeEntry({ duration_seconds: 7200 })
    const segments = billTimeEntries([entry], client)
    expect(entryBillableAmount(entry, segments)).toBe(275)
  })
})

describe('entryHasOverage', () => {
  it('returns true when an entry has overage segments', () => {
    const client = makeRetainerClient({ retainer_hours_per_month: 0.01 })
    const entry = makeTimeEntry()
    const segments = billTimeEntries([entry], client)
    expect(entryHasOverage(segments)).toBe(true)
  })

  it('returns false for standard billing', () => {
    const segments = billTimeEntries([makeTimeEntry()])
    expect(entryHasOverage(segments)).toBe(false)
  })
})

describe('entryOverageSeconds', () => {
  it('returns overage duration in seconds', () => {
    const client = makeRetainerClient({ retainer_hours_per_month: 0.5 })
    const entry = makeTimeEntry({ duration_seconds: 7200 })
    const segments = billTimeEntries([entry], client)
    expect(entryOverageSeconds(segments)).toBe(5400)
  })
})

describe('isOverageLineItem', () => {
  it('detects overage by tier', () => {
    expect(isOverageLineItem({ description: 'Project', tier: 'overage' })).toBe(
      true,
    )
  })

  it('detects overage by description suffix', () => {
    expect(
      isOverageLineItem({ description: 'Website Redesign — overage' }),
    ).toBe(true)
  })

  it('detects overage by summary description', () => {
    expect(isOverageLineItem({ description: 'Overage' })).toBe(true)
  })
})

describe('summarizeRetainerUsage', () => {
  it('summarizes retainer and overage hours for a client', () => {
    const client = makeRetainerClient({ retainer_hours_per_month: 5 })
    const entry1 = makeTimeEntry({
      id: 'entry-1',
      started_at: '2024-01-01T09:00:00.000Z',
      duration_seconds: 4 * 3600,
      projects: {
        ...makeTimeEntry().projects,
        clients: {
          ...makeTimeEntry().projects.clients,
          ...client,
          id: 'client-1',
          name: 'Retainer Co',
        },
      },
    })
    const entry2 = makeTimeEntry({
      id: 'entry-2',
      started_at: '2024-01-02T09:00:00.000Z',
      duration_seconds: 3 * 3600,
      projects: entry1.projects,
    })

    const summaries = summarizeRetainerUsage([entry1, entry2])
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toMatchObject({
      clientName: 'Retainer Co',
      allowanceHours: 5,
      retainerHoursUsed: 5,
      overageHoursUsed: 2,
      retainerHoursRemaining: 0,
    })
  })

  it('returns an empty summary for retainer clients with no billable hours', () => {
    const client = makeRetainerClient()
    const summary = emptyRetainerSummary({
      id: 'client-1',
      name: 'Retainer Co',
      ...client,
    })

    expect(summary).toMatchObject({
      allowanceHours: 10,
      retainerHoursUsed: 0,
      overageHoursUsed: 0,
      retainerHoursRemaining: 10,
    })
  })
})

describe('totalRevenueFromEntries', () => {
  it('sums billable revenue across clients', () => {
    const entry1 = makeTimeEntry({ duration_seconds: 3600 })
    const entry2 = makeTimeEntry({
      id: 'entry-2',
      projects: {
        ...makeTimeEntry().projects,
        client_id: 'client-2',
        clients: {
          ...makeTimeEntry().projects.clients,
          id: 'client-2',
          default_hourly_rate: 50,
        },
      },
      duration_seconds: 3600,
    })

    expect(totalRevenueFromEntries([entry1, entry2])).toBe(150)
  })

  it('ignores non-billable entries', () => {
    expect(
      totalRevenueFromEntries([
        makeTimeEntry({ billable: false }),
      ]),
    ).toBe(0)
  })
})

describe('billEntriesForReport', () => {
  it('maps entry ids to billed segments', () => {
    const map = billEntriesForReport([makeTimeEntry()])
    expect(map.get('entry-1')).toHaveLength(1)
    expect(map.get('entry-1')![0].amount).toBe(100)
  })
})
