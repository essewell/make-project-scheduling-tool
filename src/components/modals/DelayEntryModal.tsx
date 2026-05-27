import { useId, useMemo, useRef, useState } from 'react'
import type { Delay, DelayType, Task } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { computeDelayDaysImpact, defaultExcusableForDelayType } from '../../lib/delays'

interface DelayEntryModalProps {
  tasks: Task[]
  initialDelay?: Delay | null
  onSave: (delay: Delay) => void
  onClose: () => void
}

const DELAY_TYPES: DelayType[] = [
  'weather',
  'owner_directive',
  'force_majeure',
  'contractor_caused',
  'subcontractor_caused',
  'other',
]

export function DelayEntryModal({ tasks, initialDelay, onSave, onClose }: DelayEntryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const [start, setStart] = useState(initialDelay?.start ?? '')
  const [end, setEnd] = useState(initialDelay?.end ?? '')
  const [type, setType] = useState<DelayType>(initialDelay?.type ?? 'weather')
  const [excusable, setExcusable] = useState<boolean>(initialDelay?.excusable ?? (defaultExcusableForDelayType(initialDelay?.type ?? 'weather') ?? false))
  const [affectedTaskIds, setAffectedTaskIds] = useState<string[]>(initialDelay?.affectedTaskIds ?? [])
  const [responsibleParty, setResponsibleParty] = useState(initialDelay?.responsibleParty ?? '')
  const [narrative, setNarrative] = useState(initialDelay?.narrative ?? '')

  useDialogA11y({ containerRef: dialogRef, onClose })

  const daysImpact = useMemo(() => {
    if (!start || !end) return 0
    return computeDelayDaysImpact(start, end)
  }, [start, end])

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={boxStyle}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
            {initialDelay ? 'Edit Delay' : 'New Delay'}
          </div>
          <div id={descId} style={{ marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            Record delay evidence with affected tasks and narrative context.
          </div>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
            <select
              value={type}
              onChange={(e) => {
                const nextType = e.target.value as DelayType
                setType(nextType)
                const defaultExcusable = defaultExcusableForDelayType(nextType)
                if (defaultExcusable !== null) setExcusable(defaultExcusable)
              }}
              style={inputStyle}
            >
              {DELAY_TYPES.map((delayType) => <option key={delayType} value={delayType}>{delayType.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={excusable ? 'yes' : 'no'} onChange={(e) => setExcusable(e.target.value === 'yes')} style={inputStyle}>
              <option value="yes">Excusable</option>
              <option value="no">Non-excusable</option>
            </select>
          </div>

          <label style={labelStyle}>
            Responsible party
            <input value={responsibleParty} onChange={(e) => setResponsibleParty(e.target.value)} style={inputStyle} />
          </label>

          <label style={labelStyle}>
            Affected tasks
            <select
              multiple
              value={affectedTaskIds}
              onChange={(e) => setAffectedTaskIds(Array.from(e.target.selectedOptions).map((option) => option.value))}
              style={{ ...inputStyle, height: 120, padding: 6 }}
            >
              {tasks.map((task) => <option key={task.id} value={task.id}>{task.name}</option>)}
            </select>
          </label>

          <label style={labelStyle}>
            Narrative
            <textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={5}
              style={{ ...inputStyle, height: 'auto', padding: 8, resize: 'vertical' }}
            />
          </label>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            Computed delay days: <strong>{daysImpact}</strong>
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={secondaryButtonStyle}>Cancel</button>
          <button
            onClick={() => {
              if (!start || !end || affectedTaskIds.length === 0) return
              onSave({
                id: initialDelay?.id ?? (Math.random().toString(36).slice(2) + Date.now().toString(36)),
                recordedAt: initialDelay?.recordedAt ?? new Date().toISOString(),
                start,
                end,
                type,
                excusable,
                affectedTaskIds,
                daysImpact: computeDelayDaysImpact(start, end),
                criticalPathImpactDays: initialDelay?.criticalPathImpactDays ?? 0,
                responsibleParty: responsibleParty.trim(),
                narrative: narrative.trim(),
                reconciliation: initialDelay?.reconciliation ?? 'pending',
              })
            }}
            style={primaryButtonStyle}
          >
            Save delay
          </button>
        </div>
      </div>
    </div>
  )
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
  width: 720,
  maxWidth: '95vw',
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

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-xs)',
  height: 30,
  padding: '0 8px',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
}

const secondaryButtonStyle: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  background: 'none',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-xs)',
  cursor: 'pointer',
  padding: '0 14px',
}

const primaryButtonStyle: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 'var(--text-xs)',
  cursor: 'pointer',
  padding: '0 14px',
}
