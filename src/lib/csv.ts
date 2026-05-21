import type { Task } from '../types'
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
    'ID', 'Name', 'Group', 'Start', 'End',
    'Actual Start', 'Actual Finish', 'Progress %',
    'Status', 'Party', 'Milestone', 'Notes',
  ]

  const lines = [headers.join(',')]

  for (const t of tasks) {
    const row = [
      t.id,
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
