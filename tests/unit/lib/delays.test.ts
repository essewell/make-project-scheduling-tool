import { describe, expect, it } from 'vitest'
import type { Delay } from '../../../src/types'
import {
  computeDelayDaysImpact,
  defaultExcusableForDelayType,
  normalizeDelay,
  validateDelay,
} from '../../../src/lib/delays'

function makeDelay(overrides: Partial<Delay> = {}): Delay {
  return {
    id: 'd1',
    recordedAt: '2026-05-27T00:00:00.000Z',
    start: '2026-01-10',
    end: '2026-01-12',
    type: 'weather',
    excusable: true,
    affectedTaskIds: ['t1'],
    daysImpact: 3,
    criticalPathImpactDays: 0,
    responsibleParty: 'Owner',
    narrative: 'Snow event',
    reconciliation: 'pending',
    ...overrides,
  }
}

describe('delays', () => {
  it('derives default excusable mapping by type', () => {
    expect(defaultExcusableForDelayType('weather')).toBe(true)
    expect(defaultExcusableForDelayType('contractor_caused')).toBe(false)
    expect(defaultExcusableForDelayType('other')).toBeNull()
  })

  it('computes inclusive delay days impact', () => {
    expect(computeDelayDaysImpact('2026-01-10', '2026-01-12')).toBe(3)
    expect(computeDelayDaysImpact('2026-01-12', '2026-01-10')).toBe(0)
  })

  it('normalizes range and de-duplicates affected task ids', () => {
    const out = normalizeDelay(makeDelay({
      start: '2026-01-15',
      end: '2026-01-13',
      affectedTaskIds: ['t1', 't1', '', 't2'],
    }))
    expect(out.start).toBe('2026-01-13')
    expect(out.end).toBe('2026-01-15')
    expect(out.daysImpact).toBe(3)
    expect(out.affectedTaskIds).toEqual(['t1', 't2'])
  })

  it('validates required delay fields', () => {
    const errors = validateDelay(makeDelay({ id: '', affectedTaskIds: [], narrative: ' ' }))
    expect(errors.length).toBeGreaterThan(0)
  })
})
