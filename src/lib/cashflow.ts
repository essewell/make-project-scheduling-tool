import type {
  MonthlyCashFlowBucket,
  Resource,
  ResourceAssignment,
  ResourceCategory,
  Task,
  WorkweekConfig,
} from '../types'
import { addDays, fmtDate, toD } from './dates'
import { isWorkday, workdays } from './workdays'

const DEFAULT_WORKWEEK: WorkweekConfig = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

function emptyBucket(month: string): MonthlyCashFlowBucket {
  return { month, labor: 0, equipment: 0, material: 0, total: 0 }
}

function addCost(bucket: MonthlyCashFlowBucket, category: ResourceCategory, value: number): void {
  if (category === 'labor') bucket.labor += value
  if (category === 'equipment') bucket.equipment += value
  if (category === 'material') bucket.material += value
  bucket.total += value
}

export function computeMonthlyCashFlow(
  tasks: Task[],
  assignments: ResourceAssignment[],
  resources: Resource[],
  maxMonths = 24,
): MonthlyCashFlowBucket[] {
  if (tasks.length === 0) return []
  const resourceMap = new Map(resources.map((resource) => [resource.id, resource]))
  const taskMap = new Map(tasks.map((task) => [task.id, task]))
  const minStart = tasks.reduce((min, task) => (task.s < min ? task.s : min), tasks[0]!.s)
  const maxEnd = tasks.reduce((max, task) => (task.e > max ? task.e : max), tasks[0]!.e)

  const allMonths: string[] = []
  let cursor = new Date(toD(minStart).getFullYear(), toD(minStart).getMonth(), 1)
  const end = new Date(toD(maxEnd).getFullYear(), toD(maxEnd).getMonth(), 1)
  while (cursor <= end) {
    allMonths.push(fmtDate(cursor).slice(0, 7))
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }
  const keptMonths = allMonths.slice(0, maxMonths)
  const bucketMap = new Map(keptMonths.map((month) => [month, emptyBucket(month)]))

  assignments.forEach((assignment) => {
    if (assignment.quantity <= 0) return
    const task = taskMap.get(assignment.taskId)
    const resource = resourceMap.get(assignment.resourceId)
    if (!task || !resource || resource.costRate < 0) return

    const totalWorkdays = Math.max(1, workdays(task.s, task.e, DEFAULT_WORKWEEK, []))
    const totalCost = resource.category === 'material'
      ? assignment.quantity * resource.costRate
      : assignment.quantity * resource.costRate * totalWorkdays
    const perWorkdayCost = totalCost / totalWorkdays

    let day = task.s
    while (day <= task.e) {
      if (isWorkday(day, DEFAULT_WORKWEEK, [])) {
        const month = monthKey(day)
        const bucket = bucketMap.get(month)
        if (bucket) addCost(bucket, resource.category, perWorkdayCost)
      }
      day = addDays(day, 1)
    }
  })

  return keptMonths.map((month) => bucketMap.get(month) ?? emptyBucket(month))
}
