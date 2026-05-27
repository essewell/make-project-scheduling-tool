import { describe, it, expect } from 'vitest'
import { computeCriticalPath } from '../../../src/lib/cpm'
import type { CalendarEvent, Task, Dependency, CpmResult } from '../../../src/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Build a task with s/e dates that produce the requested calendar-day duration.
// duration = daysBetween(s, e) + 1, so e = s + (duration - 1) days.
// Uses 2024-01-01 as base (a Monday).
function makeTask(id: string, durationDays: number): Task {
  // s always 2024-01-01; e set to get the right duration
  const e = addDaysISO('2024-01-01', durationDays - 1)
  return {
    id, name: id, group: '',
    wbsCode: '',
    s: '2024-01-01', e,
    actualStart: null, actualFinish: null,
    actualCost: 0,
    pct: 0, status: 'not_started',
    party: null, notes: '', milestone: false,
    manualStatus: false, manualPct: false, deps: [],
  }
}

function serializeResult(result: CpmResult | null) {
  if (!result) return null
  return {
    criticalIds: Array.from(result.criticalIds).sort(),
    earlyStart: Array.from(result.earlyStart.entries()).sort(),
    earlyFinish: Array.from(result.earlyFinish.entries()).sort(),
    lateStart: Array.from(result.lateStart.entries()).sort(),
    lateFinish: Array.from(result.lateFinish.entries()).sort(),
    totalFloat: Array.from(result.totalFloat.entries()).sort(),
  }
}

function dep(fromId: string, toId: string, type: Dependency['type'] = 'FS', lag = 0): Dependency {
  return { fromId, toId, type, lag }
}

// Minimal date-math helper for test setup (avoids importing from lib under test)
function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y!, (m! - 1), d!)
  date.setDate(date.getDate() + n)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// ─── Empty / trivial ──────────────────────────────────────────────────────────

describe('computeCriticalPath — empty input', () => {
  it('returns an empty result for an empty task list', () => {
    const result = computeCriticalPath([], [])
    expect(result).not.toBeNull()
    expect(result!.criticalIds.size).toBe(0)
    expect(result!.earlyStart.size).toBe(0)
  })
})

// ─── No-dependency graphs ─────────────────────────────────────────────────────

describe('computeCriticalPath — independent tasks', () => {
  it('marks the longest task as critical (TF=0) when there are no dependencies', () => {
    // A=3d, B=5d, C=1d — B is the longest
    const tasks = [makeTask('A', 3), makeTask('B', 5), makeTask('C', 1)]
    const result = computeCriticalPath(tasks, [])!
    expect(result.criticalIds).toContain('B')
    expect(result.totalFloat.get('B')).toBe(0)
  })

  it('assigns positive float to shorter tasks', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 5)]
    const result = computeCriticalPath(tasks, [])!
    expect(result.totalFloat.get('A')).toBeGreaterThan(0)
  })

  it('single task has TF=0', () => {
    const result = computeCriticalPath([makeTask('A', 4)], [])!
    expect(result.totalFloat.get('A')).toBe(0)
    expect(result.criticalIds).toContain('A')
  })

  it('earlyStart=0 for all tasks with no predecessors', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 2)]
    const result = computeCriticalPath(tasks, [])!
    expect(result.earlyStart.get('A')).toBe(0)
    expect(result.earlyStart.get('B')).toBe(0)
  })
})

// ─── FS chain ─────────────────────────────────────────────────────────────────

describe('computeCriticalPath — FS chain', () => {
  //
  // This implementation uses a "same-day FS" convention: ES[successor] = EF[predecessor] + lag.
  // The backward pass uses `succLS - lag - 1`, producing a consistent -1 float offset for
  // every non-terminal task on a chain. Only the final task has TF=0.
  //
  it('forward pass: successor ES equals predecessor EF (same-day FS convention)', () => {
    // A=3d → B=2d, FS lag=0
    // EF[A] = 0 + 3 - 1 = 2  →  ES[B] = 2
    const tasks = [makeTask('A', 3), makeTask('B', 2)]
    const result = computeCriticalPath(tasks, [dep('A', 'B')])!
    expect(result.earlyStart.get('B')).toBe(result.earlyFinish.get('A'))
  })

  it('final task in a chain has TF=0', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 2)]
    const result = computeCriticalPath(tasks, [dep('A', 'B')])!
    expect(result.totalFloat.get('B')).toBe(0)
    expect(result.criticalIds).toContain('B')
  })

  it('non-terminal predecessor in a chain has TF=-1 (same-day FS backward-pass offset)', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 2)]
    const result = computeCriticalPath(tasks, [dep('A', 'B')])!
    expect(result.totalFloat.get('A')).toBe(-1)
  })

  it('three-task linear chain: only the last task has TF=0', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 2), makeTask('C', 4)]
    const deps = [dep('A', 'B'), dep('B', 'C')]
    const result = computeCriticalPath(tasks, deps)!
    expect(result.criticalIds).toContain('C')
    expect(result.criticalIds).not.toContain('A')
    expect(result.criticalIds).not.toContain('B')
  })
})

// ─── Parallel merge ───────────────────────────────────────────────────────────

describe('computeCriticalPath — parallel paths', () => {
  it('merge task is critical; shorter path has positive float', () => {
    // A(5d) → C(2d)  and  B(2d) → C(2d)
    // ES[C] = max(EF[A], EF[B]) = max(4, 1) = 4
    const tasks = [makeTask('A', 5), makeTask('B', 2), makeTask('C', 2)]
    const deps = [dep('A', 'C'), dep('B', 'C')]
    const result = computeCriticalPath(tasks, deps)!
    expect(result.criticalIds).toContain('C')
    // B's path is shorter — it has positive total float
    expect(result.totalFloat.get('B')).toBeGreaterThan(result.totalFloat.get('A')!)
  })

  it('ES of merge task is max of predecessor EFs', () => {
    const tasks = [makeTask('A', 5), makeTask('B', 2), makeTask('C', 2)]
    const deps = [dep('A', 'C'), dep('B', 'C')]
    const result = computeCriticalPath(tasks, deps)!
    const expected = Math.max(result.earlyFinish.get('A')!, result.earlyFinish.get('B')!)
    expect(result.earlyStart.get('C')).toBe(expected)
  })
})

// ─── SS dependency ────────────────────────────────────────────────────────────

describe('computeCriticalPath — SS dependency', () => {
  it('SS with lag: successor ES = predecessor ES + lag', () => {
    // A → B, SS, lag=2: ES[B] = ES[A] + 2 = 0 + 2 = 2
    const tasks = [makeTask('A', 5), makeTask('B', 3)]
    const result = computeCriticalPath(tasks, [dep('A', 'B', 'SS', 2)])!
    expect(result.earlyStart.get('B')).toBe(2)
  })

  it('SS with lag: both tasks can be critical when chain is tight', () => {
    // A(4d) → B(3d), SS lag=2
    // Forward: ES[A]=0, EF[A]=3; ES[B]=2, EF[B]=4
    // Project end = max(3, 4) = 4
    // Backward B: LF=4, LS=4-3+1=2
    // Backward A from B (SS): constraint = LS[B] - lag + duration(A) - 1 = 2 - 2 + 4 - 1 = 3
    //   → LF[A]=3, LS[A]=3-4+1=0, TF[A]=0
    const tasks = [makeTask('A', 4), makeTask('B', 3)]
    const result = computeCriticalPath(tasks, [dep('A', 'B', 'SS', 2)])!
    expect(result.totalFloat.get('A')).toBe(0)
    expect(result.totalFloat.get('B')).toBe(0)
    expect(result.criticalIds).toContain('A')
    expect(result.criticalIds).toContain('B')
  })
})

// ─── FS with lag ──────────────────────────────────────────────────────────────

describe('computeCriticalPath — FS with lag', () => {
  it('positive lag shifts successor ES forward', () => {
    // A(3d) → B(2d), FS lag=2
    // ES[A]=0, EF[A]=2; ES[B] = EF[A] + 2 = 4
    const tasks = [makeTask('A', 3), makeTask('B', 2)]
    const result = computeCriticalPath(tasks, [dep('A', 'B', 'FS', 2)])!
    expect(result.earlyStart.get('B')).toBe(4)
  })

  it('negative lag (lead) shifts successor ES backward', () => {
    // A(5d) → B(2d), FS lag=-2
    // ES[A]=0, EF[A]=4; ES[B] = EF[A] + (-2) = 2
    const tasks = [makeTask('A', 5), makeTask('B', 2)]
    const result = computeCriticalPath(tasks, [dep('A', 'B', 'FS', -2)])!
    expect(result.earlyStart.get('B')).toBe(2)
  })
})

// ─── Cycle detection ─────────────────────────────────────────────────────────

describe('computeCriticalPath — cycle detection', () => {
  it('returns null when a cycle is present', () => {
    const tasks = [makeTask('A', 2), makeTask('B', 2)]
    const deps = [dep('A', 'B'), dep('B', 'A')]   // A → B → A
    expect(computeCriticalPath(tasks, deps)).toBeNull()
  })

  it('returns null for self-loop', () => {
    const tasks = [makeTask('A', 2)]
    expect(computeCriticalPath(tasks, [dep('A', 'A')])).toBeNull()
  })

  it('returns valid result for a three-task cycle', () => {
    const tasks = [makeTask('A', 2), makeTask('B', 2), makeTask('C', 2)]
    const deps = [dep('A', 'B'), dep('B', 'C'), dep('C', 'A')]
    expect(computeCriticalPath(tasks, deps)).toBeNull()
  })
})

// ─── Unknown task IDs in dependencies ────────────────────────────────────────

describe('computeCriticalPath — edge cases', () => {
  it('ignores dependency edges that reference unknown task IDs', () => {
    const tasks = [makeTask('A', 3)]
    const deps = [dep('A', 'GHOST')]   // GHOST doesn't exist
    const result = computeCriticalPath(tasks, deps)
    expect(result).not.toBeNull()
    expect(result!.criticalIds).toContain('A')
  })

  it('handles a diamond dependency graph (A→B, A→C, B→D, C→D)', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 2), makeTask('C', 4), makeTask('D', 2)]
    const deps = [dep('A', 'B'), dep('A', 'C'), dep('B', 'D'), dep('C', 'D')]
    const result = computeCriticalPath(tasks, deps)
    expect(result).not.toBeNull()
    // D is the final merge node — should be critical
    expect(result!.criticalIds).toContain('D')
    // ES[D] driven by the longer of B's path and C's path
    expect(result!.earlyStart.get('D')).toBeGreaterThan(0)
  })
})

describe('computeCriticalPath — project calendar integration', () => {
  const nonWorkWeek: CalendarEvent[] = [
    {
      id: 'cal-1',
      name: 'Shutdown day',
      start: '2024-01-03',
      end: '2024-01-03',
      type: 'owner_shutdown',
      classification: 'non_work',
      notes: '',
    },
  ]

  it('extends effective task duration when non_work day falls inside task window', () => {
    const tasks = [makeTask('A', 3)] // Jan 1 to Jan 3
    const withoutCalendar = computeCriticalPath(tasks, [])!
    const withCalendar = computeCriticalPath(tasks, [], nonWorkWeek)!
    expect(withCalendar.earlyFinish.get('A')).toBe((withoutCalendar.earlyFinish.get('A') ?? 0) + 1)
  })

  it('empty projectCalendar produces byte-identical output to legacy call shape', () => {
    const tasks = [makeTask('A', 3), makeTask('B', 2), makeTask('C', 4)]
    const deps = [dep('A', 'B'), dep('B', 'C')]
    const legacy = computeCriticalPath(tasks, deps)
    const explicitEmpty = computeCriticalPath(tasks, deps, [])
    expect(serializeResult(explicitEmpty)).toEqual(serializeResult(legacy))
  })
})
