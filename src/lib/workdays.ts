import type { CalendarEvent, WorkweekConfig } from '../types'
import { fmtDate, toD } from './dates'
import { isCalendarNonWorkDay } from './projectCalendar'

const DOW_KEYS: (keyof WorkweekConfig)[] = ['sun','mon','tue','wed','thu','fri','sat']

/** Is a YYYY-MM-DD string a working day per workweek config + holiday list? */
export function isWorkday(
  dateStr: string,
  workweek: WorkweekConfig,
  holidays: string[],
  projectCalendar: CalendarEvent[] = [],
): boolean {
  if (holidays.includes(dateStr)) return false
  if (isCalendarNonWorkDay(dateStr, projectCalendar)) return false
  const dow = toD(dateStr).getDay()   // 0=Sun
  const key = DOW_KEYS[dow]
  if (!key) return false
  return workweek[key]
}

/**
 * Count working days between two YYYY-MM-DD strings (inclusive).
 * Returns 0 if start > end.
 */
export function workdays(
  start: string,
  end: string,
  workweek: WorkweekConfig,
  holidays: string[],
  projectCalendar: CalendarEvent[] = [],
): number {
  if (start > end) return 0
  let count = 0
  const d = toD(start)
  const endDate = toD(end)
  while (d <= endDate) {
    if (isWorkday(fmtDate(d), workweek, holidays, projectCalendar)) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

/**
 * Ratio of working days elapsed in [start, end] as of `today`.
 * Returns a value in [0, 1].
 */
export function workdayRatio(
  start: string,
  end: string,
  today: string,
  workweek: WorkweekConfig,
  holidays: string[],
  projectCalendar: CalendarEvent[] = [],
): number {
  if (today < start) return 0
  const total = workdays(start, end, workweek, holidays, projectCalendar)
  if (total === 0) return 0
  const elapsed = workdays(start, today < end ? today : end, workweek, holidays, projectCalendar)
  return Math.min(1, elapsed / total)
}
