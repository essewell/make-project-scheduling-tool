import { describe, expect, it } from 'vitest'
import type { Group, Task } from '../../../src/types'
import { computeWbsCodes, getDescendantTaskIds, getGroupDepth, walkGroupTree } from '../../../src/lib/wbs'

function makeGroup(overrides: Partial<Group>): Group {
  return {
    id: 'g',
    name: 'Group',
    color: '#1c3048',
    parentId: null,
    wbsCode: '',
    ...overrides,
  }
}

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't',
    name: 'Task',
    group: 'g',
    wbsCode: '',
    s: '2026-01-01',
    e: '2026-01-05',
    actualStart: null,
    actualFinish: null,
    actualCost: 0,
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

describe('computeWbsCodes', () => {
  it('handles flat groups', () => {
    const groups = [makeGroup({ id: 'g1' }), makeGroup({ id: 'g2' })]
    const tasks = [makeTask({ id: 't1', group: 'g1' }), makeTask({ id: 't2', group: 'g2' })]
    const out = computeWbsCodes(groups, tasks)
    expect(out.groupCodes.get('g1')).toBe('1')
    expect(out.groupCodes.get('g2')).toBe('2')
    expect(out.taskCodes.get('t1')).toBe('1.1')
    expect(out.taskCodes.get('t2')).toBe('2.1')
  })

  it('handles two-level hierarchy', () => {
    const groups = [
      makeGroup({ id: 'g1' }),
      makeGroup({ id: 'g2', parentId: 'g1' }),
    ]
    const tasks = [makeTask({ id: 't1', group: 'g2' })]
    const out = computeWbsCodes(groups, tasks)
    expect(out.groupCodes.get('g1')).toBe('1')
    expect(out.groupCodes.get('g2')).toBe('1.1')
    expect(out.taskCodes.get('t1')).toBe('1.1.1')
  })

  it('handles five-level hierarchy and depth lookup', () => {
    const groups = [
      makeGroup({ id: 'g1' }),
      makeGroup({ id: 'g2', parentId: 'g1' }),
      makeGroup({ id: 'g3', parentId: 'g2' }),
      makeGroup({ id: 'g4', parentId: 'g3' }),
      makeGroup({ id: 'g5', parentId: 'g4' }),
    ]
    const tasks = [makeTask({ id: 't1', group: 'g5' })]
    const out = computeWbsCodes(groups, tasks)
    expect(out.groupCodes.get('g5')).toBe('1.1.1.1.1')
    expect(out.taskCodes.get('t1')).toBe('1.1.1.1.1.1')
    expect(getGroupDepth('g5', groups)).toBe(4)
  })

  it('recomputes deterministically after sibling reorder', () => {
    const groupsA = [makeGroup({ id: 'g1' }), makeGroup({ id: 'g2' })]
    const groupsB = [makeGroup({ id: 'g2' }), makeGroup({ id: 'g1' })]
    expect(computeWbsCodes(groupsA, []).groupCodes.get('g1')).toBe('1')
    expect(computeWbsCodes(groupsB, []).groupCodes.get('g1')).toBe('2')
  })

  it('treats orphan parent groups as top-level', () => {
    const groups = [makeGroup({ id: 'g1', parentId: 'missing' })]
    const out = computeWbsCodes(groups, [])
    expect(out.groupCodes.get('g1')).toBe('1')
  })

  it('supports empty project', () => {
    const out = computeWbsCodes([], [])
    expect(out.groupCodes.size).toBe(0)
    expect(out.taskCodes.size).toBe(0)
  })
})

describe('tree helpers', () => {
  it('walkGroupTree returns preorder nodes with depth', () => {
    const groups = [makeGroup({ id: 'a' }), makeGroup({ id: 'b', parentId: 'a' })]
    const nodes = walkGroupTree(groups)
    expect(nodes).toHaveLength(2)
    expect(nodes[0]?.id).toBe('a')
    expect(nodes[1]?.depth).toBe(1)
  })

  it('getDescendantTaskIds includes nested descendants', () => {
    const groups = [makeGroup({ id: 'a' }), makeGroup({ id: 'b', parentId: 'a' })]
    const tasks = [makeTask({ id: 't1', group: 'a' }), makeTask({ id: 't2', group: 'b' })]
    expect(getDescendantTaskIds('a', groups, tasks)).toEqual(['t1', 't2'])
  })
})
