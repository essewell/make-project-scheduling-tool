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
// L.1: off-white section background, visual panel at 6° tilt

function Hero() {
  return (
    <section className="m-section m-section--hero">
      <div className="m-container">
        <div className="m-hero">
          <div className="m-hero-text">
            <div className="m-rise" data-delay="1">
              <span className="m-eyebrow">Construction scheduling — browser-based, local-first</span>
            </div>
            <h1 className="m-display m-rise" data-delay="2">
              Schedules that hold<br />up under scrutiny.
            </h1>
            <p className="m-lead m-rise" data-delay="3">
              MAKE combines CPM logic, baseline tracking, and A3 print output in one tool.
              No account, no server, no sync. Works on your machine on site.
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
            <div className="m-hero-tilt">
              <GanttMock />
            </div>
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
    { value: 'A3', label: 'Print-ready output, browser native' },
    { value: '4', label: 'Dependency types — FS SS FF SF' },
    { value: '20', label: 'Undo steps, LIFO stack' },
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
// L.2: 12-col poster grid, deliberately uneven cells — not three equal boxes

function Capabilities() {
  return (
    <section className="m-section" id="capabilities">
      <div className="m-container">
        <SectionHead
          eyebrow="01 — Capabilities"
          title="What you get."
          body="Four systems used in day-to-day schedule control."
        />

        <div className="m-cap-grid" style={{ marginTop: 48 }}>
          <Capability
            index="01"
            title="Critical path, auto-computed."
            body="Kahn topological sort plus forward/backward pass and total float. Zero-float tasks highlight automatically when dependency data exists. No manual entry required."
            colSpan="wide"
            figure={<DiagramCPM />}
          />
          <Capability
            index="02"
            title="Baselines and variance."
            body="Capture the live schedule as a baseline before execution begins. Baseline bars persist as ghosts while active bars move — day-slip labels appear on any task that has drifted."
            colSpan="narrow"
            figure={<DiagramBaseline />}
          />
          <Capability
            index="03"
            title="Print at A3, 55% scale."
            body="Scale-locked A3 output from the same model used on screen. Gantt and summary layouts both supported. Bring it to a meeting. Use it in a dispute."
            colSpan="half"
            figure={<DiagramPrint />}
          />
          <Capability
            index="04"
            title="CSV round-trip without loss."
            body="Import from any spreadsheet, edit in app, export back. Date parsing, row validation, append or replace modes, and full undo are all built in."
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

// ─── Interface ────────────────────────────────────────────────────────────────
// L.3: full-bleed navy band, 3 screenshot-crop SVG panels

function InterfaceSection() {
  return (
    <section className="m-section m-section--dark" id="interface">
      <div className="m-container">
        <div className="m-interface-head">
          <div style={{ display: 'grid', gap: 16 }}>
            <span className="m-eyebrow" style={{ color: 'var(--accent)' }}>02 — Interface</span>
            <h2 className="m-h2">The Gantt is the product.</h2>
          </div>
          <p className="m-body" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Five zoom levels from day to year. Dependency arrows route around bars.
            Baseline ghosts and variance labels share the same timeline as live bars.
          </p>
        </div>

        {/* Three crop panels — L.3 */}
        <div className="m-interface-crops">
          <InterfaceCrop
            label="GANTT BARS — STATUS-DRIVEN COLOR"
            figure={<CropBars />}
          />
          <InterfaceCrop
            label="CRITICAL PATH — ZERO-FLOAT HIGHLIGHT"
            figure={<CropCP />}
          />
          <InterfaceCrop
            label="BASELINE GHOST — DAY-SLIP LABEL"
            figure={<CropBaseline />}
          />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', padding: 24, borderRadius: 2, marginTop: 32 }}>
          <GanttMock />
        </div>

        <div className="m-interface-spec">
          <span>HEADER · DAY / WEEK / MONTH / QUARTER / YEAR</span>
          <span>BARS · STATUS-DRIVEN COLOR · PROGRESS FILL</span>
          <span>ARROWS · ELBOW ROUTING · CRITICAL-PATH HIGHLIGHT</span>
          <span>TODAY · MIDNIGHT TICK · LOCAL TIMEZONE</span>
        </div>
      </div>
    </section>
  )
}

function InterfaceCrop({ label, figure }: { label: string; figure: React.ReactNode }) {
  return (
    <div className="m-interface-crop">
      <div className="m-interface-crop-figure">{figure}</div>
      <span className="m-interface-crop-label">{label}</span>
    </div>
  )
}

// ─── Process ──────────────────────────────────────────────────────────────────
// L.4: numbered timeline rail, 5 steps

function Process() {
  const steps: Array<{ num: string; title: string; body: string }> = [
    {
      num: '01',
      title: 'Frame the project.',
      body: 'Set workweek, holidays, phases, and responsible parties. Start blank or load a built-in example with real task data.',
    },
    {
      num: '02',
      title: 'Add tasks and dependencies.',
      body: 'Press N to add a task. Link Builder wires FS / SS / FF / SF edges with optional lag. Status and progress auto-calculate unless you lock them.',
    },
    {
      num: '03',
      title: 'Lock a baseline.',
      body: 'Capture the approved schedule before work starts. Baseline ghosts persist on the chart so slip and recovery stay visible in context.',
    },
    {
      num: '04',
      title: 'Track variance daily.',
      body: 'Log actual start and finish dates as work happens. Midnight recalculation updates status automatically while respecting any manual overrides.',
    },
    {
      num: '05',
      title: 'Export and share.',
      body: 'Print A3 from the browser, export the schedule as CSV, or hand off the file. No proprietary format, no account required on the receiving end.',
    },
  ]

  return (
    <section className="m-section" id="how">
      <div className="m-container">
        <SectionHead eyebrow="03 — How it works" title="A five-step rhythm." />
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
// L.5: navy band with visual on the right

function ClosingCta() {
  return (
    <section className="m-section m-section--dark m-section--cta">
      <div className="m-container">
        <div className="m-closing">
          <div style={{ display: 'grid', gap: 24 }}>
            <span className="m-eyebrow" style={{ color: 'var(--accent)' }}>Try it now</span>
            <h2 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: '#fff' }}>
              Open in a browser.<br />
              No account required.<br />
              Start scheduling.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
              <a href="/" className="m-btn m-btn--accent" style={{ height: 48, padding: '0 22px', fontSize: 14 }}>
                Open the app
                <span className="m-btn-arrow" aria-hidden="true">→</span>
              </a>
              <span className="m-mono" style={{ color: 'rgba(255,255,255,0.44)' }}>
                Data stays in your browser. No server. No sync.
              </span>
            </div>
          </div>
          <div className="m-closing-visual" aria-hidden="true">
            <ClosingDiagram />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
// L.6: 4-column structured layout + version line

function Footer() {
  return (
    <footer className="m-footer">
      <div className="m-container">
        <div className="m-footer-cols">
          <div className="m-footer-col m-footer-col--brand">
            <span className="m-wordmark">MAKE</span>
            <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.5, marginTop: 12, maxWidth: '26ch' }}>
              Gantt scheduling for construction PMs. Browser-based, local-first.
            </p>
          </div>
          <div className="m-footer-col">
            <span className="m-footer-col-head">Product</span>
            <a href="/">Open the app</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#interface">Interface</a>
            <a href="#how">How it works</a>
          </div>
          <div className="m-footer-col">
            <span className="m-footer-col-head">Built with</span>
            <span>Vite + React 18</span>
            <span>TypeScript strict</span>
            <span>Plus Jakarta Sans</span>
            <span>Space Mono</span>
          </div>
          <div className="m-footer-col">
            <span className="m-footer-col-head">Storage</span>
            <span>Local-first</span>
            <span>localStorage</span>
            <span>Key: schedule-tool-v1</span>
            <span>Schema v1</span>
          </div>
        </div>
        <div className="m-footer-rule" />
        <div className="m-footer-bottom">
          <span className="m-footer-meta">v0.1.0 — 2026</span>
          <span className="m-footer-meta">No account · No server · No tracking</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Capability diagrams ──────────────────────────────────────────────────────

function DiagramCPM() {
  return (
    <svg viewBox="0 0 320 92" width="100%" role="img" aria-label="Critical path network diagram">
      <g stroke="#dce3ea" strokeWidth={1.5} fill="none">
        <line x1={32} y1={24} x2={108} y2={66} />
        <line x1={108} y1={66} x2={184} y2={66} />
      </g>
      <g stroke="#27aae1" strokeWidth={2} fill="none">
        <line x1={32} y1={24} x2={108} y2={24} />
        <line x1={108} y1={24} x2={184} y2={24} />
        <line x1={184} y1={24} x2={260} y2={24} />
      </g>
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
  return (
    <svg viewBox="0 0 280 78" width="100%" role="img" aria-label="Baseline ghost bar above current bar">
      <text x={0} y={14} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">BASELINE</text>
      <rect x={60} y={6} width={140} height={10} rx={1} fill="none" stroke="#7894a6" strokeWidth={1} strokeDasharray="3 3" />
      <text x={0} y={42} fontFamily="Space Mono, monospace" fontSize={9} fill="#1c3048">CURRENT</text>
      <rect x={78} y={32} width={156} height={12} rx={2} fill="#E0862A" />
      <g stroke="#bf3b2e" strokeWidth={1.5}>
        <line x1={200} y1={11} x2={234} y2={11} />
        <polygon points="234,11 228,8 228,14" fill="#bf3b2e" stroke="none" />
      </g>
      <text x={0} y={70} fontFamily="Space Mono, monospace" fontSize={9} fill="#bf3b2e">+18 DAYS SLIP</text>
    </svg>
  )
}

function DiagramPrint() {
  return (
    <svg viewBox="0 0 280 84" width="100%" role="img" aria-label="A3 printable layout">
      <rect x={4} y={6} width={170} height={72} fill="#fff" stroke="#dce3ea" strokeWidth={1.5} />
      <rect x={4} y={6} width={170} height={14} fill="#1c3048" />
      <text x={9} y={16} fontFamily="Space Mono, monospace" fontSize={7} fill="#7ca9cc">PROJECT SCHEDULE</text>
      <line x1={4} y1={20} x2={174} y2={20} stroke="#ecf1f5" />
      {[26, 34, 42, 50, 58, 66].map(y => (
        <line key={y} x1={48} y1={y} x2={170} y2={y} stroke="#ecf1f5" />
      ))}
      <rect x={50} y={28} width={48} height={5} rx={1} fill="#378ADD" opacity={0.7} />
      <rect x={68} y={35} width={62} height={5} rx={1} fill="#E0862A" opacity={0.7} />
      <rect x={92} y={42} width={54} height={5} rx={1} fill="#2E8B57" opacity={0.7} />
      <text x={186} y={20} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">A3 LANDSCAPE</text>
      <text x={186} y={36} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">55% SCALE</text>
      <text x={186} y={52} fontFamily="Space Mono, monospace" fontSize={9} fill="#7894a6">PAGINATED</text>
    </svg>
  )
}

function DiagramCsv() {
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

// ─── Interface crop diagrams ──────────────────────────────────────────────────
// L.3: three focused panels for the dark band

function CropBars() {
  const bars = [
    { x: 20, w: 110, color: '#378ADD', pct: 70, label: 'STRUCTURE' },
    { x: 60, w: 80, color: '#E0862A', pct: 40, label: 'MECH / ELEC' },
    { x: 30, w: 130, color: '#1D9E75', pct: 55, label: 'ENVELOPE' },
    { x: 80, w: 60, color: '#D85A30', pct: 20, label: 'FIT-OUT' },
  ]
  return (
    <svg viewBox="0 0 280 96" width="100%" role="img" aria-label="Gantt bars with status colors">
      {bars.map((b, i) => {
        const y = 8 + i * 22
        return (
          <g key={i}>
            <rect x={b.x} y={y} width={b.w} height={14} rx={2} fill={b.color} opacity={0.22} />
            <rect x={b.x} y={y} width={Math.round(b.w * b.pct / 100)} height={14} rx={2} fill={b.color} />
            <text x={b.x + 5} y={y + 10} fontFamily="Space Mono, monospace" fontSize={7} fill="#fff" fontWeight={700}>
              {b.label}
            </text>
            <text x={b.x + b.w + 6} y={y + 10} fontFamily="Space Mono, monospace" fontSize={8} fill="rgba(255,255,255,0.5)">
              {b.pct}%
            </text>
          </g>
        )
      })}
      <line x1={0} y1={0} x2={0} y2={96} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
    </svg>
  )
}

function CropCP() {
  return (
    <svg viewBox="0 0 280 96" width="100%" role="img" aria-label="Critical path arrows between tasks">
      {/* Non-critical bars */}
      <rect x={20} y={10} width={70} height={14} rx={2} fill="#378ADD" opacity={0.35} />
      <rect x={30} y={52} width={60} height={14} rx={2} fill="#1D9E75" opacity={0.35} />
      {/* Critical bars */}
      <rect x={20} y={30} width={90} height={14} rx={2} fill="#378ADD" />
      <rect x={120} y={30} width={80} height={14} rx={2} fill="#378ADD" />
      <rect x={210} y={30} width={50} height={14} rx={2} fill="#378ADD" />
      {/* Critical arrows */}
      <g stroke="#27aae1" strokeWidth={1.5} fill="none">
        <line x1={110} y1={37} x2={120} y2={37} />
        <polygon points="120,37 115,34 115,40" fill="#27aae1" stroke="none" />
        <line x1={200} y1={37} x2={210} y2={37} />
        <polygon points="210,37 205,34 205,40" fill="#27aae1" stroke="none" />
      </g>
      {/* 3px left rail on critical bars */}
      <rect x={20} y={30} width={3} height={14} rx={1} fill="#27aae1" />
      <rect x={120} y={30} width={3} height={14} rx={1} fill="#27aae1" />
      <rect x={210} y={30} width={3} height={14} rx={1} fill="#27aae1" />
      <text x={0} y={88} fontFamily="Space Mono, monospace" fontSize={8} fill="rgba(255,255,255,0.4)">CRITICAL — 0 FLOAT</text>
    </svg>
  )
}

function CropBaseline() {
  return (
    <svg viewBox="0 0 280 96" width="100%" role="img" aria-label="Baseline ghost bar with slip label">
      {/* Baseline ghost */}
      <rect x={20} y={12} width={120} height={8} rx={1} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="3 2" />
      {/* Current bar */}
      <rect x={30} y={28} width={140} height={14} rx={2} fill="#E0862A" />
      {/* Slip arrow */}
      <g stroke="#bf3b2e" strokeWidth={1.5}>
        <line x1={140} y1={16} x2={170} y2={16} />
        <polygon points="170,16 164,13 164,19" fill="#bf3b2e" stroke="none" />
      </g>
      {/* Slip label */}
      <rect x={172} y={8} width={60} height={16} rx={2} fill="rgba(191,59,46,0.2)" />
      <text x={202} y={19} textAnchor="middle" fontFamily="Space Mono, monospace" fontSize={8} fontWeight={700} fill="#bf3b2e">+22d</text>
      <text x={0} y={88} fontFamily="Space Mono, monospace" fontSize={8} fill="rgba(255,255,255,0.4)">BASELINE GHOST · SLIP LABEL</text>
    </svg>
  )
}

// ─── Closing diagram ──────────────────────────────────────────────────────────

function ClosingDiagram() {
  const tasks = [
    { x: 0, w: 160, label: 'DEMOLITION', color: '#27aae1', pct: 100 },
    { x: 40, w: 120, label: 'STRUCTURE', color: '#378ADD', pct: 100 },
    { x: 80, w: 140, label: 'ENVELOPE', color: '#1D9E75', pct: 80 },
    { x: 120, w: 120, label: 'MECH / ELEC', color: '#E0862A', pct: 55 },
    { x: 180, w: 80, label: 'FIT-OUT', color: '#D85A30', pct: 20 },
  ]
  return (
    <svg viewBox="0 0 300 130" width="100%" role="img" aria-label="Schedule Gantt preview">
      {tasks.map((t, i) => {
        const y = 8 + i * 24
        return (
          <g key={i}>
            <rect x={t.x} y={y} width={t.w} height={16} rx={2} fill={t.color} opacity={0.18} />
            <rect x={t.x} y={y} width={Math.round(t.w * t.pct / 100)} height={16} rx={2} fill={t.color} />
            <rect x={t.x} y={y} width={3} height={16} rx={1} fill={t.color === '#27aae1' ? '#27aae1' : 'transparent'} />
          </g>
        )
      })}
      <line x1={190} y1={0} x2={190} y2={130} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="3 3" />
      <text x={193} y={10} fontFamily="Space Mono, monospace" fontSize={8} fill="rgba(255,255,255,0.5)">TODAY</text>
    </svg>
  )
}
