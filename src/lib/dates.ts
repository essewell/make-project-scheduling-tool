/**
 * Date utilities — all pure functions, no side effects.
 * Dates are always YYYY-MM-DD strings internally; only convert to Date objects for arithmetic.
 */

/** Parse YYYY-MM-DD to a local-midnight Date. */
export function toD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y!, (m! - 1), d!)
}

/** Format Date → YYYY-MM-DD (local time). */
export function fmtDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Human-readable "Jan 15, 2025". */
export function prettyDate(dateStr: string): string {
  return toD(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Short "Jan 15". */
export function shortDate(dateStr: string): string {
  return toD(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** Add n calendar days to a YYYY-MM-DD string. */
export function addDays(dateStr: string, n: number): string {
  const d = toD(dateStr)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}

/**
 * Signed calendar days from a → b.
 * Positive = b is after a.
 */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000
  return Math.round((toD(b).getTime() - toD(a).getTime()) / msPerDay)
}

/** Duration in calendar days, inclusive (end - start + 1). */
export function durationDays(start: string, end: string): number {
  return daysBetween(start, end) + 1
}

/** Today as YYYY-MM-DD (local). */
export function todayStr(): string {
  return fmtDate(new Date())
}

/** Is dateStr today or in the past? */
export function isPast(dateStr: string): boolean {
  return daysBetween(todayStr(), dateStr) < 0
}

/** Is dateStr in the future (strictly after today)? */
export function isFuture(dateStr: string): boolean {
  return daysBetween(todayStr(), dateStr) > 0
}

/** Clamp a date string between min and max. */
export function clampDate(dateStr: string, min: string, max: string): string {
  if (dateStr < min) return min
  if (dateStr > max) return max
  return dateStr
}

/** Day-of-week index 0=Sun … 6=Sat for a YYYY-MM-DD string. */
export function dayOfWeek(dateStr: string): number {
  return toD(dateStr).getDay()
}

/** Is it a weekend day? */
export function isWeekend(dateStr: string): boolean {
  const dow = dayOfWeek(dateStr)
  return dow === 0 || dow === 6
}

/** Month name for a Date. */
export function monthName(date: Date, short = false): string {
  return date.toLocaleDateString('en-US', { month: short ? 'short' : 'long' })
}

/** Quarter label "Q1" for a Date. */
export function quarterLabel(date: Date): string {
  return `Q${Math.floor(date.getMonth() / 3) + 1}`
}

/** Week start (Monday) of the week containing dateStr. */
export function weekStart(dateStr: string): string {
  const d = toD(dateStr)
  const dow = d.getDay()         // 0=Sun
  const diff = (dow === 0) ? -6 : 1 - dow   // shift to Monday
  d.setDate(d.getDate() + diff)
  return fmtDate(d)
}

/** Milliseconds until next midnight + offsetMs. */
export function msToNextMidnight(offsetMs = 100): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime() + offsetMs
}

/** Parse a loose date string (M/D/YYYY, D-M-YYYY, YYYY-MM-DD, etc.) → YYYY-MM-DD or null. */
export function normalizeDate(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // M/D/YYYY or M-D-YYYY
  const mdy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (mdy) {
    const [, m, d, y] = mdy
    return `${y}-${m!.padStart(2,'0')}-${d!.padStart(2,'0')}`
  }

  // Try native Date parse as last resort
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) return fmtDate(parsed)

  return null
}
