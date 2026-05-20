import type { Task, Dependency, CpmResult } from '../types'
import { daysBetween } from './dates'

/**
 * Critical Path Method via Kahn topological sort + forward/backward pass.
 *
 * Duration = daysBetween(task.s, task.e) + 1 (inclusive calendar days).
 * Dependency types affect the forward pass timing:
 *   FS = finish-to-start (default): successor starts after predecessor finishes + lag
 *   SS = start-to-start: successor starts after predecessor starts + lag
 *   FF = finish-to-finish: successor finishes after predecessor finishes + lag
 *   SF = start-to-finish: successor finishes after predecessor starts + lag
 *
 * Returns null if a cycle is detected (no valid topological ordering).
 */
export function computeCriticalPath(
  tasks: Task[],
  dependencies: Dependency[],
): CpmResult | null {
  if (tasks.length === 0) {
    return {
      criticalIds: new Set(),
      earlyStart: new Map(),
      earlyFinish: new Map(),
      lateStart: new Map(),
      lateFinish: new Map(),
      totalFloat: new Map(),
    }
  }

  const taskMap = new Map(tasks.map(t => [t.id, t]))
  const duration = (id: string): number => {
    const t = taskMap.get(id)
    if (!t) return 1
    return Math.max(1, daysBetween(t.s, t.e) + 1)
  }

  // Build adjacency lists
  const successors = new Map<string, Dependency[]>()
  const predecessors = new Map<string, Dependency[]>()
  for (const t of tasks) {
    successors.set(t.id, [])
    predecessors.set(t.id, [])
  }
  for (const dep of dependencies) {
    if (!taskMap.has(dep.fromId) || !taskMap.has(dep.toId)) continue
    successors.get(dep.fromId)!.push(dep)
    predecessors.get(dep.toId)!.push(dep)
  }

  // ── Kahn topological sort ──────────────────────────────────────────────────
  const inDegree = new Map<string, number>()
  for (const t of tasks) inDegree.set(t.id, predecessors.get(t.id)!.length)

  const queue: string[] = []
  for (const t of tasks) {
    if (inDegree.get(t.id) === 0) queue.push(t.id)
  }

  const topoOrder: string[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    topoOrder.push(id)
    for (const dep of successors.get(id) ?? []) {
      const deg = (inDegree.get(dep.toId) ?? 0) - 1
      inDegree.set(dep.toId, deg)
      if (deg === 0) queue.push(dep.toId)
    }
  }

  if (topoOrder.length !== tasks.length) return null  // cycle detected

  // ── Forward pass (early start / early finish) ────────────────────────────
  const earlyStart = new Map<string, number>()
  const earlyFinish = new Map<string, number>()

  for (const id of topoOrder) {
    const preds = predecessors.get(id) ?? []
    let es = 0

    for (const dep of preds) {
      const predES = earlyStart.get(dep.fromId) ?? 0
      const predEF = earlyFinish.get(dep.fromId) ?? 0
      const lag = dep.lag ?? 0

      let constraint: number
      switch (dep.type) {
        case 'FS': constraint = predEF + lag;                   break
        case 'SS': constraint = predES + lag;                   break
        case 'FF': constraint = predEF + lag - duration(id) + 1; break
        case 'SF': constraint = predES + lag - duration(id) + 1; break
        default:   constraint = predEF + lag
      }
      if (constraint > es) es = constraint
    }

    earlyStart.set(id, es)
    earlyFinish.set(id, es + duration(id) - 1)
  }

  // ── Backward pass (late start / late finish) ──────────────────────────────
  const projectEnd = Math.max(...Array.from(earlyFinish.values()))
  const lateStart = new Map<string, number>()
  const lateFinish = new Map<string, number>()

  for (const t of tasks) lateFinish.set(t.id, projectEnd)

  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const id = topoOrder[i]!
    const succs = successors.get(id) ?? []
    let lf = projectEnd

    for (const dep of succs) {
      const succLS = lateStart.get(dep.toId) ?? projectEnd
      const succLF = lateFinish.get(dep.toId) ?? projectEnd
      const lag = dep.lag ?? 0

      let constraint: number
      switch (dep.type) {
        case 'FS': constraint = succLS - lag - 1;                     break
        case 'SS': constraint = succLS - lag + duration(id) - 1;      break
        case 'FF': constraint = succLF - lag;                          break
        case 'SF': constraint = succLF - lag + duration(id) - 1;      break
        default:   constraint = succLS - lag - 1
      }
      if (constraint < lf) lf = constraint
    }

    lateFinish.set(id, lf)
    lateStart.set(id, lf - duration(id) + 1)
  }

  // ── Total float & critical path ───────────────────────────────────────────
  const totalFloat = new Map<string, number>()
  const criticalIds = new Set<string>()

  for (const t of tasks) {
    const tf = (lateStart.get(t.id) ?? 0) - (earlyStart.get(t.id) ?? 0)
    totalFloat.set(t.id, tf)
    if (tf === 0) criticalIds.add(t.id)
  }

  return { criticalIds, earlyStart, earlyFinish, lateStart, lateFinish, totalFloat }
}
