import { describe, expect, it } from 'vitest'
import { computeCriticalPath } from '../../../src/lib/cpm'
import { runDcmaAssessment } from '../../../src/lib/dcma'
import type {
  Baseline,
  Dependency,
  Resource,
  ResourceAssignment,
  Task,
} from '../../../src/types'

function makeTask(id: string, start: string, end: string, patch: Partial<Task> = {}): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: start,
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
    ...patch,
  }
}

function makeResource(id: string, category: Resource['category'] = 'labor'): Resource {
  return {
    id,
    name: id,
    category,
    unit: 'hours',
    capacity: 2,
    costRate: 100,
    color: '#378ADD',
  }
}

function makeAssignment(id: string, taskId: string, resourceId: string): ResourceAssignment {
  return { id, taskId, resourceId, quantity: 1, notes: '' }
}

function baseContext(input?: Partial<{
  tasks: Task[]
  dependencies: Dependency[]
  resources: Resource[]
  assignments: ResourceAssignment[]
  baselines: Baseline[]
  today: string
}>) {
  const tasks = input?.tasks ?? [
    makeTask('A', '2026-01-01', '2026-01-03'),
    makeTask('B', '2026-01-04', '2026-01-07'),
  ]
  const dependencies = input?.dependencies ?? [{ fromId: 'A', toId: 'B', type: 'FS', lag: 0 as const }]
  return {
    tasks,
    dependencies,
    resources: input?.resources ?? [makeResource('r1')],
    assignments: input?.assignments ?? [makeAssignment('a1', 'A', 'r1'), makeAssignment('a2', 'B', 'r1')],
    baselines: input?.baselines ?? [],
    cpm: computeCriticalPath(tasks, dependencies),
    today: input?.today ?? '2026-01-10',
  }
}

describe('runDcmaAssessment', () => {
  it('returns all 14 checks', () => {
    const result = runDcmaAssessment(baseContext())
    expect(result.checks).toHaveLength(14)
    expect(result.generatedAt.length).toBeGreaterThan(0)
  })

  it('check 1 flags orphan logic', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-01-02'), makeTask('B', '2026-01-03', '2026-01-04')]
    const result = runDcmaAssessment(baseContext({ tasks, dependencies: [] }))
    const logic = result.checks.find((check) => check.id === 1)!
    expect(logic.passed).toBe(false)
    expect(logic.affectedTaskIds).toContain('A')
    expect(logic.affectedTaskIds).toContain('B')
  })

  it('check 2 fails when negative lag exists', () => {
    const deps: Dependency[] = [{ fromId: 'A', toId: 'B', type: 'FS', lag: -1 }]
    const result = runDcmaAssessment(baseContext({ dependencies: deps }))
    const leads = result.checks.find((check) => check.id === 2)!
    expect(leads.passed).toBe(false)
    expect(leads.score).toBe(1)
  })

  it('check 3 fails with lag ratio above threshold', () => {
    const deps: Dependency[] = [
      { fromId: 'A', toId: 'B', type: 'FS', lag: 1 },
      { fromId: 'B', toId: 'A', type: 'SS', lag: 0 },
    ]
    const result = runDcmaAssessment(baseContext({ dependencies: deps }))
    const lags = result.checks.find((check) => check.id === 3)!
    expect(lags.passed).toBe(false)
    expect(lags.score).toBeGreaterThan(5)
  })

  it('check 4 fails when FS ratio is low', () => {
    const deps: Dependency[] = [{ fromId: 'A', toId: 'B', type: 'SS', lag: 0 }]
    const result = runDcmaAssessment(baseContext({ dependencies: deps }))
    const rel = result.checks.find((check) => check.id === 4)!
    expect(rel.passed).toBe(false)
    expect(rel.score).toBe(0)
  })

  it('check 5 returns neutral placeholder', () => {
    const result = runDcmaAssessment(baseContext())
    const hard = result.checks.find((check) => check.id === 5)!
    expect(hard.passed).toBe(true)
    expect(hard.note).toContain('neutral')
  })

  it('check 6 flags high float tasks', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-01-02'), makeTask('B', '2026-01-20', '2026-01-22')]
    const context = baseContext({ tasks, dependencies: [] })
    const result = runDcmaAssessment({
      ...context,
      cpm: {
        criticalIds: new Set(['A']),
        earlyStart: new Map(),
        earlyFinish: new Map(),
        lateStart: new Map(),
        lateFinish: new Map(),
        totalFloat: new Map([
          ['A', 0],
          ['B', 60],
        ]),
      },
    })
    const highFloat = result.checks.find((check) => check.id === 6)!
    expect(highFloat.affectedTaskIds.length).toBeGreaterThan(0)
  })

  it('check 7 flags negative float tasks', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-01-03')]
    const context = baseContext({ tasks, dependencies: [] })
    const result = runDcmaAssessment({
      ...context,
      cpm: {
        criticalIds: new Set(['A']),
        earlyStart: new Map(),
        earlyFinish: new Map(),
        lateStart: new Map(),
        lateFinish: new Map(),
        totalFloat: new Map([['A', -2]]),
      },
    })
    const negFloat = result.checks.find((check) => check.id === 7)!
    expect(negFloat.passed).toBe(false)
  })

  it('check 8 flags long duration tasks', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-03-15')]
    const result = runDcmaAssessment(baseContext({ tasks, dependencies: [] }))
    const longDuration = result.checks.find((check) => check.id === 8)!
    expect(longDuration.passed).toBe(false)
  })

  it('check 9 flags invalid future actual dates', () => {
    const tasks = [
      makeTask('A', '2026-01-01', '2026-01-05', { actualFinish: '2026-02-01' }),
    ]
    const result = runDcmaAssessment(baseContext({ tasks, dependencies: [], today: '2026-01-10' }))
    const invalid = result.checks.find((check) => check.id === 9)!
    expect(invalid.passed).toBe(false)
    expect(invalid.affectedTaskIds).toContain('A')
  })

  it('check 10 fails for unresourced work tasks', () => {
    const tasks = [makeTask('A', '2026-01-01', '2026-01-03'), makeTask('B', '2026-01-04', '2026-01-05')]
    const assignments = [makeAssignment('a1', 'A', 'r1')]
    const result = runDcmaAssessment(baseContext({ tasks, assignments }))
    const resources = result.checks.find((check) => check.id === 10)!
    expect(resources.passed).toBe(false)
    expect(resources.affectedTaskIds).toContain('B')
  })

  it('check 11 flags missed incomplete tasks', () => {
    const tasks = [
      makeTask('A', '2026-01-01', '2026-01-02', { status: 'in_progress' }),
    ]
    const result = runDcmaAssessment(baseContext({ tasks, dependencies: [], today: '2026-01-10' }))
    const missed = result.checks.find((check) => check.id === 11)!
    expect(missed.passed).toBe(false)
  })

  it('check 12 marks failure when no critical path is available', () => {
    const context = baseContext()
    const result = runDcmaAssessment({ ...context, cpm: null })
    const cpTest = result.checks.find((check) => check.id === 12)!
    expect(cpTest.passed).toBe(false)
    expect(cpTest.note).toContain('No critical path')
  })

  it('check 13 computes CPLI with cpm context', () => {
    const result = runDcmaAssessment(baseContext({ today: '2026-01-01' }))
    const cpli = result.checks.find((check) => check.id === 13)!
    expect(typeof cpli.score).toBe('number')
  })

  it('check 14 returns N/A note when no baseline exists', () => {
    const result = runDcmaAssessment(baseContext({ baselines: [] }))
    const bei = result.checks.find((check) => check.id === 14)!
    expect(bei.passed).toBe(false)
    expect(bei.note).toContain('capture a baseline')
  })

  it('check 14 computes BEI against latest baseline', () => {
    const tasks = [
      makeTask('A', '2026-01-01', '2026-01-02', { actualFinish: '2026-01-02', status: 'complete' }),
      makeTask('B', '2026-01-03', '2026-01-04', { actualFinish: null, status: 'in_progress' }),
    ]
    const baseline: Baseline = {
      id: 'b1',
      name: 'Baseline 1',
      date: '2026-01-01',
      tasks: tasks.map((task) => ({ ...task })),
    }
    const result = runDcmaAssessment(baseContext({ tasks, baselines: [baseline], today: '2026-01-10' }))
    const bei = result.checks.find((check) => check.id === 14)!
    expect(bei.score).toBe(0.5)
    expect(bei.passed).toBe(false)
  })
})
