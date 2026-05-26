import type { ScheduleHealthResult } from '../../lib/health'
import { HealthSparkline } from '../reports/HealthSparkline'

interface HealthScoreBreakdownProps {
  health: ScheduleHealthResult
  history?: number[]
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`
}

function subscore(value: number | null): string {
  if (value === null) return 'N/A'
  return `${Math.round(value)}`
}

export function HealthScoreBreakdown({ health, history = [] }: HealthScoreBreakdownProps) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10 }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        Health Score Breakdown
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 6, fontSize: 'var(--text-xs)' }}>
        <span>Logic</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>{pct(health.normalizedWeights.logic)}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{subscore(health.subscores.logicSubscore)}</span>

        <span>Resource</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>{pct(health.normalizedWeights.resource)}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{subscore(health.subscores.resourceSubscore)}</span>

        <span>Baseline</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>{pct(health.normalizedWeights.baseline)}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{subscore(health.subscores.baselineSubscore)}</span>

        <span>Float</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>{pct(health.normalizedWeights.float)}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{subscore(health.subscores.floatSubscore)}</span>

        <span>Completeness</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>{pct(health.normalizedWeights.completeness)}</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{subscore(health.subscores.completenessSubscore)}</span>
      </div>
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Total</span>
        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{health.score}</strong>
      </div>
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>30-day trend</span>
        <HealthSparkline values={history.slice(-30)} />
      </div>
    </div>
  )
}
