import { describe, it, expect } from 'vitest'
import { parseCSVText, csvRowsToTasks, generateCSV } from '../../../src/lib/csv'
import type { Task } from '../../../src/types'

// ─── parseCSVText ─────────────────────────────────────────────────────────────

describe('parseCSVText', () => {
  it('parses a simple two-column CSV', () => {
    const rows = parseCSVText('name,start\nAlpha,2024-01-01\nBeta,2024-02-01')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ name: 'Alpha', start: '2024-01-01' })
    expect(rows[1]).toEqual({ name: 'Beta', start: '2024-02-01' })
  })

  it('handles quoted fields containing commas', () => {
    const rows = parseCSVText('name,note\n"Smith, John",Important\n')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.name).toBe('Smith, John')
  })

  it('handles escaped double-quotes inside quoted fields', () => {
    const rows = parseCSVText('name,note\n"Say ""hello""",ok')
    expect(rows[0]!.name).toBe('Say "hello"')
  })

  it('handles CRLF line endings', () => {
    const rows = parseCSVText('a,b\r\n1,2\r\n3,4')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ a: '1', b: '2' })
  })

  it('skips blank lines in the body', () => {
    const rows = parseCSVText('name,start\nAlpha,2024-01-01\n\nBeta,2024-02-01')
    expect(rows).toHaveLength(2)
  })

  it('returns empty array for header-only input', () => {
    expect(parseCSVText('name,start')).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    expect(parseCSVText('')).toHaveLength(0)
    expect(parseCSVText('  ')).toHaveLength(0)
  })

  it('trims whitespace from cell values', () => {
    const rows = parseCSVText('name\n  Alpha  ')
    expect(rows[0]!.name).toBe('Alpha')
  })
})

// ─── csvRowsToTasks ───────────────────────────────────────────────────────────

const COL_MAP: Record<string, keyof Task | 'skip'> = {
  Name: 'name',
  Start: 's',
  End: 'e',
}

describe('csvRowsToTasks', () => {
  it('maps columns to task fields', () => {
    const rows = parseCSVText('Name,Start,End\nAlpha,2024-01-01,2024-01-10')
    const { tasks, errors } = csvRowsToTasks(rows, COL_MAP, [])
    expect(tasks).toHaveLength(1)
    expect(tasks[0]!.name).toBe('Alpha')
    expect(tasks[0]!.s).toBe('2024-01-01')
    expect(tasks[0]!.e).toBe('2024-01-10')
    expect(errors).toHaveLength(0)
  })

  it('generates a unique ID when the id column is not mapped', () => {
    const rows = parseCSVText('Name\nAlpha')
    const { tasks } = csvRowsToTasks(rows, { Name: 'name' }, [])
    expect(tasks[0]!.id).toBeTruthy()
    expect(tasks[0]!.id.length).toBeGreaterThan(4)
  })

  it('generates a new ID when the imported ID collides with an existing task', () => {
    const existing: Task[] = [
      { id: 'abc', name: 'Existing', group: '', s: '2024-01-01', e: '2024-01-05',
        actualStart: null, actualFinish: null, pct: 0, status: 'not_started',
        party: null, notes: '', milestone: false, manualStatus: false, manualPct: false, deps: [] },
    ]
    const rows = parseCSVText('id,Name\nabc,New Task')
    const { tasks } = csvRowsToTasks(rows, { id: 'id', Name: 'name' }, existing)
    expect(tasks[0]!.id).not.toBe('abc')
  })

  it('emits a row error for an invalid start date and still imports the row', () => {
    const rows = parseCSVText('Name,Start\nAlpha,not-a-date')
    const { tasks, errors } = csvRowsToTasks(rows, { Name: 'name', Start: 's' }, [])
    expect(errors).toHaveLength(1)
    expect(errors[0]!.reason).toContain('Invalid start date')
    expect(errors[0]!.row).toBe(2)   // header=row1, first data=row2
    expect(tasks).toHaveLength(1)    // row is still imported with fallback start
  })

  it('emits a row error for an invalid pct value', () => {
    const rows = parseCSVText('Name,Pct\nAlpha,abc')
    const { tasks, errors } = csvRowsToTasks(rows, { Name: 'name', Pct: 'pct' }, [])
    expect(errors).toHaveLength(1)
    expect(errors[0]!.reason).toContain('Invalid progress')
    expect(tasks).toHaveLength(1)
  })

  it('clamps pct to [0, 100]', () => {
    const rows = parseCSVText('Name,Pct\nAlpha,150\nBeta,-10')
    const { tasks } = csvRowsToTasks(rows, { Name: 'name', Pct: 'pct' }, [])
    expect(tasks[0]!.pct).toBe(100)
    expect(tasks[1]!.pct).toBe(0)
  })

  it('skips rows with a mapped-but-empty name field, adding an error', () => {
    const rows = parseCSVText('Name,Start\n,2024-01-01')
    const { tasks, errors } = csvRowsToTasks(rows, { Name: 'name', Start: 's' }, [])
    expect(tasks).toHaveLength(0)
    expect(errors).toHaveLength(1)
    expect(errors[0]!.reason).toContain('skipped')
  })

  it('adds a warning (non-fatal) when start is after end', () => {
    const rows = parseCSVText('Name,Start,End\nAlpha,2024-01-10,2024-01-01')
    const { tasks, errors } = csvRowsToTasks(rows, COL_MAP, [])
    // Row is NOT skipped — cross-field check is advisory
    expect(tasks).toHaveLength(1)
    expect(errors).toHaveLength(1)
    expect(errors[0]!.reason).toContain('Start')
  })

  it('uses "skip" to ignore a column', () => {
    const rows = parseCSVText('Name,Junk\nAlpha,garbage')
    const { tasks } = csvRowsToTasks(rows, { Name: 'name', Junk: 'skip' }, [])
    expect(tasks).toHaveLength(1)
  })

  it('sets actualFinish and marks pct=100, status=complete, both manual flags', () => {
    const rows = parseCSVText('Name,Finish\nAlpha,2024-01-10')
    const { tasks } = csvRowsToTasks(rows, { Name: 'name', Finish: 'actualFinish' }, [])
    expect(tasks[0]!.actualFinish).toBe('2024-01-10')
    expect(tasks[0]!.pct).toBe(100)
    expect(tasks[0]!.status).toBe('complete')
    expect(tasks[0]!.manualStatus).toBe(true)
    expect(tasks[0]!.manualPct).toBe(true)
  })

  it('falls back to "Task N" when name column is not mapped at all', () => {
    const rows = parseCSVText('Start\n2024-01-01')
    const { tasks } = csvRowsToTasks(rows, { Start: 's' }, [])
    expect(tasks[0]!.name).toBe('Task 1')
  })

  it('handles multiple rows with mixed valid/invalid dates', () => {
    const csv = 'Name,Start\nAlpha,2024-01-01\nBeta,BAD\nGamma,2024-03-01'
    const rows = parseCSVText(csv)
    const { tasks, errors } = csvRowsToTasks(rows, { Name: 'name', Start: 's' }, [])
    expect(tasks).toHaveLength(3)    // all rows imported (bad date is non-fatal)
    expect(errors).toHaveLength(1)   // one date error
  })
})

// ─── generateCSV ──────────────────────────────────────────────────────────────

describe('generateCSV', () => {
  const task: Task = {
    id: 'abc', name: 'My Task', group: 'Phase 1', s: '2024-01-01', e: '2024-01-10',
    actualStart: null, actualFinish: null, pct: 50, status: 'in_progress',
    party: 'Design', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: [],
  }

  it('produces a header row as the first line', () => {
    const csv = generateCSV([task])
    const header = csv.split('\n')[0]!
    expect(header).toContain('Name')
    expect(header).toContain('Start')
    expect(header).toContain('Progress %')
  })

  it('produces one data row per task', () => {
    const csv = generateCSV([task, { ...task, id: 'xyz', name: 'Task 2' }])
    const lines = csv.split('\n').filter(Boolean)
    expect(lines).toHaveLength(3)   // 1 header + 2 data rows
  })

  it('escapes commas inside task names', () => {
    const t = { ...task, name: 'Smith, John' }
    const csv = generateCSV([t])
    expect(csv).toContain('"Smith, John"')
  })

  it('handles an empty task list (header only)', () => {
    const csv = generateCSV([])
    const lines = csv.split('\n').filter(Boolean)
    expect(lines).toHaveLength(1)
  })

  it('renders null actual dates as empty strings', () => {
    const csv = generateCSV([task])
    // actualStart and actualFinish are null — they should appear as empty fields
    const row = csv.split('\n')[1]!
    const cols = row.split(',')
    // Actual Start is column 6 (0-indexed 5) and Actual Finish is column 7
    expect(cols[5]).toBe('')
    expect(cols[6]).toBe('')
  })
})
