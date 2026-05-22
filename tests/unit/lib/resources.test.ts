import { describe, expect, it } from 'vitest'
import type { Resource, ResourceAssignment, Task } from '../../../src/types'
import {
  createResource,
  findResourceById,
  getNextResourceColor,
  pruneOrphanAssignments,
  validateResource,
} from '../../../src/lib/resources'

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: 'r1',
    name: 'Electrical Crew',
    category: 'labor',
    unit: 'hours',
    capacity: 2,
    costRate: 85,
    color: '#378ADD',
    ...overrides,
  }
}

function makeTask(id: string): Task {
  return {
    id,
    name: `Task ${id}`,
    group: '',
    s: '2026-01-01',
    e: '2026-01-03',
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
}

describe('resources helpers', () => {
  it('assigns next palette color when creating a resource without explicit color', () => {
    const created = createResource(
      'r2',
      {
        name: 'Crane',
        category: 'equipment',
        unit: 'hours',
        capacity: 1,
        costRate: 150,
      },
      [makeResource()],
    )

    expect(created.color).toBe(getNextResourceColor([makeResource()]))
  })

  it('finds resource by id', () => {
    const resource = makeResource()
    expect(findResourceById([resource], 'r1')).toEqual(resource)
    expect(findResourceById([resource], 'missing')).toBeUndefined()
  })

  it('validates required/length/uniqueness/capacity/cost rules', () => {
    const existing = [
      makeResource({ id: 'r2', name: 'Electrical Crew', category: 'labor' }),
    ]
    const candidate = makeResource({
      id: 'r1',
      name: '',
      unit: '',
      capacity: 0,
      costRate: -1,
    })

    const errors = validateResource(candidate, existing)
    expect(errors.some((e) => e.field === 'name')).toBe(true)
    expect(errors.some((e) => e.field === 'unit')).toBe(true)
    expect(errors.some((e) => e.field === 'capacity')).toBe(true)
    expect(errors.some((e) => e.field === 'costRate')).toBe(true)
  })

  it('allows material resources with zero capacity', () => {
    const material = makeResource({
      category: 'material',
      capacity: 0,
      unit: 'tons',
    })
    const errors = validateResource(material, [])
    expect(errors.some((e) => e.field === 'capacity')).toBe(false)
  })

  it('prunes orphan assignments by missing task/resource ids', () => {
    const assignments: ResourceAssignment[] = [
      { id: 'a1', taskId: 't1', resourceId: 'r1', quantity: 1, notes: '' },
      { id: 'a2', taskId: 't2', resourceId: 'r1', quantity: 1, notes: '' },
      { id: 'a3', taskId: 't1', resourceId: 'r2', quantity: 1, notes: '' },
    ]
    const result = pruneOrphanAssignments(assignments, [makeTask('t1')], [makeResource({ id: 'r1' })])

    expect(result.assignments).toHaveLength(1)
    expect(result.assignments[0]?.id).toBe('a1')
    expect(result.droppedCount).toBe(2)
  })
})
