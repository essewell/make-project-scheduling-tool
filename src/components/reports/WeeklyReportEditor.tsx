import type { WeeklyReportData } from '../../types'

interface WeeklyNarrativeState {
  highlights: string
  concerns: string
  lookAhead: string
}

interface WeeklyReportEditorProps {
  report: WeeklyReportData
  narrative: WeeklyNarrativeState
  onChange: (next: WeeklyNarrativeState) => void
  onExportPdf: () => void
}

export function WeeklyReportEditor({ report, narrative, onChange, onExportPdf }: WeeklyReportEditorProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
          Weekly Progress Report
        </div>
        <button
          onClick={onExportPdf}
          style={{
            height: 28,
            padding: '0 10px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-xs)',
            cursor: 'pointer',
          }}
        >
          Export PDF
        </button>
      </div>

      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>
        Narrative is not saved — export before closing.
      </div>

      <div className="report-print-page weekly-report-page" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 'var(--space-3)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <List title="Completed this week" items={report.completedTaskIds} />
            <List title="Planned next week" items={report.plannedTaskIds} />
            <List title="Variance watchlist" items={report.varianceTaskIds} />
            <List title="Change orders this week" items={report.recentChangeOrderIds} />
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <Field
              label="Highlights"
              value={narrative.highlights}
              onChange={(value) => onChange({ ...narrative, highlights: value })}
            />
            <Field
              label="Concerns"
              value={narrative.concerns}
              onChange={(value) => onChange({ ...narrative, concerns: value })}
            />
            <Field
              label="Look-ahead notes"
              value={narrative.lookAhead}
              onChange={(value) => onChange({ ...narrative, lookAhead: value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)' }}>No items.</div>
      ) : (
        items.map((item) => (
          <div key={item} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
            {item}
          </div>
        ))
      )}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)' }}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        style={{
          resize: 'vertical',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text-primary)',
          background: 'var(--color-surface)',
        }}
      />
    </label>
  )
}
