import { useEffect, useMemo, useState } from 'react'
import type { ChangeOrder } from '../../types'

interface ChangeOrderSectionProps {
  taskId: string
  changeOrders: ChangeOrder[]
  onOpenManager: (changeOrderId?: string) => void
  onStartLink: () => void
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

export function ChangeOrderSection({
  taskId,
  changeOrders,
  onOpenManager,
  onStartLink,
}: ChangeOrderSectionProps) {
  const linked = useMemo(
    () => changeOrders.filter((changeOrder) => changeOrder.affectedTaskIds.includes(taskId)),
    [changeOrders, taskId],
  )
  const [expanded, setExpanded] = useState(linked.length > 0)

  useEffect(() => {
    setExpanded(linked.length > 0)
  }, [taskId, linked.length])

  return (
    <div>
      <div style={SECTION_RULE} aria-hidden="true" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={SECTION_TITLE}>Change Orders</div>
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
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {linked.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              No change orders affect this task.
            </div>
          ) : (
            linked.map((changeOrder) => (
              <button
                key={changeOrder.id}
                onClick={() => onOpenManager(changeOrder.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-sunken)',
                  padding: '7px 9px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontWeight: 'var(--weight-medium)' }}>
                  {changeOrder.number} · {changeOrder.name}
                </div>
                <div style={{ marginTop: 2, fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
                  {changeOrder.daysImpact >= 0 ? '+' : ''}
                  {changeOrder.daysImpact}d
                  {typeof changeOrder.costImpact === 'number'
                    ? ` · $${changeOrder.costImpact.toLocaleString()}`
                    : ''}
                </div>
              </button>
            ))
          )}
          <button
            onClick={onStartLink}
            style={{
              alignSelf: 'flex-start',
              height: 26,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              background: 'none',
              color: 'var(--accent)',
              fontSize: 'var(--text-xs)',
              padding: '0 10px',
              cursor: 'pointer',
            }}
          >
            + Link change order
          </button>
        </div>
      )}
    </div>
  )
}
