import { describe, expect, it } from 'vitest'
import { computeScheduleHealth } from '../../../src/lib/health'
import type { DcmaAssessmentResult, Task } from '../../../src/types'
import type { FloatBucketCount } from '../../../src/lib/floatDistribution'

function makeTask(id: string, status: Task['status'] = 'not_started'): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: '2026-01-01',
    e: '2026-01-02',
    actualStart: null,
    actualFinish: null,
    pct: 0,
    status,
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: [],
  }
}

function makeAssessment(overrides?: Partial<Record<number, Partial<{ score: number; note: string; affectedTaskIds: string[] }>>>): DcmaAssessmentResult {
  const checks = Array.from({ length: 14 }, (_, index) => {
    const id = index + 1
    const override = overrides?.[id]
    return {
      id: id as never,
      name: `Check ${id}`,
      passed: true,
      score: override?.score ?? 100,
      threshold: 0,
      plainEnglish: '',
      affectedTaskIds: override?.affectedTaskIds ?? [],
      note: override?.note,
    }
  })
  return {
    checks,
    generatedAt: new Date().toISOString(),
  }
}

function makeFloatDistribution(overrides?: Partial<Record<string, number>>): FloatBucketCount[] {
  const base: FloatBucketCount[] = [
    { key: 'neg', label: '<0', min: Number.NEGATIVE_INFINITY, max: -1, count: 0 },
    { key: 'zero', label: '0', min: 0, max: 0, count: 0 },
    { key: '1-5', label: '1–5', min: 1, max: 5, count: 0 },
    { key: '6-10', label: '6–10', min: 6, max: 10, count: 0 },
    { key: '11-20', label: '11–20', min: 11, max: 20, count: 0 },
    { key: '21-50', label: '21–50', min: 21, max: 50, count: 0 },
    { key: '51-100', label: '51–100', min: 51, max: 100, count: 0 },
    { key: 'gt100', label: '>100', min: 101, max: null, count: 0 },
  ]
  return base.map((bucket) => ({ ...bucket, count: overrides?.[bucket.key] ?? bucket.count }))
}

describe('computeScheduleHealth', () => {
  it('computes a rounded score with all subscores available', () => {
    const tasks = [makeTask('A', 'complete'), makeTask('B', 'complete')]
    const assessment = makeAssessment({
      1: { score: 100, affectedTaskIds: [] },
      2: { score: 0 },
      3: { score: 0 },
      4: { score: 100 },
      10: { affectedTaskIds: [] },
      14: { score: 1 },
    })
    const floatDistribution = makeFloatDistribution({ '11-20': 2 })
    const result = computeScheduleHealth({
      assessment,
      tasks,
      overAllocatedResourceCount: 0,
      totalResourceCount: 10,
      floatDistribution,
    })
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('redistributes weights when baseline is N/A', () => {
    const tasks = [makeTask('A')]
    const assessment = makeAssessment({
      14: { score: 0, note: 'N/A — capture a baseline first.' },
      10: { affectedTaskIds: [] },
      1: { affectedTaskIds: [] },
    })
    const result = computeScheduleHealth({
      assessment,
      tasks,
      overAllocatedResourceCount: 0,
      totalResourceCount: 1,
      floatDistribution: makeFloatDistribution({ zero: 1 }),
    })
    expect(result.normalizedWeights.baseline).toBe(0)
    expect(result.normalizedWeights.logic).toBeGreaterThan(0.3)
  })

  it('treats no resources as fully feasible', () => {
    const tasks = [makeTask('A')]
    const assessment = makeAssessment({ 10: { affectedTaskIds: [] }, 1: { affectedTaskIds: [] } })
    const result = computeScheduleHealth({
      assessment,
      tasks,
      overAllocatedResourceCount: 0,
      totalResourceCount: 0,
      floatDistribution: makeFloatDistribution({ zero: 1 }),
    })
    expect(result.subscores.resourceSubscore).toBe(100)
  })

  it('penalizes extreme float distribution', () => {
    const tasks = [makeTask('A'), makeTask('B'), makeTask('C'), makeTask('D')]
    const assessment = makeAssessment({ 10: { affectedTaskIds: [] }, 1: { affectedTaskIds: [] } })
    const result = computeScheduleHealth({
      assessment,
      tasks,
      overAllocatedResourceCount: 0,
      totalResourceCount: 1,
      floatDistribution: makeFloatDistribution({ neg: 2, gt100: 1, zero: 1 }),
    })
    expect(result.subscores.floatSubscore).toBeLessThan(60)
  })
})
