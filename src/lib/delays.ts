import type { Delay, DelayType } from '../types'
import { durationDays } from './dates'

const EXCUSABLE_DELAY_TYPES: DelayType[] = ['weather', 'owner_directive', 'force_majeure']

export function defaultExcusableForDelayType(type: DelayType): boolean | null {
  if (EXCUSABLE_DELAY_TYPES.includes(type)) return true
  if (type === 'contractor_caused' || type === 'subcontractor_caused') return false
  return null
}

export function computeDelayDaysImpact(start: string, end: string): number {
  if (start > end) return 0
  return durationDays(start, end)
}

export function normalizeDelay(delay: Delay): Delay {
  const start = delay.start <= delay.end ? delay.start : delay.end
  const end = delay.start <= delay.end ? delay.end : delay.start
  return {
    ...delay,
    start,
    end,
    daysImpact: computeDelayDaysImpact(start, end),
    affectedTaskIds: [...new Set(delay.affectedTaskIds)].filter(Boolean),
  }
}

export function validateDelay(delay: Delay): string[] {
  const errors: string[] = []
  if (!delay.id) errors.push('Delay id is required.')
  if (!delay.start || !delay.end) errors.push('Delay date range is required.')
  if (delay.start > delay.end) errors.push('Delay start must be on or before end.')
  if (delay.affectedTaskIds.length === 0) errors.push('At least one affected task is required.')
  if (!delay.narrative.trim()) errors.push('Narrative is required.')
  return errors
}
