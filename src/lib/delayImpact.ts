import type { CpmResult, Delay, Dependency, Task } from '../types'
import { durationDays } from './dates'

export interface DelayImpactResult {
  criticalPathImpactDays: number
  affectedDownstreamTaskIds: string[]
}

function buildDownstreamMap(dependencies: Dependency[]): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const dep of dependencies) {
    const list = out.get(dep.fromId)
    if (list) list.push(dep.toId)
    else out.set(dep.fromId, [dep.toId])
  }
  return out
}

function collectDownstream(seedTaskIds: string[], dependencies: Dependency[]): Set<string> {
  const downstreamByFrom = buildDownstreamMap(dependencies)
  const visited = new Set<string>()
  const queue = [...seedTaskIds]
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || visited.has(current)) continue
    visited.add(current)
    const next = downstreamByFrom.get(current)
    if (!next) continue
    for (const taskId of next) {
      if (!visited.has(taskId)) queue.push(taskId)
    }
  }
  return visited
}

export function computeDelayImpact(
  delay: Delay,
  tasks: Task[],
  dependencies: Dependency[],
  cpmResult: CpmResult | null,
): DelayImpactResult {
  const taskIds = new Set(tasks.map((task) => task.id))
  const affectedSeeds = delay.affectedTaskIds.filter((taskId) => taskIds.has(taskId))
  const delaySpan = delay.start <= delay.end ? durationDays(delay.start, delay.end) : 0
  const downstream = collectDownstream(affectedSeeds, dependencies)
  const downstreamIds = [...downstream]

  if (!cpmResult || delaySpan <= 0) {
    return {
      criticalPathImpactDays: 0,
      affectedDownstreamTaskIds: downstreamIds,
    }
  }

  const touchesCriticalPath = affectedSeeds.some((taskId) => cpmResult.criticalIds.has(taskId))
  return {
    criticalPathImpactDays: touchesCriticalPath ? delaySpan : 0,
    affectedDownstreamTaskIds: downstreamIds,
  }
}
