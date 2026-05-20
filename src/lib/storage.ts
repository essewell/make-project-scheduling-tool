import type { PersistedState } from '../types'
import { STORAGE_KEY } from '../constants'

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_WORKWEEK = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }

export function makeDefaultState(projectName = 'My Project'): PersistedState {
  return {
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

// ─── Load ─────────────────────────────────────────────────────────────────────

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeDefaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    // Merge with defaults to handle missing fields from older versions
    return {
      ...makeDefaultState(parsed.projectName),
      ...parsed,
    }
  } catch {
    return makeDefaultState()
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export function saveState(state: PersistedState): void {
  try {
    // Strip undo stack (restore fns are not serializable)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

// ─── Reset ───────────────────────────────────────────────────────────────────

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}
