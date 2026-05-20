import type { Task } from '../types'
import { normalizeDate, fmtDate, addDays, todayStr } from './dates'

// ─── CSV import ───────────────────────────────────────────────────────────────

export interface CsvColumn {
  field: keyof Task | 'skip'
  header: string
}

export interface CsvRow {
  [key: string]: string
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

/** Convert parsed CSV rows + column mapping into Task objects. */
export function csvRowsToTasks(
  rows: CsvRow[],
  columnMap: Record<string, keyof Task | 'skip'>,
  existingTasks: Task[],
): Task[] {
  const today = todayStr()
  const tasks: Task[] = []
  const existingIds = new Set(existingTasks.map(t => t.id))

  rows.forEach((row, i) => {
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
          task.name = value
          break
        case 'group':
          task.group = value
          break
        case 's': {
          const d = normalizeDate(value)
          if (d) task.s = d
          break
        }
        case 'e': {
          const d = normalizeDate(value)
          if (d) task.e = d
          break
        }
        case 'actualStart': {
          task.actualStart = normalizeDate(value)
          break
        }
        case 'actualFinish': {
          task.actualFinish = normalizeDate(value)
          if (task.actualFinish) {
            task.pct = 100
            task.status = 'complete'
            task.manualStatus = true
            task.manualPct = true
          }
          break
        }
        case 'pct': {
          const n = parseInt(value, 10)
          if (!isNaN(n)) {
            task.pct = Math.min(100, Math.max(0, n))
            task.manualPct = true
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

    // Ensure required fields
    if (!task.name) task.name = `Task ${i + 1}`

    // Generate unique id if missing or collision
    if (!task.id || existingIds.has(task.id)) {
      task.id = generateId()
    }
    existingIds.add(task.id)

    tasks.push(task as Task)
  })

  return tasks
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

/** Trigger a browser CSV file picker and return the file contents. */
export function triggerCSVImport(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,text/csv'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('No file selected')); return }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    }
    input.click()
  })
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

export { fmtDate }
