import type { MonthlyCashFlowBucket } from '../../types'
import { CashFlowChart } from './charts/CashFlowChart'

interface CashFlowPreviewProps {
  buckets: MonthlyCashFlowBucket[]
}

export function CashFlowPreview({ buckets }: CashFlowPreviewProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.total, 0)
  if (buckets.length === 0 || total <= 0) {
    return (
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
        Assign costed resources to enable cash flow forecast.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        Monthly planned spend by category
      </div>
      <CashFlowChart buckets={buckets} />
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
        Forecast total: <strong style={{ color: 'var(--color-text-primary)' }}>{money(total)}</strong>
      </div>
    </div>
  )
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}
