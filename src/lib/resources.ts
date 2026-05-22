import { GROUP_PALETTE } from '../constants'
import type { Resource, ResourceAssignment, ResourceCategory, Task } from '../types'

export interface ResourceDraft {
  name: string
  category: ResourceCategory
  unit: string
  capacity: number
  costRate: number
  color?: string
}

export interface ResourceValidationError {
  field: 'name' | 'unit' | 'capacity' | 'costRate'
  reason: string
}

export function getNextResourceColor(resources: Resource[]): string {
  return GROUP_PALETTE[resources.length % GROUP_PALETTE.length] ?? GROUP_PALETTE[0]
}

export function createResource(id: string, draft: ResourceDraft, existingResources: Resource[]): Resource {
  return {
    id,
    name: draft.name.trim(),
    category: draft.category,
    unit: draft.unit.trim(),
    capacity: draft.capacity,
    costRate: draft.costRate,
    color: draft.color ?? getNextResourceColor(existingResources),
  }
}

export function validateResource(resource: Resource, existingResources: Resource[]): ResourceValidationError[] {
  const errors: ResourceValidationError[] = []
  const trimmedName = resource.name.trim()
  const trimmedUnit = resource.unit.trim()

  if (!trimmedName) {
    errors.push({ field: 'name', reason: 'Name is required' })
  } else if (trimmedName.length > 80) {
    errors.push({ field: 'name', reason: 'Name must be 80 characters or fewer' })
  }

  const duplicateInCategory = existingResources.some(
    (candidate) =>
      candidate.id !== resource.id &&
      candidate.category === resource.category &&
      candidate.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  )
  if (duplicateInCategory) {
    errors.push({ field: 'name', reason: 'Name must be unique within its category' })
  }

  if (!trimmedUnit) {
    errors.push({ field: 'unit', reason: 'Unit is required' })
  } else if (trimmedUnit.length > 16) {
    errors.push({ field: 'unit', reason: 'Unit must be 16 characters or fewer' })
  }

  if (resource.category !== 'material' && resource.capacity <= 0) {
    errors.push({ field: 'capacity', reason: 'Capacity must be greater than 0 for labor/equipment' })
  }

  if (resource.costRate < 0) {
    errors.push({ field: 'costRate', reason: 'Cost rate must be 0 or greater' })
  }

  return errors
}

export function findResourceById(resources: Resource[], resourceId: string): Resource | undefined {
  return resources.find((resource) => resource.id === resourceId)
}

export interface PruneAssignmentsResult {
  assignments: ResourceAssignment[]
  droppedCount: number
}

export function pruneOrphanAssignments(
  assignments: ResourceAssignment[],
  tasks: Task[],
  resources: Resource[],
): PruneAssignmentsResult {
  const taskIds = new Set(tasks.map((task) => task.id))
  const resourceIds = new Set(resources.map((resource) => resource.id))
  const kept: ResourceAssignment[] = []

  assignments.forEach((assignment) => {
    if (!taskIds.has(assignment.taskId)) return
    if (!resourceIds.has(assignment.resourceId)) return
    kept.push(assignment)
  })

  return {
    assignments: kept,
    droppedCount: assignments.length - kept.length,
  }
}
