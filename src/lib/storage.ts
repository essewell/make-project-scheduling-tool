import type { PersistedState, Task, Dependency, Baseline, Group } from '../types'
import { PERSISTED_SCHEMA_VERSION } from '../types'
import { STORAGE_KEY } from '../constants'
import { computeWbsCodes } from './wbs'

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
    projectCalendar: [],
    delays: [],
    onboardingPhase: 'fresh',
    ghostStyle: 'stripe',
    resources: [],
    assignments: [],
    changeOrders: [],
    varianceSnapshots: [],
  }
}

function normalizeGroups(groups: Group[]): Group[] {
  return groups.map((group) => ({
    ...group,
    parentId: group.parentId ?? null,
    wbsCode: group.wbsCode ?? '',
  }))
}

function normalizeTasks(tasks: Task[]): Task[] {
  return tasks.map((task) => ({
    ...task,
    wbsCode: task.wbsCode ?? '',
    actualCost: Number.isFinite(task.actualCost) ? task.actualCost : 0,
  }))
}

function stampWbs(groups: Group[], tasks: Task[]): { groups: Group[]; tasks: Task[] } {
  const normalizedGroups = normalizeGroups(groups)
  const normalizedTasks = normalizeTasks(tasks)
  const { groupCodes, taskCodes } = computeWbsCodes(normalizedGroups, normalizedTasks)

  const stampedGroups = normalizedGroups.map((group) => ({
    ...group,
    wbsCode: groupCodes.get(group.id) ?? '',
  }))

  const stampedTasks = normalizedTasks.map((task) => ({
    ...task,
    wbsCode: taskCodes.get(task.id) ?? '',
  }))

  return { groups: stampedGroups, tasks: stampedTasks }
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

  if (version === 1) {
    if (!Array.isArray(base.resources)) base.resources = []
    if (!Array.isArray(base.assignments)) base.assignments = []
  }

  if (version === 2) {
    if (!Array.isArray(base.changeOrders)) base.changeOrders = []
    if (!Array.isArray(base.varianceSnapshots)) base.varianceSnapshots = []
    if (Array.isArray(base.baselines)) {
      base.baselines = (base.baselines as Baseline[]).map((baseline) => ({
        ...baseline,
        reason: typeof baseline.reason === 'string' ? baseline.reason : '',
        lockedAt: typeof baseline.lockedAt === 'string' ? baseline.lockedAt : baseline.date,
      }))
    }
  }

  if (version <= 3) {
    base.groups = normalizeGroups(Array.isArray(base.groups) ? (base.groups as Group[]) : [])
    base.tasks = normalizeTasks(Array.isArray(base.tasks) ? (base.tasks as Task[]) : [])
  }

  if (version <= 4) {
    if (!Array.isArray(base.projectCalendar)) base.projectCalendar = []
    if (!Array.isArray(base.delays)) base.delays = []
  }

  const stamped = stampWbs(base.groups as Group[], base.tasks as Task[])
  base.groups = stamped.groups
  base.tasks = stamped.tasks

  if (Array.isArray(base.baselines)) {
    base.baselines = (base.baselines as Baseline[]).map((baseline) => {
      const baselineStamped = stampWbs(stamped.groups, normalizeTasks(baseline.tasks as Task[]))
      return {
        ...baseline,
        tasks: baselineStamped.tasks,
      }
    })
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
    const stamped = stampWbs(state.groups, state.tasks)
    const baselines = state.baselines.map((baseline) => {
      const baselineStamped = stampWbs(stamped.groups, baseline.tasks)
      return { ...baseline, tasks: baselineStamped.tasks }
    })
    const out: PersistedState = {
      ...state,
      groups: stamped.groups,
      tasks: stamped.tasks,
      baselines,
      persistedSchemaVersion: PERSISTED_SCHEMA_VERSION,
    }
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
