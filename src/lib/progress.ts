import type { Task, TaskStatus, WorkweekConfig } from '../types'
import { todayStr, daysBetween } from './dates'
import { workdayRatio } from './workdays'

/**
 * Compute auto-derived status and pct for a task based on its planned dates,
 * actual dates, and today.
 *
 * Rules:
 *  - actualFinish set → status='complete', pct=100, both manual flags true
 *  - manualStatus=true → status unchanged from task.status
 *  - manualPct=true    → pct unchanged from task.pct
 *  - Otherwise auto-calculate from dates
 */
export function computeAutoStatus(
  task: Task,
  today: string,
  workweek: WorkweekConfig,
  holidays: string[],
): { status: TaskStatus; pct: number } {
  // actualFinish overrides everything
  if (task.actualFinish) {
    return { status: 'complete', pct: 100 }
  }

  const manualStatus = task.manualStatus ? task.status : null
  const manualPct = task.manualPct ? task.pct : null

  // Auto-calculate pct
  let autoPct: number
  if (today < task.s) {
    autoPct = 0
  } else if (today >= task.e) {
    autoPct = 100
  } else {
    autoPct = Math.round(workdayRatio(task.s, task.e, today, workweek, holidays) * 100)
  }

  const pct = manualPct !== null ? manualPct : autoPct

  // Auto-calculate status
  let autoStatus: TaskStatus
  if (today < task.s) {
    autoStatus = 'not_started'
  } else if (pct >= 100) {
    autoStatus = 'complete'
  } else {
    const daysOverdue = daysBetween(task.e, today)
    if (daysOverdue > 5) {
      autoStatus = 'delayed'
    } else if (daysOverdue > 0) {
      autoStatus = 'at_risk'
    } else {
      autoStatus = 'in_progress'
    }
  }

  const status = manualStatus !== null ? manualStatus : autoStatus

  return { status, pct }
}

/**
 * Enrich a task with computed status/pct. Does not mutate the original.
 */
export function enrichTask(
  task: Task,
  today: string,
  workweek: WorkweekConfig,
  holidays: string[],
): Task {
  // If actualFinish set, lock completion (also sets manual flags)
  if (task.actualFinish) {
    return { ...task, status: 'complete', pct: 100, manualStatus: true, manualPct: true }
  }

  if (task.manualStatus && task.manualPct) {
    return task  // nothing to compute
  }

  const { status, pct } = computeAutoStatus(task, today, workweek, holidays)
  if (status === task.status && pct === task.pct) return task
  return { ...task, status, pct }
}

/**
 * Re-run auto-progress on all tasks. Returns a new array only if something changed.
 */
export function refreshAutoProgress(
  tasks: Task[],
  workweek: WorkweekConfig,
  holidays: string[],
  today = todayStr(),
): Task[] {
  let changed = false
  const next = tasks.map(task => {
    const enriched = enrichTask(task, today, workweek, holidays)
    if (enriched !== task) changed = true
    return enriched
  })
  return changed ? next : tasks
}

