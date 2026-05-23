import type { FloatBucketCount } from '../../lib/floatDistribution'

interface FloatDistributionChartProps {
  buckets: FloatBucketCount[]
}

export function FloatDistributionChart({ buckets }: FloatDistributionChartProps) {
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count))
  const width = 320
  const height = 180
  const barGap = 6
  const barWidth = (width - (buckets.length - 1) * barGap) / buckets.length

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 10 }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        Float Distribution
      </div>
      <svg width={width} height={height} role="img" aria-label="Float distribution histogram">
        {buckets.map((bucket, index) => {
          const x = index * (barWidth + barGap)
          const h = Math.round((bucket.count / maxCount) * (height - 26))
          const y = height - h - 18
          const fill = bucket.key === 'neg'
            ? 'var(--float-bucket-negative)'
            : bucket.key === 'zero'
              ? 'var(--float-bucket-critical)'
              : 'var(--float-bucket-bg)'
          return (
            <g key={bucket.key}>
              <rect x={x} y={y} width={barWidth} height={h} fill={fill} stroke="var(--color-border)" />
              <text
                x={x + barWidth / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-text-tertiary)"
              >
                {bucket.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
