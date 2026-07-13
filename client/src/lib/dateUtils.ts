export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function localDateInputFromIso(isoDate: string): string {
  return toDateInputValue(new Date(isoDate))
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

export function getWeekStart(date: Date): Date {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function toIsoStartOfLocalDay(dateInput: string): string {
  return startOfDay(parseDateInputValue(dateInput)).toISOString()
}

export function toIsoEndOfLocalDay(dateInput: string): string {
  return endOfDay(parseDateInputValue(dateInput)).toISOString()
}

export function isWithinLocalDateRange(
  isoDate: string,
  startDate?: string,
  endDate?: string,
): boolean {
  const localDate = localDateInputFromIso(isoDate)
  if (startDate && localDate < startDate) return false
  if (endDate && localDate > endDate) return false
  return true
}
