import { describe, expect, it } from 'vitest'
import { buildExecutiveReport } from '../../../src/lib/reportData'
import type { Baseline, DcmaAssessmentResult, Task } from '../../../src/types'

function makeTask(id: string, end: string, milestone = false): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: '2026-01-01',
    e: end,
    actualStart: null,
    actualFinish: null,
    pct: 0,
    status: 'not_started',
    party: null,
    notes: '',
    milestone,
    manualStatus: false,
    manualPct: false,
    deps: [],
    wbsCode: '1.1',
    actualCost: 0,
  }
}

function makeBaseline(tasks: Task[]): Baseline {
  return { id: 'b1', name: 'b1', date: '2026-01-01', reason: '', lockedAt: '2026-01-01', tasks }
}

function makeAssessment(): DcmaAssessmentResult {
  return {
    generatedAt: new Date().toISOString(),
    checks: Array.from({ length: 16 }, (_, index) => ({
      id: (index + 1) as never,
      name: `Check ${index + 1}`,
      passed: index % 3 === 0,
      score: 50 + index,
      threshold: 90,
      plainEnglish: '',
      affectedTaskIds: [],
    })),
  }
}

describe('buildExecutiveReport', () => {
  it('orders top variances by slip descending and caps at 3', () => {
    const baselineTasks = [makeTask('a', '2026-01-02'), makeTask('b', '2026-01-03'), makeTask('c', '2026-01-04'), makeTask('d', '2026-01-05')]
    const currentTasks = [makeTask('a', '2026-01-08'), makeTask('b', '2026-01-07'), makeTask('c', '2026-01-06'), makeTask('d', '2026-01-04')]
    const report = buildExecutiveReport({
      tasks: currentTasks,
      baseline: makeBaseline(baselineTasks),
      assessment: makeAssessment(),
      healthScore: 77,
      evm: { pv: 100, ev: 90, ac: 80, spi: 0.9, cpi: 1.12 },
      statusDate: '2026-01-01',
    })
    expect(report.topVariances).toHaveLength(3)
    expect(report.topVariances[0]!.taskId).toBe('a')
    expect(report.cpi).toBe(1.12)
  })

  it('returns next five future milestones and preserves spi null fallback', () => {
    const tasks = [
      makeTask('m1', '2026-01-10', true),
      makeTask('m2', '2026-01-11', true),
      makeTask('m3', '2026-01-12', true),
      makeTask('m4', '2026-01-13', true),
      makeTask('m5', '2026-01-14', true),
      makeTask('m6', '2026-01-15', true),
    ]
    const report = buildExecutiveReport({
      tasks,
      baseline: null,
      assessment: makeAssessment(),
      healthScore: 70,
      evm: { pv: 0, ev: 0, ac: 0, spi: null, cpi: null },
      statusDate: '2026-01-10',
    })
    expect(report.nextMilestones).toHaveLength(5)
    expect(report.spi).toBeNull()
    expect(report.cpi).toBeNull()
  })
})
