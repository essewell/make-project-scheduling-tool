import { describe, expect, it } from 'vitest'
import { computeEVM } from '../../../src/lib/evm'
import type { Baseline, Resource, ResourceAssignment, Task } from '../../../src/types'

function makeTask(id: string, start: string, end: string, pct: number): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: start,
    e: end,
    actualStart: null,
    actualFinish: null,
    pct,
    status: 'not_started',
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: [],
  }
}

function makeBaseline(tasks: Task[]): Baseline {
  return {
    id: 'b1',
    name: 'b1',
    date: '2026-01-01',
    reason: '',
    lockedAt: '2026-01-01',
    tasks,
  }
}

describe('computeEVM', () => {
  const resources: Resource[] = [
    { id: 'r1', name: 'Crew', category: 'labor', unit: 'hr', capacity: 8, costRate: 100, color: '#000000' },
  ]
  const assignments: ResourceAssignment[] = [
    { id: 'a1', taskId: 't1', resourceId: 'r1', quantity: 1, notes: '' },
  ]

  it('returns null SPI when no baseline is selected', () => {
    const result = computeEVM([], null, assignments, resources, '2026-01-01')
    expect(result.spi).toBeNull()
    expect(result.pv).toBe(0)
  })

  it('computes PV/EV and SPI', () => {
    const baselineTask = makeTask('t1', '2026-01-01', '2026-01-10', 0)
    const currentTask = makeTask('t1', '2026-01-01', '2026-01-10', 50)
    const result = computeEVM([currentTask], makeBaseline([baselineTask]), assignments, resources, '2026-01-05')
    expect(result.pv).toBeGreaterThan(0)
    expect(result.ev).toBeGreaterThan(0)
    expect(result.spi).not.toBeNull()
  })

  it('does not return Infinity when PV is zero', () => {
    const baselineTask = makeTask('t1', '2026-02-01', '2026-02-10', 0)
    const currentTask = makeTask('t1', '2026-02-01', '2026-02-10', 10)
    const result = computeEVM([currentTask], makeBaseline([baselineTask]), assignments, resources, '2026-01-01')
    expect(result.pv).toBe(0)
    expect(result.spi).toBeNull()
  })
})
