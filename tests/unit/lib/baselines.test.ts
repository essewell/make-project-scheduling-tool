import { describe, expect, it } from 'vitest'
import type { Baseline, Task } from '../../../src/types'
import { assertNotLocked, compareBaselines, findBaselineById } from '../../../src/lib/baselines'

function makeTask(id: string, end: string): Task {
  return {
    id,
    name: `Task ${id}`,
    group: 'g1',
    s: '2026-01-01',
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

function makeBaseline(id: string, tasks: Task[]): Baseline {
  return {
    id,
    name: `Baseline ${id}`,
    date: '2026-05-01',
    tasks,
  }
}

describe('baselines lib', () => {
  it('findBaselineById returns baseline or null', () => {
    const one = makeBaseline('b1', [makeTask('t1', '2026-01-10')])
    const two = makeBaseline('b2', [makeTask('t2', '2026-01-11')])
    expect(findBaselineById([one, two], 'b2')).toEqual(two)
    expect(findBaselineById([one, two], 'missing')).toBeNull()
  })

  it('assertNotLocked throws for locked baseline', () => {
    const baseline = { ...makeBaseline('b1', []), lockedAt: '2026-05-01T00:00:00.000Z' }
    expect(() => assertNotLocked(baseline)).toThrow(/locked/i)
  })

  it('assertNotLocked passes when unlocked', () => {
    const baseline = makeBaseline('b1', [])
    expect(() => assertNotLocked(baseline)).not.toThrow()
  })

  it('compareBaselines returns empty diff for identical baselines', () => {
    const tasks = [makeTask('t1', '2026-01-10'), makeTask('t2', '2026-01-12')]
    const a = makeBaseline('a', tasks)
    const b = makeBaseline('b', tasks.map((task) => ({ ...task })))
    const diff = compareBaselines(a, b)

    expect(diff.slipped).toEqual([])
    expect(diff.added).toEqual([])
    expect(diff.removed).toEqual([])
    expect(diff.totals).toEqual({
      totalSlipDays: 0,
      netTaskCountChange: 0,
      totalCostDelta: 0,
    })
  })

  it('compareBaselines captures slipped tasks and sorts by slip days desc', () => {
    const a = makeBaseline('a', [makeTask('t1', '2026-01-10'), makeTask('t2', '2026-01-12')])
    const b = makeBaseline('b', [makeTask('t1', '2026-01-14'), makeTask('t2', '2026-01-13')])
    const diff = compareBaselines(a, b, { t1: 100, t2: 200 }, { t1: 150, t2: 230 })

    expect(diff.slipped.map((row) => row.taskId)).toEqual(['t1', 't2'])
    expect(diff.slipped[0]?.slipDays).toBe(4)
    expect(diff.slipped[1]?.slipDays).toBe(1)
    expect(diff.totals.totalSlipDays).toBe(5)
    expect(diff.totals.totalCostDelta).toBe(80)
  })

  it('compareBaselines captures added and removed tasks', () => {
    const a = makeBaseline('a', [makeTask('t1', '2026-01-10'), makeTask('t2', '2026-01-12')])
    const b = makeBaseline('b', [makeTask('t2', '2026-01-12'), makeTask('t3', '2026-01-20')])
    const diff = compareBaselines(a, b, { t1: 80, t2: 120 }, { t2: 120, t3: 60 })

    expect(diff.added).toHaveLength(1)
    expect(diff.added[0]?.taskId).toBe('t3')
    expect(diff.removed).toHaveLength(1)
    expect(diff.removed[0]?.taskId).toBe('t1')
    expect(diff.totals.netTaskCountChange).toBe(0)
    expect(diff.totals.totalCostDelta).toBe(-20)
  })

  it('compareBaselines handles empty baselines', () => {
    const a = makeBaseline('a', [])
    const b = makeBaseline('b', [])
    const diff = compareBaselines(a, b)
    expect(diff.slipped).toEqual([])
    expect(diff.added).toEqual([])
    expect(diff.removed).toEqual([])
  })
})
