import { describe, it, expect } from 'vitest'
import { computeAutoStatus, enrichTask, refreshAutoProgress } from '../../../src/lib/progress'
import type { Task, WorkweekConfig } from '../../../src/types'

const STANDARD: WorkweekConfig = {
  mon: true, tue: true, wed: true, thu: true, fri: true,
  sat: false, sun: false,
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    name: 'Test task',
    group: '',
    s: '2024-01-01',
    e: '2024-01-05',
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
    ...overrides,
  }
}

// ─── computeAutoStatus ────────────────────────────────────────────────────────

describe('computeAutoStatus', () => {
  it('returns complete when actualFinish is set, regardless of other fields', () => {
    const task = makeTask({ actualFinish: '2024-01-03', pct: 50 })
    const result = computeAutoStatus(task, '2024-01-04', STANDARD, [])
    expect(result).toEqual({ status: 'complete', pct: 100 })
  })

  it('returns not_started when today is before start', () => {
    const task = makeTask({ s: '2024-02-01', e: '2024-02-28' })
    const result = computeAutoStatus(task, '2024-01-15', STANDARD, [])
    expect(result.status).toBe('not_started')
    expect(result.pct).toBe(0)
  })

  it('returns complete when today is after end', () => {
    const task = makeTask({ s: '2024-01-01', e: '2024-01-05' })
    const result = computeAutoStatus(task, '2024-01-10', STANDARD, [])
    expect(result.status).toBe('complete')
    expect(result.pct).toBe(100)
  })

  it('returns in_progress when mid-task and not overdue', () => {
    const task = makeTask({ s: '2024-01-01', e: '2024-01-31' })
    const result = computeAutoStatus(task, '2024-01-15', STANDARD, [])
    expect(result.status).toBe('in_progress')
    expect(result.pct).toBeGreaterThan(0)
    expect(result.pct).toBeLessThan(100)
  })

  it('returns at_risk when slightly overdue (1-5 days)', () => {
    // at_risk only fires when pct < 100. Without manualPct, today >= end → autoPct=100 → complete.
    // Use manualPct:true so pct stays < 100, exposing the overdue branch.
    // end = 2024-01-05, today = 2024-01-08 → daysOverdue=3 (1-5 range) → at_risk
    const task = makeTask({ s: '2024-01-01', e: '2024-01-05', manualPct: true, pct: 50 })
    const result = computeAutoStatus(task, '2024-01-08', STANDARD, [])
    expect(result.status).toBe('at_risk')
  })

  it('returns delayed when significantly overdue (> 5 days)', () => {
    // Same pattern: manualPct keeps pct < 100; today=2024-01-15 → daysOverdue=10 > 5 → delayed
    const task = makeTask({ s: '2024-01-01', e: '2024-01-05', manualPct: true, pct: 50 })
    const result = computeAutoStatus(task, '2024-01-15', STANDARD, [])
    expect(result.status).toBe('delayed')
  })

  it('respects manualStatus: returns user-set status even when auto would differ', () => {
    const task = makeTask({
      s: '2024-01-01',
      e: '2024-01-05',
      manualStatus: true,
      status: 'at_risk',
    })
    // today is after end → auto would say 'complete', but manual is 'at_risk'
    const result = computeAutoStatus(task, '2024-01-10', STANDARD, [])
    expect(result.status).toBe('at_risk')
  })

  it('respects manualPct: returns user-set pct even when auto would differ', () => {
    const task = makeTask({
      s: '2024-01-01',
      e: '2024-01-05',
      manualPct: true,
      pct: 30,
    })
    // today is after end → auto pct would be 100, but manual is 30
    const result = computeAutoStatus(task, '2024-01-10', STANDARD, [])
    expect(result.pct).toBe(30)
  })

  it('actualFinish overrides manualStatus and manualPct', () => {
    const task = makeTask({
      actualFinish: '2024-01-03',
      manualStatus: true,
      status: 'in_progress',
      manualPct: true,
      pct: 50,
    })
    const result = computeAutoStatus(task, '2024-01-05', STANDARD, [])
    expect(result.status).toBe('complete')
    expect(result.pct).toBe(100)
  })
})

// ─── enrichTask ───────────────────────────────────────────────────────────────

describe('enrichTask', () => {
  it('returns same object reference when nothing changes', () => {
    // Task is future → already not_started with pct=0 → no change
    const task = makeTask({ s: '2099-01-01', e: '2099-12-31', status: 'not_started', pct: 0 })
    const result = enrichTask(task, '2024-01-01', STANDARD, [])
    expect(result).toBe(task)
  })

  it('sets status and pct when actualFinish is set', () => {
    const task = makeTask({ actualFinish: '2024-01-03', status: 'in_progress', pct: 40 })
    const result = enrichTask(task, '2024-01-05', STANDARD, [])
    expect(result.status).toBe('complete')
    expect(result.pct).toBe(100)
    expect(result.manualStatus).toBe(true)
    expect(result.manualPct).toBe(true)
  })

  it('does not mutate the original task', () => {
    const task = makeTask({ s: '2024-01-01', e: '2024-01-05' })
    const result = enrichTask(task, '2024-01-10', STANDARD, [])
    expect(result).not.toBe(task)
    expect(task.status).toBe('not_started')   // original unchanged
    expect(task.pct).toBe(0)
  })

  it('returns same ref when both manual flags are true', () => {
    const task = makeTask({ manualStatus: true, manualPct: true, status: 'at_risk', pct: 50 })
    const result = enrichTask(task, '2024-01-10', STANDARD, [])
    expect(result).toBe(task)
  })

  it('skips re-computation when computed values match existing values', () => {
    // Task already has correct auto-computed values stamped
    const task = makeTask({ s: '2099-01-01', e: '2099-12-31', status: 'not_started', pct: 0 })
    const result = enrichTask(task, '2024-01-01', STANDARD, [])
    expect(result).toBe(task)
  })
})

// ─── refreshAutoProgress ─────────────────────────────────────────────────────

describe('refreshAutoProgress', () => {
  it('returns the same array reference when no task changed', () => {
    const tasks = [
      makeTask({ id: 't1', s: '2099-01-01', e: '2099-12-31', status: 'not_started', pct: 0 }),
    ]
    const result = refreshAutoProgress(tasks, STANDARD, [], '2024-01-01')
    expect(result).toBe(tasks)
  })

  it('returns a new array when at least one task changed', () => {
    const tasks = [
      // This task is in the past with status=not_started → should be updated
      makeTask({ id: 't1', s: '2024-01-01', e: '2024-01-05', status: 'not_started', pct: 0 }),
    ]
    const result = refreshAutoProgress(tasks, STANDARD, [], '2024-06-01')
    expect(result).not.toBe(tasks)
  })

  it('updates stale status on tasks that have elapsed', () => {
    const tasks = [
      makeTask({ id: 't1', s: '2024-01-01', e: '2024-01-05', status: 'not_started', pct: 0 }),
    ]
    const result = refreshAutoProgress(tasks, STANDARD, [], '2024-06-01')
    expect(result[0]!.status).toBe('complete')
    expect(result[0]!.pct).toBe(100)
  })

  it('does not modify tasks that have manual flags set', () => {
    const tasks = [
      makeTask({ id: 't1', s: '2024-01-01', e: '2024-01-05', manualStatus: true, manualPct: true, status: 'at_risk', pct: 60 }),
    ]
    const result = refreshAutoProgress(tasks, STANDARD, [], '2024-06-01')
    // Same ref because nothing changed (manual flags prevent update)
    expect(result).toBe(tasks)
  })

  it('uses today by default (smoke test)', () => {
    const tasks = [makeTask()]
    // Should not throw; result type is correct
    const result = refreshAutoProgress(tasks, STANDARD, [])
    expect(Array.isArray(result)).toBe(true)
  })
})
