import { describe, expect, it } from 'vitest'

import {
  filterRows,
  getPageTotal,
  getYearsFromDates,
  matchesDateParts,
  paginateRows,
  sortRows,
} from '../tableUtils'

describe('tableUtils', () => {
  const rows = [
    { id: '1', name: 'Alpha', value: 3 },
    { id: '2', name: 'Beta', value: 1 },
    { id: '3', name: 'Gamma', value: 2 },
  ]

  it('filters rows by search function', () => {
    const filtered = filterRows(rows, 'bet', (row, query) =>
      row.name.toLowerCase().includes(query),
    )

    expect(filtered).toEqual([{ id: '2', name: 'Beta', value: 1 }])
  })

  it('sorts rows ascending and descending', () => {
    const ascending = sortRows(rows, 'value', 'asc', (row) => row.value)
    const descending = sortRows(rows, 'value', 'desc', (row) => row.value)

    expect(ascending.map((row) => row.id)).toEqual(['2', '3', '1'])
    expect(descending.map((row) => row.id)).toEqual(['1', '3', '2'])
  })

  it('paginates rows', () => {
    expect(paginateRows(rows, 1, 2).map((row) => row.id)).toEqual(['1', '2'])
    expect(paginateRows(rows, 2, 2).map((row) => row.id)).toEqual(['3'])
  })

  it('calculates page total', () => {
    expect(getPageTotal(0, 10)).toBe(1)
    expect(getPageTotal(11, 10)).toBe(2)
  })

  it('matches date parts when filters are set', () => {
    const filter = { year: '2024', month: '3', day: '15' }

    expect(matchesDateParts('2024-03-15T10:00:00.000Z', filter)).toBe(true)
    expect(matchesDateParts('2024-03-16T10:00:00.000Z', filter)).toBe(false)
    expect(matchesDateParts('2023-03-15T10:00:00.000Z', filter)).toBe(false)
  })

  it('matches partial date filters', () => {
    expect(
      matchesDateParts('2024-03-15T10:00:00.000Z', {
        year: '2024',
        month: '',
        day: '',
      }),
    ).toBe(true)
    expect(
      matchesDateParts('2024-03-15T10:00:00.000Z', {
        year: '',
        month: '3',
        day: '',
      }),
    ).toBe(true)
  })

  it('extracts unique years from dates', () => {
    expect(
      getYearsFromDates([
        '2024-01-01T00:00:00.000Z',
        '2023-06-01T00:00:00.000Z',
        '2024-12-01T00:00:00.000Z',
      ]),
    ).toEqual([2024, 2023])
  })
})
