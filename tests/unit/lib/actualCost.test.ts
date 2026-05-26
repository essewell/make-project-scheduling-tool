import { describe, expect, it } from 'vitest'
import type { Task } from '../../../src/types'
import { computeTotalActualCost } from '../../../src/lib/actualCost'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't',
    name: 'Task',
    group: 'g',
    wbsCode: '',
    s: '2026-01-01',
    e: '2026-01-03',
    actualStart: null,
    actualFinish: null,
    actualCost: 0,
    pct: 0,
    status: 'not_started',
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: [],
    ...overrides,
  }
}

describe('computeTotalActualCost', () => {
  it('returns 0 for empty input', () => {
    expect(computeTotalActualCost([])).toBe(0)
  })

  it('sums positive costs and ignores non-positive values', () => {
    const tasks = [
      makeTask({ id: 't1', actualCost: 100 }),
      makeTask({ id: 't2', actualCost: 0 }),
      makeTask({ id: 't3', actualCost: -20 }),
      makeTask({ id: 't4', actualCost: 50 }),
    ]
    expect(computeTotalActualCost(tasks)).toBe(150)
  })

  it('handles large fixture-style arrays', () => {
    const tasks = Array.from({ length: 500 }, (_, index) => makeTask({ id: `t${index}`, actualCost: 2 }))
    expect(computeTotalActualCost(tasks)).toBe(1000)
  })
})
