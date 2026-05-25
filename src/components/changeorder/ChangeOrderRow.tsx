import { useMemo, useState } from 'react'
import type { ChangeOrder, Task } from '../../types'

interface ChangeOrderRowProps {
  changeOrder: ChangeOrder
  tasksById: Map<string, Task>
}

export function ChangeOrderRow({ changeOrder, tasksById }: ChangeOrderRowProps) {
  const [expanded, setExpanded] = useState(false)
  const affectedNames = useMemo(
    () => changeOrder.affectedTaskIds.map((taskId) => tasksById.get(taskId)?.name ?? taskId),
    [changeOrder.affectedTaskIds, tasksById],
  )

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '10px',
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {changeOrder.number} · {changeOrder.name}
          </div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginTop: 3 }}>
            {changeOrder.reason || 'No reason provided'}
          </div>
        </div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {changeOrder.status}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
          {changeOrder.affectedTaskIds.length} affected task{changeOrder.affectedTaskIds.length !== 1 ? 's' : ''}
        </div>
        <button
          onClick={() => setExpanded((value) => !value)}
          style={{
            height: 24,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-2xs)',
            padding: '0 8px',
            cursor: 'pointer',
          }}
        >
          {expanded ? 'Hide Tasks' : 'Show Tasks'}
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 8, display: 'grid', gap: 4 }}>
          {affectedNames.length === 0 ? (
            <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-dim)' }}>
              No tasks linked yet.
            </div>
          ) : (
            affectedNames.map((name) => (
              <div key={name} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                • {name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
