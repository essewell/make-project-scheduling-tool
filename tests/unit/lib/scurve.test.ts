import { describe, expect, it } from 'vitest'
import { computeSCurve } from '../../../src/lib/scurve'
import type { Baseline, Task } from '../../../src/types'

function makeTask(id: string, start: string, end: string, pct = 0): Task {
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

describe('computeSCurve', () => {
  it('builds monotonic weekly points', () => {
    const tasks = [
      makeTask('a', '2026-01-01', '2026-01-14', 50),
      makeTask('b', '2026-01-01', '2026-01-14', 25),
    ]
    const series = computeSCurve(tasks, makeBaseline(tasks), 'weekly')
    expect(series.points.length).toBeGreaterThan(1)
    for (let i = 1; i < series.points.length; i += 1) {
      expect(series.points[i]!.plannedPct).toBeGreaterThanOrEqual(series.points[i - 1]!.plannedPct)
      expect(series.points[i]!.actualPct).toBeGreaterThanOrEqual(series.points[i - 1]!.actualPct)
    }
  })

  it('supports monthly bucketing and signed variance', () => {
    const baselineTasks = [makeTask('a', '2026-01-01', '2026-03-31', 0)]
    const currentTasks = [makeTask('a', '2026-01-01', '2026-03-31', 60)]
    const series = computeSCurve(currentTasks, makeBaseline(baselineTasks), 'monthly')
    expect(series.points.length).toBeGreaterThanOrEqual(3)
    expect(series.variancePct).toBeLessThanOrEqual(0)
  })
})
