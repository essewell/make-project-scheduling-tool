/**
 * Static SVG mock of the Gantt at a typical zoom level.
 * Mirrors the actual product's visual language: mono numerals, group color rails,
 * today line, dependency arrow, milestone diamond, progress fill.
 * No external state. No animation. A poster, not a screenshot.
 */
export function GanttMock() {
  // ── Geometry ──────────────────────────────────────────────────────────────
  const W = 720
  const H = 380
  const TASK_COL = 196
  const HEADER_H = 44
  const ROW_H = 32

  // Time grid: 3 months × 4 weeks = 12 columns
  const cols = 12
  const colW = (W - TASK_COL) / cols
  const todayX = TASK_COL + colW * 5.6

  // Helpers
  const x = (col: number) => TASK_COL + col * colW
  const rowY = (i: number) => HEADER_H + i * ROW_H

  // ── Data (mirrors EXAMPLE_TASKS shape but simplified) ─────────────────────
  const groupSite = '#7C5CBF'
  const groupFound = '#E0862A'
  const groupFrame = '#2E8B57'
  const groupMep = '#27aae1'

  const rows = [
    { kind: 'group' as const, label: '1  Site Preparation', color: groupSite },
    { kind: 'task' as const, label: '1.1  Demolition', color: groupSite, start: 0, end: 2, pct: 100 },
    { kind: 'task' as const, label: '1.2  Earthworks', color: groupSite, start: 2, end: 5, pct: 72 },
    { kind: 'group' as const, label: '2  Foundation', color: groupFound },
    { kind: 'task' as const, label: '2.1  Footings', color: groupFound, start: 4.8, end: 6.4, pct: 0 },
    { kind: 'task' as const, label: '2.2  Foundation walls', color: groupFound, start: 6.4, end: 8.6, pct: 0 },
    { kind: 'milestone' as const, label: '2.3  Foundation complete', color: groupFound, at: 8.6 },
    { kind: 'task' as const, label: '3.1  Floor & framing', color: groupFrame, start: 8.8, end: 11.2, pct: 0 },
    { kind: 'task' as const, label: '4.1  Rough plumbing', color: groupMep, start: 9.2, end: 11.6, pct: 0 },
  ]

  return (
    <svg
      role="img"
      aria-label="Sample Gantt chart with task list, headers, bars, milestone, today line, and a dependency arrow"
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', background: '#fff', borderRadius: 2, boxShadow: '0 1px 0 rgba(15,28,50,0.06), 0 24px 56px -24px rgba(15,28,50,0.18)' }}
    >
      {/* ─── Task list column background ─── */}
      <rect x={0} y={0} width={TASK_COL} height={H} fill="#fbfcfd" />
      <line x1={TASK_COL} y1={0} x2={TASK_COL} y2={H} stroke="#dce3ea" strokeWidth={1} />

      {/* ─── Header band ─── */}
      <rect x={0} y={0} width={W} height={HEADER_H} fill="#fff" />
      <line x1={0} y1={HEADER_H} x2={W} y2={HEADER_H} stroke="#dce3ea" strokeWidth={1} />

      {/* Primary tier — months */}
      <g fontFamily="Plus Jakarta Sans, sans-serif" fontSize={11} fontWeight={600} letterSpacing={0.4} fill="#466070">
        <text x={TASK_COL + 8} y={18}>JUN 2025</text>
        <text x={x(4) + 8} y={18}>JUL 2025</text>
        <text x={x(8) + 8} y={18}>AUG 2025</text>
      </g>
      <line x1={x(4)} y1={4} x2={x(4)} y2={HEADER_H - 1} stroke="#ecf1f5" strokeWidth={1} />
      <line x1={x(8)} y1={4} x2={x(8)} y2={HEADER_H - 1} stroke="#ecf1f5" strokeWidth={1} />

      {/* Secondary tier — weeks */}
      <line x1={TASK_COL} y1={HEADER_H / 2 + 2} x2={W} y2={HEADER_H / 2 + 2} stroke="#ecf1f5" strokeWidth={1} />
      <g fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">
        {Array.from({ length: cols }, (_, i) => (
          <g key={i}>
            <line x1={x(i)} y1={HEADER_H / 2 + 2} x2={x(i)} y2={HEADER_H} stroke="#ecf1f5" strokeWidth={1} />
            <text x={x(i) + 6} y={HEADER_H - 6}>W{23 + i}</text>
          </g>
        ))}
      </g>

      {/* ─── Vertical week grid in body ─── */}
      <g stroke="#f1f4f7" strokeWidth={1}>
        {Array.from({ length: cols }, (_, i) => (
          <line key={i} x1={x(i)} y1={HEADER_H} x2={x(i)} y2={H} />
        ))}
      </g>

      {/* ─── Rows ─── */}
      {rows.map((row, i) => {
        const y = rowY(i)
        const isGroup = row.kind === 'group'

        return (
          <g key={i}>
            {/* Row band */}
            <rect
              x={0}
              y={y}
              width={W}
              height={ROW_H}
              fill={isGroup ? '#f5f8fb' : i % 2 === 0 ? '#fdfefe' : '#fff'}
            />
            <line x1={0} y1={y + ROW_H} x2={W} y2={y + ROW_H} stroke="#ecf1f5" strokeWidth={1} />

            {/* Group color left rail */}
            <rect x={0} y={y} width={3} height={ROW_H} fill={row.color} />

            {/* Task label */}
            <text
              x={14}
              y={y + ROW_H / 2 + 4}
              fontFamily="Plus Jakarta Sans, sans-serif"
              fontSize={11}
              fontWeight={isGroup ? 600 : 400}
              fill={isGroup ? '#1c3048' : '#1c3048'}
            >
              {row.label}
            </text>

            {/* Bar / milestone */}
            {row.kind === 'task' && (
              <g>
                {/* Bar background (planned) */}
                <rect
                  x={x(row.start)}
                  y={y + 8}
                  width={(row.end - row.start) * colW}
                  height={16}
                  rx={2}
                  fill={row.color}
                  opacity={0.18}
                />
                {/* Bar progress */}
                {row.pct > 0 && (
                  <rect
                    x={x(row.start)}
                    y={y + 8}
                    width={(row.end - row.start) * colW * (row.pct / 100)}
                    height={16}
                    rx={2}
                    fill={row.color}
                  />
                )}
                {/* Bar outline */}
                <rect
                  x={x(row.start)}
                  y={y + 8}
                  width={(row.end - row.start) * colW}
                  height={16}
                  rx={2}
                  fill="none"
                  stroke={row.color}
                  strokeWidth={1}
                  opacity={0.45}
                />
                {/* % label on the in-progress bar */}
                {row.pct > 0 && row.pct < 100 && (
                  <text
                    x={x(row.start) + (row.end - row.start) * colW + 6}
                    y={y + 20}
                    fontFamily="Space Mono, monospace"
                    fontSize={9}
                    fill="#466070"
                  >
                    {row.pct}%
                  </text>
                )}
              </g>
            )}

            {row.kind === 'milestone' && (
              <g transform={`translate(${x(row.at)}, ${y + ROW_H / 2})`}>
                <rect x={-6} y={-6} width={12} height={12} fill={row.color} transform="rotate(45)" />
              </g>
            )}
          </g>
        )
      })}

      {/* ─── Dependency arrow: 1.2 Earthworks → 2.1 Footings ─── */}
      {(() => {
        const from = rows[2]
        const to = rows[4]
        if (!from || !to || from.kind !== 'task' || to.kind !== 'task') return null
        const fromX = x(from.end)
        const fromY = rowY(2) + ROW_H / 2
        const toX = x(to.start)
        const toY = rowY(4) + ROW_H / 2
        const midX = (fromX + toX) / 2
        return (
          <g stroke="#7894a6" strokeWidth={1} fill="none">
            <path d={`M${fromX} ${fromY} L${midX} ${fromY} L${midX} ${toY} L${toX - 5} ${toY}`} />
            <polygon points={`${toX},${toY} ${toX - 6},${toY - 3} ${toX - 6},${toY + 3}`} fill="#7894a6" stroke="none" />
          </g>
        )
      })()}

      {/* ─── Today line ─── */}
      <line
        x1={todayX}
        y1={HEADER_H - 2}
        x2={todayX}
        y2={H}
        stroke="#27aae1"
        strokeWidth={1.5}
      />
      <rect x={todayX - 18} y={HEADER_H - 16} width={36} height={14} fill="#27aae1" rx={1} />
      <text
        x={todayX}
        y={HEADER_H - 6}
        textAnchor="middle"
        fontFamily="Space Mono, monospace"
        fontSize={9}
        fontWeight={700}
        fill="#fff"
      >
        TODAY
      </text>
    </svg>
  )
}
