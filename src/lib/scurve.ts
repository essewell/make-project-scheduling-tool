import type { Baseline, SCurveBucketing, SCurveSeries, Task } from '../types'
import { addDays, daysBetween, fmtDate, toD } from './dates'

function clampPercent(value: number): number {
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

function pickWindow(tasks: Task[], baseline: Baseline | null): { start: string; end: string } | null {
  const source = baseline?.tasks ?? tasks
  if (source.length === 0) return null
  const start = source.reduce((min, task) => (task.s < min ? task.s : min), source[0]!.s)
  const end = source.reduce((max, task) => (task.e > max ? task.e : max), source[0]!.e)
  return { start, end }
}

function buildBucketDates(start: string, end: string, bucketing: SCurveBucketing): string[] {
  const dates: string[] = []
  if (bucketing === 'weekly') {
    let cursor = start
    while (cursor <= end) {
      dates.push(cursor)
      cursor = addDays(cursor, 7)
    }
  } else {
    const first = toD(start)
    let cursor = new Date(first.getFullYear(), first.getMonth(), 1)
    const endDate = toD(end)
    while (cursor <= endDate) {
      dates.push(fmtDate(cursor))
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    }
  }
  if (dates[dates.length - 1] !== end) {
    dates.push(end)
  }
  return dates
}

function progressAtDate(task: Task, date: string): number {
  if (date < task.s) return 0
  if (date >= task.e) return 1
  const totalDays = Math.max(1, daysBetween(task.s, task.e) + 1)
  const elapsed = Math.max(0, daysBetween(task.s, date) + 1)
  return Math.min(1, elapsed / totalDays)
}

export function computeSCurve(tasks: Task[], baseline: Baseline | null, bucketing: SCurveBucketing): SCurveSeries {
  const window = pickWindow(tasks, baseline)
  if (!window) {
    return { bucketing, points: [], variancePct: 0 }
  }

  const baselineTasks = baseline?.tasks ?? tasks
  const currentById = new Map(tasks.map((task) => [task.id, task]))
  const bucketDates = buildBucketDates(window.start, window.end, bucketing)
  const totalWeight = Math.max(1, baselineTasks.length)

  const points = bucketDates.map((date) => {
    let planned = 0
    let actual = 0

    baselineTasks.forEach((baselineTask) => {
      planned += progressAtDate(baselineTask, date)
      const currentTask = currentById.get(baselineTask.id)
      if (currentTask) {
        actual += clampPercent(currentTask.pct) / 100
      } else {
        actual += progressAtDate(baselineTask, date)
      }
    })

    return {
      date,
      plannedPct: clampPercent((planned / totalWeight) * 100),
      actualPct: clampPercent((actual / totalWeight) * 100),
    }
  })

  const last = points[points.length - 1]
  const variancePct = last ? last.actualPct - last.plannedPct : 0
  return { bucketing, points, variancePct }
}
