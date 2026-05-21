import { describe, it, expect, beforeEach } from 'vitest'
import { loadState, saveState, clearState, makeDefaultState, DEFAULT_WORKWEEK } from '../../../src/lib/storage'
import { PERSISTED_SCHEMA_VERSION } from '../../../src/types'
import { STORAGE_KEY } from '../../../src/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMinimalTask(id: string, extraDeps: string[] = []) {
  return {
    id,
    name: `Task ${id}`,
    group: '',
    s: '2024-01-01',
    e: '2024-01-05',
    actualStart: null,
    actualFinish: null,
    pct: 0,
    status: 'not_started',
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: extraDeps,
  }
}

// ─── makeDefaultState ─────────────────────────────────────────────────────────

describe('makeDefaultState', () => {
  it('uses the current schema version', () => {
    const state = makeDefaultState()
    expect(state.persistedSchemaVersion).toBe(PERSISTED_SCHEMA_VERSION)
  })

  it('defaults projectName to "My Project"', () => {
    expect(makeDefaultState().projectName).toBe('My Project')
  })

  it('accepts a custom project name', () => {
    expect(makeDefaultState('Custom').projectName).toBe('Custom')
  })

  it('has a Mon-Fri workweek', () => {
    const { workweek } = makeDefaultState()
    expect(workweek).toEqual(DEFAULT_WORKWEEK)
    expect(workweek.mon).toBe(true)
    expect(workweek.sat).toBe(false)
    expect(workweek.sun).toBe(false)
  })

  it('defaults ghostStyle to "stripe"', () => {
    expect(makeDefaultState().ghostStyle).toBe('stripe')
  })

  it('has empty arrays for all collection fields', () => {
    const s = makeDefaultState()
    expect(s.tasks).toHaveLength(0)
    expect(s.groups).toHaveLength(0)
    expect(s.parties).toHaveLength(0)
    expect(s.notes).toHaveLength(0)
    expect(s.dependencies).toHaveLength(0)
    expect(s.collapsedGroups).toHaveLength(0)
    expect(s.baselines).toHaveLength(0)
    expect(s.holidays).toHaveLength(0)
  })

  it('starts with onboardingPhase "fresh"', () => {
    expect(makeDefaultState().onboardingPhase).toBe('fresh')
  })
})

// ─── loadState — empty/missing localStorage ───────────────────────────────────

describe('loadState — empty localStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns a default state when nothing is stored', () => {
    const state = loadState()
    expect(state.persistedSchemaVersion).toBe(PERSISTED_SCHEMA_VERSION)
    expect(state.tasks).toHaveLength(0)
  })

  it('returns default state when stored JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{')
    const state = loadState()
    expect(state.tasks).toHaveLength(0)
    expect(state.persistedSchemaVersion).toBe(PERSISTED_SCHEMA_VERSION)
  })
})

// ─── saveState + loadState round-trip ────────────────────────────────────────

describe('saveState + loadState round-trip', () => {
  beforeEach(() => localStorage.clear())

  it('persists and restores projectName', () => {
    const state = { ...makeDefaultState('Round Trip Project') }
    saveState(state)
    expect(loadState().projectName).toBe('Round Trip Project')
  })

  it('persists and restores tasks array', () => {
    const state = makeDefaultState()
    state.tasks = [makeMinimalTask('abc')]
    saveState(state)
    const loaded = loadState()
    expect(loaded.tasks).toHaveLength(1)
    expect(loaded.tasks[0]!.id).toBe('abc')
  })

  it('persists and restores dependencies', () => {
    const state = makeDefaultState()
    state.dependencies = [{ fromId: 'a', toId: 'b', type: 'FS', lag: 2 }]
    saveState(state)
    const loaded = loadState()
    expect(loaded.dependencies).toHaveLength(1)
    expect(loaded.dependencies[0]).toMatchObject({ fromId: 'a', toId: 'b', type: 'FS', lag: 2 })
  })

  it('always stamps the current schema version on save', () => {
    const state = makeDefaultState()
    // Simulate a caller that forgets to set the version
    ;(state as Record<string, unknown>).persistedSchemaVersion = 999
    saveState(state)
    expect(loadState().persistedSchemaVersion).toBe(PERSISTED_SCHEMA_VERSION)
  })

  it('persists ghostStyle', () => {
    const state = makeDefaultState()
    state.ghostStyle = 'solid'
    saveState(state)
    expect(loadState().ghostStyle).toBe('solid')
  })

  it('persists workweek overrides', () => {
    const state = makeDefaultState()
    state.workweek = { ...DEFAULT_WORKWEEK, sat: true }
    saveState(state)
    expect(loadState().workweek.sat).toBe(true)
  })
})

// ─── clearState ───────────────────────────────────────────────────────────────

describe('clearState', () => {
  beforeEach(() => localStorage.clear())

  it('removes the storage key so subsequent loadState returns defaults', () => {
    saveState(makeDefaultState('To Be Cleared'))
    clearState()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(loadState().projectName).toBe('My Project')
  })
})

// ─── v0 migration ─────────────────────────────────────────────────────────────

describe('loadState — v0 migration', () => {
  beforeEach(() => localStorage.clear())

  it('converts legacy task.deps string[] to FS dependency edges', () => {
    const v0 = {
      projectName: 'Legacy',
      tasks: [makeMinimalTask('t1', ['t2']), makeMinimalTask('t2')],
      groups: [], parties: [], notes: [], collapsedGroups: [],
      baselines: [], workweek: DEFAULT_WORKWEEK, holidays: [],
      onboardingPhase: 'complete',
      // no persistedSchemaVersion — this is what makes it v0
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v0))

    const loaded = loadState()
    expect(loaded.dependencies).toHaveLength(1)
    expect(loaded.dependencies[0]).toMatchObject({ fromId: 't2', toId: 't1', type: 'FS', lag: 0 })
  })

  it('stamps persistedSchemaVersion=1 after migration', () => {
    const v0 = {
      projectName: 'Legacy',
      tasks: [], groups: [], parties: [], notes: [], collapsedGroups: [],
      baselines: [], workweek: DEFAULT_WORKWEEK, holidays: [],
      onboardingPhase: 'complete',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v0))
    expect(loadState().persistedSchemaVersion).toBe(1)
  })

  it('sets ghostStyle to "stripe" when missing', () => {
    const v0 = {
      projectName: 'Legacy',
      tasks: [], groups: [], parties: [], notes: [], collapsedGroups: [],
      baselines: [], workweek: DEFAULT_WORKWEEK, holidays: [],
      onboardingPhase: 'complete',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v0))
    expect(loadState().ghostStyle).toBe('stripe')
  })

  it('handles multiple tasks with deps, creating one edge per dep', () => {
    const v0 = {
      projectName: 'Multi',
      tasks: [
        makeMinimalTask('t1', ['t2', 't3']),  // t1 has two predecessors
        makeMinimalTask('t2'),
        makeMinimalTask('t3'),
      ],
      groups: [], parties: [], notes: [], collapsedGroups: [],
      baselines: [], workweek: DEFAULT_WORKWEEK, holidays: [],
      onboardingPhase: 'complete',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v0))

    const loaded = loadState()
    expect(loaded.dependencies).toHaveLength(2)
    const toIds = loaded.dependencies.map(d => d.fromId).sort()
    expect(toIds).toEqual(['t2', 't3'])
  })

  it('tasks with empty deps array produce no edges', () => {
    const v0 = {
      projectName: 'NoDeps',
      tasks: [makeMinimalTask('t1'), makeMinimalTask('t2')],
      groups: [], parties: [], notes: [], collapsedGroups: [],
      baselines: [], workweek: DEFAULT_WORKWEEK, holidays: [],
      onboardingPhase: 'complete',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v0))
    expect(loadState().dependencies).toHaveLength(0)
  })

  it('deduplicates edges if both task.deps and dependencies overlap', () => {
    const v0 = {
      projectName: 'Dup',
      tasks: [makeMinimalTask('t1', ['t2']), makeMinimalTask('t2')],
      // already has the same edge as a dependency
      dependencies: [{ fromId: 't2', toId: 't1', type: 'FS', lag: 0 }],
      groups: [], parties: [], notes: [], collapsedGroups: [],
      baselines: [], workweek: DEFAULT_WORKWEEK, holidays: [],
      onboardingPhase: 'complete',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v0))
    // Should deduplicate to one edge
    expect(loadState().dependencies).toHaveLength(1)
  })
})
