import { useId, useRef, useState, useMemo } from 'react'
import type { Task, Dependency, DepType } from '../../types'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { daysBetween } from '../../lib/dates'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LinkBuilderModalProps {
  taskId: string      // the task whose predecessors we're editing
  tasks: Task[]
  dependencies: Dependency[]
  onSave: (newDeps: Dependency[]) => void
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface Row {
  fromId: string
  checked: boolean
  type: DepType
  lag: number
}

const DEP_TYPES: DepType[] = ['FS', 'SS', 'FF', 'SF']

/** DFS: can we reach `targetId` from `startId` following successor edges? */
function canReach(startId: string, targetId: string, deps: Dependency[]): boolean {
  const visited = new Set<string>()
  const stack = [startId]
  while (stack.length > 0) {
    const curr = stack.pop()!
    if (curr === targetId) return true
    if (visited.has(curr)) continue
    visited.add(curr)
    for (const d of deps) {
      if (d.fromId === curr) stack.push(d.toId)
    }
  }
  return false
}

// ─── Overlay / box styles (shared pattern) ───────────────────────────────────

const OVERLAY: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,18,30,0.54)',
  zIndex: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: 580,
  maxWidth: '95vw',
  maxHeight: '80vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  borderTop: '3px solid var(--accent)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

const INPUT: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-sans)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
}

// ─── LinkBuilderModal ─────────────────────────────────────────────────────────

export function LinkBuilderModal({ taskId, tasks, dependencies, onSave, onClose }: LinkBuilderModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const descId = useId()
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useDialogA11y({ containerRef: dialogRef, initialFocusRef: searchInputRef, onClose })

  // Build initial rows from existing predecessors of this task
  const [rows, setRows] = useState<Row[]>(() => {
    const candidates = tasks.filter(t => t.id !== taskId)
    return candidates.map(t => {
      const existing = dependencies.find(d => d.fromId === t.id && d.toId === taskId)
      return {
        fromId: t.id,
        checked: !!existing,
        type: existing?.type ?? 'FS',
        lag: existing?.lag ?? 0,
      }
    })
  })

  const candidates = useMemo(
    () => tasks.filter(t => t.id !== taskId),
    [tasks, taskId],
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return candidates.filter(t => t.name.toLowerCase().includes(q))
  }, [candidates, search])

  const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks])

  const setRow = (fromId: string, patch: Partial<Row>) => {
    setRows(prev => prev.map(r => r.fromId === fromId ? { ...r, ...patch } : r))
    setError(null)
  }

  const handleSave = () => {
    // Build proposed edges
    const checked = rows.filter(r => r.checked)

    // Circular dep check: for each new edge (fromId → taskId), verify taskId can't already reach fromId
    const depsWithoutCurrent = dependencies.filter(d => d.toId !== taskId)
    for (const row of checked) {
      if (canReach(taskId, row.fromId, depsWithoutCurrent)) {
        const name = taskMap.get(row.fromId)?.name ?? row.fromId
        setError(`Circular dependency detected: adding "${name}" as predecessor would create a cycle.`)
        return
      }
    }

    // Build new full dep list: keep non-taskId edges, replace taskId's predecessors
    const newEdges: Dependency[] = checked.map(r => ({
      fromId: r.fromId,
      toId: taskId,
      type: r.type,
      lag: r.lag,
    }))
    onSave([...depsWithoutCurrent, ...newEdges])
    onClose()
  }

  const checkedCount = rows.filter(r => r.checked).length
  const durationByTaskId = useMemo(
    () => new Map(tasks.map((task) => [task.id, Math.max(1, daysBetween(task.s, task.e) + 1)])),
    [tasks],
  )

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
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>
            Edit Dependencies
          </div>
          <div id={descId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
            Select predecessor tasks for: <strong>{taskMap.get(taskId)?.name}</strong>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ ...INPUT, width: '100%' }}
          />
        </div>

        {/* Task list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 'var(--text-xs)' }}>
              No tasks match
            </div>
          )}
          {filtered.map(task => {
            const row = rows.find(r => r.fromId === task.id)
            if (!row) return null
            return (
              <div
                key={task.id}
                className="link-row"
                data-checked={row.checked}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr 130px 70px',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 20px',
                  borderBottom: '1px solid var(--color-border-light)',
                  background: row.checked ? 'var(--color-selected-bg)' : undefined,
                }}
              >
                <input
                  type="checkbox"
                  checked={row.checked}
                  onChange={e => setRow(task.id, { checked: e.target.checked })}
                  style={{ width: 14, height: 14, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 'var(--text-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.name}
                </span>
                {/* Type segmented control */}
                <div style={{ display: 'flex', opacity: row.checked ? 1 : 0.35 }}>
                  {DEP_TYPES.map(t => (
                    <button
                      key={t}
                      disabled={!row.checked}
                      onClick={() => setRow(task.id, { type: t })}
                      className={`dep-type-btn${row.type === t ? ' dep-type-btn--active' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={row.lag}
                        disabled={!row.checked}
                        onChange={e => setRow(task.id, { lag: parseInt(e.target.value, 10) || 0 })}
                        style={{ ...INPUT, width: 44, opacity: row.checked ? 1 : 0.4, fontFamily: 'var(--font-mono)' }}
                      />
                      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>d</span>
                    </div>
                    {row.checked && row.lag > (durationByTaskId.get(task.id) ?? 1) * 0.5 && (
                      <span style={{ fontSize: '10px', color: 'var(--health-amber)', whiteSpace: 'nowrap' }}>
                        Lag exceeds 50% of predecessor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 20px',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger)',
            background: 'var(--color-danger-dim)',
            borderTop: '1px solid var(--color-border)',
          }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              {checkedCount} predecessor{checkedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClose}
              style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
