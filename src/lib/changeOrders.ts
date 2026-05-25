import type { ChangeOrder, ChangeOrderStatus } from '../types'

export function linkChangeOrderToTask(changeOrder: ChangeOrder, taskId: string): ChangeOrder {
  if (changeOrder.affectedTaskIds.includes(taskId)) return changeOrder
  return {
    ...changeOrder,
    affectedTaskIds: [...changeOrder.affectedTaskIds, taskId],
  }
}

export function unlinkChangeOrderFromTask(changeOrder: ChangeOrder, taskId: string): ChangeOrder {
  if (!changeOrder.affectedTaskIds.includes(taskId)) return changeOrder
  return {
    ...changeOrder,
    affectedTaskIds: changeOrder.affectedTaskIds.filter((id) => id !== taskId),
  }
}

export interface ChangeOrderValidationOptions {
  previousStatus?: ChangeOrderStatus
}

export function validateChangeOrder(
  changeOrder: ChangeOrder,
  options?: ChangeOrderValidationOptions,
): string[] {
  const errors: string[] = []
  if (changeOrder.number.trim().length === 0) {
    errors.push('Change order number is required.')
  }
  if (changeOrder.name.trim().length === 0) {
    errors.push('Change order name is required.')
  }
  if (options?.previousStatus) {
    const validTransition = options.previousStatus === 'draft' &&
      (changeOrder.status === 'approved' || changeOrder.status === 'rejected' || changeOrder.status === 'draft')
    if (!validTransition && options.previousStatus !== changeOrder.status) {
      errors.push(`Invalid status transition: ${options.previousStatus} -> ${changeOrder.status}.`)
    }
  }
  return errors
}

export interface ChangeOrderImpactSummary {
  daysImpact: number
  costImpact: number
  changeOrderCount: number
}

export function aggregateImpacts(taskId: string, changeOrders: ChangeOrder[]): ChangeOrderImpactSummary {
  const matched = changeOrders.filter((changeOrder) => changeOrder.affectedTaskIds.includes(taskId))
  return {
    daysImpact: matched.reduce((sum, changeOrder) => sum + changeOrder.daysImpact, 0),
    costImpact: matched.reduce((sum, changeOrder) => sum + (changeOrder.costImpact ?? 0), 0),
    changeOrderCount: matched.length,
  }
}
