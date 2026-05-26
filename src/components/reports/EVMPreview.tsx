import type { EVMResult } from '../../types'
import { EVMChart } from './charts/EVMChart'

interface EVMPreviewProps {
  evm: EVMResult
  hasBaseline: boolean
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function EVMPreview({ evm, hasBaseline }: EVMPreviewProps) {
  if (!hasBaseline || evm.pv <= 0) {
    return (
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
        Capture a baseline with cost-loaded tasks to enable EVM.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 'var(--space-2)' }}>
        <Metric label="PV" value={money(evm.pv)} />
        <Metric label="EV" value={money(evm.ev)} />
        <Metric label="AC" value={money(evm.ac)} />
        <Metric label="SPI" value={evm.spi === null ? '—' : evm.spi.toFixed(2)} />
        <Metric label="CPI" value={evm.cpi === null ? '—' : evm.cpi.toFixed(2)} />
      </div>
      <EVMChart evm={evm} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 'var(--space-2)' }}>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{value}</div>
    </div>
  )
}
