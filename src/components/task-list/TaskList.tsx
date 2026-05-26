import { memo, type RefObject } from 'react'
import type { Group, Party, VisibleRow, Task, Dependency, GroupRollup } from '../../types'
import { daysBetween, shortDate } from '../../lib/dates'
import { ROW_HEIGHT, GANTT_HEADER_HEIGHT } from '../../constants'
import { StatusBadge } from './StatusBadge'
import { CaretDown, CaretRight, Funnel, Warning } from '../../lib/icons'
import { findExcessiveLagDependencies, findNegativeFloatTaskIds, findOrphanTaskIds } from '../../lib/logicValidation'

const WBS_COL_WIDTH = 48
const GROUP_INDENT_PX = 16

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskListProps {
  visibleRows: VisibleRow[]
  filteredTasks: Task[]
  taskCount: number
  isComputing?: boolean
  groups: Group[]
  parties: Party[]
  selectedTaskId: string | null
  kbFocusId: string | null
  completionFlashId: string | null
  showCostColumn?: boolean
  taskCosts?: Map<string, number>
  groupRollups?: Map<string, GroupRollup>
  dependencies: Dependency[]
  today: string
  onSelectTask: (id: string) => void
  onOpenPanel: (id: string) => void
  onOpenLinks: (id: string) => void
  onToggleGroup: (groupId: string) => void
  onNewTask: () => void
  listRef: RefObject<HTMLDivElement>
  onScroll: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCompactCurrency(value: number): string {
  if (value <= 0) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Days remaining until planned end (negative = overdue). Hide for complete tasks. */
function floatDays(task: Task, today: string): number | null {
  if (task.status === 'complete') return null
  return daysBetween(today, task.e)
}

function formatFloat(floatValue: number): string {
  return floatValue < 0 ? `${floatValue}` : `+${floatValue}`
}

// ─── Group row ────────────────────────────────────────────────────────────────

interface GroupRowProps {
  groupId: string
  name: string
  color: string
  count: number
  collapsed: boolean
  wbs: string
  depth: number
  completionPct: number
  rollupLabel: string
  showCostColumn: boolean
  onToggle: () => void
}

const GroupRow = memo(function GroupRow({
  groupId: _groupId,
  name,
  color,
  count,
  collapsed,
  wbs,
  depth,
  completionPct,
  rollupLabel,
  showCostColumn,
  onToggle,
}: GroupRowProps) {
  const columns = showCostColumn ? '1fr 52px 80px 48px 90px' : '1fr 52px 80px 48px'
  return (
    <div
      onClick={onToggle}
      style={{
        height: ROW_HEIGHT,
        display: 'grid',
        gridTemplateColumns: columns,
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
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 8 + depth * GROUP_INDENT_PX,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 8 + Math.max(0, depth - 1) * GROUP_INDENT_PX,
          top: 0,
          bottom: 0,
          width: depth > 0 ? 1 : 0,
          background: 'var(--color-border-light)',
        }} />
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
          width: WBS_COL_WIDTH,
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
        <span style={{
          fontSize: 'var(--text-3xs)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '999px',
          padding: '1px 6px',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          marginLeft: 4,
        }}>
          {rollupLabel}
        </span>
      </div>
      {/* Party / Dates columns — empty for group rows */}
      <div /><div />
      {/* Group completion meter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
        <div
          title={`Phase completion: ${completionPct}%`}
          style={{
            width: 4,
            height: 20,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-sunken)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: `${completionPct}%`,
              background: completionPct >= 100 ? 'var(--data-positive)' : 'var(--accent)',
            }}
          />
        </div>
      </div>
      {showCostColumn && <div />}
    </div>
  )
})

// ─── Task row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task
  depth: number
  party: Party | undefined
  groupColor: string
  isSelected: boolean
  isKbFocused: boolean
  isFlashing: boolean
  showCostColumn: boolean
  cost: number
  isOrphan: boolean
  hasExcessiveLag: boolean
  hasNegativeFloat: boolean
  today: string
  onSelect: () => void
  onOpen: () => void
  onOpenLinks: () => void
}

const TaskRow = memo(function TaskRow({
  task,
  depth,
  party,
  groupColor,
  isSelected,
  isKbFocused,
  isFlashing,
  showCostColumn,
  cost,
  isOrphan,
  hasExcessiveLag,
  hasNegativeFloat,
  today,
  onSelect,
  onOpen,
  onOpenLinks,
}: TaskRowProps) {
  const float = floatDays(task, today)
  const columns = showCostColumn ? '1fr 52px 80px 48px 90px' : '1fr 52px 80px 48px'

  let bg = 'var(--color-surface)'
  if (isFlashing) bg = 'var(--color-selected-bg)'
  else if (isSelected) bg = 'var(--color-selected-bg)'

  return (
    <div
      className="task-row"
      data-selected={isSelected}
      data-testid="task-row"
      onClick={onSelect}
      onDoubleClick={onOpen}
      style={{
        height: ROW_HEIGHT,
        display: 'grid',
        gridTemplateColumns: columns,
        alignItems: 'center',
        background: bg,
        borderBottom: isSelected ? 'none' : '1px solid var(--color-border-light)',
        borderLeft: isSelected || isKbFocused ? '2px solid var(--accent)' : '3px solid ' + groupColor,
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
        marginLeft: depth * GROUP_INDENT_PX,
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
          width: WBS_COL_WIDTH,
        }}>
          {task.wbsCode}
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

        {hasExcessiveLag && (
          <span
            aria-hidden="true"
            title="Dependency lag exceeds 50% of predecessor duration"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--health-amber)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        )}

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
        border: hasNegativeFloat ? '1px solid var(--color-danger)' : 'none',
        borderLeftWidth: hasNegativeFloat ? 3 : 0,
        borderRadius: hasNegativeFloat ? 'var(--radius-sm)' : 0,
        minHeight: 20,
        boxSizing: 'border-box',
      }}>
        {float !== null && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-3xs)',
            color: float < 0 ? 'var(--color-danger)' : 'var(--color-text-dim)',
            fontWeight: float < 0 ? 'var(--weight-medium)' : undefined,
            fontVariantNumeric: 'tabular-nums',
            minWidth: 24,
            textAlign: 'right',
            display: 'inline-block',
          }}>
            {formatFloat(float)}
          </span>
        )}
      </div>

      {showCostColumn && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xs)', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cost)}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isOrphan && (
          <button
            onClick={(event) => {
              event.stopPropagation()
              onOpenLinks()
            }}
            title="No predecessors or successors"
            aria-label="Open links for orphan task"
            style={{
              width: 18,
              height: 18,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <Warning size={12} weight="fill" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
})

// ─── TaskList ─────────────────────────────────────────────────────────────────

export function TaskList({
  visibleRows,
  filteredTasks,
  taskCount,
  isComputing = false,
  groups,
  parties,
  selectedTaskId,
  kbFocusId,
  completionFlashId,
  showCostColumn = false,
  taskCosts = new Map<string, number>(),
  groupRollups = new Map<string, GroupRollup>(),
  dependencies,
  today,
  onSelectTask,
  onOpenPanel,
  onOpenLinks,
  onToggleGroup,
  onNewTask,
  listRef,
  onScroll,
}: TaskListProps) {
  const columns = showCostColumn ? '1fr 52px 80px 48px 90px 16px' : '1fr 52px 80px 48px 16px'
  const partyMap = new Map(parties.map(p => [p.id, p]))
  const groupColorMap = new Map(groups.map(g => [g.id, g.color]))
  const groupDepthMap = new Map(
    visibleRows
      .filter((row): row is Extract<VisibleRow, { kind: 'group' }> => row.kind === 'group')
      .map((row) => [row.groupId, row.depth ?? 0] as const),
  )
  const orphanTaskIds = new Set(findOrphanTaskIds(filteredTasks, dependencies))
  const negativeFloatTaskIds = new Set(findNegativeFloatTaskIds(filteredTasks, new Map(
    filteredTasks
      .map((task) => [task.id, floatDays(task, today) ?? 0] as const),
  )))
  const excessiveLagTaskIds = new Set(
    findExcessiveLagDependencies(filteredTasks, dependencies, 0.5).flatMap((pair) => [pair.fromId, pair.toId]),
  )
  // Determine which groups belong to visible tasks (for coloring task rows)
  const taskGroupColor = (task: Task): string =>
    groupColorMap.get(task.group) ?? '#378ADD'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-surface)', position: 'relative' }}>
      {isComputing && <div className="computing-bar" aria-hidden="true" />}
      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        height: GANTT_HEADER_HEIGHT,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'grid',
        gridTemplateColumns: columns,
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
        {showCostColumn && (
          <span style={{ textAlign: 'right', paddingRight: 10, fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cost
          </span>
        )}
        <span />
      </div>

      {/* ── Scrollable row area ── */}
      <div
        ref={listRef}
        onScroll={onScroll}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {visibleRows.length === 0 && taskCount > 0 && (
          <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
            <Funnel size={22} weight="regular" color="var(--color-text-dim)" aria-hidden="true" />
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-tertiary)' }}>
              No results
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>
              No tasks match the current filters.
            </div>
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
                wbs={row.wbsCode ?? ''}
                depth={row.depth ?? 0}
                completionPct={groupRollups.get(row.groupId)?.completionPct ?? 0}
                rollupLabel={`${groupRollups.get(row.groupId)?.taskCount ?? 0} tasks · ${groupRollups.get(row.groupId)?.completionPct ?? 0}% · ${formatCompactCurrency(groupRollups.get(row.groupId)?.totalCost ?? 0)} · ${groupRollups.get(row.groupId)?.resourceCount ?? 0} res`}
                showCostColumn={showCostColumn}
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
              depth={(groupDepthMap.get(task.group) ?? 0) + 1}
              party={party}
              groupColor={taskGroupColor(task)}
              isSelected={task.id === selectedTaskId}
              isKbFocused={task.id === kbFocusId}
              isFlashing={task.id === completionFlashId}
              showCostColumn={showCostColumn}
              cost={taskCosts.get(task.id) ?? 0}
              isOrphan={orphanTaskIds.has(task.id)}
              hasExcessiveLag={excessiveLagTaskIds.has(task.id)}
              hasNegativeFloat={negativeFloatTaskIds.has(task.id)}
              today={today}
              onSelect={() => onSelectTask(task.id)}
              onOpen={() => onOpenPanel(task.id)}
              onOpenLinks={() => onOpenLinks(task.id)}
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
