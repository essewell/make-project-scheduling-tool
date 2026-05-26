import type { Group, GroupNode, Task } from '../types'

interface WbsCodesResult {
  groupCodes: Map<string, string>
  groupDepths: Map<string, number>
  taskCodes: Map<string, string>
}

function buildGroupChildren(groups: Group[]): Map<string | null, Group[]> {
  const byId = new Map(groups.map((group) => [group.id, group]))
  const children = new Map<string | null, Group[]>()

  groups.forEach((group) => {
    const parentId = group.parentId && byId.has(group.parentId) ? group.parentId : null
    const bucket = children.get(parentId)
    if (bucket) {
      bucket.push(group)
      return
    }
    children.set(parentId, [group])
  })

  return children
}

export function computeWbsCodes(groups: Group[], tasks: Task[]): WbsCodesResult {
  const groupCodes = new Map<string, string>()
  const groupDepths = new Map<string, number>()
  const taskCodes = new Map<string, string>()
  const children = buildGroupChildren(groups)
  const visiting = new Set<string>()

  const walkGroup = (group: Group, code: string, depth: number) => {
    if (visiting.has(group.id)) return
    visiting.add(group.id)
    groupCodes.set(group.id, code)
    groupDepths.set(group.id, depth)

    const directTasks = tasks.filter((task) => task.group === group.id)
    directTasks.forEach((task, index) => {
      taskCodes.set(task.id, `${code}.${index + 1}`)
    })

    const childGroups = children.get(group.id) ?? []
    childGroups.forEach((child, index) => {
      walkGroup(child, `${code}.${index + 1}`, depth + 1)
    })
    visiting.delete(group.id)
  }

  const topLevelGroups = children.get(null) ?? []
  topLevelGroups.forEach((group, index) => {
    walkGroup(group, `${index + 1}`, 0)
  })

  const orphanTasks = tasks.filter((task) => !groupCodes.has(task.group))
  orphanTasks.forEach((task, index) => {
    taskCodes.set(task.id, `${topLevelGroups.length + index + 1}`)
  })

  return { groupCodes, groupDepths, taskCodes }
}

export function walkGroupTree(groups: Group[]): GroupNode[] {
  const nodes: GroupNode[] = []
  const children = buildGroupChildren(groups)
  const { groupCodes, groupDepths } = computeWbsCodes(groups, [])

  const walk = (parentId: string | null) => {
    const childGroups = children.get(parentId) ?? []
    childGroups.forEach((group) => {
      nodes.push({
        id: group.id,
        depth: groupDepths.get(group.id) ?? 0,
        parentId: group.parentId,
        wbsCode: groupCodes.get(group.id) ?? '',
      })
      walk(group.id)
    })
  }

  walk(null)
  return nodes
}

export function getGroupDepth(groupId: string, groups: Group[]): number {
  const depth = computeWbsCodes(groups, []).groupDepths.get(groupId)
  return depth ?? 0
}

export function getDescendantTaskIds(groupId: string, groups: Group[], tasks: Task[]): string[] {
  const children = buildGroupChildren(groups)
  const groupIds = new Set<string>()

  const walk = (id: string) => {
    if (groupIds.has(id)) return
    groupIds.add(id)
    const childGroups = children.get(id) ?? []
    childGroups.forEach((group) => walk(group.id))
  }

  walk(groupId)
  return tasks.filter((task) => groupIds.has(task.group)).map((task) => task.id)
}
