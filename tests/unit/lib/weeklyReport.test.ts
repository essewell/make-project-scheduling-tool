import { describe, expect, it } from 'vitest'
import { buildWeeklyReport } from '../../../src/lib/weeklyReport'
import type { ChangeOrder, Task } from '../../../src/types'

function makeTask(id: string, start: string, finish: string | null, pct: number): Task {
  return {
    id,
    name: id,
    group: 'g1',
    s: start,
    e: start,
    actualStart: finish ? start : null,
    actualFinish: finish,
    pct,
    status: finish ? 'complete' : 'in_progress',
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: [],
  }
}

function makeChangeOrder(id: string, createdAt: string): ChangeOrder {
  return {
    id,
    number: id,
    name: id,
    reason: '',
    status: 'draft',
    createdAt,
    lockedAt: createdAt,
    affectedTaskIds: [],
    daysImpact: 0,
  }
}

describe('buildWeeklyReport', () => {
  it('collects completed and planned windows correctly', () => {
    const data = buildWeeklyReport({
      weekEnding: '2026-01-14',
      tasks: [
        makeTask('done', '2026-01-10', '2026-01-12', 100),
        makeTask('next', '2026-01-18', null, 0),
      ],
      changeOrders: [],
    })
    expect(data.completedTaskIds).toContain('done')
    expect(data.plannedTaskIds).toContain('next')
  })

  it('includes only change orders created inside the week window', () => {
    const report = buildWeeklyReport({
      weekEnding: '2026-01-14',
      tasks: [],
      changeOrders: [
        makeChangeOrder('in', '2026-01-10T10:00:00.000Z'),
        makeChangeOrder('out', '2026-01-01T10:00:00.000Z'),
      ],
    })
    expect(report.recentChangeOrderIds).toContain('in')
    expect(report.recentChangeOrderIds).not.toContain('out')
  })
})
