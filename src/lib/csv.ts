import type { Resource, ResourceAssignment, Task } from '../types'
import { GROUP_PALETTE } from '../constants'
import { normalizeDate, addDays, todayStr } from './dates'

// ─── CSV import ───────────────────────────────────────────────────────────────

export interface CsvRow {
  [key: string]: string
}

/** Per-row validation error. `row` is the 1-indexed data row (header is row 1, first data row is row 2). */
export interface CsvRowError {
  row: number
  field?: string
  reason: string
}

/** Result of converting CSV rows to tasks: importable tasks + non-fatal errors. */
export interface CsvImportResult {
  tasks: Task[]
  errors: CsvRowError[]
}

export interface ResourcesCsvImportResult {
  resources: Resource[]
  errors: CsvRowError[]
}

export interface AssignmentsCsvImportResult {
  assignments: ResourceAssignment[]
  errors: CsvRowError[]
}

/** Parse raw CSV text into rows of {header: value} objects. */
export function parseCSVText(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = splitCsvLine(lines[0] ?? '')
  const rows: CsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line?.trim()) continue
    const values = splitCsvLine(line)
    const row: CsvRow = {}
    headers.forEach((h, j) => {
      row[h] = values[j] ?? ''
    })
    rows.push(row)
  }

  return rows
}

/** Convert parsed CSV rows + column mapping into tasks with per-row validation errors. */
export function csvRowsToTasks(
  rows: CsvRow[],
  columnMap: Record<string, keyof Task | 'skip'>,
  existingTasks: Task[],
): CsvImportResult {
  const today = todayStr()
  const tasks: Task[] = []
  const errors: CsvRowError[] = []
  const existingIds = new Set(existingTasks.map(t => t.id))

  // Which CSV header (if any) is mapped to the `name` field?
  const nameHeader = Object.entries(columnMap).find(([, f]) => f === 'name')?.[0]

  rows.forEach((row, i) => {
    const rowNum = i + 2 // header is row 1, first data row is row 2
    const rowErrors: CsvRowError[] = []
    let skipRow = false

    const task: Partial<Task> = {
      id: '',
      name: '',
      group: '',
      s: today,
      e: addDays(today, 6),
      actualStart: null,
      actualFinish: null,
      pct: 0,
      status: 'not_started',
      party: null,
      notes: '',
      milestone: false,
      manualStatus: false,
      manualPct: false,
      deps: [],
      wbsCode: '',
      actualCost: 0,
    }

    for (const [csvHeader, field] of Object.entries(columnMap)) {
      if (field === 'skip') continue
      const value = row[csvHeader] ?? ''

      switch (field) {
        case 'name':
          task.name = value.trim()
          break
        case 'group':
          task.group = value
          break
        case 's': {
          if (value.trim() === '') break
          const d = normalizeDate(value)
          if (d) task.s = d
          else rowErrors.push({ row: rowNum, field: csvHeader, reason: `Invalid start date "${value}"` })
          break
        }
        case 'e': {
          if (value.trim() === '') break
          const d = normalizeDate(value)
          if (d) task.e = d
          else rowErrors.push({ row: rowNum, field: csvHeader, reason: `Invalid end date "${value}"` })
          break
        }
        case 'actualStart': {
          if (value.trim() === '') break
          const d = normalizeDate(value)
          if (d) task.actualStart = d
          else rowErrors.push({ row: rowNum, field: csvHeader, reason: `Invalid actual start "${value}"` })
          break
        }
        case 'actualFinish': {
          if (value.trim() === '') break
          const d = normalizeDate(value)
          if (d) {
            task.actualFinish = d
            task.pct = 100
            task.status = 'complete'
            task.manualStatus = true
            task.manualPct = true
          } else {
            rowErrors.push({ row: rowNum, field: csvHeader, reason: `Invalid actual finish "${value}"` })
          }
          break
        }
        case 'pct': {
          if (value.trim() === '') break
          const n = parseInt(value, 10)
          if (!isNaN(n)) {
            task.pct = Math.min(100, Math.max(0, n))
            task.manualPct = true
          } else {
            rowErrors.push({ row: rowNum, field: csvHeader, reason: `Invalid progress "${value}" (expected number 0–100)` })
          }
          break
        }
        case 'milestone':
          task.milestone = /^(true|yes|1|x)$/i.test(value.trim())
          break
        case 'notes':
          task.notes = value
          break
        case 'party':
          task.party = value || null
          break
        case 'id':
          task.id = value
          break
        case 'wbsCode':
          task.wbsCode = value.trim()
          break
        case 'actualCost': {
          if (value.trim() === '') break
          const amount = Number(value)
          if (Number.isFinite(amount) && amount >= 0) {
            task.actualCost = amount
          } else {
            rowErrors.push({ row: rowNum, field: csvHeader, reason: `Invalid actual cost "${value}" (expected number >= 0)` })
          }
          break
        }
        default:
          break
      }
    }

    // Skip rows that meaningfully lack data: name column was mapped but value is blank.
    if (nameHeader && (row[nameHeader] ?? '').trim() === '') {
      rowErrors.push({ row: rowNum, field: nameHeader, reason: 'Missing name — row skipped' })
      skipRow = true
    }

    // Cross-field check: start must not be after end. Non-fatal — keep the row, log a warning.
    if (!skipRow && task.s && task.e && task.s > task.e) {
      rowErrors.push({ row: rowNum, reason: `Start (${task.s}) is after end (${task.e})` })
    }

    errors.push(...rowErrors)
    if (skipRow) return

    // Fallback name when name column was never mapped at all.
    if (!task.name) task.name = `Task ${i + 1}`

    // Generate unique id if missing or collision
    if (!task.id || existingIds.has(task.id)) {
      task.id = generateId()
    }
    existingIds.add(task.id)

    tasks.push(task as Task)
  })

  return { tasks, errors }
}

/** Generate CSV text from a task list. */
export function generateCSV(tasks: Task[]): string {
  const headers = [
    'ID', 'WBS Code', 'Name', 'Group', 'Start', 'End',
    'Actual Start', 'Actual Finish', 'Progress %',
    'Status', 'Party', 'Milestone', 'Notes', 'Actual Cost',
  ]

  const lines = [headers.join(',')]

  for (const t of tasks) {
    const row = [
      t.id,
      t.wbsCode ?? '',
      escapeCsv(t.name),
      escapeCsv(t.group),
      t.s,
      t.e,
      t.actualStart ?? '',
      t.actualFinish ?? '',
      String(t.pct),
      t.status,
      t.party ?? '',
      t.milestone ? 'Yes' : 'No',
      escapeCsv(t.notes),
      String(t.actualCost ?? 0),
    ]
    lines.push(row.join(','))
  }

  return lines.join('\n')
}

/** Trigger a browser CSV download. */
export function triggerCSVDownload(csv: string, filename = 'schedule.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseResourcesCsv(text: string): ResourcesCsvImportResult {
  const rows = parseCSVText(text)
  const resources: Resource[] = []
  const errors: CsvRowError[] = []
  const ids = new Set<string>()

  rows.forEach((row, i) => {
    const rowNum = i + 2
    const id = (row.ID ?? row.id ?? '').trim()
    const name = (row.Name ?? row.name ?? '').trim()
    const category = (row.Category ?? row.category ?? '').trim().toLowerCase()
    const unit = (row.Unit ?? row.unit ?? '').trim()
    const capacityRaw = (row.Capacity ?? row.capacity ?? '').trim()
    const costRateRaw = (row.CostRate ?? row.costRate ?? row['Cost Rate'] ?? '').trim()
    const color = (row.Color ?? row.color ?? '').trim() || GROUP_PALETTE[resources.length % GROUP_PALETTE.length] || GROUP_PALETTE[0] || '#378ADD'

    if (!id) errors.push({ row: rowNum, field: 'ID', reason: 'Missing resource ID' })
    if (!name) errors.push({ row: rowNum, field: 'Name', reason: 'Missing resource name' })
    if (!['labor', 'equipment', 'material'].includes(category)) {
      errors.push({ row: rowNum, field: 'Category', reason: `Invalid category "${category}"` })
    }
    if (!unit) errors.push({ row: rowNum, field: 'Unit', reason: 'Missing unit' })
    if (ids.has(id)) errors.push({ row: rowNum, field: 'ID', reason: `Duplicate resource ID "${id}"` })

    const capacity = capacityRaw === '' ? 0 : Number(capacityRaw)
    const costRate = costRateRaw === '' ? 0 : Number(costRateRaw)
    if (!Number.isFinite(capacity)) errors.push({ row: rowNum, field: 'Capacity', reason: `Invalid capacity "${capacityRaw}"` })
    if (!Number.isFinite(costRate)) errors.push({ row: rowNum, field: 'CostRate', reason: `Invalid cost rate "${costRateRaw}"` })

    if (errors.some((e) => e.row === rowNum)) return

    ids.add(id)
    resources.push({
      id,
      name,
      category: category as Resource['category'],
      unit,
      capacity,
      costRate,
      color,
    })
  })

  return { resources, errors }
}

export function parseAssignmentsCsv(text: string): AssignmentsCsvImportResult {
  const rows = parseCSVText(text)
  const assignments: ResourceAssignment[] = []
  const errors: CsvRowError[] = []
  const ids = new Set<string>()

  rows.forEach((row, i) => {
    const rowNum = i + 2
    const id = (row.ID ?? row.id ?? '').trim()
    const taskId = (row.TaskID ?? row.taskId ?? row.task_id ?? '').trim()
    const resourceId = (row.ResourceID ?? row.resourceId ?? row.resource_id ?? '').trim()
    const quantityRaw = (row.Quantity ?? row.quantity ?? '').trim()
    const notes = row.Notes ?? row.notes ?? ''

    if (!id) errors.push({ row: rowNum, field: 'ID', reason: 'Missing assignment ID' })
    if (!taskId) errors.push({ row: rowNum, field: 'TaskID', reason: 'Missing task ID' })
    if (!resourceId) errors.push({ row: rowNum, field: 'ResourceID', reason: 'Missing resource ID' })
    if (ids.has(id)) errors.push({ row: rowNum, field: 'ID', reason: `Duplicate assignment ID "${id}"` })

    const quantity = Number(quantityRaw)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push({ row: rowNum, field: 'Quantity', reason: `Invalid quantity "${quantityRaw}"` })
    }

    if (errors.some((e) => e.row === rowNum)) return
    ids.add(id)
    assignments.push({ id, taskId, resourceId, quantity, notes })
  })

  return { assignments, errors }
}

export function generateResourcesCsv(resources: Resource[]): string {
  const headers = ['ID', 'Name', 'Category', 'Unit', 'Capacity', 'CostRate', 'Color']
  const lines = [headers.join(',')]

  resources.forEach((resource) => {
    lines.push([
      escapeCsv(resource.id),
      escapeCsv(resource.name),
      resource.category,
      escapeCsv(resource.unit),
      String(resource.capacity),
      String(resource.costRate),
      escapeCsv(resource.color),
    ].join(','))
  })

  return lines.join('\n')
}

export function generateAssignmentsCsv(assignments: ResourceAssignment[]): string {
  const headers = ['ID', 'TaskID', 'ResourceID', 'Quantity', 'Notes']
  const lines = [headers.join(',')]

  assignments.forEach((assignment) => {
    lines.push([
      escapeCsv(assignment.id),
      escapeCsv(assignment.taskId),
      escapeCsv(assignment.resourceId),
      String(assignment.quantity),
      escapeCsv(assignment.notes),
    ].join(','))
  })

  return lines.join('\n')
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function splitCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
