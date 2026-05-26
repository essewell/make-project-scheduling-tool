import { useEffect, useMemo, useState } from 'react'
import type { ResourceAssignment, Task } from '../types'

interface SidePanelActualCostSectionProps {
  task: Task
  assignments: ResourceAssignment[]
  onCommitActualCost: (value: number) => void
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
}

const SECTION_RULE: React.CSSProperties = {
  width: 32,
  height: 1,
  background: 'var(--rule-soft)',
  marginBottom: 8,
}

const LABEL: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  color: 'var(--color-text-tertiary)',
  display: 'block',
  marginBottom: 4,
}

const INPUT: React.CSSProperties = {
  height: 30,
  borderRadius: 'var(--radius)',
  border: '1px solid var(--color-border)',
  padding: '0 8px',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-mono)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  width: '100%',
  boxSizing: 'border-box',
}

function normalizeCost(raw: string): number | null {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

export function SidePanelActualCostSection({ task, assignments, onCommitActualCost }: SidePanelActualCostSectionProps) {
  const [draft, setDraft] = useState(String(task.actualCost))

  const hasAssignments = useMemo(
    () => assignments.some((assignment) => assignment.taskId === task.id),
    [assignments, task.id],
  )

  useEffect(() => {
    setDraft(String(task.actualCost))
  }, [task.actualCost, task.id])

  return (
    <div>
      <div style={SECTION_RULE} aria-hidden="true" />
      <div style={SECTION_TITLE}>Actual Cost</div>
      <label htmlFor="task-actual-cost" style={LABEL}>Actual cost (USD)</label>
      <input
        id="task-actual-cost"
        type="number"
        min={0}
        step="0.01"
        inputMode="decimal"
        value={draft}
        disabled={!hasAssignments}
        aria-label="Actual cost in USD"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (!hasAssignments) return
          const normalized = normalizeCost(draft)
          if (normalized === null) {
            setDraft(String(task.actualCost))
            return
          }
          if (normalized !== task.actualCost) onCommitActualCost(normalized)
          setDraft(String(normalized))
        }}
        style={{
          ...INPUT,
          opacity: hasAssignments ? 1 : 0.6,
          cursor: hasAssignments ? 'text' : 'not-allowed',
        }}
      />
      {!hasAssignments && (
        <div style={{ marginTop: 6, fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
          Assign resources first to enable cost tracking.
        </div>
      )}
    </div>
  )
}
