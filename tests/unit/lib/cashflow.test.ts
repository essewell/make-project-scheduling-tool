import { describe, expect, it } from 'vitest'
import { computeMonthlyCashFlow } from '../../../src/lib/cashflow'
import type { Resource, ResourceAssignment, Task } from '../../../src/types'

function makeTask(id: string, start: string, end: string): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: start,
    e: end,
    actualStart: null,
    actualFinish: null,
    pct: 0,
    status: 'not_started',
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: [],
  }
}

describe('computeMonthlyCashFlow', () => {
  const resources: Resource[] = [
    { id: 'l', name: 'Labor', category: 'labor', unit: 'hr', capacity: 8, costRate: 100, color: '#111111' },
    { id: 'e', name: 'Equip', category: 'equipment', unit: 'day', capacity: 2, costRate: 50, color: '#222222' },
    { id: 'm', name: 'Mat', category: 'material', unit: 'lot', capacity: 0, costRate: 1000, color: '#333333' },
  ]

  it('distributes costs across month boundaries', () => {
    const tasks = [makeTask('t1', '2026-01-20', '2026-02-10')]
    const assignments: ResourceAssignment[] = [
      { id: 'a1', taskId: 't1', resourceId: 'l', quantity: 1, notes: '' },
    ]
    const buckets = computeMonthlyCashFlow(tasks, assignments, resources, 24)
    expect(buckets.find((bucket) => bucket.month === '2026-01')?.total ?? 0).toBeGreaterThan(0)
    expect(buckets.find((bucket) => bucket.month === '2026-02')?.total ?? 0).toBeGreaterThan(0)
  })

  it('segments totals by category', () => {
    const tasks = [makeTask('t1', '2026-01-01', '2026-01-05')]
    const assignments: ResourceAssignment[] = [
      { id: 'a1', taskId: 't1', resourceId: 'l', quantity: 1, notes: '' },
      { id: 'a2', taskId: 't1', resourceId: 'e', quantity: 1, notes: '' },
      { id: 'a3', taskId: 't1', resourceId: 'm', quantity: 1, notes: '' },
    ]
    const january = computeMonthlyCashFlow(tasks, assignments, resources, 24)
      .find((bucket) => bucket.month === '2026-01')
    expect(january?.labor ?? 0).toBeGreaterThan(0)
    expect(january?.equipment ?? 0).toBeGreaterThan(0)
    expect(january?.material ?? 0).toBeGreaterThan(0)
  })
})
