import type { Timeline, TimelineBucket, ZoomLevel } from '../types'
import { ZOOM_LEVELS, TIMELINE_PAD_BEFORE, TIMELINE_PAD_AFTER } from '../constants'
import { fmtDate, monthName, quarterLabel, addDays, daysBetween } from './dates'

/**
 * Build a Timeline object from a date range and pixels-per-day.
 * All offsets are in pixels from the left edge of the gantt scroll area.
 */
export function buildTimeline(
  minDate: string,
  maxDate: string,
  dayPx: number,
): Timeline {
  const paddedMin = addDays(minDate, -TIMELINE_PAD_BEFORE)
  const paddedMax = addDays(maxDate, TIMELINE_PAD_AFTER)

  const min = new Date(paddedMin + 'T00:00:00')
  const max = new Date(paddedMax + 'T00:00:00')
  const totalDays = daysBetween(paddedMin, paddedMax) + 1
  const totalPx = Math.round(totalDays * dayPx)

  // ── Months ────────────────────────────────────────────────────────────────
  const months: TimelineBucket[] = []
  const cur = new Date(min)
  cur.setDate(1)
  while (cur <= max) {
    const bucketStart = cur < min ? new Date(min) : new Date(cur)
    const bucketEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0)  // last day of month
    if (bucketEnd > max) bucketEnd.setTime(max.getTime())

    const offsetDays = daysBetween(paddedMin, fmtDate(bucketStart))
    const bucketDays = daysBetween(fmtDate(bucketStart), fmtDate(bucketEnd)) + 1

    months.push({
      label: monthName(cur, true) + ' ' + cur.getFullYear(),
      year: cur.getFullYear(),
      days: bucketDays,
      offset: Math.round(offsetDays * dayPx),
    })

    cur.setMonth(cur.getMonth() + 1)
    cur.setDate(1)
  }

  // ── Quarters ──────────────────────────────────────────────────────────────
  const quarters: TimelineBucket[] = []
  const qCur = new Date(min)
  qCur.setDate(1)
  qCur.setMonth(Math.floor(qCur.getMonth() / 3) * 3)
  while (qCur <= max) {
    const bucketStart = qCur < min ? new Date(min) : new Date(qCur)
    const qEnd = new Date(qCur.getFullYear(), qCur.getMonth() + 3, 0)
    if (qEnd > max) qEnd.setTime(max.getTime())

    const offsetDays = daysBetween(paddedMin, fmtDate(bucketStart))
    const bucketDays = daysBetween(fmtDate(bucketStart), fmtDate(qEnd)) + 1

    quarters.push({
      label: quarterLabel(qCur) + ' ' + qCur.getFullYear(),
      year: qCur.getFullYear(),
      days: bucketDays,
      offset: Math.round(offsetDays * dayPx),
    })

    qCur.setMonth(qCur.getMonth() + 3)
    qCur.setDate(1)
  }

  // ── Years ─────────────────────────────────────────────────────────────────
  const years: TimelineBucket[] = []
  const yCur = new Date(min.getFullYear(), 0, 1)
  while (yCur <= max) {
    const bucketStart = yCur < min ? new Date(min) : new Date(yCur)
    const yEnd = new Date(yCur.getFullYear() + 1, 0, 0)
    if (yEnd > max) yEnd.setTime(max.getTime())

    const offsetDays = daysBetween(paddedMin, fmtDate(bucketStart))
    const bucketDays = daysBetween(fmtDate(bucketStart), fmtDate(yEnd)) + 1

    years.push({
      label: String(yCur.getFullYear()),
      year: yCur.getFullYear(),
      days: bucketDays,
      offset: Math.round(offsetDays * dayPx),
    })

    yCur.setFullYear(yCur.getFullYear() + 1)
  }

  // ── Weeks (Monday-anchored) ───────────────────────────────────────────────
  const weeks: Array<{ offset: number; label: string }> = []
  const wCur = new Date(min)
  // Advance to first Monday
  while (wCur.getDay() !== 1) wCur.setDate(wCur.getDate() + 1)
  while (wCur <= max) {
    const offsetDays = daysBetween(paddedMin, fmtDate(wCur))
    const label = 'W' + getISOWeek(wCur)
    weeks.push({ offset: Math.round(offsetDays * dayPx), label })
    wCur.setDate(wCur.getDate() + 7)
  }

  // ── Days ──────────────────────────────────────────────────────────────────
  const days: Array<{ offset: number; date: Date }> = []
  const dCur = new Date(min)
  while (dCur <= max) {
    const offsetDays = daysBetween(paddedMin, fmtDate(dCur))
    days.push({ offset: Math.round(offsetDays * dayPx), date: new Date(dCur) })
    dCur.setDate(dCur.getDate() + 1)
  }

  return { min, max, totalDays, totalPx, months, quarters, years, weeks, days }
}

/** Convert a YYYY-MM-DD date to an x-pixel offset within the timeline. */
export function dateToOffset(dateStr: string, timeline: Timeline, dayPx: number): number {
  const minStr = fmtDate(timeline.min)
  return Math.round(daysBetween(minStr, dateStr) * dayPx)
}

/** Convert an x-pixel offset back to a YYYY-MM-DD date. */
export function offsetToDate(offsetPx: number, timeline: Timeline, dayPx: number): string {
  const minStr = fmtDate(timeline.min)
  const days = Math.round(offsetPx / dayPx)
  return addDays(minStr, days)
}

/**
 * Choose the header tier configuration based on dayPx.
 *   ≥ 16 → month (primary) + day (secondary)
 *   ≥  5 → month (primary) + week (secondary)
 *   ≥  2 → quarter (primary) + month (secondary)
 *        → year (primary) + quarter (secondary)
 */
export function getTiersForDayPx(dayPx: number): { primary: 'year' | 'quarter' | 'month'; secondary: 'quarter' | 'month' | 'week' | 'day' } {
  if (dayPx >= 16) return { primary: 'month', secondary: 'day' }
  if (dayPx >= 5)  return { primary: 'month', secondary: 'week' }
  if (dayPx >= 2)  return { primary: 'quarter', secondary: 'month' }
  return { primary: 'year', secondary: 'quarter' }
}

export { ZOOM_LEVELS }
export type { ZoomLevel }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)
}
