import { daysBetween } from './dates'
import type { Baseline, Delay, DelayType, Task, VarianceSnapshot } from '../types'

function getProjectFinish(tasks: Task[]): string | null {
  if (tasks.length === 0) return null
  return tasks.reduce((max, task) => (task.e > max ? task.e : max), tasks[0]!.e)
}

export function computeProjectFinishVariance(tasks: Task[], baseline: Baseline): number {
  const currentFinish = getProjectFinish(tasks)
  const baselineFinish = getProjectFinish(baseline.tasks)
  if (!currentFinish || !baselineFinish) return 0
  return daysBetween(baselineFinish, currentFinish)
}

export function appendVarianceSnapshot(
  snapshots: VarianceSnapshot[],
  nextSnapshot: VarianceSnapshot,
): VarianceSnapshot[] {
  const withoutSameDay = snapshots.filter(
    (snapshot) => !(snapshot.date === nextSnapshot.date && snapshot.activeBaselineId === nextSnapshot.activeBaselineId),
  )
  return [...withoutSameDay, nextSnapshot]
}

export function trimSnapshots(
  snapshots: VarianceSnapshot[],
  maxPerBaseline = 365,
): VarianceSnapshot[] {
  const byBaseline = new Map<string, VarianceSnapshot[]>()
  for (const snapshot of snapshots) {
    const list = byBaseline.get(snapshot.activeBaselineId) ?? []
    list.push(snapshot)
    byBaseline.set(snapshot.activeBaselineId, list)
  }

  const kept: VarianceSnapshot[] = []
  for (const list of byBaseline.values()) {
    const sorted = [...list].sort((left, right) => left.date.localeCompare(right.date))
    const windowed = sorted.slice(Math.max(0, sorted.length - maxPerBaseline))
    kept.push(...windowed)
  }

  return kept.sort((left, right) => {
    if (left.date !== right.date) return left.date.localeCompare(right.date)
    return left.activeBaselineId.localeCompare(right.activeBaselineId)
  })
}

export function computeVarianceByDelayCause(delays: Delay[]): Array<{ type: DelayType; totalDays: number }> {
  const byType = new Map<DelayType, number>()
  delays.forEach((delay) => {
    byType.set(delay.type, (byType.get(delay.type) ?? 0) + delay.daysImpact)
  })
  return [...byType.entries()]
    .map(([type, totalDays]) => ({ type, totalDays }))
    .sort((left, right) => right.totalDays - left.totalDays)
}
