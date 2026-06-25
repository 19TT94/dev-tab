export type SortDirection = 'asc' | 'desc'

export interface DatePartsFilter {
  year: string
  month: string
  day: string
}

export function matchesDateParts(
  isoDate: string,
  filter: DatePartsFilter,
): boolean {
  if (!filter.year && !filter.month && !filter.day) return true

  const date = new Date(isoDate)
  if (filter.year && String(date.getFullYear()) !== filter.year) return false
  if (filter.month && String(date.getMonth() + 1) !== filter.month) return false
  if (filter.day && String(date.getDate()) !== filter.day) return false

  return true
}

export function getYearsFromDates(dates: string[]): number[] {
  const years = new Set(dates.map((date) => new Date(date).getFullYear()))
  return [...years].sort((a, b) => b - a)
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  new Date(2000, index, 1).toLocaleString('en-US', { month: 'long' }),
)

export function getMonthOptions(): { value: string; label: string }[] {
  return MONTH_LABELS.map((label, index) => ({
    value: String(index + 1),
    label,
  }))
}

export function getDayOptions(): { value: string; label: string }[] {
  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1
    return { value: String(day), label: String(day) }
  })
}

export function filterRows<T>(
  rows: T[],
  query: string,
  searchFn: (row: T, normalizedQuery: string) => boolean,
): T[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows
  return rows.filter((row) => searchFn(row, normalized))
}

export function sortRows<T>(
  rows: T[],
  sortKey: string,
  sortDirection: SortDirection,
  getValue: (row: T) => string | number,
): T[] {
  const sorted = [...rows].sort((a, b) => {
    const aVal = getValue(a)
    const bVal = getValue(b)
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  })
  return sortDirection === 'asc' ? sorted : sorted.reverse()
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function getPageTotal(rowCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(rowCount / pageSize))
}
