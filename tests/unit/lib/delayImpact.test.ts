import { describe, expect, it } from 'vitest'
import type { CpmResult, Delay, Dependency, Task } from '../../../src/types'
import { computeDelayImpact } from '../../../src/lib/delayImpact'

function makeTask(id: string): Task {
  return {
    id,
    name: id,
    group: 'g1',
    wbsCode: '1.1',
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
  }
}

function makeDelay(): Delay {
  return {
    id: 'd1',
    recordedAt: '2026-05-27T00:00:00.000Z',
    start: '2026-01-10',
    end: '2026-01-12',
    type: 'weather',
    excusable: true,
    affectedTaskIds: ['A'],
    daysImpact: 3,
    criticalPathImpactDays: 0,
    responsibleParty: 'Owner',
    narrative: 'Weather',
    reconciliation: 'pending',
  }
}

const dependencies: Dependency[] = [
  { fromId: 'A', toId: 'B', type: 'FS', lag: 0 },
  { fromId: 'B', toId: 'C', type: 'FS', lag: 0 },
]

const cpm: CpmResult = {
  criticalIds: new Set(['A', 'B', 'C']),
  earlyStart: new Map(),
  earlyFinish: new Map(),
  lateStart: new Map(),
  lateFinish: new Map(),
  totalFloat: new Map(),
}

describe('computeDelayImpact', () => {
  it('returns downstream task ids from dependency graph', () => {
    const result = computeDelayImpact(makeDelay(), [makeTask('A'), makeTask('B'), makeTask('C')], dependencies, null)
    expect(result.affectedDownstreamTaskIds.sort()).toEqual(['A', 'B', 'C'])
    expect(result.criticalPathImpactDays).toBe(0)
  })

  it('stamps critical-path impact when affected task is critical', () => {
    const result = computeDelayImpact(makeDelay(), [makeTask('A'), makeTask('B'), makeTask('C')], dependencies, cpm)
    expect(result.criticalPathImpactDays).toBe(3)
  })

  it('returns zero impact when affected tasks are non-critical', () => {
    const nonCriticalCpm: CpmResult = { ...cpm, criticalIds: new Set(['B', 'C']) }
    const result = computeDelayImpact(makeDelay(), [makeTask('A'), makeTask('B'), makeTask('C')], dependencies, nonCriticalCpm)
    expect(result.criticalPathImpactDays).toBe(0)
  })
})
