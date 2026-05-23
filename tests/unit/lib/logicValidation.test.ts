import { describe, expect, it } from 'vitest'
import {
  findExcessiveLagDependencies,
  findNegativeFloatTaskIds,
  findOrphanTaskIds,
  runLogicValidation,
} from '../../../src/lib/logicValidation'
import type { Dependency, Task } from '../../../src/types'

function makeTask(id: string, s = '2026-01-01', e = '2026-01-05'): Task {
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

describe('logicValidation', () => {
  it('finds fully orphaned tasks', () => {
    const tasks = [makeTask('A'), makeTask('B')]
    const deps: Dependency[] = [{ fromId: 'A', toId: 'A', type: 'FS', lag: 0 }]
    const orphans = findOrphanTaskIds(tasks, deps)
    expect(orphans).toContain('B')
  })

  it('finds negative float task ids', () => {
    const tasks = [makeTask('A'), makeTask('B')]
    const floats = new Map<string, number>([['A', -1], ['B', 2]])
    expect(findNegativeFloatTaskIds(tasks, floats)).toEqual(['A'])
  })

  it('flags excessive lag only above ratio threshold', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-01-10'), makeTask('B')]
    const deps: Dependency[] = [
      { fromId: 'A', toId: 'B', type: 'FS', lag: 5 },
      { fromId: 'A', toId: 'B', type: 'SS', lag: 6 },
    ]
    const flagged = findExcessiveLagDependencies(tasks, deps, 0.5)
    expect(flagged).toHaveLength(1)
    expect(flagged[0]?.lag).toBe(6)
  })

  it('aggregates orphan/negative/excessive lag signals', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-01-10'), makeTask('B'), makeTask('C')]
    const deps: Dependency[] = [{ fromId: 'A', toId: 'B', type: 'FS', lag: 7 }]
    const floats = new Map<string, number>([['A', 0], ['B', -1], ['C', 3]])
    const result = runLogicValidation(tasks, deps, floats, 0.5)
    expect(result.orphanTaskIds).toContain('C')
    expect(result.negativeFloatTaskIds).toContain('B')
    expect(result.excessiveLagDependencyTaskIds).toContain('A')
    expect(result.excessiveLagDependencyTaskIds).toContain('B')
  })
})
