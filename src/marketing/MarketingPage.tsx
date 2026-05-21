import { GanttMock } from './GanttMock'

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MarketingPage() {
  return (
    <div className="m-page">
      <Nav />
      <main>
        <Hero />
        <Capabilities />
        <InterfaceSection />
        <Process />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="m-nav">
      <div className="m-container">
        <div className="m-nav-row">
          <a href="/marketing.html" className="m-wordmark" aria-label="MAKE — home">MAKE</a>
          <nav className="m-nav-list" aria-label="Primary">
            <a href="#capabilities">Capabilities</a>
            <a href="#interface">Interface</a>
            <a href="#how">How it works</a>
          </nav>
          <a href="/" className="m-btn m-btn--primary">
            Open the app
            <span className="m-btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="m-section m-section--hero">
      <div className="m-container">
        <div className="m-hero">
          <div className="m-hero-text">
            <div className="m-rise" data-delay="1">
              <span className="m-eyebrow">Project scheduling — v1.0</span>
            </div>
            <h1 className="m-display m-rise" data-delay="2">
              Schedules that hold<br />up under scrutiny.
            </h1>
            <p className="m-lead m-rise" data-delay="3">
              MAKE is a Gantt-grade scheduling tool for construction project managers,
              schedulers, and field teams. Built for accuracy under real-world variance —
              not for demos.
            </p>
            <div className="m-hero-actions m-rise" data-delay="4">
              <a href="/" className="m-btn m-btn--primary">
                Open the app
                <span className="m-btn-arrow" aria-hidden="true">→</span>
              </a>
              <a href="#capabilities" className="m-btn m-btn--ghost">
                See what it does
              </a>
            </div>
          </div>

          <div className="m-hero-visual m-rise" data-delay="3">
            <GanttMock />
          </div>
        </div>

        <StatStrip />
      </div>
    </section>
  )
}

function StatStrip() {
  const items: Array<{ value: string; label: string }> = [
    { value: '5', label: 'Zoom levels — day to year' },
    { value: 'A3', label: 'Print-ready output' },
    { value: 'CPM', label: 'Critical-path computation' },
    { value: '20', label: 'Step undo stack' },
  ]
  return (
    <div className="m-stat-strip" aria-label="Product specs at a glance">
      {items.map((it, i) => (
        <div key={i} className="m-stat">
          <span className="m-stat-value">{it.value}</span>
          <span className="m-stat-label">{it.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Capabilities ─────────────────────────────────────────────────────────────

function Capabilities() {
  return (
    <section className="m-section" id="capabilities">
      <div className="m-container">
        <SectionHead
          eyebrow="01 — Capabilities"
          title="What you get."
          body="Four systems that decide whether a scheduling tool is a real tool or a slide deck."
        />

        <div className="m-cap-grid" style={{ marginTop: 48 }}>
          <Capability
            index="01"
            title="Critical path, auto-computed."
            body="Kahn topological sort, forward and backward pass, total float. Zero-float tasks light up. Toggleable when dependencies exist; silent when they don't."
            colSpan="wide"
            figure={<DiagramCPM />}
          />
          <Capability
            index="02"
            title="Baselines and variance."
            body="Capture the current schedule as a baseline. The original bars persist as ghosts. Variance reads at a glance — no spreadsheet pivot required."
            colSpan="narrow"
            figure={<DiagramBaseline />}
          />
          <Capability
            index="03"
            title="Print at A3, 55% scale."
            body="Paginated, scale-locked output. Hand it to a superintendent in the field. The print pane mirrors the on-screen schedule down to row heights and tick marks."
            colSpan="half"
            figure={<DiagramPrint />}
          />
          <Capability
            index="04"
            title="CSV round-trip without loss."
            body="Import a schedule from a spreadsheet, edit in MAKE, export back. Dates normalise. Status auto-derives from planned dates unless you lock it manually."
            colSpan="half"
            figure={<DiagramCsv />}
          />
        </div>
      </div>
    </section>
  )
}

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 760 }}>
      <span className="m-eyebrow">{eyebrow}</span>
      <h2 className="m-h2">{title}</h2>
      {body && <p className="m-lead">{body}</p>}
    </div>
  )
}

function Capability({
  index,
  title,
  body,
  colSpan,
  figure,
}: {
  index: string
  title: string
  body: string
  colSpan: 'wide' | 'narrow' | 'half' | 'third'
  figure?: React.ReactNode
}) {
  return (
    <div className={`m-cap m-cap--${colSpan}`}>
      <span className="m-cap-index">{index}</span>
      <h3 className="m-cap-title">{title}</h3>
      <p className="m-cap-body">{body}</p>
      {figure && <div className="m-cap-figure">{figure}</div>}
    </div>
  )
}

// ─── Interface (full-width gantt scene) ───────────────────────────────────────

function InterfaceSection() {
  return (
    <section className="m-section m-section--dark" id="interface">
      <div className="m-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 4fr)', gap: 56, alignItems: 'end', marginBottom: 56 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <span className="m-eyebrow m-eyebrow--accent" style={{ color: 'var(--accent)' }}>02 — Interface</span>
            <h2 className="m-h2">The Gantt is the product.</h2>
          </div>
          <p className="m-body" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Five zoom levels, from a day-by-day view at construction pace down to a year overview.
            Dependency arrows route around tasks. The today line tracks midnight in your local time.
            Print-mirror at A3.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 24, borderRadius: 2 }}>
          <GanttMock />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginTop: 40, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>
          <span>HEADER · DAY / WEEK / MONTH / QUARTER / YEAR</span>
          <span>BARS · STATUS-DRIVEN COLOR · PROGRESS FILL</span>
          <span>ARROWS · ELBOW ROUTING · CRITICAL-PATH HIGHLIGHT</span>
          <span>TODAY · MIDNIGHT TICK · LOCAL TIMEZONE</span>
        </div>
      </div>
    </section>
  )
}

// ─── Process ──────────────────────────────────────────────────────────────────

function Process() {
  const steps: Array<{ num: string; title: string; body: string }> = [
    {
      num: '01',
      title: 'Frame the project.',
      body: 'Set the workweek, define phases, list the parties. The setup wizard lets you load example data or start blank.',
    },
    {
      num: '02',
      title: 'Add tasks and dependencies.',
      body: 'Type N for a new task. The Link Builder accepts SS, FS, FF, SF relationships. Status and progress auto-derive from planned dates unless you override.',
    },
    {
      num: '03',
      title: 'Lock a baseline.',
      body: 'Capture the schedule before kickoff. Ghost bars persist as the bars move, so variance is visible without a separate comparison view.',
    },
    {
      num: '04',
      title: 'Track variance daily.',
      body: 'The midnight ticker re-runs auto-progress when the date changes. Set actual start and actual finish as they happen — manual overrides survive.',
    },
  ]

  return (
    <section className="m-section" id="how">
      <div className="m-container">
        <SectionHead eyebrow="03 — How it works" title="A four-step rhythm." />
        <div className="m-process" style={{ marginTop: 48 }}>
          {steps.map(s => (
            <div key={s.num} className="m-step">
              <div className="m-step-num">{s.num}</div>
              <div className="m-step-title">{s.title}</div>
              <div className="m-step-body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Closing CTA ──────────────────────────────────────────────────────────────

function ClosingCta() {
  return (
    <section className="m-section">
      <div className="m-container">
        <div className="m-closing">
          <div style={{ display: 'grid', gap: 20 }}>
            <span className="m-eyebrow">Try it now</span>
            <h2 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              Open in a browser.<br />
              No install. Local-first.<br />
              Yours.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <a href="/" className="m-btn m-btn--accent" style={{ height: 48, padding: '0 22px', fontSize: 14 }}>
              Open the app
              <span className="m-btn-arrow" aria-hidden="true">→</span>
            </a>
            <span className="m-mono">Schedule data lives in your browser — localStorage, not a server.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="m-footer">
      <div className="m-container">
        <div className="m-footer-row">
          <span className="m-wordmark">MAKE</span>
          <span className="m-footer-meta">
            v1.0  ·  Built with Vite, React 18, TypeScript  ·  No telemetry
          </span>
          <span className="m-footer-meta">2026</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Small inline diagrams for capability cards ───────────────────────────────
// Swiss principle: the diagram is the proof. Each illustrates the concept directly.

function DiagramCPM() {
  // Mini network diagram: 5 nodes, critical path highlighted in cyan
  return (
    <svg viewBox="0 0 320 92" width="100%" role="img" aria-label="Critical path network diagram">
      {/* Non-critical edges */}
      <g stroke="#dce3ea" strokeWidth={1.5} fill="none">
        <line x1={32} y1={24} x2={108} y2={66} />
        <line x1={108} y1={66} x2={184} y2={66} />
      </g>
      {/* Critical edges */}
      <g stroke="#27aae1" strokeWidth={2} fill="none">
        <line x1={32} y1={24} x2={108} y2={24} />
        <line x1={108} y1={24} x2={184} y2={24} />
        <line x1={184} y1={24} x2={260} y2={24} />
      </g>
      {/* Nodes */}
      {[
        { x: 32, y: 24, critical: true },
        { x: 108, y: 24, critical: true },
        { x: 184, y: 24, critical: true },
        { x: 260, y: 24, critical: true },
        { x: 108, y: 66, critical: false },
        { x: 184, y: 66, critical: false },
      ].map((n, i) => (
        <g key={i}>
          <rect x={n.x - 14} y={n.y - 8} width={28} height={16} rx={1} fill={n.critical ? '#27aae1' : '#fff'} stroke={n.critical ? '#27aae1' : '#dce3ea'} strokeWidth={1.5} />
        </g>
      ))}
      <text x={0} y={88} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">CRITICAL PATH — ZERO FLOAT</text>
    </svg>
  )
}

function DiagramBaseline() {
  // Two stacked bars: baseline (ghost) + current
  return (
    <svg viewBox="0 0 280 78" width="100%" role="img" aria-label="Baseline ghost bar above current bar">
      <g>
        <text x={0} y={14} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">BASELINE</text>
        <rect x={60} y={6} width={140} height={10} rx={1} fill="none" stroke="#7894a6" strokeWidth={1} strokeDasharray="3 3" />
      </g>
      <g>
        <text x={0} y={42} fontFamily="Space Mono, monospace" fontSize={9} fill="#1c3048">CURRENT</text>
        <rect x={78} y={32} width={156} height={12} rx={2} fill="#E0862A" />
      </g>
      <g stroke="#bf3b2e" strokeWidth={1.5}>
        <line x1={200} y1={11} x2={234} y2={11} />
        <polygon points="234,11 228,8 228,14" fill="#bf3b2e" stroke="none" />
      </g>
      <text x={0} y={70} fontFamily="Space Mono, monospace" fontSize={9} fill="#bf3b2e">+18 DAYS SLIP</text>
    </svg>
  )
}

function DiagramPrint() {
  // A3 page hint
  return (
    <svg viewBox="0 0 280 84" width="100%" role="img" aria-label="A3 printable layout">
      <rect x={4} y={6} width={170} height={72} fill="#fff" stroke="#dce3ea" strokeWidth={1.5} />
      <line x1={4} y1={20} x2={174} y2={20} stroke="#ecf1f5" />
      {[24, 32, 40, 48, 56, 64].map(y => (
        <line key={y} x1={48} y1={y} x2={170} y2={y} stroke="#ecf1f5" />
      ))}
      <rect x={50} y={28} width={48} height={6} fill="#7C5CBF" opacity={0.6} />
      <rect x={68} y={36} width={62} height={6} fill="#E0862A" opacity={0.6} />
      <rect x={92} y={44} width={54} height={6} fill="#2E8B57" opacity={0.6} />
      <text x={186} y={20} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">A3 LANDSCAPE</text>
      <text x={186} y={36} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">55% SCALE</text>
      <text x={186} y={52} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">PAGINATED</text>
    </svg>
  )
}

function DiagramCsv() {
  // Arrow round-trip
  return (
    <svg viewBox="0 0 280 80" width="100%" role="img" aria-label="CSV round-trip diagram">
      <rect x={4} y={20} width={78} height={40} fill="#fff" stroke="#dce3ea" strokeWidth={1.5} />
      <text x={43} y={45} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize={11} fontWeight={700} fill="#1c3048">.CSV</text>
      <rect x={198} y={20} width={78} height={40} fill="#1c3048" />
      <text x={237} y={45} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize={11} fontWeight={700} fill="#fff">MAKE</text>
      <g stroke="#27aae1" strokeWidth={1.5} fill="none">
        <path d="M82 32 L198 32" />
        <polygon points="198,32 192,29 192,35" fill="#27aae1" stroke="none" />
        <path d="M198 48 L82 48" />
        <polygon points="82,48 88,45 88,51" fill="#27aae1" stroke="none" />
      </g>
      <text x={140} y={28} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">IMPORT</text>
      <text x={140} y={58} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">EXPORT</text>
    </svg>
  )
}
