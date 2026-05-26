import { useEffect, useMemo, useState } from 'react'
import type { VarianceSnapshot } from '../../types'

interface VarianceTrendChartProps {
  snapshots: VarianceSnapshot[]
}

interface Point {
  date: string
  variance: number
  healthScore: number | null
}

const CHART_HEIGHT = 140
const CHART_WIDTH = 360
const PAD_X = 28
const PAD_Y = 14

function toDate(date: string): number {
  return new Date(`${date}T00:00:00`).getTime()
}

export function VarianceTrendChart({ snapshots }: VarianceTrendChartProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [showHealthScore, setShowHealthScore] = useState(false)

  useEffect(() => {
    setHoveredDate(null)
  }, [snapshots])

  const points = useMemo<Point[]>(() => {
    if (snapshots.length === 0) return []
    if (snapshots.length < 90) {
      return snapshots.map((snapshot) => ({
        date: snapshot.date,
        variance: snapshot.projectFinishVariance,
        healthScore: typeof snapshot.compositeHealthScore === 'number' ? snapshot.compositeHealthScore : null,
      }))
    }
    return snapshots.slice(snapshots.length - 90).map((snapshot) => ({
      date: snapshot.date,
      variance: snapshot.projectFinishVariance,
      healthScore: typeof snapshot.compositeHealthScore === 'number' ? snapshot.compositeHealthScore : null,
    }))
  }, [snapshots])

  const hovered = hoveredDate ? points.find((point) => point.date === hoveredDate) ?? null : null

  const trendDegrading = useMemo(() => {
    if (points.length < 8) return false
    const recent = points.slice(points.length - 8)
    const first = recent[0]?.variance ?? 0
    const last = recent[recent.length - 1]?.variance ?? 0
    return last - first > 0
  }, [points])

  if (points.length < 2) {
    return (
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
          Capture at least two snapshots to view variance trend.
        </div>
      </div>
    )
  }

  const minX = toDate(points[0]!.date)
  const maxX = toDate(points[points.length - 1]!.date)
  const minY = Math.min(...points.map((point) => point.variance), 0)
  const maxY = Math.max(...points.map((point) => point.variance), 0)
  const ySpan = Math.max(1, maxY - minY)
  const xSpan = Math.max(1, maxX - minX)

  const toSvgX = (date: string): number => {
    const ratio = (toDate(date) - minX) / xSpan
    return PAD_X + ratio * (CHART_WIDTH - PAD_X * 2)
  }
  const toSvgY = (variance: number): number => {
    const ratio = (variance - minY) / ySpan
    return CHART_HEIGHT - PAD_Y - ratio * (CHART_HEIGHT - PAD_Y * 2)
  }
  const toHealthY = (healthScore: number): number => {
    const bounded = Math.max(0, Math.min(100, healthScore))
    const ratio = bounded / 100
    return CHART_HEIGHT - PAD_Y - ratio * (CHART_HEIGHT - PAD_Y * 2)
  }

  const polyline = points.map((point) => `${toSvgX(point.date)},${toSvgY(point.variance)}`).join(' ')
  const healthPolyline = points
    .filter((point) => point.healthScore !== null)
    .map((point) => `${toSvgX(point.date)},${toHealthY(point.healthScore ?? 0)}`)
    .join(' ')
  const zeroY = toSvgY(0)
  const lineColor = trendDegrading ? 'var(--health-amber)' : 'var(--health-green)'

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10 }}>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Variance Trend
      </div>
      <svg width="100%" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="Variance trend chart">
        <line
          x1={PAD_X}
          y1={zeroY}
          x2={CHART_WIDTH - PAD_X}
          y2={zeroY}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <polyline fill="none" stroke={lineColor} strokeWidth="2" points={polyline} />
        {showHealthScore && healthPolyline.length > 0 && (
          <polyline fill="none" stroke="var(--health-sparkline)" strokeWidth="1.5" strokeDasharray="4 2" points={healthPolyline} />
        )}
        {points.map((point) => {
          const x = toSvgX(point.date)
          const y = toSvgY(point.variance)
          return (
            <circle
              key={point.date}
              cx={x}
              cy={y}
              r={3}
              fill={hoveredDate === point.date ? 'var(--accent)' : lineColor}
              onMouseEnter={() => setHoveredDate(point.date)}
              onMouseLeave={() => setHoveredDate(null)}
            />
          )
        })}
      </svg>
      {hovered && (
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {hovered.date} · variance {hovered.variance >= 0 ? '+' : ''}{hovered.variance}d
          {showHealthScore && hovered.healthScore !== null ? ` · health ${hovered.healthScore}` : ''}
        </div>
      )}
      <button
        onClick={() => setShowHealthScore((value) => !value)}
        style={{
          marginTop: 6,
          border: 'none',
          background: 'none',
          padding: 0,
          fontSize: 'var(--text-2xs)',
          color: 'var(--accent)',
          cursor: 'pointer',
        }}
      >
        {showHealthScore ? 'Hide health score' : 'Show health score'}
      </button>
    </div>
  )
}
