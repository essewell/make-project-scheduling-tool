import { describe, expect, it } from 'vitest'
import type { Group, ResourceAssignment, Task } from '../../../src/types'
import { computeGroupRollup } from '../../../src/lib/rollups'

function makeGroup(overrides: Partial<Group>): Group {
  return {
    id: 'g',
    name: 'Group',
    color: '#1c3048',
    parentId: null,
    wbsCode: '',
    ...overrides,
  }
}

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

describe('computeGroupRollup', () => {
  it('returns zeros for empty group', () => {
    const result = computeGroupRollup('g1', [makeGroup({ id: 'g1' })], [], new Map(), [])
    expect(result).toEqual({ taskCount: 0, completionPct: 0, totalCost: 0, resourceCount: 0 })
  })

  it('rolls up one task', () => {
    const tasks = [makeTask({ id: 't1', group: 'g1', pct: 60 })]
    const costs = new Map([['t1', 1200]])
    const assignments: ResourceAssignment[] = [{ id: 'a1', taskId: 't1', resourceId: 'r1', quantity: 1, notes: '' }]
    const result = computeGroupRollup('g1', [makeGroup({ id: 'g1' })], tasks, costs, assignments)
    expect(result).toEqual({ taskCount: 1, completionPct: 60, totalCost: 1200, resourceCount: 1 })
  })

  it('rolls up nested groups with mixed progress states', () => {
    const groups = [makeGroup({ id: 'g1' }), makeGroup({ id: 'g2', parentId: 'g1' })]
    const tasks = [
      makeTask({ id: 't1', group: 'g1', pct: 0 }),
      makeTask({ id: 't2', group: 'g2', pct: 100 }),
    ]
    const costs = new Map([['t1', 100], ['t2', 300]])
    const result = computeGroupRollup('g1', groups, tasks, costs, [])
    expect(result.taskCount).toBe(2)
    expect(result.completionPct).toBe(50)
    expect(result.totalCost).toBe(400)
  })

  it('rounds completion percentage to nearest whole number', () => {
    const tasks = [
      makeTask({ id: 't1', group: 'g1', pct: 33 }),
      makeTask({ id: 't2', group: 'g1', pct: 34 }),
    ]
    const result = computeGroupRollup('g1', [makeGroup({ id: 'g1' })], tasks, new Map(), [])
    expect(result.completionPct).toBe(34)
  })

  it('counts unique resources across descendant tasks', () => {
    const groups = [makeGroup({ id: 'g1' }), makeGroup({ id: 'g2', parentId: 'g1' })]
    const tasks = [makeTask({ id: 't1', group: 'g1' }), makeTask({ id: 't2', group: 'g2' })]
    const assignments: ResourceAssignment[] = [
      { id: 'a1', taskId: 't1', resourceId: 'r1', quantity: 1, notes: '' },
      { id: 'a2', taskId: 't2', resourceId: 'r1', quantity: 2, notes: '' },
      { id: 'a3', taskId: 't2', resourceId: 'r2', quantity: 1, notes: '' },
    ]
    const result = computeGroupRollup('g1', groups, tasks, new Map(), assignments)
    expect(result.resourceCount).toBe(2)
  })
})
