import type { Group, Task } from '../types'

interface SidePanelWbsBreadcrumbProps {
  task: Task
  groups: Group[]
}

const WRAP: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 0,
}

const CODE_TEXT: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  fontFamily: 'var(--font-mono)',
  color: 'var(--color-text-tertiary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const NAME_TEXT: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

function buildGroupPath(groups: Group[], groupId: string): string {
  const byId = new Map(groups.map((group) => [group.id, group]))
  const visited = new Set<string>()
  const names: string[] = []
  let currentId: string | null = groupId

  while (currentId) {
    if (visited.has(currentId)) break
    visited.add(currentId)
    const group = byId.get(currentId)
    if (!group) break
    names.unshift(group.name)
    currentId = group.parentId
  }

  return names.join(' / ')
}

export function SidePanelWbsBreadcrumb({ task, groups }: SidePanelWbsBreadcrumbProps) {
  const code = task.wbsCode.trim() || '—'
  const groupPath = buildGroupPath(groups, task.group)

  return (
    <div style={WRAP} aria-label="Task WBS breadcrumb">
      <span style={CODE_TEXT}>{code}</span>
      <span style={{ color: 'var(--color-text-dim)', fontSize: 'var(--text-2xs)' }}>-</span>
      <span style={NAME_TEXT}>{groupPath || 'Ungrouped task'}</span>
    </div>
  )
}
