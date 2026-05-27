import { describe, it, expect } from 'vitest'
import { isWorkday, workdays, workdayRatio } from '../../../src/lib/workdays'
import type { CalendarEvent, WorkweekConfig } from '../../../src/types'

// Standard Mon-Fri workweek used in most tests
const STANDARD: WorkweekConfig = {
  mon: true, tue: true, wed: true, thu: true, fri: true,
  sat: false, sun: false,
}

const NON_WORK_EVENT: CalendarEvent = {
  id: 'c1',
  name: 'Shutdown',
  start: '2024-01-03',
  end: '2024-01-03',
  type: 'owner_shutdown',
  classification: 'non_work',
  notes: '',
}

const ADVISORY_EVENT: CalendarEvent = {
  id: 'c2',
  name: 'Advisory',
  start: '2024-01-03',
  end: '2024-01-03',
  type: 'weather_window',
  classification: 'advisory_only',
  notes: '',
}

// 2024-01-01 is a Monday — known reference dates:
// Mon 2024-01-01, Tue 2024-01-02, Wed 2024-01-03, Thu 2024-01-04,
// Fri 2024-01-05, Sat 2024-01-06, Sun 2024-01-07, Mon 2024-01-08

// ─── isWorkday ────────────────────────────────────────────────────────────────

describe('isWorkday', () => {
  it('Monday is a workday', () => {
    expect(isWorkday('2024-01-01', STANDARD, [])).toBe(true)
  })

  it('Friday is a workday', () => {
    expect(isWorkday('2024-01-05', STANDARD, [])).toBe(true)
  })

  it('Saturday is not a workday', () => {
    expect(isWorkday('2024-01-06', STANDARD, [])).toBe(false)
  })

  it('Sunday is not a workday', () => {
    expect(isWorkday('2024-01-07', STANDARD, [])).toBe(false)
  })

  it('a holiday overrides a Monday', () => {
    expect(isWorkday('2024-01-01', STANDARD, ['2024-01-01'])).toBe(false)
  })

  it('non_work calendar events mark a weekday as non-work', () => {
    expect(isWorkday('2024-01-03', STANDARD, [], [NON_WORK_EVENT])).toBe(false)
  })

  it('advisory_only calendar events do not change workday status', () => {
    expect(isWorkday('2024-01-03', STANDARD, [], [ADVISORY_EVENT])).toBe(true)
  })

  it('Saturday can be a workday with custom workweek', () => {
    const sixDay: WorkweekConfig = { ...STANDARD, sat: true }
    expect(isWorkday('2024-01-06', sixDay, [])).toBe(true)
  })

  it('all-false workweek: every day returns false', () => {
    const none: WorkweekConfig = {
      mon: false, tue: false, wed: false, thu: false,
      fri: false, sat: false, sun: false,
    }
    expect(isWorkday('2024-01-01', none, [])).toBe(false)
  })
})

// ─── workdays (count) ─────────────────────────────────────────────────────────

describe('workdays', () => {
  it('counts Mon-Fri as 5 workdays', () => {
    expect(workdays('2024-01-01', '2024-01-05', STANDARD, [])).toBe(5)
  })

  it('counts Mon-Sun as 5 workdays (skips weekend)', () => {
    expect(workdays('2024-01-01', '2024-01-07', STANDARD, [])).toBe(5)
  })

  it('counts Mon-Mon (next week) as 6 workdays', () => {
    expect(workdays('2024-01-01', '2024-01-08', STANDARD, [])).toBe(6)
  })

  it('returns 0 when start > end', () => {
    expect(workdays('2024-01-05', '2024-01-01', STANDARD, [])).toBe(0)
  })

  it('returns 1 for a single workday', () => {
    expect(workdays('2024-01-01', '2024-01-01', STANDARD, [])).toBe(1)
  })

  it('returns 0 for a single weekend day', () => {
    expect(workdays('2024-01-06', '2024-01-06', STANDARD, [])).toBe(0)
  })

  it('subtracts holidays from the count', () => {
    // Mon-Fri with holiday on Wednesday = 4 workdays
    expect(workdays('2024-01-01', '2024-01-05', STANDARD, ['2024-01-03'])).toBe(4)
  })

  it('subtracts non_work calendar event days from count', () => {
    expect(workdays('2024-01-01', '2024-01-05', STANDARD, [], [NON_WORK_EVENT])).toBe(4)
  })

  it('ignores advisory_only events in workday count', () => {
    expect(workdays('2024-01-01', '2024-01-05', STANDARD, [], [ADVISORY_EVENT])).toBe(5)
  })

  it('includes Saturday when workweek includes Saturday', () => {
    const sixDay: WorkweekConfig = { ...STANDARD, sat: true }
    // Mon-Sat = 6 workdays
    expect(workdays('2024-01-01', '2024-01-06', sixDay, [])).toBe(6)
  })
})

// ─── workdayRatio ─────────────────────────────────────────────────────────────

describe('workdayRatio', () => {
  it('returns 0 when today is before the start', () => {
    expect(workdayRatio('2024-01-05', '2024-01-09', '2024-01-03', STANDARD, [])).toBe(0)
  })

  it('returns 1/total when today equals start (not zero — only today < start returns 0)', () => {
    // start=Mon(01-01), end=Fri(01-05): total=5 workdays, elapsed on Mon=1 → ratio=0.2
    const ratio = workdayRatio('2024-01-01', '2024-01-05', '2024-01-01', STANDARD, [])
    expect(ratio).toBeCloseTo(0.2)   // 1 workday elapsed of 5 total
  })

  it('returns 1 when today is after the end', () => {
    expect(workdayRatio('2024-01-01', '2024-01-05', '2024-01-10', STANDARD, [])).toBe(1)
  })

  it('returns 1 when today equals end', () => {
    expect(workdayRatio('2024-01-01', '2024-01-05', '2024-01-05', STANDARD, [])).toBe(1)
  })

  it('returns approx 0.5 at the midpoint of a Mon-Fri range', () => {
    // Wed 2024-01-03 is the midpoint of Mon-Fri (3 of 5 elapsed)
    const ratio = workdayRatio('2024-01-01', '2024-01-05', '2024-01-03', STANDARD, [])
    expect(ratio).toBeCloseTo(0.6)   // 3 / 5
  })

  it('returns 0 when total workdays is 0 (all-weekend range)', () => {
    // Sat 2024-01-06 to Sun 2024-01-07 — 0 workdays in range
    const ratio = workdayRatio('2024-01-06', '2024-01-07', '2024-01-06', STANDARD, [])
    expect(ratio).toBe(0)
  })
})
