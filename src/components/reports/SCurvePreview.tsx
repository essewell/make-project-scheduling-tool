import type { SCurveSeries } from '../../types'
import { SCurveChart } from './charts/SCurveChart'

interface SCurvePreviewProps {
  series: SCurveSeries
  statusDate: string
}

export function SCurvePreview({ series, statusDate }: SCurvePreviewProps) {
  if (series.points.length === 0) {
    return (
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
        Capture a baseline to enable the S-curve.
      </div>
    )
  }

  const last = series.points[series.points.length - 1]!
  const variance = last.actualPct - last.plannedPct
  let varianceColor = 'var(--health-green)'
  if (variance < -5) varianceColor = 'var(--health-red)'
  if (variance < 0 && variance >= -5) varianceColor = 'var(--health-amber)'

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
          Planned vs actual cumulative progress
        </div>
        <SCurveChart series={series} statusDate={statusDate} />
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        Actual {last.actualPct.toFixed(1)}% · Planned {last.plannedPct.toFixed(1)}% · Variance{' '}
        <strong style={{ color: varianceColor }}>
          {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
        </strong>
      </div>
    </div>
  )
}
