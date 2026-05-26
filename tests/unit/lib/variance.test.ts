import { describe, expect, it } from 'vitest'
import type { Baseline, Task, VarianceSnapshot } from '../../../src/types'
import {
  appendVarianceSnapshot,
  computeProjectFinishVariance,
  trimSnapshots,
} from '../../../src/lib/variance'

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

function makeBaseline(tasks: Task[]): Baseline {
  return {
    id: 'b1',
    name: 'Baseline 1',
    date: '2026-05-01',
    tasks,
  }
}

describe('variance lib', () => {
  it('computeProjectFinishVariance returns positive when current schedule is behind baseline', () => {
    const baseline = makeBaseline([makeTask('t1', '2026-01-10')])
    const current = [makeTask('t1', '2026-01-15')]
    expect(computeProjectFinishVariance(current, baseline)).toBe(5)
  })

  it('computeProjectFinishVariance returns negative when current schedule is ahead', () => {
    const baseline = makeBaseline([makeTask('t1', '2026-01-10')])
    const current = [makeTask('t1', '2026-01-07')]
    expect(computeProjectFinishVariance(current, baseline)).toBe(-3)
  })

  it('computeProjectFinishVariance returns zero when either side has no finish data', () => {
    const baseline = makeBaseline([])
    const current: Task[] = []
    expect(computeProjectFinishVariance(current, baseline)).toBe(0)
  })

  it('appendVarianceSnapshot appends new date and replaces same-day same-baseline snapshot', () => {
    const base: VarianceSnapshot[] = [
      { date: '2026-05-01', activeBaselineId: 'b1', projectFinishVariance: 1, criticalPathLength: 10, compositeHealthScore: 76 },
    ]

    const appended = appendVarianceSnapshot(base, {
      date: '2026-05-02',
      activeBaselineId: 'b1',
      projectFinishVariance: 2,
      criticalPathLength: 11,
      compositeHealthScore: 80,
    })
    expect(appended).toHaveLength(2)

    const replaced = appendVarianceSnapshot(appended, {
      date: '2026-05-02',
      activeBaselineId: 'b1',
      projectFinishVariance: 3,
      criticalPathLength: 12,
      compositeHealthScore: 82,
    })
    expect(replaced).toHaveLength(2)
    expect(replaced.find((snapshot) => snapshot.date === '2026-05-02')?.projectFinishVariance).toBe(3)
    expect(replaced.find((snapshot) => snapshot.date === '2026-05-02')?.compositeHealthScore).toBe(82)
  })

  it('trimSnapshots enforces max per baseline and keeps most recent snapshots', () => {
    const snapshots: VarianceSnapshot[] = []
    for (let i = 1; i <= 370; i += 1) {
      const day = `${i}`.padStart(3, '0')
      snapshots.push({
        date: `2026-01-${day}`,
        activeBaselineId: 'b1',
        projectFinishVariance: i,
        criticalPathLength: 100 + i,
      })
    }
    snapshots.push({
      date: '2026-01-001',
      activeBaselineId: 'b2',
      projectFinishVariance: 9,
      criticalPathLength: 9,
    })

    const trimmed = trimSnapshots(snapshots, 365)
    const baselineOne = trimmed.filter((snapshot) => snapshot.activeBaselineId === 'b1')
    const baselineTwo = trimmed.filter((snapshot) => snapshot.activeBaselineId === 'b2')

    expect(baselineOne).toHaveLength(365)
    expect(baselineTwo).toHaveLength(1)
    expect(baselineOne[0]?.projectFinishVariance).toBe(6)
    expect(baselineOne[364]?.projectFinishVariance).toBe(370)
  })
})
