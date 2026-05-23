import type { Task, CpmResult } from '../types'
import { shortDate } from '../lib/dates'
import { HEALTH_AMBER_THRESHOLD, HEALTH_GREEN_THRESHOLD } from '../constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatBarProps {
  tasks: Task[]
  today: string
  criticalPath?: CpmResult | null
  projectCost?: number
  overAllocationCount?: number
  healthScore?: number
  onOpenOverAllocations?: () => void
  onOpenQualityPanel?: () => void
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function StatBar({
  tasks,
  today,
  criticalPath,
  projectCost = 0,
  overAllocationCount = 0,
  healthScore = 0,
  onOpenOverAllocations,
  onOpenQualityPanel,
}: StatBarProps) {
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

  // Conditional stats
  const criticalCount = criticalPath ? criticalPath.criticalIds.size : 0
  const varianceCount = workTasks.filter(t => t.status === 'at_risk' || t.status === 'delayed').length
  const healthColor = healthScore >= HEALTH_GREEN_THRESHOLD
    ? 'var(--health-green)'
    : healthScore >= HEALTH_AMBER_THRESHOLD
      ? 'var(--health-amber)'
      : 'var(--health-red)'

  return (
    <div className="stat-bar">
      <div className="stat-bar-main">
      {/* Project window */}
      <span className="stat-item stat-item-window">
        <span style={{ color: 'var(--color-text-tertiary)' }}>Window</span>
        {' '}
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          {shortDate(windowStart)} – {shortDate(windowEnd)}
        </span>
      </span>

      <Divider />

      {/* Task count */}
      <span className="stat-item stat-item-tasks">
        <span style={{ color: 'var(--color-text-tertiary)' }}>Tasks</span>
        {' '}
        <strong style={{ fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'], color: 'var(--color-text-primary)' }}>
          {count}
        </strong>
      </span>

      <Divider />

      {/* Overall progress */}
      <span className="stat-item stat-item-progress" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
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

      {/* Critical path count — only when CP is active */}
      {criticalPath && criticalCount > 0 && (
        <>
          <Divider />
      <span className="stat-item stat-item-cost">
            <span style={{ color: 'var(--color-text-tertiary)' }}>Critical</span>
            {' '}
            <strong style={{ fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'], color: 'var(--data-negative)', fontFamily: 'var(--font-mono)' }}>
              {criticalCount}
            </strong>
      </span>
        </>
      )}

      {/* Variance count — only when tasks are off-plan */}
      {varianceCount > 0 && (
        <>
          <Divider />
          <span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Variance</span>
            {' '}
            <strong style={{ fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'], color: 'var(--data-caution)', fontFamily: 'var(--font-mono)' }}>
              {varianceCount}
            </strong>
          </span>
        </>
      )}

      <Divider />
      <button
        className="stat-item"
        onClick={onOpenQualityPanel}
        title="Click for full quality report"
        style={{
          height: 22,
          padding: '0 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span style={{ color: 'var(--color-text-tertiary)' }}>Health</span>
        {' '}
        <strong
          style={{
            color: healthColor,
            fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'],
          }}
        >
          {healthScore}
        </strong>
      </button>
      </div>

      <div className="stat-bar-spacer" />

      <div className="stat-bar-side">
        {/* Project total cost */}
        <span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>Cost</span>
          {' '}
          <strong style={{ fontWeight: 'var(--weight-semibold)' as React.CSSProperties['fontWeight'], color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatMoney(projectCost)}
          </strong>
        </span>

        {overAllocationCount > 0 && (
          <>
            <Divider />
            <button
              onClick={onOpenOverAllocations}
              className="stat-item stat-item-overalloc"
              style={{
                height: 22,
                padding: '0 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-danger)',
                background: 'var(--color-danger-dim)',
                color: 'var(--color-danger)',
                fontSize: 'var(--text-2xs)',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
              title="Open first over-allocated resource"
            >
              Over-alloc {overAllocationCount}
            </button>
          </>
        )}

        <Divider />

        {/* Today pill — right-aligned */}
        <span className="stat-item stat-item-today" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '0 8px', height: 20,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-sunken)',
          border: '1px solid var(--color-border-light)',
          fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0,
        }}>
          <span>Today</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'var(--weight-regular)', letterSpacing: 0, textTransform: 'none', color: 'var(--color-text-secondary)' }}>
            {shortDate(today)}
          </span>
        </span>
      </div>
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
