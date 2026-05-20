import { useState, useMemo } from 'react'
import type { Task, Group, Party, WorkweekConfig } from '../../types'
import { prettyDate } from '../../lib/dates'
import { workdays } from '../../lib/workdays'
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(10,18,30,0.7)',
  backdropFilter: 'blur(4px)',
  zIndex: 800,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const BOX: React.CSSProperties = {
  width: '92vw', maxWidth: 1140, height: '88vh',
  background: 'var(--color-surface)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
  animation: 'schedule-slide-in 0.16s ease-out both',
}

// ─── PrintPreviewModal ────────────────────────────────────────────────────────

export function PrintPreviewModal({
  tasks, groups, parties, projectName, workweek, holidays, today, onClose,
}: PrintPreviewModalProps) {
  const [mode, setMode] = useState<PrintMode>('gantt')

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
      <div style={BOX} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)' }}>Print Preview</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
              A3 landscape · {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {(PRINT_SCALE * 100).toFixed(0)}% scale
            </div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface-2)', padding: 3, borderRadius: 'var(--radius)' }}>
            {(['gantt', 'summary'] as PrintMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  height: 28, padding: '0 12px',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  border: 'none',
                  background: mode === m ? 'var(--color-surface)' : 'transparent',
                  color: mode === m ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                  cursor: 'pointer',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {m === 'gantt' ? 'Gantt' : 'Summary'}
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
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
      {/* Title row */}
      <div style={{ padding: '6px 10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{projectName}</div>
        <div style={{ fontSize: 9, color: '#666' }}>Printed {prettyDate(today)}</div>
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

function SummaryPrintLayout({ tasks, groupMap, partyMap, projectName, workweek, holidays, today }: SummaryPrintLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px 14px' }}>
      {/* Title */}
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{projectName}</div>
        <div style={{ fontSize: 9, color: '#666' }}>Printed {prettyDate(today)}</div>
      </div>

      {/* Table */}
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 8 }}>
        <thead>
          <tr style={{ background: '#f0f2f5' }}>
            {['Task Name', 'Phase', 'Party', 'Start', 'End', 'Duration', 'Progress', 'Status'].map(h => (
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
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
