import { describe, expect, it } from 'vitest'
import { computeGroupCosts, computeProjectTotalCost, computeTaskCost, computeTaskCosts } from '../../../src/lib/cost'
import type { Resource, ResourceAssignment, Task, WorkweekConfig } from '../../../src/types'

const WORKWEEK: WorkweekConfig = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
}

function makeTask(id: string, group: string, s = '2026-01-05', e = '2026-01-09'): Task {
  return {
    id,
    name: id,
    group,
    s,
    e,
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

function makeResource(id: string, category: Resource['category'], costRate: number): Resource {
  return {
    id,
    name: id,
    category,
    unit: 'hours',
    capacity: 1,
    costRate,
    color: '#378ADD',
  }
}

function makeAssignment(id: string, taskId: string, resourceId: string, quantity: number): ResourceAssignment {
  return { id, taskId, resourceId, quantity, notes: '' }
}

describe('cost rollups', () => {
  it('computes labor/equipment task cost by quantity * workdays * costRate', () => {
    const task = makeTask('t1', 'g1')
    const resources = [makeResource('r1', 'labor', 100)]
    const assignments = [makeAssignment('a1', 't1', 'r1', 2)]

    const cost = computeTaskCost(task, {
      resources,
      assignments,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(cost).toBe(1000) // 2 * 5 workdays * 100
  })

  it('computes material task cost as quantity * costRate (no duration multiplier)', () => {
    const task = makeTask('t1', 'g1')
    const resources = [makeResource('r1', 'material', 50)]
    const assignments = [makeAssignment('a1', 't1', 'r1', 10)]
    const cost = computeTaskCost(task, {
      resources,
      assignments,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(cost).toBe(500)
  })

  it('sums multi-assignment costs per task', () => {
    const task = makeTask('t1', 'g1')
    const resources = [makeResource('r1', 'labor', 100), makeResource('r2', 'material', 50)]
    const assignments = [makeAssignment('a1', 't1', 'r1', 1), makeAssignment('a2', 't1', 'r2', 4)]

    const cost = computeTaskCost(task, {
      resources,
      assignments,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(cost).toBe(700) // (1*5*100) + (4*50)
  })

  it('rolls up group and project totals from task costs', () => {
    const tasks = [makeTask('t1', 'g1'), makeTask('t2', 'g1'), makeTask('t3', 'g2')]
    const resources = [makeResource('r1', 'labor', 10)]
    const assignments = [
      makeAssignment('a1', 't1', 'r1', 1), // 50
      makeAssignment('a2', 't2', 'r1', 2), // 100
      makeAssignment('a3', 't3', 'r1', 3), // 150
    ]

    const taskCosts = computeTaskCosts(tasks, {
      resources,
      assignments,
      workweek: WORKWEEK,
      holidays: [],
    })
    const groupCosts = computeGroupCosts(tasks, taskCosts)
    const total = computeProjectTotalCost(taskCosts)

    expect(groupCosts.get('g1')).toBe(150)
    expect(groupCosts.get('g2')).toBe(150)
    expect(total).toBe(300)
  })

  it('handles zero rate, zero quantity, invalid duration, and missing resource edges', () => {
    const taskA = makeTask('t1', 'g1', '2026-01-10', '2026-01-05') // invalid span => 0 workdays
    const taskB = makeTask('t2', 'g1')
    const resources = [makeResource('r1', 'labor', 0)]
    const assignments = [
      makeAssignment('a1', 't1', 'r1', 2), // zero due to invalid duration + rate 0
      makeAssignment('a2', 't2', 'r1', 0), // zero quantity
      makeAssignment('a3', 't2', 'missing', 5), // missing resource
    ]

    const taskCosts = computeTaskCosts([taskA, taskB], {
      resources,
      assignments,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(taskCosts.get('t1')).toBe(0)
    expect(taskCosts.get('t2')).toBe(0)
    expect(computeProjectTotalCost(taskCosts)).toBe(0)
  })
})
