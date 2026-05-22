import type { ReactNode } from 'react'
import type { TaskStatus } from '../../types'
import { Check, CircleHalf, Clock, Warning } from '../../lib/icons'

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

const ICON: Partial<Record<TaskStatus, ReactNode>> = {
  in_progress: <CircleHalf size={11} weight="regular" aria-hidden="true" />,
  at_risk: <Warning size={11} weight="regular" aria-hidden="true" />,
  delayed: <Clock size={11} weight="regular" aria-hidden="true" />,
  complete: <Check size={11} weight="regular" aria-hidden="true" />,
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { background, color } = STYLE[status]
  return (
    <span
      className="status-badge"
      style={{
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
        gap: 4,
        transition: 'background-color 200ms ease, color 200ms ease, opacity 200ms ease, border-color 200ms ease',
      }}
    >
      {status === 'not_started' ? (
        <span
          aria-hidden="true"
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'currentColor',
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
      ) : (
        ICON[status]
      )}
      {LABEL[status]}
    </span>
  )
}
