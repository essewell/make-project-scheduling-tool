import { describe, expect, it } from 'vitest'
import { buildFloatDistribution } from '../../../src/lib/floatDistribution'
import type { Task } from '../../../src/types'

function makeTask(id: string): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: '2026-01-01',
    e: '2026-01-02',
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

describe('buildFloatDistribution', () => {
  it('buckets boundary values correctly', () => {
    const tasks = [
      makeTask('t-neg'),
      makeTask('t-0'),
      makeTask('t-1'),
      makeTask('t-5'),
      makeTask('t-6'),
      makeTask('t-10'),
      makeTask('t-11'),
      makeTask('t-20'),
      makeTask('t-21'),
      makeTask('t-50'),
      makeTask('t-51'),
      makeTask('t-100'),
      makeTask('t-101'),
    ]
    const floats = new Map<string, number>([
      ['t-neg', -1],
      ['t-0', 0],
      ['t-1', 1],
      ['t-5', 5],
      ['t-6', 6],
      ['t-10', 10],
      ['t-11', 11],
      ['t-20', 20],
      ['t-21', 21],
      ['t-50', 50],
      ['t-51', 51],
      ['t-100', 100],
      ['t-101', 101],
    ])

    const dist = buildFloatDistribution(tasks, floats)
    expect(dist.find((bucket) => bucket.key === 'neg')?.count).toBe(1)
    expect(dist.find((bucket) => bucket.key === 'zero')?.count).toBe(1)
    expect(dist.find((bucket) => bucket.key === '1-5')?.count).toBe(2)
    expect(dist.find((bucket) => bucket.key === '6-10')?.count).toBe(2)
    expect(dist.find((bucket) => bucket.key === '11-20')?.count).toBe(2)
    expect(dist.find((bucket) => bucket.key === '21-50')?.count).toBe(2)
    expect(dist.find((bucket) => bucket.key === '51-100')?.count).toBe(2)
    expect(dist.find((bucket) => bucket.key === 'gt100')?.count).toBe(1)
  })

  it('ignores tasks without float values', () => {
    const tasks = [makeTask('t1'), makeTask('t2')]
    const dist = buildFloatDistribution(tasks, new Map([['t1', 0]]))
    expect(dist.find((bucket) => bucket.key === 'zero')?.count).toBe(1)
    expect(dist.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(1)
  })
})
