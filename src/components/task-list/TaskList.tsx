import { memo, type RefObject } from 'react'
import type { Group, Party, VisibleRow, Task } from '../../types'
import { daysBetween, shortDate } from '../../lib/dates'
import { ROW_HEIGHT, GANTT_HEADER_HEIGHT } from '../../constants'
import { StatusBadge } from './StatusBadge'
import { CaretDown, CaretRight } from '../../lib/icons'

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskListProps {
  visibleRows: VisibleRow[]
  groups: Group[]
  parties: Party[]
  selectedTaskId: string | null
  kbFocusId: string | null
  completionFlashId: string | null
  today: string
  onSelectTask: (id: string) => void
  onOpenPanel: (id: string) => void
  onToggleGroup: (groupId: string) => void
  onNewTask: () => void
  listRef: RefObject<HTMLDivElement>
  onScroll: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute WBS info for visible rows (group numbers + task indices within group). */
function computeWbs(rows: VisibleRow[]): Map<string, string> {
  const map = new Map<string, string>()
  let groupNum = 0
  let taskNum = 0

  for (const row of rows) {
    if (row.kind === 'group') {
      groupNum++
      taskNum = 0
      map.set('group:' + row.groupId, String(groupNum))
    } else {
      taskNum++
      map.set('task:' + row.task.id, `${groupNum}.${taskNum}`)
    }
  }
  return map
}

/** Days remaining until planned end (negative = overdue). Hide for complete tasks. */
function floatDays(task: Task, today: string): number | null {
  if (task.status === 'complete') return null
  return daysBetween(today, task.e)
}

// ─── Group row ────────────────────────────────────────────────────────────────

interface GroupRowProps {
  groupId: string
  name: string
  color: string
  count: number
  collapsed: boolean
  wbs: string
  onToggle: () => void
}

const GroupRow = memo(function GroupRow({
  groupId: _groupId,
  name,
  color,
  count,
  collapsed,
  wbs,
  onToggle,
}: GroupRowProps) {
  return (
    <div
      onClick={onToggle}
      style={{
        height: ROW_HEIGHT,
        display: 'grid',
        gridTemplateColumns: '1fr 52px 80px 48px',
        alignItems: 'center',
        background: 'var(--color-surface-2)',
        borderBottom: '1px solid var(--color-border-light)',
        borderLeft: `3px solid ${color}`,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Task column */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 8,
        overflow: 'hidden',
      }}>
        {collapsed ? (
          <CaretRight size={12} weight="regular" aria-hidden="true" color="var(--color-text-tertiary)" />
        ) : (
          <CaretDown size={12} weight="regular" aria-hidden="true" color="var(--color-text-tertiary)" />
        )}
        {/* WBS */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--color-text-dim)',
          flexShrink: 0,
          minWidth: 24,
        }}>
          {wbs}
        </span>
        {/* Group name */}
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
        {/* Task count badge */}
        <span style={{
          fontSize: 'var(--text-2xs)',
          color: 'var(--color-text-tertiary)',
          flexShrink: 0,
        }}>
          ({count})
        </span>
      </div>
      {/* Party / Dates / Float columns — empty for group rows */}
      <div /><div /><div />
    </div>
  )
})

// ─── Task row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task
  wbs: string
  party: Party | undefined
  groupColor: string
  isSelected: boolean
  isKbFocused: boolean
  isFlashing: boolean
  today: string
  onSelect: () => void
  onOpen: () => void
}

const TaskRow = memo(function TaskRow({
  task,
  wbs,
  party,
  groupColor,
  isSelected,
  isKbFocused,
  isFlashing,
  today,
  onSelect,
  onOpen,
}: TaskRowProps) {
  const float = floatDays(task, today)

  let bg = 'var(--color-surface)'
  if (isFlashing) bg = 'var(--color-selected-bg)'
  else if (isSelected) bg = 'var(--color-selected-bg)'

  return (
    <div
      data-testid="task-row"
      onClick={onSelect}
      onDoubleClick={onOpen}
      style={{
        height: ROW_HEIGHT,
        display: 'grid',
        gridTemplateColumns: '1fr 52px 80px 48px',
        alignItems: 'center',
        background: bg,
        borderBottom: '1px solid var(--color-border-light)',
        borderLeft: isKbFocused ? '2px solid var(--accent)' : '3px solid ' + groupColor,
        cursor: 'pointer',
        outline: isKbFocused ? '2px solid var(--accent)' : undefined,
        outlineOffset: isKbFocused ? '-2px' : undefined,
        animation: isFlashing ? `schedule-completion-pulse ${600}ms ease both` : undefined,
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Task name column ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        paddingLeft: isKbFocused ? 9 : 8,   // account for 2px outline border swap
        paddingRight: 6,
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {/* WBS */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          color: 'var(--color-text-dim)',
          flexShrink: 0,
          minWidth: 24,
        }}>
          {wbs}
        </span>

        {/* Milestone diamond */}
        {task.milestone && (
          <span style={{
            display: 'inline-block',
            width: 8, height: 8,
            background: groupColor,
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }} />
        )}

        {/* Name */}
        <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0,
        }}>
          {task.name}
        </span>

        {/* Status badge */}
        <StatusBadge status={task.status} />

        {/* Note indicator */}
        {task.notes && (
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0, color: 'var(--color-text-dim)' }}>
            <path d="M1 2h8M1 5h6M1 8h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        )}
      </div>

      {/* ── Party column ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 4,
      }}>
        {party && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1px 5px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-2xs)',
            fontWeight: 'var(--weight-medium)',
            background: `color-mix(in srgb, ${party.color} 14%, transparent)`,
            color: party.color,
            whiteSpace: 'nowrap',
            maxWidth: 44,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {party.abbr}
          </span>
        )}
      </div>

      {/* ── Dates column ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 6,
        gap: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-3xs)',
          color: 'var(--color-text-tertiary)',
          lineHeight: 1.2,
        }}>
          {shortDate(task.s)}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-3xs)',
          color: 'var(--color-text-tertiary)',
          lineHeight: 1.2,
        }}>
          {shortDate(task.e)}
        </span>
      </div>

      {/* ── Float column ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 10,
      }}>
        {float !== null && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-3xs)',
            color: float < 0 ? 'var(--color-danger)' : 'var(--color-text-dim)',
            fontWeight: float < 0 ? 'var(--weight-medium)' : undefined,
          }}>
            {float < 0 ? float : `+${float}`}
          </span>
        )}
      </div>
    </div>
  )
})

// ─── TaskList ─────────────────────────────────────────────────────────────────

export function TaskList({
  visibleRows,
  groups,
  parties,
  selectedTaskId,
  kbFocusId,
  completionFlashId,
  today,
  onSelectTask,
  onOpenPanel,
  onToggleGroup,
  onNewTask,
  listRef,
  onScroll,
}: TaskListProps) {
  const wbsMap = computeWbs(visibleRows)
  const partyMap = new Map(parties.map(p => [p.id, p]))
  const groupColorMap = new Map(groups.map(g => [g.id, g.color]))

  // Determine which groups belong to visible tasks (for coloring task rows)
  const taskGroupColor = (task: Task): string =>
    groupColorMap.get(task.group) ?? '#378ADD'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-surface)' }}>
      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        height: GANTT_HEADER_HEIGHT,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: '1fr 52px 80px 48px',
        alignItems: 'flex-end',
        paddingBottom: 8,
        flexShrink: 0,
      }}>
        <span style={{ paddingLeft: 36, fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Task
        </span>
        <span style={{ textAlign: 'center', fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Party
        </span>
        <span style={{ textAlign: 'right', paddingRight: 6, fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Dates
        </span>
        <span style={{ textAlign: 'right', paddingRight: 10, fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Float
        </span>
      </div>

      {/* ── Scrollable row area ── */}
      <div
        ref={listRef}
        onScroll={onScroll}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {visibleRows.length === 0 && (
          <div style={{
            padding: '32px 24px',
            textAlign: 'center',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-sm)',
          }}>
            No tasks match the current filters.
          </div>
        )}

        {visibleRows.map((row, i) => {
          if (row.kind === 'group') {
            return (
              <GroupRow
                key={row.groupId}
                groupId={row.groupId}
                name={row.name}
                color={row.color}
                count={row.count}
                collapsed={row.collapsed}
                wbs={wbsMap.get('group:' + row.groupId) ?? ''}
                onToggle={() => onToggleGroup(row.groupId)}
              />
            )
          }

          const { task } = row
          const party = task.party ? partyMap.get(task.party) : undefined
          return (
            <TaskRow
              key={task.id + i}
              task={task}
              wbs={wbsMap.get('task:' + task.id) ?? ''}
              party={party}
              groupColor={taskGroupColor(task)}
              isSelected={task.id === selectedTaskId}
              isKbFocused={task.id === kbFocusId}
              isFlashing={task.id === completionFlashId}
              today={today}
              onSelect={() => onSelectTask(task.id)}
              onOpen={() => onOpenPanel(task.id)}
            />
          )
        })}

        {/* ── Add task row ── */}
        <div style={{ padding: '10px 12px' }}>
          <button
            onClick={onNewTask}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            + New Task
          </button>
        </div>
      </div>
    </div>
  )
}
