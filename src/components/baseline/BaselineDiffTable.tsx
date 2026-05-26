import type { BaselineDiff, ChangeOrder } from '../../types'

interface BaselineDiffTableProps {
  diff: BaselineDiff
  changeOrders?: ChangeOrder[]
}

const DELTA: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-2xs)',
  color: 'var(--color-text-secondary)',
  textAlign: 'right',
}

export function BaselineDiffTable({ diff, changeOrders = [] }: BaselineDiffTableProps) {
  const changeOrderLabelsByTask = new Map<string, string[]>()
  diff.slipped.forEach((row) => {
    const labels = changeOrders
      .filter((changeOrder) => changeOrder.affectedTaskIds.includes(row.taskId))
      .map((changeOrder) => changeOrder.number)
    changeOrderLabelsByTask.set(row.taskId, labels)
  })

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <section>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Slipped Tasks
        </div>
        {diff.slipped.length === 0 ? (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>No slipped tasks.</div>
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {diff.slipped.map((row) => (
              <div key={row.taskId} style={{ display: 'grid', gridTemplateColumns: '1fr 74px 82px', gap: 10, padding: '7px 9px', borderTop: '1px solid var(--color-border-light)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
                    {row.baselineAFinish} → {row.baselineBFinish}
                  </div>
                  {(changeOrderLabelsByTask.get(row.taskId) ?? []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                      {(changeOrderLabelsByTask.get(row.taskId) ?? []).map((label) => (
                        <span
                          key={`${row.taskId}-${label}`}
                          style={{
                            fontSize: 'var(--text-3xs)',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 4px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-selected-bg)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={DELTA}>+{row.slipDays}d</div>
                <div style={DELTA}>{row.costDelta >= 0 ? '+' : ''}${row.costDelta.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Added Tasks
        </div>
        {diff.added.length === 0 ? (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>No added tasks.</div>
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {diff.added.map((row) => (
              <div key={row.taskId} style={{ display: 'grid', gridTemplateColumns: '1fr 82px', gap: 10, padding: '7px 9px', borderTop: '1px solid var(--color-border-light)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
                    Finish: {row.finish}
                  </div>
                </div>
                <div style={DELTA}>{row.costDelta >= 0 ? '+' : ''}${row.costDelta.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Removed Tasks
        </div>
        {diff.removed.length === 0 ? (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>No removed tasks.</div>
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {diff.removed.map((row) => (
              <div key={row.taskId} style={{ display: 'grid', gridTemplateColumns: '1fr 82px', gap: 10, padding: '7px 9px', borderTop: '1px solid var(--color-border-light)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
                    Finish: {row.finish}
                  </div>
                </div>
                <div style={DELTA}>{row.costDelta >= 0 ? '+' : ''}${row.costDelta.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
