export type ReportType =
  | 's-curve'
  | 'evm'
  | 'cash-flow'
  | 'executive-summary'
  | 'weekly-progress'

interface ReportTypeListProps {
  selectedType: ReportType
  onSelect: (type: ReportType) => void
}

const REPORT_TYPES: Array<{ id: ReportType; label: string }> = [
  { id: 's-curve', label: 'S-curve' },
  { id: 'evm', label: 'EVM' },
  { id: 'cash-flow', label: 'Cash Flow' },
  { id: 'executive-summary', label: 'Executive Summary' },
  { id: 'weekly-progress', label: 'Weekly Progress' },
]

export function ReportTypeList({ selectedType, onSelect }: ReportTypeListProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {REPORT_TYPES.map((type) => {
        const selected = type.id === selectedType
        return (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            style={{
              textAlign: 'left',
              borderRadius: 'var(--radius)',
              border: selected ? '1px solid var(--accent)' : '1px solid var(--color-border)',
              background: selected ? 'var(--color-selected-bg)' : 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
