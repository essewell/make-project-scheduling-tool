import { useMemo, useState } from 'react'
import type { Resource, ResourceAssignment, Task, WorkweekConfig } from '../../types'
import { workdays } from '../../lib/workdays'
import { CaretDown, CaretRight } from '../../lib/icons'

interface ResourceAssignmentSectionProps {
  task: Task
  resources: Resource[]
  assignments: ResourceAssignment[]
  workweek: WorkweekConfig
  holidays: string[]
  onAddAssignment: (taskId: string) => void
  onUpdateAssignment: (assignmentId: string, patch: Partial<ResourceAssignment>) => void
  onRemoveAssignment: (assignmentId: string) => void
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
  width: '100%',
  boxSizing: 'border-box',
}

const SELECT: React.CSSProperties = {
  ...INPUT,
  cursor: 'pointer',
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 'var(--text-2xs)',
  fontWeight: 'var(--weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ResourceAssignmentSection({
  task,
  resources,
  assignments,
  workweek,
  holidays,
  onAddAssignment,
  onUpdateAssignment,
  onRemoveAssignment,
}: ResourceAssignmentSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const taskAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.taskId === task.id),
    [assignments, task.id],
  )

  const durationWorkdays = useMemo(
    () => workdays(task.s, task.e, workweek, holidays),
    [task.s, task.e, workweek, holidays],
  )

  const costByAssignmentId = useMemo(() => {
    const byId = new Map<string, number>()
    taskAssignments.forEach((assignment) => {
      const resource = resources.find((candidate) => candidate.id === assignment.resourceId)
      if (!resource) {
        byId.set(assignment.id, 0)
        return
      }
      const base = assignment.quantity * resource.costRate
      const total = resource.category === 'material' ? base : base * durationWorkdays
      byId.set(assignment.id, Number.isFinite(total) ? total : 0)
    })
    return byId
  }, [taskAssignments, resources, durationWorkdays])

  const resourceOptions = resources.map((resource) => (
    <option key={resource.id} value={resource.id}>
      {resource.name}
    </option>
  ))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={() => setExpanded((value) => !value)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
        }}
        aria-expanded={expanded}
      >
        {expanded ? <CaretDown size={14} weight="regular" aria-hidden="true" /> : <CaretRight size={14} weight="regular" aria-hidden="true" />}
        <span style={SECTION_TITLE}>Resources</span>
      </button>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {taskAssignments.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', lineHeight: 1.5 }}>
              No resources assigned.
              <button
                onClick={() => onAddAssignment(task.id)}
                style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: 'var(--text-xs)' }}
              >
                + Add assignment
              </button>
            </div>
          ) : (
            <>
              {taskAssignments.map((assignment) => (
                <div key={assignment.id} style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px auto', gap: 8, alignItems: 'center' }}>
                    <select
                      value={assignment.resourceId}
                      onChange={(event) => onUpdateAssignment(assignment.id, { resourceId: event.target.value })}
                      style={SELECT}
                    >
                      <option value="">Select resource...</option>
                      {resourceOptions}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={assignment.quantity}
                      onChange={(event) => onUpdateAssignment(assignment.id, { quantity: Number(event.target.value) })}
                      style={{
                        ...INPUT,
                        borderColor: assignment.quantity <= 0 ? 'var(--color-danger)' : 'var(--color-border)',
                      }}
                    />
                    <button
                      onClick={() => onRemoveAssignment(assignment.id)}
                      aria-label="Remove assignment"
                      style={{ width: 28, height: 28, border: 'none', background: 'none', color: 'var(--color-text-dim)', fontSize: 16, cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
                    Cost: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{formatMoney(costByAssignmentId.get(assignment.id) ?? 0)}</span>
                  </div>
                  {assignment.quantity <= 0 && (
                    <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-danger)' }}>
                      Quantity must be greater than 0.
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => onAddAssignment(task.id)}
                style={{ alignSelf: 'flex-start', height: 28, padding: '0 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
              >
                + Add assignment
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
