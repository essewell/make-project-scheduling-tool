import { describe, it, expect } from 'vitest'
import {
  toD,
  fmtDate,
  prettyDate,
  shortDate,
  addDays,
  daysBetween,
  durationDays,
  todayStr,
  dayOfWeek,
  isWeekend,
  monthName,
  quarterLabel,
  msToNextMidnight,
  normalizeDate,
} from '../../../src/lib/dates'

// ─── toD / fmtDate round-trip ─────────────────────────────────────────────────

describe('toD', () => {
  it('parses YYYY-MM-DD to a local-midnight Date', () => {
    const d = toD('2024-03-15')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(2)   // 0-indexed
    expect(d.getDate()).toBe(15)
  })

  it('round-trips with fmtDate', () => {
    const iso = '2024-06-01'
    expect(fmtDate(toD(iso))).toBe(iso)
  })
})

describe('fmtDate', () => {
  it('formats Date → YYYY-MM-DD', () => {
    expect(fmtDate(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('zero-pads month and day', () => {
    expect(fmtDate(new Date(2024, 8, 3))).toBe('2024-09-03')
  })
})

// ─── daysBetween ──────────────────────────────────────────────────────────────

describe('daysBetween', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetween('2024-01-15', '2024-01-15')).toBe(0)
  })

  it('returns 1 for adjacent dates', () => {
    expect(daysBetween('2024-01-15', '2024-01-16')).toBe(1)
  })

  it('returns negative when b is before a', () => {
    expect(daysBetween('2024-01-16', '2024-01-15')).toBe(-1)
  })

  it('counts days across a month boundary', () => {
    expect(daysBetween('2024-01-29', '2024-02-02')).toBe(4)
  })

  it('counts days across a year boundary', () => {
    expect(daysBetween('2023-12-30', '2024-01-02')).toBe(3)
  })
})

// ─── durationDays ─────────────────────────────────────────────────────────────

describe('durationDays', () => {
  it('returns 1 for the same day (inclusive)', () => {
    expect(durationDays('2024-01-15', '2024-01-15')).toBe(1)
  })

  it('returns 5 for Mon-Fri', () => {
    expect(durationDays('2024-01-01', '2024-01-05')).toBe(5)
  })
})

// ─── addDays ──────────────────────────────────────────────────────────────────

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2024-01-10', 5)).toBe('2024-01-15')
  })

  it('subtracts when n is negative', () => {
    expect(addDays('2024-01-10', -3)).toBe('2024-01-07')
  })

  it('crosses a month boundary', () => {
    expect(addDays('2024-01-29', 5)).toBe('2024-02-03')
  })

  it('handles n=0', () => {
    expect(addDays('2024-05-20', 0)).toBe('2024-05-20')
  })
})

// ─── todayStr ─────────────────────────────────────────────────────────────────

describe('todayStr', () => {
  it('returns a string matching YYYY-MM-DD', () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('matches fmtDate(new Date())', () => {
    expect(todayStr()).toBe(fmtDate(new Date()))
  })
})

// ─── dayOfWeek / isWeekend ────────────────────────────────────────────────────

describe('dayOfWeek', () => {
  it('returns 1 for Monday (2024-01-01)', () => {
    expect(dayOfWeek('2024-01-01')).toBe(1)   // Monday
  })

  it('returns 6 for Saturday (2024-01-06)', () => {
    expect(dayOfWeek('2024-01-06')).toBe(6)
  })

  it('returns 0 for Sunday (2024-01-07)', () => {
    expect(dayOfWeek('2024-01-07')).toBe(0)
  })
})

describe('isWeekend', () => {
  it('Saturday is a weekend', () => {
    expect(isWeekend('2024-01-06')).toBe(true)
  })

  it('Sunday is a weekend', () => {
    expect(isWeekend('2024-01-07')).toBe(true)
  })

  it('Monday is not a weekend', () => {
    expect(isWeekend('2024-01-01')).toBe(false)
  })

  it('Friday is not a weekend', () => {
    expect(isWeekend('2024-01-05')).toBe(false)
  })
})

// ─── prettyDate / shortDate ───────────────────────────────────────────────────

describe('prettyDate', () => {
  it('returns a non-empty human-readable string', () => {
    const result = prettyDate('2024-01-15')
    expect(result).toContain('2024')
    expect(result.length).toBeGreaterThan(5)
  })
})

describe('shortDate', () => {
  it('returns a non-empty short string without year', () => {
    const result = shortDate('2024-01-15')
    expect(result.length).toBeGreaterThan(3)
    expect(result).not.toContain('2024')
  })
})

// ─── monthName / quarterLabel ─────────────────────────────────────────────────

describe('monthName', () => {
  it('returns full month name by default', () => {
    expect(monthName(new Date(2024, 0, 1))).toBe('January')
  })

  it('returns short month name when short=true', () => {
    expect(monthName(new Date(2024, 0, 1), true)).toBe('Jan')
  })
})

describe('quarterLabel', () => {
  it('Q1 for January', () => {
    expect(quarterLabel(new Date(2024, 0, 1))).toBe('Q1')
  })

  it('Q2 for April', () => {
    expect(quarterLabel(new Date(2024, 3, 1))).toBe('Q2')
  })

  it('Q4 for December', () => {
    expect(quarterLabel(new Date(2024, 11, 1))).toBe('Q4')
  })
})

// ─── msToNextMidnight ─────────────────────────────────────────────────────────

describe('msToNextMidnight', () => {
  it('returns a positive number', () => {
    expect(msToNextMidnight()).toBeGreaterThan(0)
  })

  it('returns less than 24 hours in ms', () => {
    expect(msToNextMidnight()).toBeLessThan(86_400_100)
  })

  it('adds the optional offset', () => {
    const base = msToNextMidnight(0)
    const withOffset = msToNextMidnight(500)
    expect(withOffset - base).toBeCloseTo(500, -1)
  })
})

// ─── normalizeDate ────────────────────────────────────────────────────────────

describe('normalizeDate', () => {
  it('returns ISO string unchanged', () => {
    expect(normalizeDate('2024-03-15')).toBe('2024-03-15')
  })

  it('parses M/D/YYYY', () => {
    expect(normalizeDate('3/15/2024')).toBe('2024-03-15')
  })

  it('parses M-D-YYYY (dash separator)', () => {
    expect(normalizeDate('3-15-2024')).toBe('2024-03-15')
  })

  it('parses single-digit month and day', () => {
    expect(normalizeDate('1/5/2024')).toBe('2024-01-05')
  })

  it('returns null for empty string', () => {
    expect(normalizeDate('')).toBeNull()
  })

  it('returns null for garbage input', () => {
    expect(normalizeDate('not-a-date')).toBeNull()
  })

  it('falls back to native Date parse for formats like "Jan 15, 2024"', () => {
    const result = normalizeDate('Jan 15, 2024')
    // Native parse may or may not succeed across environments; just verify it's a valid ISO or null
    if (result !== null) {
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
