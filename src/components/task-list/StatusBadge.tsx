import type { TaskStatus } from '../../types'

interface StatusBadgeProps {
  status: TaskStatus
}

const LABEL: Record<TaskStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  delayed: 'Delayed',
  complete: 'Complete',
}

const STYLE: Record<TaskStatus, { background: string; color: string }> = {
  not_started: { background: 'var(--color-surface-2)',          color: 'var(--color-text-dim)' },
  in_progress:  { background: 'var(--accent-dim)',               color: 'var(--accent)' },
  at_risk:      { background: 'rgba(239,159,39,0.13)',           color: 'var(--color-warning)' },
  delayed:      { background: 'var(--color-danger-dim)',         color: 'var(--color-danger)' },
  complete:     { background: 'rgba(29,158,117,0.12)',           color: 'var(--color-success)' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { background, color } = STYLE[status]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1px 5px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-medium)',
      lineHeight: '15px',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      background,
      color,
    }}>
      {LABEL[status]}
    </span>
  )
}
