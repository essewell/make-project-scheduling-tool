import type { Task } from '../types'
import { shortDate } from '../lib/dates'

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatBarProps {
  tasks: Task[]
  today: string
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

export function StatBar({ tasks, today }: StatBarProps) {
  const count = tasks.length

  // Project window: earliest start → latest end across all tasks
  const windowStart = count > 0
    ? tasks.reduce((min, t) => t.s < min ? t.s : min, tasks[0]!.s)
    : today
  const windowEnd = count > 0
    ? tasks.reduce((max, t) => t.e > max ? t.e : max, tasks[0]!.e)
    : today

  // Overall progress: average pct across all non-milestone tasks
  const workTasks = tasks.filter(t => !t.milestone)
  const avgPct = workTasks.length > 0
    ? Math.round(workTasks.reduce((sum, t) => sum + t.pct, 0) / workTasks.length)
    : 0
  const completePct = workTasks.length > 0
    ? (workTasks.filter(t => t.status === 'complete').length / workTasks.length) * 100
    : 0
  const atRiskPct = workTasks.length > 0
    ? (workTasks.filter(t => t.status === 'at_risk').length / workTasks.length) * 100
    : 0
  const delayedPct = workTasks.length > 0
    ? (workTasks.filter(t => t.status === 'delayed').length / workTasks.length) * 100
    : 0

  return (
    <div
      className="stat-bar"
      style={{
        height: 'var(--stat-bar-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 'var(--space-4)',
        gap: 'var(--space-3)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        overflow: 'hidden',
      }}
    >
      {/* Project window */}
      <span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>Window</span>
        {' '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          {shortDate(windowStart)} – {shortDate(windowEnd)}
        </span>
      </span>

      <Divider />

      {/* Task count */}
      <span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>Tasks</span>
        {' '}
        <strong style={{ fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'], color: 'var(--color-text-primary)' }}>
          {count}
        </strong>
      </span>

      <Divider />

      {/* Overall progress */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ color: 'var(--color-text-tertiary)' }}>Progress</span>
        <span
          style={{
            width: 60,
            height: 4,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-sunken)',
            overflow: 'hidden',
            display: 'inline-block',
            verticalAlign: 'middle',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${completePct}%`,
              background: 'var(--data-positive)',
              transition: 'width 0.3s ease',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: `${completePct}%`,
              top: 0,
              height: '100%',
              width: `${atRiskPct}%`,
              background: 'var(--data-caution)',
              transition: 'left 0.3s ease, width 0.3s ease',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: `${completePct}%`,
              top: 0,
              height: '100%',
              width: `${atRiskPct}%`,
              backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.32) 0 2px, transparent 2px 4px)',
              pointerEvents: 'none',
              transition: 'left 0.3s ease, width 0.3s ease',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: `${completePct + atRiskPct}%`,
              top: 0,
              height: '100%',
              width: `${delayedPct}%`,
              background: 'var(--data-negative)',
              transition: 'left 0.3s ease, width 0.3s ease',
            }}
          />
        </span>
        <strong style={{ fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'], color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
          {avgPct}%
        </strong>
      </span>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <span
      style={{
        width: 1,
        height: 14,
        background: 'var(--color-border)',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}
