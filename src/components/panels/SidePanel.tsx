import { useState, useCallback, type KeyboardEvent } from 'react'
import type { Task, Group, Party, Note, Dependency, WorkweekConfig } from '../../types'
import { daysBetween } from '../../lib/dates'
import { workdays } from '../../lib/workdays'
import { ActualDatesSection } from './ActualDatesSection'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidePanelProps {
  task: Task
  tasks: Task[]
  groups: Group[]
  parties: Party[]
  notes: Note[]
  dependencies: Dependency[]
  workweek: WorkweekConfig
  holidays: string[]
  today: string
  onUpdateTask: (id: string, patch: Partial<Task>) => void
  onDeleteTask: (id: string) => void
  onAddNote: (taskId: string, text: string) => void
  onClose: () => void
  onOpenLinkBuilder: (taskId: string) => void
}

// ─── Shared input style ───────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-sans)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  width: '100%',
  boxSizing: 'border-box',
}

const SELECT: React.CSSProperties = {
  ...INPUT,
  cursor: 'pointer',
}

const LABEL: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  color: 'var(--color-text-tertiary)',
  display: 'block',
  marginBottom: 4,
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: 6,
}

const STATUS_OPTIONS: Array<{ value: Task['status']; label: string }> = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk',     label: 'At Risk' },
  { value: 'delayed',     label: 'Delayed' },
  { value: 'complete',    label: 'Complete' },
]

const DEP_TYPE_LABELS: Record<string, string> = {
  FS: 'Finish → Start',
  SS: 'Start → Start',
  FF: 'Finish → Finish',
  SF: 'Start → Finish',
}

// ─── SidePanel ────────────────────────────────────────────────────────────────

export function SidePanel({
  task,
  tasks,
  groups,
  parties,
  notes,
  dependencies,
  workweek,
  holidays,
  today: _today,
  onUpdateTask,
  onDeleteTask,
  onAddNote,
  onClose,
  onOpenLinkBuilder,
}: SidePanelProps) {
  const [newNoteText, setNewNoteText] = useState('')

  const update = useCallback((patch: Partial<Task>) => {
    onUpdateTask(task.id, patch)
  }, [task.id, onUpdateTask])

  // ── Computed ──────────────────────────────────────────────────────────────
  const durationDays = daysBetween(task.s, task.e) + 1
  const workdayCount = workdays(task.s, task.e, workweek, holidays)

  // Deps where this task is the successor (predecessors of current task)
  const predecessors = dependencies.filter(d => d.toId === task.id)
  const taskMap = new Map(tasks.map(t => [t.id, t]))

  // Notes for this task, newest first
  const taskNotes = notes
    .filter(n => n.taskId === task.id)
    .sort((a, b) => b.when.localeCompare(a.when))

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNoteKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      const text = newNoteText.trim()
      if (text) {
        onAddNote(task.id, text)
        setNewNoteText('')
      }
    }
  }, [newNoteText, task.id, onAddNote])

  const handleDelete = useCallback(() => {
    onDeleteTask(task.id)
  }, [task.id, onDeleteTask])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: 360,
      background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <input
          type="text"
          value={task.name}
          onChange={e => update({ name: e.target.value })}
          style={{
            flex: 1,
            height: 32,
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            padding: '0 10px',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-semibold)',
            fontFamily: 'var(--font-sans)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            fontSize: 18, lineHeight: 1, flexShrink: 0,
          }}
          title="Close"
        >×</button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Status + Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={SECTION_TITLE}>Status & Progress</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
            <div>
              <label style={LABEL}>Status</label>
              <select
                value={task.status}
                onChange={e => update({ status: e.target.value as Task['status'], manualStatus: true })}
                style={SELECT}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL}>Progress %</label>
              <input
                type="number"
                min={0} max={100}
                value={task.pct}
                onChange={e => {
                  const n = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0))
                  update({ pct: n, manualPct: true })
                }}
                style={INPUT}
              />
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${task.pct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.2s' }} />
          </div>
          {(task.manualStatus || task.manualPct) && (
            <button
              onClick={() => update({ manualStatus: false, manualPct: false })}
              style={{ alignSelf: 'flex-start', fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '1px 6px', cursor: 'pointer' }}
            >
              Reset to auto
            </button>
          )}
        </div>

        {/* Planned Dates */}
        <div>
          <div style={SECTION_TITLE}>Planned Dates</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={LABEL}>Start</label>
              <input
                type="date"
                value={task.s}
                onChange={e => { if (e.target.value) update({ s: e.target.value }) }}
                style={{ ...INPUT, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label style={LABEL}>End</label>
              <input
                type="date"
                value={task.e}
                onChange={e => { if (e.target.value) update({ e: e.target.value }) }}
                style={{ ...INPUT, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius)', padding: '6px 10px' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>Duration</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', fontFamily: 'var(--font-mono)' }}>{durationDays}d</div>
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius)', padding: '6px 10px' }}>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>Workdays</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', fontFamily: 'var(--font-mono)' }}>{workdayCount}d</div>
            </div>
          </div>
        </div>

        {/* Party + Phase */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={LABEL}>Responsible Party</label>
            <select
              value={task.party ?? ''}
              onChange={e => update({ party: e.target.value || null })}
              style={SELECT}
            >
              <option value="">— None —</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Phase</label>
            <select
              value={task.group}
              onChange={e => update({ group: e.target.value })}
              style={SELECT}
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Milestone */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-xs)' }}>
          <input
            type="checkbox"
            checked={task.milestone}
            onChange={e => update({ milestone: e.target.checked })}
            style={{ width: 14, height: 14, cursor: 'pointer' }}
          />
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>Milestone</span>
        </label>

        {/* Task Notes */}
        <div>
          <label style={LABEL}>Task Notes</label>
          <textarea
            value={task.notes}
            onChange={e => update({ notes: e.target.value })}
            rows={3}
            placeholder="Add notes about this task..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              padding: '8px',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-sans)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* Actual Dates */}
        <ActualDatesSection
          actualStart={task.actualStart}
          actualFinish={task.actualFinish}
          onChange={patch => update(patch)}
        />

        {/* Dependencies preview */}
        <div>
          <div style={SECTION_TITLE}>Dependencies</div>
          {predecessors.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>No predecessors set</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {predecessors.map(dep => {
                const pred = taskMap.get(dep.fromId)
                return (
                  <div
                    key={dep.fromId + dep.type}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 'var(--text-xs)', padding: '4px 8px',
                      background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pred?.name ?? dep.fromId}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--accent)', flexShrink: 0 }}>
                      {DEP_TYPE_LABELS[dep.type] ?? dep.type}
                      {dep.lag !== 0 && ` ${dep.lag > 0 ? '+' : ''}${dep.lag}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Log */}
        <div>
          <div style={SECTION_TITLE}>Log</div>
          <textarea
            value={newNoteText}
            onChange={e => setNewNoteText(e.target.value)}
            onKeyDown={handleNoteKeyDown}
            rows={2}
            placeholder="Add log entry (Ctrl+Enter to save)..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              padding: '8px',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-sans)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          />
          {taskNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {taskNotes.map(note => (
                <div
                  key={note.id}
                  style={{
                    padding: '6px 10px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '2px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                    {note.text}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)', marginTop: 3 }}>
                    {new Date(note.when).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        background: 'var(--color-surface)',
      }}>
        <button
          onClick={handleDelete}
          style={{
            height: 30, padding: '0 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-danger)',
            background: 'none',
            color: 'var(--color-danger)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
        <button
          onClick={() => onOpenLinkBuilder(task.id)}
          style={{
            height: 30, padding: '0 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            background: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-medium)',
            cursor: 'pointer',
          }}
        >
          Links
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>Autosaves</span>
      </div>
    </div>
  )
}
