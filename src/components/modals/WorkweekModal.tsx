import { useId, useRef, useState } from 'react'
import type { WorkweekConfig } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkweekModalProps {
  workweek: WorkweekConfig
  holidays: string[]
  onSave: (workweek: WorkweekConfig, holidays: string[]) => void
  onClose: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: Array<{ key: keyof WorkweekConfig; label: string; short: string }> = [
  { key: 'mon', label: 'Monday',    short: 'M' },
  { key: 'tue', label: 'Tuesday',   short: 'T' },
  { key: 'wed', label: 'Wednesday', short: 'W' },
  { key: 'thu', label: 'Thursday',  short: 'T' },
  { key: 'fri', label: 'Friday',    short: 'F' },
  { key: 'sat', label: 'Saturday',  short: 'S' },
  { key: 'sun', label: 'Sunday',    short: 'S' },
]

const OVERLAY: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,18,30,0.54)',
  backdropFilter: 'blur(3px)',
  zIndex: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: 440,
  maxWidth: '95vw',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

// ─── WorkweekModal ────────────────────────────────────────────────────────────

export function WorkweekModal({ workweek, holidays, onSave, onClose }: WorkweekModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const [ww, setWw] = useState<WorkweekConfig>({ ...workweek })
  const [hols, setHols] = useState<string[]>([...holidays])
  const [newDate, setNewDate] = useState('')

  useDialogA11y({ containerRef: dialogRef, onClose })

  const toggleDay = (key: keyof WorkweekConfig) => {
    setWw(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const addHoliday = () => {
    const d = newDate.trim()
    if (!d || hols.includes(d)) return
    setHols(prev => [...prev, d].sort())
    setNewDate('')
  }

  const removeHoliday = (d: string) => {
    setHols(prev => prev.filter(h => h !== d))
  }

  const workingDays = DAYS.filter(d => ww[d.key]).length

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={BOX}
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
            Workweek & Holidays
          </div>
          <div id={descId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            {workingDays} working day{workingDays !== 1 ? 's' : ''} per week
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

          {/* 7-day toggle grid */}
          <div>
            <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Working Days
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DAYS.map(day => (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  title={day.label}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--color-border)',
                    background: ww[day.key] ? 'var(--accent)' : 'var(--color-surface-2)',
                    color: ww[day.key] ? '#fff' : 'var(--color-text-tertiary)',
                    fontWeight: ww[day.key] ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    transition: 'background 0.12s, color 0.12s',
                  }}
                >
                  {day.short}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 6, fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
              {DAYS.filter(d => ww[d.key]).map(d => d.label).join(', ') || 'No working days selected'}
            </div>
          </div>

          {/* Holiday list */}
          <div>
            <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Holidays
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="date"
                value={newDate}
                aria-label="Add holiday date"
                onChange={e => setNewDate(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHoliday()}
                style={{
                  flex: 1,
                  height: 30,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  padding: '0 8px',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={addHoliday}
                style={{
                  height: 30, padding: '0 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  background: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>

            {hols.length === 0 ? (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', padding: '8px 0' }}>
                No holidays configured
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                {hols.map(h => (
                  <div
                    key={h}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 10px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{h}</span>
                    <button
                      onClick={() => removeHoliday(h)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', fontSize: 14, lineHeight: 1 }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(ww, hols); onClose() }}
            style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
