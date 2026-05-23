import type { DcmaCheckResult } from '../../types'
import { Check, WarningCircle } from '../../lib/icons'

interface DcmaFindingsTableProps {
  checks: DcmaCheckResult[]
  hasResources: boolean
  onCaptureBaseline: () => void
}

export function DcmaFindingsTable({ checks, hasResources, onCaptureBaseline }: DcmaFindingsTableProps) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px 1fr 120px',
          padding: '8px 10px',
          background: 'var(--surface-sunken)',
          fontSize: 'var(--text-2xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span>ID</span>
        <span>Check</span>
        <span style={{ textAlign: 'right' }}>Score</span>
      </div>
      <div style={{ maxHeight: 380, overflow: 'auto' }}>
        {checks.map((check) => {
          const score = check.id === 13 || check.id === 14
            ? check.score.toFixed(2)
            : `${Math.round(check.score)}${check.id === 2 || check.id === 7 || check.id === 9 ? '' : '%'}`
          const inlineNote = check.id === 14 && check.note
            ? (
                <button
                  onClick={onCaptureBaseline}
                  style={{
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-2xs)',
                    textAlign: 'left',
                  }}
                >
                  N/A — capture a baseline first
                </button>
              )
            : check.id === 10 && !hasResources
              ? <span>No resources defined — open Resources to add.</span>
              : <span>{check.note ?? check.plainEnglish}</span>

          return (
            <div
              key={check.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 120px',
                padding: '8px 10px',
                borderTop: '1px solid var(--color-border-light)',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
                {check.id}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {check.passed ? (
                    <Check size={14} color="var(--health-green)" weight="bold" aria-hidden="true" />
                  ) : (
                    <WarningCircle size={14} color="var(--health-red)" weight="fill" aria-hidden="true" />
                  )}
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{check.name}</span>
                </div>
                <div style={{ marginTop: 2, fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)' }}>
                  {inlineNote}
                </div>
              </div>
              <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
