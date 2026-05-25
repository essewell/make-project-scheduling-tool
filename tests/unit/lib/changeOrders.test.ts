import { describe, expect, it } from 'vitest'
import type { ChangeOrder } from '../../../src/types'
import {
  aggregateImpacts,
  linkChangeOrderToTask,
  unlinkChangeOrderFromTask,
  validateChangeOrder,
} from '../../../src/lib/changeOrders'

function makeChangeOrder(id: string, status: ChangeOrder['status'] = 'draft'): ChangeOrder {
  return {
    id,
    number: `CO-${id}`,
    name: `Change ${id}`,
    reason: 'Scope revision',
    status,
    createdAt: '2026-05-25T00:00:00.000Z',
    lockedAt: '2026-05-25T00:00:00.000Z',
    affectedTaskIds: [],
    daysImpact: 0,
  }
}

describe('changeOrders lib', () => {
  it('linkChangeOrderToTask adds task id and is idempotent', () => {
    const base = makeChangeOrder('1')
    const linked = linkChangeOrderToTask(base, 'task-1')
    expect(linked.affectedTaskIds).toEqual(['task-1'])

    const linkedAgain = linkChangeOrderToTask(linked, 'task-1')
    expect(linkedAgain.affectedTaskIds).toEqual(['task-1'])
  })

  it('unlinkChangeOrderFromTask removes task id and is idempotent', () => {
    const base = { ...makeChangeOrder('1'), affectedTaskIds: ['task-1', 'task-2'] }
    const unlinked = unlinkChangeOrderFromTask(base, 'task-1')
    expect(unlinked.affectedTaskIds).toEqual(['task-2'])

    const unlinkedAgain = unlinkChangeOrderFromTask(unlinked, 'task-1')
    expect(unlinkedAgain.affectedTaskIds).toEqual(['task-2'])
  })

  it('validateChangeOrder enforces required number and name', () => {
    const invalid: ChangeOrder = {
      ...makeChangeOrder('1'),
      number: ' ',
      name: '',
    }
    const errors = validateChangeOrder(invalid)
    expect(errors).toContain('Change order number is required.')
    expect(errors).toContain('Change order name is required.')
  })

  it('validateChangeOrder rejects invalid status transition from approved', () => {
    const changeOrder = { ...makeChangeOrder('1', 'rejected') }
    const errors = validateChangeOrder(changeOrder, { previousStatus: 'approved' })
    expect(errors.some((error) => error.includes('Invalid status transition'))).toBe(true)
  })

  it('validateChangeOrder allows draft to approved transition', () => {
    const changeOrder = { ...makeChangeOrder('1', 'approved') }
    const errors = validateChangeOrder(changeOrder, { previousStatus: 'draft' })
    expect(errors).toEqual([])
  })

  it('aggregateImpacts returns zero summary when task has no linked change orders', () => {
    const summary = aggregateImpacts('task-404', [makeChangeOrder('1')])
    expect(summary).toEqual({ daysImpact: 0, costImpact: 0, changeOrderCount: 0 })
  })

  it('aggregateImpacts sums day and cost impacts for linked task', () => {
    const orders: ChangeOrder[] = [
      { ...makeChangeOrder('1'), affectedTaskIds: ['task-1'], daysImpact: 3, costImpact: 1000 },
      { ...makeChangeOrder('2'), affectedTaskIds: ['task-1', 'task-2'], daysImpact: 2, costImpact: 250 },
      { ...makeChangeOrder('3'), affectedTaskIds: ['task-3'], daysImpact: 5, costImpact: 900 },
    ]
    const summary = aggregateImpacts('task-1', orders)
    expect(summary).toEqual({ daysImpact: 5, costImpact: 1250, changeOrderCount: 2 })
  })
})
