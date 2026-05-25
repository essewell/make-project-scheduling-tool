import { useRef, useState } from 'react'
import type { Baseline, GhostStyle } from '../../types'
import { ZOOM_LEVELS } from '../../constants'
import { EditableTitle } from './EditableTitle'
import { BaselineMenu } from '../overlays/BaselineMenu'
import {
  ArrowCounterClockwise,
  Bookmarks,
  CalendarBlank,
  Camera,
  Download,
  Minus,
  Path,
  Plus,
  Printer,
  ShieldCheck,
  SquaresFour,
  UploadSimple,
  Users,
  UsersThree,
} from '../../lib/icons'

// ─── Props ────────────────────────────────────────────────────────────────────

interface TopBarProps {
  projectName: string
  onRenameProject: (name: string) => void
  zoomIndex: number
  onZoomIn: () => void
  onZoomOut: () => void
  baselines: Baseline[]
  activeBaselineId: string | null
  ghostStyle: GhostStyle
  onCaptureBaseline: () => void
  onSetActiveBaseline: (id: string | null) => void
  onDeleteBaseline: (id: string) => void
  onCompareBaselines: (id: string) => void
  onSetGhostStyle: (style: GhostStyle) => void
  onOpenWorkweek: () => void
  onOpenGroups: () => void
  onOpenParties: () => void
  onOpenResources: () => void
  onOpenQuality: () => void
  onOpenCsvImport: () => void
  onOpenPrint: () => void
  onExportCsv: () => void
  hasDeps: boolean
  showCriticalPath: boolean
  onToggleCriticalPath: () => void
  onReset: () => void
  onNewTask: () => void
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ICON_BTN: React.CSSProperties = {
  height: 28, padding: '0 10px',
  borderRadius: 'var(--radius)',
  border: '1px solid rgba(255,255,255,0.22)',
  background: 'transparent', color: 'white',
  fontSize: 'var(--text-xs)', cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  display: 'flex', alignItems: 'center', gap: 5,
  whiteSpace: 'nowrap', flexShrink: 0,
  transition: 'background 0.12s',
}

const DIVIDER: React.CSSProperties = {
  width: 1, height: 20,
  background: 'rgba(255,255,255,0.18)',
  flexShrink: 0,
}

const GROUP: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  flexShrink: 0,
}

const WORDMARK_K: React.CSSProperties = {
  display: 'inline-block',
  transform: 'translateY(0.03em)',
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar({
  projectName, onRenameProject,
  zoomIndex, onZoomIn, onZoomOut,
  baselines, activeBaselineId, ghostStyle,
  onCaptureBaseline, onSetActiveBaseline, onDeleteBaseline, onCompareBaselines, onSetGhostStyle,
  onOpenWorkweek, onOpenGroups, onOpenParties, onOpenResources,
  onOpenQuality,
  onOpenCsvImport, onOpenPrint, onExportCsv,
  hasDeps, showCriticalPath, onToggleCriticalPath,
  onReset, onNewTask,
}: TopBarProps) {
  const [baselineMenuOpen, setBaselineMenuOpen] = useState(false)
  const baselineBtnRef = useRef<HTMLButtonElement>(null)

  const zoomLabel = ZOOM_LEVELS[zoomIndex]?.label ?? '—'
  const activeBaseline = baselines.find(b => b.id === activeBaselineId)

  return (
    <div style={{
      background: 'var(--brand)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', height: '100%',
      color: 'white', gap: 20,
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.22em', flexShrink: 0, marginRight: 2 }}>
        MA<span style={WORDMARK_K}>K</span>E
      </div>

      <div style={DIVIDER} />

      {/* Editable project title */}
      <EditableTitle value={projectName} onChange={onRenameProject} />

      {/* Flex spacer */}
      <div style={{ flex: 1 }} />

      {/* Utility groups */}
      <div style={GROUP}>
        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <button
          onClick={onZoomOut}
          style={{ ...ICON_BTN, padding: '0 7px', fontSize: 14 }}
          title="Zoom out"
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
        ><Minus size={13} weight="regular" aria-hidden="true" /></button>
        <span style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', padding: '0 4px', minWidth: 44, textAlign: 'center' }}>
          {zoomLabel}
        </span>
        <button
          onClick={onZoomIn}
          style={{ ...ICON_BTN, padding: '0 7px', fontSize: 14 }}
          title="Zoom in"
          disabled={zoomIndex <= 0}
        ><Plus size={13} weight="regular" aria-hidden="true" /></button>
        </div>

        {/* Baseline controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button
          ref={baselineBtnRef}
          onClick={() => setBaselineMenuOpen(v => !v)}
          style={{
            ...ICON_BTN,
            background: activeBaseline ? 'rgba(255,255,255,0.14)' : 'transparent',
          }}
          title="Baselines"
        >
          <Bookmarks size={14} weight="regular" aria-hidden="true" />
          Baselines{activeBaseline ? ` · ${activeBaseline.name}` : ''}
        </button>
        <button
          onClick={onCaptureBaseline}
          style={{ ...ICON_BTN, padding: '0 8px' }}
          title="Capture current schedule as a baseline"
        >
          <Camera size={14} weight="regular" aria-hidden="true" />
          Capture
        </button>
        </div>

        {/* Settings buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={onOpenWorkweek} style={ICON_BTN}><CalendarBlank size={14} weight="regular" aria-hidden="true" />Calendar</button>
          <button onClick={onOpenGroups} style={ICON_BTN}><SquaresFour size={14} weight="regular" aria-hidden="true" />Phases</button>
          <button onClick={onOpenParties} style={ICON_BTN}><UsersThree size={14} weight="regular" aria-hidden="true" />Parties</button>
          <button onClick={onOpenResources} style={ICON_BTN}><Users size={14} weight="regular" aria-hidden="true" />Resources</button>
          <button onClick={onOpenQuality} style={ICON_BTN}><ShieldCheck size={14} weight="regular" aria-hidden="true" />Quality</button>
        </div>

        {/* Data buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={onOpenCsvImport} style={ICON_BTN}><UploadSimple size={14} weight="regular" aria-hidden="true" />Import</button>
          <button onClick={onExportCsv} style={ICON_BTN}><Download size={14} weight="regular" aria-hidden="true" />Export</button>
          <button onClick={onOpenPrint} style={{ ...ICON_BTN, color: 'var(--brand-on-brand)' }}>
            <Printer size={14} weight="regular" aria-hidden="true" />
            Print
          </button>
        </div>

        {/* Critical path toggle — only when deps exist */}
        {hasDeps && (
          <button
            onClick={onToggleCriticalPath}
            title="Toggle critical path"
            style={{
              ...ICON_BTN,
              background: showCriticalPath ? 'rgba(226,75,74,0.22)' : 'transparent',
              borderColor: showCriticalPath ? 'rgba(226,75,74,0.6)' : 'rgba(255,255,255,0.22)',
              color: showCriticalPath ? 'var(--data-negative)' : 'rgba(255,255,255,0.7)',
            }}
          >
            <Path size={14} weight="regular" aria-hidden="true" />
            CP
          </button>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset project"
          style={{ ...ICON_BTN, color: 'rgba(255,255,255,0.5)' }}
        >
          <ArrowCounterClockwise size={14} weight="regular" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div style={DIVIDER} />

      {/* New task */}
      <NewTaskButton onClick={onNewTask} />

      {/* Baseline menu popover */}
      {baselineMenuOpen && (
        <BaselineMenu
          baselines={baselines}
          activeBaselineId={activeBaselineId}
          ghostStyle={ghostStyle}
          anchorRef={baselineBtnRef}
          onSetActive={id => { onSetActiveBaseline(id); setBaselineMenuOpen(false) }}
          onDelete={id => { onDeleteBaseline(id) }}
          onCompare={id => { onCompareBaselines(id); setBaselineMenuOpen(false) }}
          onSetGhostStyle={onSetGhostStyle}
          onClose={() => setBaselineMenuOpen(false)}
        />
      )}
    </div>
  )
}

// ─── NewTaskButton ────────────────────────────────────────────────────────────

function NewTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="New task (N)"
      style={{
        height: 28, padding: '0 11px',
        borderRadius: 'var(--radius)',
        border: 'none',
        background: 'var(--accent)',
        color: 'var(--brand)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.36)',
      }}
    >
      <Plus size={14} weight="regular" aria-hidden="true" />
      New Task
      <span style={{
        background: 'rgba(28,48,72,0.18)',
        border: '1px solid rgba(28,48,72,0.32)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        padding: '0 4px',
        lineHeight: '16px',
      }}>N</span>
    </button>
  )
}
