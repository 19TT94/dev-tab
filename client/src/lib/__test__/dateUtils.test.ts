import { describe, expect, it } from 'vitest'
import {
  endOfDay,
  getWeekStart,
  isWithinLocalDateRange,
  localDateInputFromIso,
  parseDateInputValue,
  startOfDay,
  toDateInputValue,
  toIsoEndOfLocalDay,
  toIsoStartOfLocalDay,
} from '../dateUtils'

describe('toDateInputValue', () => {
  it('returns the local calendar date as YYYY-MM-DD', () => {
    expect(toDateInputValue(new Date(2024, 5, 15, 23, 30))).toBe('2024-06-15')
  })
})

describe('parseDateInputValue', () => {
  it('parses YYYY-MM-DD in local time', () => {
    const date = parseDateInputValue('2024-06-15')
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(5)
    expect(date.getDate()).toBe(15)
  })
})

describe('localDayBounds', () => {
  it('includes midday within the local day range', () => {
    const dateInput = '2024-06-15'
    const start = toIsoStartOfLocalDay(dateInput)
    const end = toIsoEndOfLocalDay(dateInput)
    const midday = parseDateInputValue(dateInput)
    midday.setHours(12, 0, 0, 0)

    expect(midday.toISOString() >= start).toBe(true)
    expect(midday.toISOString() <= end).toBe(true)
  })
})

describe('localDateInputFromIso', () => {
  it('uses the local calendar date instead of the UTC date prefix', () => {
    const localMidnight = new Date(2024, 5, 15, 0, 0, 0)
    expect(localDateInputFromIso(localMidnight.toISOString())).toBe('2024-06-15')
  })
})

describe('isWithinLocalDateRange', () => {
  it('matches entries on the local calendar day', () => {
    const localMorning = new Date(2024, 5, 15, 9, 0, 0)

    expect(
      isWithinLocalDateRange(
        localMorning.toISOString(),
        '2024-06-15',
        '2024-06-15',
      ),
    ).toBe(true)
    expect(
      isWithinLocalDateRange(
        localMorning.toISOString(),
        '2024-06-16',
        '2024-06-16',
      ),
    ).toBe(false)
  })
})

describe('startOfDay / endOfDay', () => {
  it('sets time to start and end of day', () => {
    const date = new Date(2024, 5, 15, 14, 30, 45, 123)
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

describe('getWeekStart', () => {
  it('returns Monday for a mid-week date', () => {
    const wednesday = new Date(2026, 6, 8)
    expect(toDateInputValue(getWeekStart(wednesday))).toBe('2026-07-06')
  })

  it('returns the same Monday when the date is already Monday', () => {
    const monday = new Date(2026, 6, 6)
    expect(toDateInputValue(getWeekStart(monday))).toBe('2026-07-06')
  })

  it('returns the prior Monday for Sunday', () => {
    const sunday = new Date(2026, 6, 12)
    expect(toDateInputValue(getWeekStart(sunday))).toBe('2026-07-06')
  })
})
