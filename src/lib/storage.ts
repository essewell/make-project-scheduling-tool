import type { PersistedState, Task, Dependency } from '../types'
import { PERSISTED_SCHEMA_VERSION } from '../types'
import { STORAGE_KEY } from '../constants'

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_WORKWEEK = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }

export function makeDefaultState(projectName = 'My Project'): PersistedState {
  return {
    persistedSchemaVersion: PERSISTED_SCHEMA_VERSION,
    projectName,
    tasks: [],
    groups: [],
    parties: [],
    notes: [],
    dependencies: [],
    collapsedGroups: [],
    baselines: [],
    workweek: { ...DEFAULT_WORKWEEK },
    holidays: [],
    onboardingPhase: 'fresh',
    ghostStyle: 'stripe',
  }
}

// Migrate old persisted payloads to the current schema version
function migrateState(parsed: Record<string, unknown>): PersistedState {
  const base = {
    ...makeDefaultState(parsed?.projectName as string | undefined),
    ...parsed,
  }

  // If no schema version, assume legacy (0) and migrate
  const version = (parsed?.persistedSchemaVersion as number | undefined) ?? 0

  if (version === 0) {
    // Legacy: tasks may have `deps: string[]`. Convert to dependency edges if needed.
    const legacyDeps: Dependency[] = []
    if (Array.isArray(base.tasks)) {
      base.tasks.forEach((t: Task) => {
        if (Array.isArray(t.deps) && t.deps.length > 0) {
          t.deps.forEach((predId) => {
            legacyDeps.push({ fromId: predId, toId: t.id, type: 'FS', lag: 0 })
          })
        }
      })
    }
    // Merge with any existing dependencies but avoid duplicates
    const existing = Array.isArray(base.dependencies) ? base.dependencies : []
    const depsMap = new Map<string, Dependency>()
    ;[...existing, ...legacyDeps].forEach((d: Dependency) => {
      const key = `${d.fromId}->${d.toId}:${d.type}:${d.lag}`
      depsMap.set(key, d)
    })
    base.dependencies = Array.from(depsMap.values())

    // Ensure ghostStyle exists
    if (!base.ghostStyle) base.ghostStyle = 'stripe'
  }

  // Stamp the current schema version so downstream code can rely on the field.
  base.persistedSchemaVersion = PERSISTED_SCHEMA_VERSION
  return base as PersistedState
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeDefaultState()
    const parsed = JSON.parse(raw)
    const migrated = migrateState(parsed)
    return migrated
  } catch {
    return makeDefaultState()
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export function saveState(state: PersistedState): boolean {
  try {
    // Always stamp the current schema version on save, regardless of caller.
    const out: PersistedState = { ...state, persistedSchemaVersion: PERSISTED_SCHEMA_VERSION }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
    return true
  } catch {
    return false
  }
}

// ─── Reset ───────────────────────────────────────────────────────────────────

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}
