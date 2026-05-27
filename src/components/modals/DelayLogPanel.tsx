import { useEffect, useMemo, useRef, useState } from 'react'
import type { Delay } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'

interface DelayLogPanelProps {
  delays: Delay[]
  focusDelayId: string | null
  onOpenNewDelay: () => void
  onEditDelay: (delay: Delay) => void
  onSetReconciliation: (delayId: string, value: Delay['reconciliation']) => void
  onExportCsv: () => void
  onClose: () => void
}

type SortField = 'recordedAt' | 'start' | 'daysImpact' | 'criticalPathImpactDays'

export function DelayLogPanel({
  delays,
  focusDelayId,
  onOpenNewDelay,
  onEditDelay,
  onSetReconciliation,
  onExportCsv,
  onClose,
}: DelayLogPanelProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())
  const [sortField, setSortField] = useState<SortField>('recordedAt')
  const [sortDesc, setSortDesc] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  useDialogA11y({ containerRef: dialogRef, onClose })

  const sortedDelays = useMemo(() => {
    const copied = [...delays]
    copied.sort((a, b) => {
      let cmp = 0
      if (sortField === 'daysImpact' || sortField === 'criticalPathImpactDays') {
        cmp = a[sortField] - b[sortField]
      } else {
        cmp = a[sortField].localeCompare(b[sortField])
      }
      return sortDesc ? -cmp : cmp
    })
    return copied
  }, [delays, sortField, sortDesc])

  useEffect(() => {
    if (!focusDelayId) return
    const element = rowRefs.current.get(focusDelayId)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setExpandedIds((prev) => new Set(prev).add(focusDelayId))
  }, [focusDelayId, sortedDelays])

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Delay log panel" tabIndex={-1} style={boxStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Delay Log</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Track causes, impacts, and reconciliation outcomes.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onExportCsv} style={secondaryButtonStyle}>Export CSV</button>
            <button onClick={onOpenNewDelay} style={primaryButtonStyle}>+ New</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '130px 110px 110px 120px 130px 1fr 160px auto', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
          <button onClick={() => toggleSort('recordedAt', sortField, sortDesc, setSortField, setSortDesc)} style={sortButtonStyle}>Recorded</button>
          <button onClick={() => toggleSort('start', sortField, sortDesc, setSortField, setSortDesc)} style={sortButtonStyle}>Start</button>
          <div>End</div>
          <button onClick={() => toggleSort('daysImpact', sortField, sortDesc, setSortField, setSortDesc)} style={sortButtonStyle}>Days</button>
          <button onClick={() => toggleSort('criticalPathImpactDays', sortField, sortDesc, setSortField, setSortDesc)} style={sortButtonStyle}>CP Impact</button>
          <div>Type</div>
          <div>Reconciliation</div>
          <div />
        </div>

        <div style={{ overflow: 'auto', padding: '4px 8px 12px' }}>
          {sortedDelays.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', padding: '14px 8px' }}>
              No delays recorded yet. When a delay happens, log it here so the variance attribution is complete.
            </div>
          ) : (
            sortedDelays.map((delay) => {
              const expanded = expandedIds.has(delay.id)
              return (
                <div key={delay.id}>
                  <div
                    ref={(element) => {
                      if (element) rowRefs.current.set(delay.id, element)
                      else rowRefs.current.delete(delay.id)
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '130px 110px 110px 120px 130px 1fr 160px auto',
                      gap: 8,
                      padding: '8px 4px',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--color-border-light)',
                      background: focusDelayId === delay.id ? 'var(--color-selected-bg)' : undefined,
                    }}
                  >
                    <div style={cellStyle}>{new Date(delay.recordedAt).toLocaleDateString()}</div>
                    <div style={cellStyle}>{delay.start}</div>
                    <div style={cellStyle}>{delay.end}</div>
                    <div style={cellStyle}>{delay.daysImpact}</div>
                    <div style={cellStyle}>{delay.criticalPathImpactDays}</div>
                    <div style={cellStyle}>{delay.type.replace(/_/g, ' ')}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['pending', 'accepted', 'rejected'] as const).map((value) => (
                        <button key={value} onClick={() => onSetReconciliation(delay.id, value)} style={{ ...pillStyle, background: delay.reconciliation === value ? 'var(--accent-dim)' : 'transparent' }}>
                          {value}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setExpandedIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(delay.id)) next.delete(delay.id)
                        else next.add(delay.id)
                        return next
                      })} style={secondaryTinyButtonStyle}>
                        {expanded ? 'Hide' : 'Details'}
                      </button>
                      <button onClick={() => onEditDelay(delay)} style={secondaryTinyButtonStyle}>Edit</button>
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ padding: '8px 10px 12px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border-light)' }}>
                      <div><strong>Responsible:</strong> {delay.responsibleParty || 'N/A'}</div>
                      <div><strong>Affected Tasks:</strong> {delay.affectedTaskIds.length}</div>
                      <div><strong>Narrative:</strong> {delay.narrative || 'N/A'}</div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function toggleSort(
  field: SortField,
  currentField: SortField,
  currentDesc: boolean,
  setField: (value: SortField) => void,
  setDesc: (value: boolean) => void,
) {
  if (currentField === field) setDesc(!currentDesc)
  else {
    setField(field)
    setDesc(true)
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,18,30,0.54)',
  zIndex: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const boxStyle: React.CSSProperties = {
  width: 1120,
  maxWidth: '97vw',
  maxHeight: '88vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  borderTop: '3px solid var(--accent)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

const primaryButtonStyle: React.CSSProperties = {
  height: 30, borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', padding: '0 14px', fontSize: 'var(--text-xs)', cursor: 'pointer',
}
const secondaryButtonStyle: React.CSSProperties = {
  height: 30, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', padding: '0 14px', fontSize: 'var(--text-xs)', cursor: 'pointer',
}
const secondaryTinyButtonStyle: React.CSSProperties = {
  height: 24, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', padding: '0 8px', fontSize: 'var(--text-2xs)', cursor: 'pointer',
}
const sortButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  textAlign: 'left',
  color: 'var(--color-text-tertiary)',
  fontSize: 'var(--text-2xs)',
  cursor: 'pointer',
  padding: 0,
}
const cellStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
}
const pillStyle: React.CSSProperties = {
  height: 22,
  borderRadius: 999,
  border: '1px solid var(--color-border)',
  fontSize: '10px',
  color: 'var(--color-text-secondary)',
  background: 'none',
  padding: '0 8px',
  cursor: 'pointer',
}
