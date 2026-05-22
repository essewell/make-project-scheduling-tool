import { describe, expect, it } from 'vitest'
import { computeResourceDemand } from '../../../src/lib/resourceDemand'
import type { Resource, ResourceAssignment, Task, Timeline, WorkweekConfig } from '../../../src/types'
import { addDays, toD } from '../../../src/lib/dates'

const WORKWEEK: WorkweekConfig = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
}

function makeTask(id: string, s: string, e: string): Task {
  return {
    id,
    name: id,
    group: 'g1',
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

function makeResource(id: string, category: Resource['category'], capacity = 2): Resource {
  return {
    id,
    name: id,
    category,
    unit: 'hours',
    capacity,
    costRate: 100,
    color: '#378ADD',
  }
}

function makeAssignment(id: string, taskId: string, resourceId: string, quantity: number): ResourceAssignment {
  return { id, taskId, resourceId, quantity, notes: '' }
}

function makeTimeline(start: string, end: string): Timeline {
  const days: Array<{ offset: number; date: Date }> = []
  let cursor = start
  let offset = 0
  while (cursor <= end) {
    days.push({ offset, date: toD(cursor) })
    cursor = addDays(cursor, 1)
    offset += 1
  }

  return {
    min: toD(start),
    max: toD(end),
    totalDays: days.length,
    totalPx: days.length,
    months: [],
    quarters: [],
    years: [],
    weeks: [],
    days,
  }
}

describe('resource demand rollup', () => {
  it('computes single-task daily demand for labor resources', () => {
    const timeline = makeTimeline('2026-01-05', '2026-01-09')
    const demand = computeResourceDemand('r1', {
      tasks: [makeTask('t1', '2026-01-05', '2026-01-09')],
      assignments: [makeAssignment('a1', 't1', 'r1', 2)],
      resources: [makeResource('r1', 'labor', 3)],
      timeline,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(demand).toHaveLength(5)
    demand.forEach((point) => {
      expect(point.demand).toBe(2)
      expect(point.overAllocation).toBe(0)
    })
  })

  it('sums overlap demand and reports over-allocation above capacity', () => {
    const timeline = makeTimeline('2026-01-05', '2026-01-09')
    const demand = computeResourceDemand('r1', {
      tasks: [
        makeTask('t1', '2026-01-05', '2026-01-07'),
        makeTask('t2', '2026-01-06', '2026-01-08'),
      ],
      assignments: [
        makeAssignment('a1', 't1', 'r1', 2),
        makeAssignment('a2', 't2', 'r1', 2),
      ],
      resources: [makeResource('r1', 'labor', 2)],
      timeline,
      workweek: WORKWEEK,
      holidays: [],
    })

    const day2 = demand[1] // 2026-01-06 overlap
    expect(day2?.demand).toBe(4)
    expect(day2?.overAllocation).toBe(2)
  })

  it('excludes weekends from demand accumulation', () => {
    const timeline = makeTimeline('2026-01-09', '2026-01-12') // Fri -> Mon
    const demand = computeResourceDemand('r1', {
      tasks: [makeTask('t1', '2026-01-09', '2026-01-12')],
      assignments: [makeAssignment('a1', 't1', 'r1', 1)],
      resources: [makeResource('r1', 'equipment', 10)],
      timeline,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(demand[0]?.demand).toBe(1) // Friday
    expect(demand[1]?.demand).toBe(0) // Saturday
    expect(demand[2]?.demand).toBe(0) // Sunday
    expect(demand[3]?.demand).toBe(1) // Monday
  })

  it('limits accumulation to the timeline window', () => {
    const timeline = makeTimeline('2026-01-07', '2026-01-08')
    const demand = computeResourceDemand('r1', {
      tasks: [makeTask('t1', '2026-01-05', '2026-01-10')],
      assignments: [makeAssignment('a1', 't1', 'r1', 1)],
      resources: [makeResource('r1', 'labor', 1)],
      timeline,
      workweek: WORKWEEK,
      holidays: [],
    })

    expect(demand).toHaveLength(2)
    expect(demand[0]?.demand).toBe(1)
    expect(demand[1]?.demand).toBe(1)
  })

  it('distributes material quantities linearly over workdays with no over-allocation', () => {
    const timeline = makeTimeline('2026-01-05', '2026-01-09')
    const demand = computeResourceDemand('r1', {
      tasks: [makeTask('t1', '2026-01-05', '2026-01-09')],
      assignments: [makeAssignment('a1', 't1', 'r1', 10)],
      resources: [makeResource('r1', 'material', 0)],
      timeline,
      workweek: WORKWEEK,
      holidays: [],
    })

    demand.forEach((point) => {
      expect(point.demand).toBe(2)
      expect(point.overAllocation).toBe(0)
    })
  })
})
