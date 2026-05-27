import { useId, useMemo, useRef, useState } from 'react'
import type { CalendarEvent, CalendarEventClassification, CalendarEventType } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'

interface ProjectCalendarManagerProps {
  events: CalendarEvent[]
  onAddEvent: (event: CalendarEvent) => void
  onUpdateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  onDeleteEvent: (id: string) => void
  onClose: () => void
}

const EVENT_TYPES: CalendarEventType[] = ['holiday', 'owner_shutdown', 'union_action', 'weather_window', 'other']
const CLASSIFICATIONS: CalendarEventClassification[] = ['non_work', 'reduced_capacity', 'advisory_only']

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
  width: 860,
  maxWidth: '96vw',
  maxHeight: '86vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  borderTop: '3px solid var(--accent)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

export function ProjectCalendarManager({
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onClose,
}: ProjectCalendarManagerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const [newName, setNewName] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newType, setNewType] = useState<CalendarEventType>('holiday')
  const [newClassification, setNewClassification] = useState<CalendarEventClassification>('non_work')
  const [newNotes, setNewNotes] = useState('')

  useDialogA11y({ containerRef: dialogRef, onClose })

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.start.localeCompare(b.start)),
    [events],
  )

  const addEvent = () => {
    if (!newName.trim() || !newStart || !newEnd) return
    const start = newStart <= newEnd ? newStart : newEnd
    const end = newStart <= newEnd ? newEnd : newStart
    onAddEvent({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      name: newName.trim(),
      start,
      end,
      type: newType,
      classification: newClassification,
      notes: newNotes.trim(),
    })
    setNewName('')
    setNewStart('')
    setNewEnd('')
    setNewType('holiday')
    setNewClassification('non_work')
    setNewNotes('')
  }

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
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>
            Project Calendar
          </div>
          <div id={descId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            Calendar events that explain workday exceptions and schedule context.
          </div>
        </div>

        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1.4fr repeat(2, 140px) 150px 150px 1fr auto', gap: 8 }}>
          <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Event name" style={inputStyle} />
          <input type="date" value={newStart} onChange={(event) => setNewStart(event.target.value)} style={inputStyle} />
          <input type="date" value={newEnd} onChange={(event) => setNewEnd(event.target.value)} style={inputStyle} />
          <select value={newType} onChange={(event) => setNewType(event.target.value as CalendarEventType)} style={inputStyle}>
            {EVENT_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={newClassification} onChange={(event) => setNewClassification(event.target.value as CalendarEventClassification)} style={inputStyle}>
            {CLASSIFICATIONS.map((classification) => <option key={classification} value={classification}>{classification.replace(/_/g, ' ')}</option>)}
          </select>
          <input value={newNotes} onChange={(event) => setNewNotes(event.target.value)} placeholder="Notes" style={inputStyle} />
          <button onClick={addEvent} style={addButtonStyle}>Add</button>
        </div>

        <div style={{ overflow: 'auto', padding: 12 }}>
          {sortedEvents.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', padding: 12 }}>No project calendar events recorded yet.</div>
          ) : (
            sortedEvents.map((event) => (
              <div key={event.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(2, 140px) 150px 150px 1fr auto', gap: 8, padding: 8, borderBottom: '1px solid var(--color-border-light)' }}>
                <input value={event.name} onChange={(e) => onUpdateEvent(event.id, { name: e.target.value })} style={inputStyle} />
                <input type="date" value={event.start} onChange={(e) => onUpdateEvent(event.id, { start: e.target.value })} style={inputStyle} />
                <input type="date" value={event.end} onChange={(e) => onUpdateEvent(event.id, { end: e.target.value })} style={inputStyle} />
                <select value={event.type} onChange={(e) => onUpdateEvent(event.id, { type: e.target.value as CalendarEventType })} style={inputStyle}>
                  {EVENT_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                </select>
                <select value={event.classification} onChange={(e) => onUpdateEvent(event.id, { classification: e.target.value as CalendarEventClassification })} style={inputStyle}>
                  {CLASSIFICATIONS.map((classification) => <option key={classification} value={classification}>{classification.replace(/_/g, ' ')}</option>)}
                </select>
                <input value={event.notes} onChange={(e) => onUpdateEvent(event.id, { notes: e.target.value })} style={inputStyle} />
                <button onClick={() => onDeleteEvent(event.id)} style={deleteButtonStyle}>Delete</button>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryButtonStyle}>Close</button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px',
  fontSize: 'var(--text-xs)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

const addButtonStyle: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 'var(--text-xs)',
  cursor: 'pointer',
  padding: '0 12px',
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

const deleteButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  color: 'var(--color-danger)',
}
