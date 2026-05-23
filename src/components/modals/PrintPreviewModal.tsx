import { useId, useRef, useState, useMemo } from 'react'
import type { Task, Group, Party, WorkweekConfig } from '../../types'
import { prettyDate } from '../../lib/dates'
import { workdays } from '../../lib/workdays'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import {
  PRINT_SCALE, A3_W, A3_H,
  PRINT_TL_W, PRINT_ROW_H, PRINT_HDR_H,
  PRINT_DAY_PX_BASE,
} from '../../constants'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PrintPreviewModalProps {
  tasks: Task[]
  groups: Group[]
  parties: Party[]
  taskCosts: Map<string, number>
  projectCost: number
  healthScore: number
  projectName: string
  workweek: WorkweekConfig
  holidays: string[]
  today: string
  onClose: () => void
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PrintMode = 'gantt' | 'summary'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function readabilityScore(tasks: Task[], dayPx: number): { label: string; color: string } {
  const avgDays = tasks.length
    ? tasks.reduce((sum, t) => sum + daysBetween(t.s, t.e) + 1, 0) / tasks.length
    : 0
  const avgPx = avgDays * dayPx
  if (avgPx >= 40) return { label: 'Excellent', color: '#2ECC71' }
  if (avgPx >= 20) return { label: 'Good', color: '#F39C12' }
  if (avgPx >= 8)  return { label: 'Fair', color: '#E67E22' }
  return { label: 'Tight', color: '#E74C3C' }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(10,18,30,0.7)',
  zIndex: 800,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: '92vw', maxWidth: 1140, height: '88vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  borderTop: '3px solid var(--accent)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

// ─── PrintPreviewModal ────────────────────────────────────────────────────────

export function PrintPreviewModal({
  tasks, groups, parties, taskCosts, projectCost, healthScore, projectName, workweek, holidays, today, onClose,
}: PrintPreviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  const [mode, setMode] = useState<PrintMode>('gantt')

  useDialogA11y({ containerRef: dialogRef, onClose })

  // Compute date range across all tasks
  const { minDate, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      return { minDate: today, totalDays: 1 }
    }
    const starts = tasks.map(t => t.s)
    const ends = tasks.map(t => t.e)
    const mn = starts.reduce((a, b) => a < b ? a : b)
    const mx = ends.reduce((a, b) => a > b ? a : b)
    return { minDate: mn, totalDays: daysBetween(mn, mx) + 1 }
  }, [tasks, today])

  // Gantt day-px: fit totalDays into available print width
  const ganttPrintW = A3_W - PRINT_TL_W
  const dayPx = Math.max(PRINT_DAY_PX_BASE, Math.floor(ganttPrintW / Math.max(totalDays, 1)))

  const readability = readabilityScore(tasks, dayPx)

  const groupMap = useMemo(() => new Map(groups.map(g => [g.id, g])), [groups])
  const partyMap = useMemo(() => new Map(parties.map(p => [p.id, p])), [parties])

  const printA3Style: React.CSSProperties = {
    width: A3_W,
    height: A3_H,
    transform: `scale(${PRINT_SCALE})`,
    transformOrigin: 'top left',
    background: '#fff',
    color: '#1a1a2e',
    fontFamily: '"Plus Jakarta Sans", ui-sans-serif, sans-serif',
    fontSize: 10,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  }

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
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div id={titleId} style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Print Preview</div>
            <div id={descId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
              A3 landscape · {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {(PRINT_SCALE * 100).toFixed(0)}% scale
            </div>
          </div>

          {/* Mode thumbnail strip */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 'var(--radius)' }}>
            {([
              {
                id: 'gantt' as PrintMode,
                label: 'Gantt',
                thumb: (
                  <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="18" height="3" rx="1" fill="currentColor" opacity="0.5" />
                    <rect x="2" y="9" width="26" height="3" rx="1" fill="currentColor" opacity="0.7" />
                    <rect x="2" y="15" width="12" height="3" rx="1" fill="currentColor" opacity="0.5" />
                    <line x1="32" y1="1" x2="32" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.35" />
                  </svg>
                ),
              },
              {
                id: 'summary' as PrintMode,
                label: 'Summary',
                thumb: (
                  <svg width="36" height="20" viewBox="0 0 36 20" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="32" height="4" rx="1" fill="currentColor" opacity="0.25" />
                    <line x1="2" y1="9" x2="34" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <line x1="2" y1="13" x2="34" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <line x1="2" y1="17" x2="34" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <line x1="10" y1="2" x2="10" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                    <line x1="20" y1="2" x2="20" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  </svg>
                ),
              },
            ]).map(({ id, label, thumb }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '5px 10px 4px',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  border: 'none',
                  background: mode === id ? 'var(--color-surface)' : 'transparent',
                  color: mode === id ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-medium)',
                  cursor: 'pointer',
                  boxShadow: mode === id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.12s',
                  lineHeight: 1,
                }}
              >
                {thumb}
                {label}
              </button>
            ))}
          </div>

          {/* Readability chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>Readability</span>
            <span style={{
              fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)',
              padding: '2px 8px', borderRadius: 99,
              background: readability.color + '22', color: readability.color,
            }}>
              {readability.label}
            </span>
          </div>
        </div>

        {/* A3 canvas wrapper — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#888', display: 'flex', justifyContent: 'center', padding: '24px 24px 0' }}>
          <div style={{ width: A3_W * PRINT_SCALE, height: A3_H * PRINT_SCALE, position: 'relative', flexShrink: 0, marginBottom: 24 }}>
            <div style={printA3Style} className="print-canvas">
              {mode === 'gantt' ? (
                <GanttPrintLayout
                  tasks={tasks}
                  groupMap={groupMap}
                  partyMap={partyMap}
                  projectName={projectName}
                  minDate={minDate}
                  dayPx={dayPx}
                  today={today}
                />
              ) : (
                <SummaryPrintLayout
                  tasks={tasks}
                  groupMap={groupMap}
                  partyMap={partyMap}
                  taskCosts={taskCosts}
                  projectCost={projectCost}
                  healthScore={healthScore}
                  projectName={projectName}
                  workweek={workweek}
                  holidays={holidays}
                  today={today}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', gap: 8, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            style={{ height: 30, padding: '0 14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}
          >
            Print…
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Gantt Print Layout ───────────────────────────────────────────────────────

interface GanttPrintLayoutProps {
  tasks: Task[]
  groupMap: Map<string, Group>
  partyMap: Map<string, Party>
  projectName: string
  minDate: string
  dayPx: number
  today: string
}

function GanttPrintLayout({ tasks, groupMap, projectName, minDate, dayPx, today }: GanttPrintLayoutProps) {
  const ganttW = A3_W - PRINT_TL_W

  // Today line offset
  const todayOffset = Math.max(0, daysBetween(minDate, today)) * dayPx

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title bar */}
      <div style={{ padding: '5px 10px', borderBottom: '1.5px solid #1c3048', background: '#1c3048', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7ca9cc', marginBottom: 1 }}>Project Schedule</div>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>{projectName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 7, color: '#7ca9cc', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Printed</div>
          <div style={{ fontSize: 9, color: '#fff', fontFamily: 'monospace' }}>{prettyDate(today)}</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Task list column */}
        <div style={{ width: PRINT_TL_W, flexShrink: 0, borderRight: '1px solid #ddd', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ height: PRINT_HDR_H, borderBottom: '1px solid #ddd', padding: '0 8px', display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 9, color: '#555', background: '#f7f8fa' }}>
            Task Name
          </div>
          {tasks.map((task, i) => {
            const group = groupMap.get(task.group)
            return (
              <div
                key={task.id}
                style={{
                  height: PRINT_ROW_H,
                  padding: '0 8px',
                  display: 'flex', alignItems: 'center',
                  borderBottom: '1px solid #f0f1f3',
                  background: i % 2 === 0 ? '#fff' : '#fafbfc',
                  gap: 5,
                  overflow: 'hidden',
                }}
              >
                {group && (
                  <div style={{ width: 4, height: 12, borderRadius: 2, background: group.color, flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 8, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.name}
                </span>
                {task.milestone && <span style={{ fontSize: 7, color: '#888', flexShrink: 0 }}>◆</span>}
              </div>
            )
          })}
        </div>

        {/* Gantt column */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Header area (dates) */}
          <div style={{ height: PRINT_HDR_H, borderBottom: '1px solid #ddd', background: '#f7f8fa', position: 'relative', overflow: 'hidden' }}>
            {/* Today marker in header */}
            {todayOffset >= 0 && todayOffset < ganttW && (
              <div style={{ position: 'absolute', left: todayOffset, top: 0, bottom: 0, width: 1, background: '#27AAE1', opacity: 0.6 }} />
            )}
          </div>

          {/* Bars */}
          <div style={{ position: 'relative' }}>
            {/* Today line */}
            {todayOffset >= 0 && todayOffset < ganttW && (
              <div style={{ position: 'absolute', left: todayOffset, top: 0, bottom: 0, width: 1, background: '#27AAE1', opacity: 0.4, zIndex: 2 }} />
            )}
            {tasks.map((task, i) => {
              const left = daysBetween(minDate, task.s) * dayPx
              const width = Math.max(2, (daysBetween(task.s, task.e) + 1) * dayPx)
              const group = groupMap.get(task.group)
              const color = group?.color ?? '#378ADD'
              return (
                <div
                  key={task.id}
                  style={{
                    height: PRINT_ROW_H,
                    borderBottom: '1px solid #f0f1f3',
                    background: i % 2 === 0 ? '#fff' : '#fafbfc',
                    position: 'relative',
                  }}
                >
                  {task.milestone ? (
                    <div style={{
                      position: 'absolute', left: left + width / 2 - 5, top: '50%', marginTop: -5,
                      width: 10, height: 10, background: color, transform: 'rotate(45deg)',
                    }} />
                  ) : (
                    <div style={{
                      position: 'absolute', left, top: '50%', marginTop: -6,
                      width, height: 12, borderRadius: 3,
                      background: color, opacity: 0.85,
                    }}>
                      {/* Progress fill */}
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${task.pct}%`, borderRadius: 3, background: 'rgba(0,0,0,0.2)' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Summary Print Layout ─────────────────────────────────────────────────────

interface SummaryPrintLayoutProps {
  tasks: Task[]
  groupMap: Map<string, Group>
  partyMap: Map<string, Party>
  taskCosts: Map<string, number>
  projectCost: number
  healthScore: number
  projectName: string
  workweek: WorkweekConfig
  holidays: string[]
  today: string
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  at_risk: 'At Risk',
  delayed: 'Delayed',
  complete: 'Complete',
}

function SummaryPrintLayout({
  tasks,
  groupMap,
  partyMap,
  taskCosts,
  projectCost,
  healthScore,
  projectName,
  workweek,
  holidays,
  today,
}: SummaryPrintLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px 14px' }}>
      {/* Title */}
      <div style={{ marginBottom: 8, padding: '5px 0', borderBottom: '1.5px solid #1c3048', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7ca9cc', marginBottom: 1 }}>Project Schedule — Summary</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1c3048' }}>{projectName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 7, color: '#999', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Printed</div>
          <div style={{ fontSize: 9, color: '#444', fontFamily: 'monospace' }}>{prettyDate(today)}</div>
          <div style={{ fontSize: 8, color: '#1c3048', fontFamily: 'monospace', marginTop: 1 }}>
            Quality score: {healthScore}/100
          </div>
        </div>
      </div>

      {/* Table */}
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 8 }}>
        <thead>
          <tr style={{ background: '#f0f2f5' }}>
            {['Task Name', 'Phase', 'Party', 'Start', 'End', 'Duration', 'Progress', 'Status', 'Cost'].map(h => (
              <th key={h} style={{ padding: '4px 6px', textAlign: 'left', fontWeight: 600, color: '#444', borderBottom: '1.5px solid #ccc', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => {
            const group = groupMap.get(task.group)
            const party = task.party ? partyMap.get(task.party) : null
            const dur = workdays(task.s, task.e, workweek, holidays)
            return (
              <tr key={task.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc', breakInside: 'avoid' }}>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', maxWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {group && <div style={{ width: 3, height: 10, borderRadius: 1, background: group.color, flexShrink: 0 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</span>
                    {task.milestone && <span style={{ color: '#888' }}>◆</span>}
                  </div>
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', color: group?.color ?? '#555' }}>
                  {group?.name ?? '—'}
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  {party ? (
                    <span style={{ background: party.color + '22', color: party.color, padding: '1px 4px', borderRadius: 3, fontWeight: 600 }}>
                      {party.abbr}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  {prettyDate(task.s)}
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  {prettyDate(task.e)}
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {dur}d
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 40, height: 5, background: '#e0e3e8', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${task.pct}%`, background: '#27AAE1', borderRadius: 2 }} />
                    </div>
                    <span>{task.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </td>
                <td style={{ padding: '3px 6px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', textAlign: 'right', fontFamily: 'monospace' }}>
                  {formatMoney(taskCosts.get(task.id) ?? 0)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={8} style={{ padding: '6px', borderTop: '1.5px solid #ccc', textAlign: 'right', fontWeight: 600 }}>
              Project Total
            </td>
            <td style={{ padding: '6px', borderTop: '1.5px solid #ccc', whiteSpace: 'nowrap', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', color: '#1c3048' }}>
              {formatMoney(projectCost)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
