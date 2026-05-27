import type { CalendarEvent } from '../types'
import { addDays, fmtDate, toD } from './dates'

export function eventSpansDate(event: CalendarEvent, date: string): boolean {
  return event.start <= date && date <= event.end
}

export function isCalendarNonWorkDay(date: string, projectCalendar: CalendarEvent[]): boolean {
  return projectCalendar.some(
    (event) => event.classification === 'non_work' && eventSpansDate(event, date),
  )
}

export function listCalendarEventsForDate(date: string, projectCalendar: CalendarEvent[]): CalendarEvent[] {
  return projectCalendar.filter((event) => eventSpansDate(event, date))
}

export function expandCalendarEventDates(event: CalendarEvent): string[] {
  if (event.start > event.end) return []
  const dates: string[] = []
  let cursor = event.start
  while (cursor <= event.end) {
    dates.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return dates
}

export function countCalendarDaysInRange(
  start: string,
  end: string,
  projectCalendar: CalendarEvent[],
  classification: CalendarEvent['classification'],
): number {
  if (start > end) return 0
  let count = 0
  const seen = new Set<string>()
  for (const event of projectCalendar) {
    if (event.classification !== classification) continue
    const rangeStart = event.start > start ? event.start : start
    const rangeEnd = event.end < end ? event.end : end
    if (rangeStart > rangeEnd) continue
    let cursor = rangeStart
    while (cursor <= rangeEnd) {
      if (!seen.has(cursor)) {
        seen.add(cursor)
        count++
      }
      cursor = addDays(cursor, 1)
    }
  }
  return count
}

export function normalizeCalendarEventRange(event: CalendarEvent): CalendarEvent {
  if (event.start <= event.end) return event
  return { ...event, start: fmtDate(toD(event.end)), end: fmtDate(toD(event.start)) }
}
