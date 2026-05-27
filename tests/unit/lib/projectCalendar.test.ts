import { describe, expect, it } from 'vitest'
import type { CalendarEvent } from '../../../src/types'
import {
  countCalendarDaysInRange,
  eventSpansDate,
  expandCalendarEventDates,
  isCalendarNonWorkDay,
  listCalendarEventsForDate,
} from '../../../src/lib/projectCalendar'

const events: CalendarEvent[] = [
  {
    id: 'c1',
    name: 'Holiday shutdown',
    start: '2026-12-24',
    end: '2026-12-26',
    type: 'holiday',
    classification: 'non_work',
    notes: '',
  },
  {
    id: 'c2',
    name: 'Advisory rain',
    start: '2026-12-25',
    end: '2026-12-25',
    type: 'weather_window',
    classification: 'advisory_only',
    notes: '',
  },
]

describe('projectCalendar', () => {
  it('identifies non-work days from classified events', () => {
    expect(isCalendarNonWorkDay('2026-12-25', events)).toBe(true)
    expect(isCalendarNonWorkDay('2026-12-27', events)).toBe(false)
  })

  it('lists all events spanning a date', () => {
    const dayEvents = listCalendarEventsForDate('2026-12-25', events)
    expect(dayEvents.map((item) => item.id)).toEqual(['c1', 'c2'])
  })

  it('expands event ranges inclusively', () => {
    expect(expandCalendarEventDates(events[0])).toEqual(['2026-12-24', '2026-12-25', '2026-12-26'])
  })

  it('counts unique days in range for a classification', () => {
    const count = countCalendarDaysInRange('2026-12-20', '2026-12-31', events, 'non_work')
    expect(count).toBe(3)
  })

  it('checks event span with inclusive bounds', () => {
    expect(eventSpansDate(events[0], '2026-12-24')).toBe(true)
    expect(eventSpansDate(events[0], '2026-12-26')).toBe(true)
    expect(eventSpansDate(events[0], '2026-12-27')).toBe(false)
  })
})
