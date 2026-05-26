import type { ExecutiveReportData, SCurveSeries } from '../../types'
import type { ReactNode } from 'react'
import { SCurveChart } from './charts/SCurveChart'

interface ExecutiveReportPreviewProps {
  report: ExecutiveReportData
  scurve: SCurveSeries
  hasBaseline: boolean
  hasCostData: boolean
  onExportPdf: () => void
}

export function ExecutiveReportPreview({ report, scurve, hasBaseline, hasCostData, onExportPdf }: ExecutiveReportPreviewProps) {
  if (!hasBaseline && !hasCostData) {
    return (
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
        Capture a baseline and assign costed resources to generate the executive summary report.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
          Executive Summary
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

      <div className="report-print-page" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 'var(--space-3)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Section title="Health score">{report.healthScore}/100</Section>
          <Section title="S-curve">
            <SCurveChart series={scurve} size="thumbnail" statusDate={report.statusDate} />
          </Section>
          <Section title="Top 3 variances">
            {report.topVariances.length === 0 ? 'No slipped tasks.' : report.topVariances.map((item) => (
              <div key={item.taskId} style={{ fontSize: 'var(--text-2xs)' }}>
                {item.name}: {item.baselineFinish} → {item.currentFinish} ({item.slipDays >= 0 ? '+' : ''}{item.slipDays}d)
              </div>
            ))}
          </Section>
          <Section title="Top 3 risks">
            {report.topRisks.length === 0 ? 'No failed quality checks.' : report.topRisks.map((risk) => (
              <div key={risk.checkId} style={{ fontSize: 'var(--text-2xs)' }}>
                {risk.name} (severity {risk.severity.toFixed(1)})
              </div>
            ))}
          </Section>
          <Section title="Next 5 milestones">
            {report.nextMilestones.length === 0 ? 'No upcoming milestones.' : report.nextMilestones.map((milestone) => (
              <div key={milestone.taskId} style={{ fontSize: 'var(--text-2xs)' }}>
                {milestone.name} · {milestone.finish}
              </div>
            ))}
          </Section>
          <Section title="SPI">{report.spi === null ? 'N/A' : report.spi.toFixed(2)}</Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{children}</div>
    </div>
  )
}
