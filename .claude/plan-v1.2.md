# MAKE Scheduling Tool — Plan v1.2

**Status:** Draft · Visual refinement pass (post-v1.1)
**Created:** 2026-05-21
**Author:** Claude — composed through the `taste-skill` router (Swiss System + Dashboards) per `/spartan:plan` and `.claude/CLAUDE.md`
**Predecessors:** [plan-v0.md](./plan-v0.md), [plan-v1.0.md](./plan-v1.0.md), [plan-v1.1.md](./plan-v1.1.md), [taste-audit-swiss.md](./taste-audit-swiss.md)

---

## 0. One-line premise

v1.0 made it work. v1.1 makes it reliable. **v1.2 makes it look like a piece of professional construction project management software a human designer worked on for months — not something an AI made in an afternoon.**

---

## 1. Purpose & relationship to prior plans

| Plan | Scope | Outcome |
|------|-------|---------|
| v0 | Implementation — turn HTML prototype into React | Shipped |
| v1.0 | Track C UX refinement (7 tasks) | Shipped |
| v1.1 | Production-readiness — perf, tests, mobile, CI, marketing finalization | Active |
| **v1.2** | **Visual identity, materiality, brand discipline, de-AI'd surface** | **This plan** |

v1.2 assumes v1.1 has landed. It introduces **no new product surface area, no new data model, no new persisted fields**. Every task either elevates an existing surface, codifies a brand decision, or removes a generic AI tell. The codebase already has good bones (Plus Jakarta Sans + Space Mono, 8px grid, mono numerals, restrained palette). v1.2 turns those bones into a recognizable industry-grade instrument.

**The audience for v1.2 is the buyer's eye, not the user's hands.** Procurement at a hospital authority. A construction-firm partner who has used Procore for ten years. A regional GC's IT lead. They scan a UI in five seconds and decide whether it looks like "real software" or "a side project." v1.2 closes that perception gap.

---

## 2. The De-Vibecoded Principle (THE GUIDING DIRECTIVE)

> "Vibecoded" = the surface betrays its origin as an LLM/Cursor/v0/Lovable output before you've touched a single button.

Every v1.2 decision will be tested against this principle. If a choice signals "AI made this," it loses. The seven tells, ranked by how immediately they read as AI:

### The seven AI tells we are eliminating

| # | Tell | Where it currently lives | Fix |
|---|------|-------------------------|-----|
| 1 | **Purple-blue/violet gradient anywhere** | Not currently a problem — cyan is legitimate brand. Stay vigilant during marketing visuals. | Hard-ban purple/violet/indigo accents. Cyan stays as the single signal color. |
| 2 | **Emoji decoration as iconography** | TopBar uses ⊕ ◎ ↺; SidePanel close uses ×; CsvImportDialog uses 📄 | Replace every emoji with Phosphor icons at consistent weight (1.5px regular). |
| 3 | **`rounded-2xl` softness everywhere** | Modal `--radius-lg: 10px` is borderline; some inputs at `--radius: 5px` | Tighten the radius system: `--radius-sm: 2px`, `--radius: 4px`, `--radius-lg: 6px`, `--radius-xl: 10px`. Construction software is not soft. |
| 4 | **Hero "three equal feature cards"** | Marketing capabilities section risks this | Capabilities becomes a poster-grid (12-col, deliberately uneven cells, image+caption pairings), not three boxes. |
| 5 | **Centered hero / centered everything** | SetupWizard is centered-card-on-color-field — the most AI-template gesture in the app | Redesign: split composition, asymmetric weight (see §12). |
| 6 | **Generic CTA copy** ("Get Started", "Learn More") | Mostly OK ("Start blank", "Load example", "+ New Task"); marketing "See what it does" is fine | Audit pass: every CTA names the outcome. |
| 7 | **AI SaaS copy energy** ("Transform your business", "Streamline workflows") | Marketing currently restrained but unverified | Copy review: every claim is specific and quantifiable. No "unlock potential" language. |

### The seven de-vibecoded moves we're making

These are positive signals — things real designers do that AI rarely does without being asked.

1. **Asymmetric weight in every layout.** Centered-on-color = AI. Off-center, content-pushed-left, breathing room on the right = designed.
2. **Real photography in marketing.** Not abstract gradients. Not "particles." Real construction site photography — hospitals mid-build, community-centre exteriors — with intentional crop and a navy-tinted overlay at low opacity to bind it to brand.
3. **Specific numbers in copy.** Not "fast." Not "scales." "Renders 500 tasks at 60fps on a 2019 MacBook." "Prints A3 at 100% color fidelity."
4. **Surface ladder, not flat panels.** Currently most surfaces are `--color-surface` (white) on `--color-bg` (off-white). Add a third tier `--surface-sunken` for tracks, wells, and recessed slabs. Three tones, not two.
5. **Micro-rules and hairlines.** Use 1px rules with `--color-border-light` to suggest grouping instead of always reaching for a card. Swiss does its work with lines.
6. **Tabular numerals everywhere they belong.** Already mostly done. Sweep for misses (status badge percentage, baseline date stamps, variance pills).
7. **Wordmark detailing.** "MAKE" with 0.3em tracking currently. Refine to a tiny custom touch: the "A" gets a 1px counter notch, or the "K" arms align mathematically with the type baseline. One small typographic move that no AI would make autonomously.

### The pre-flight test

Before shipping any visual change in v1.2, ask:
- "Would another product look identical if I swapped the wordmark?" — if yes, fail.
- "Does this gesture appear in three or more shadcn templates?" — if yes, fail.
- "Does it have a job, or is it decorative?" — if decorative, fail.
- "Would I notice it missing?" — if no, fail.

---

## 3. Style thesis: Swiss-disciplined operator dashboard

Per the `taste-skill` router, this product routes to **Swiss System** (typographic discipline, grid logic, institutional restraint) with **Dashboards** as the secondary lens (operator-first density, status-as-meaning, work-surface clarity).

The fusion produces what we'll call the **"instrument"** aesthetic: a precision tool that signals seriousness through restraint, not decoration. Adjacent references:

| Reference | What we steal | What we don't |
|-----------|---------------|---------------|
| **Linear** | Surface ladder, mono numerals, restrained motion, keyboard-first | Their purple. Cyan stays. |
| **Bloomberg Terminal** | Information density, status semantics, calm under heavy data | Their black-on-amber. We're light-first navy/cyan. |
| **Vercel Dashboard** | Swiss typography, hairline rules, no card spam | Their grayscale-only. We have one signal color. |
| **Procore (the bar we beat)** | Domain familiarity for construction users | Their toolbar bloat, their dated chrome, their dropdown nesting |
| **Massimo Vignelli's NYC subway map** | Diagrammatic confidence — the Gantt is our subway map | The literal red-yellow-blue. We have one accent. |
| **Pentagram brand systems** | Confidence in restraint; one good idea over ten weak ones | Anything that doesn't have a job |

### Design dials (per `taste-skill` baseline)

| Surface | DESIGN_VARIANCE | MOTION_INTENSITY | VISUAL_DENSITY | Why |
|---------|-----------------|------------------|----------------|-----|
| **App (operator surface)** | 3 | 2 | 7 | Predictable, near-static, dense — operator cockpit |
| **Marketing landing** | 4 | 3 | 5 | Slight compositional offset, restrained reveals, daily-app density |
| **Print preview (A3 output)** | 2 | 1 | 8 | Strictest grid, no motion, full info — it IS a deliverable artifact |
| **SetupWizard (opening page)** | 5 | 3 | 4 | The one place where compositional ambition is welcome — see §12 |

---

## 4. Brand voice & positioning

**Who they serve:** Construction project managers, schedulers, and field teams at firms that build community centres, hospitals, public facilities, and other institutional-scale projects.

**Why this matters for the visual system:**
- The buyer is institutional. Public sector, municipal procurement, healthcare authorities. They distrust trendy.
- The schedules built here will be presented to owners, lawyers, and inspectors. The output (printed A3, exported PDF) must look like an engineering deliverable, not a marketing brochure.
- The user is a tradesperson who has been on jobsites for 20 years. They respect tools that look like tools.

**Voice (existing copy already gets this right):**
- "Schedules that hold up under scrutiny." — keep this as the marketing thesis
- "Built for accuracy under real-world variance — not for demos." — keep this attitude
- No exclamation points anywhere in the UI or marketing.
- No verbs like "unlock", "elevate", "supercharge", "transform".
- No fake testimonials with stock-photo people.
- When showing numbers, show real numbers ("renders 500 tasks at 60fps", "A3 at 55% scale preview") — not "blazingly fast" or "industry-leading."

**Visual restraint thresholds:**
- One signal color (cyan `#27aae1`). Already enforced.
- One brand color (navy `#1c3048`). Already enforced.
- One destructive color (red `#bf3b2e`). Already enforced.
- One success color (green `#1D9E75`). Already enforced.
- One warning color (amber `#EF9F27`). Already enforced.
- **Zero ambient gradients, zero blob backgrounds, zero glow effects.** Hardcoded ban.

---

## 5. Color system v2 — token upgrade

The current token set in [`src/styles/tokens.css`](../src/styles/tokens.css) is solid but missing a few roles that v1.2 needs. Additions:

### New role tokens (add to `:root` and dark mode)

```css
/* Surface ladder (deeper than v1.0 — three tones, not two) */
--surface-sunken:    #e6ecf3;   /* recessed wells, tracks, progress backgrounds */
--surface-raised:    #ffffff;   /* alias of --color-surface; explicit when elevation matters */
--surface-overlay:   #ffffff;   /* modal/popover bodies — slight tone shift in dark mode */

/* Brand tints (for navy-on-navy work in the TopBar and Wizard) */
--brand-tint-1:      #243a55;   /* 8% lighter than brand */
--brand-tint-2:      #2c4663;   /* 16% lighter — divider lines on brand surfaces */
--brand-on-brand:    rgba(255, 255, 255, 0.85);  /* on-brand body text */
--brand-on-brand-dim: rgba(255, 255, 255, 0.55); /* on-brand secondary text */

/* Accent variations */
--accent-on-brand:   #4cc1ef;   /* slightly brighter cyan for use on navy */
--accent-pressed:    #1781b3;   /* press state — darker than --accent-hover */

/* Data semantics (separate from status-text colors — these are for fills, rails, glyphs) */
--data-positive:     #1D9E75;   /* alias of --color-success — explicit semantic */
--data-negative:     #bf3b2e;   /* alias of --color-danger */
--data-caution:      #EF9F27;   /* alias of --color-warning */
--data-neutral:      #7894a6;   /* alias of --color-text-tertiary — for "no signal" */
--data-info:         #27aae1;   /* alias of --accent */

/* Ink (text on light surfaces — explicit ladder) */
--ink-strong:        #0f1c2e;   /* 2 steps darker than --color-text-primary — only for display headlines */
--ink-primary:       #1c3048;   /* alias of --color-text-primary */
--ink-secondary:     #466070;   /* alias of --color-text-secondary */
--ink-tertiary:      #7894a6;   /* alias of --color-text-tertiary */
--ink-quiet:         #a6bcca;   /* alias of --color-text-dim — for whisper text only */

/* Rules vs borders (subtle but meaningful distinction) */
--rule:              #dce3ea;   /* alias of --color-border — for structural rules */
--rule-soft:         #ecf1f5;   /* alias of --color-border-light — for grouping hairlines */
--rule-strong:       #b5c4d0;   /* new — section dividers in marketing, table heavy rules */

/* Phase rail (the 5 example phases — codify as tokens to enable theming) */
--phase-1:           #7C5CBF;   /* Site Preparation — violet/lavender */
--phase-2:           #E0862A;   /* Foundation — burnt orange */
--phase-3:           #2E8B57;   /* Framing — sea green */
--phase-4:           #27aae1;   /* MEP — cyan (intentionally aligns with brand) */
--phase-5:           #BF3B2E;   /* Finishes — terracotta red */

/* Focus ring — explicit, separate from accent for future theming */
--ring:              #27aae1;
--ring-offset:       2px;
```

### Radius scale tightening

Currently: `--radius-sm: 3px`, `--radius: 5px`, `--radius-lg: 10px`, `--radius-xl: 14px`.

v1.2 tightens these because construction-PM is not soft:

```css
--radius-sm: 2px;   /* badges, small chips, micro-pills */
--radius:    4px;   /* inputs, buttons, cards, default UI */
--radius-lg: 6px;   /* modal headers, panel containers */
--radius-xl: 8px;   /* setup wizard card, large hero plates */
```

Gantt bars stay at `5px` — they're a special case (the only place where 5px rhymes with the historical 5px brand).

### Dark mode parity

Every new light token gets a dark equivalent. Dark mode should still feel **institutional**, not **gamer**:
- No flat black — use `#0e1c2c` to `#192a3c` ladder.
- Cyan stays as cyan — do not boost saturation in dark mode.
- Status colors get a mild lift (~10% brightness) to maintain contrast.

---

## 6. Typography — role-based scale

Plus Jakarta Sans + Space Mono is the right pairing. v1.2 codifies **roles** instead of just sizes. Every text element claims a role.

| Role | Family | Size | Weight | Tracking | Use |
|------|--------|------|--------|----------|-----|
| **Display** | Jakarta | clamp(28px, 4vw, 56px) | 700 | -0.02em | Marketing hero ONLY |
| **Headline** | Jakarta | 19px (`--text-lg`) | 600 | -0.01em | Modal titles, wizard hero, section openers |
| **Title** | Jakarta | 16px (`--text-md`) | 600 | 0 | Side panel section headers, card titles |
| **Body-strong** | Jakarta | 14px (`--text-base`) | 500 | 0 | Task names, primary inputs |
| **Body** | Jakarta | 14px (`--text-base`) | 400 | 0 | Default running text |
| **Caption** | Jakarta | 13px (`--text-sm`) | 400 | 0 | Helper text under inputs |
| **Eyebrow** | Jakarta | 11px (`--text-2xs`) | 600 | 0.06em | Section identifiers (UPPERCASE) |
| **Annotation** | Jakarta | 10px (`--text-3xs`) | 500 | 0.02em | WBS slugs, micro-labels, footnotes |
| **Data** | Space Mono | 13–14px | 400 | 0 | Numbers, dates, IDs, code paths |
| **Data-emphasis** | Space Mono | 14px | 700 | 0 | KPIs, hero metrics in marketing |

**Rules:**
- Tabular numerals (`font-variant-numeric: tabular-nums`) wherever numbers can change — already partially done via `.nums` utility; sweep for misses.
- Headlines never exceed 3 lines on desktop. If a translation does, rewrite the headline.
- Body line-length capped at 70ch.
- Mono is reserved for data. Don't sprinkle it for "tech" flavor.

---

## 7. Iconography — Phosphor unification

**Current:** Mix of unicode glyphs (`⊕ ◎ ↺ × − +`), emoji (`📄`), and ASCII (`←`). All inconsistent in stroke weight and metaphor.

**v1.2:** Single icon family — **Phosphor Icons** at `regular` weight (1.5px stroke).

Why Phosphor:
- Six weights available — perfect for stress-testing density mode (regular for normal, bold for emphasis, light for marketing display).
- Geometric, slightly engineered — pairs well with Swiss type.
- Tree-shakeable React package (`@phosphor-icons/react`) — bundle impact ~2KB per icon used.
- License: MIT.

### Icon swap table

| Location | Current | Phosphor (regular weight) |
|----------|---------|---------------------------|
| TopBar — Capture baseline | `⊕` | `Camera` |
| TopBar — Baselines menu trigger | `◎` | `Bookmarks` |
| TopBar — Reset | `↺` | `ArrowCounterClockwise` |
| TopBar — Calendar | (text) | `CalendarBlank` |
| TopBar — Phases | (text) | `SquaresFour` |
| TopBar — Parties | (text) | `UsersThree` |
| TopBar — Import | (text) | `UploadSimple` |
| TopBar — Export | (text) | `Download` |
| TopBar — Print | (text) | `Printer` |
| TopBar — Critical Path toggle | "CP" | `Path` (with text "CP" beside) |
| TopBar — New Task | `+` | `Plus` |
| TopBar — Zoom in/out | `+` `−` | `Plus` / `Minus` |
| SidePanel — Close | `×` | `X` |
| Modal — Back | `←` | `ArrowLeft` |
| CsvImportDialog — Drop zone | `📄` | `FileArrowUp` (24px) |
| Status badges — not-started | (dot) | (keep dot, no icon) |
| Status badges — in-progress | (dot) | `CircleHalf` |
| Status badges — at-risk | (dot) | `Warning` |
| Status badges — delayed | (dot) | `Clock` |
| Status badges — complete | (dot) | `Check` |
| Milestone — diamond | (CSS rotated square) | (keep CSS — it's a unique semantic) |
| Group row caret | (CSS triangle) | `CaretRight` / `CaretDown` |
| Filter chips | (none) | Optional `Funnel` prefix on chip group label |

**Implementation note for v1.1 Phase 9 marketing:** Phosphor also gives marketing access to icons like `Buildings`, `HardHat`, `Crane`, `Blueprint` if needed for capability blocks. Use sparingly — one icon per capability max.

---

## 8. Surface ladder & materiality

Current: two-tone (white + off-white). v1.2: three-tone with intentional purpose for each.

```
Layer 0: --color-bg         #eff2f6  → page background (the canvas)
Layer 1: --surface-raised   #ffffff  → primary content (TaskList, Gantt, panels)
Layer 2: --color-surface-2  #f5f8fb  → secondary modules (meta grids, footer hints, table headers)
Layer 3: --surface-sunken   #e6ecf3  → tracks, wells, progress bar backgrounds — RECESSED feel
```

### Where each tier shows up

| Layer | Component | Example |
|-------|-----------|---------|
| Layer 0 | Page background | Behind everything; visible at app-main gutter |
| Layer 1 | TaskList, Gantt body, SidePanel body, modal body | The white surfaces you can work on |
| Layer 2 | Side-panel section "meta" blocks (duration, workdays), table sub-headers, csv preview rows | One step quieter |
| Layer 3 | Progress slider track, gantt weekend bands, scrollbar track, baseline ghost background | "Sunken" — feels recessed |

### Elevation rules (de-vibecoded — minimal shadows)

- **Layer 1 over Layer 0:** No shadow. Just the surface change.
- **Layer 2 inside Layer 1:** No shadow. Use the tone change.
- **Layer 3 inside Layer 1 or 2:** No shadow. The recession is the meaning.
- **Modal over app:** `--shadow-modal` — already specified, keep.
- **TopBar over app:** No shadow — use a 1px `--brand-tint-2` rule at bottom.
- **SidePanel over Gantt:** 1px `--rule` on the left edge — that's it.

**Banned:** card-with-shadow-everywhere. The whole point of Swiss is that **the grid does the work**.

### Materiality rules

- No `backdrop-filter: blur(...)` anywhere. Already approved by Swiss audit item 3.
- No `linear-gradient` on text. Ever.
- No `radial-gradient` backgrounds.
- Borders/rules are 1px solid. Two thicknesses: `--rule` (1px, default) and `--rule-strong` (1px but with deeper color for sections).
- Inner highlights (1px white-at-12% inset on dark surfaces) are allowed only on Gantt bars and the TopBar — they signal "physical" depth without resorting to shadow.

---

## 9. Motion budget

Current motion is already disciplined (good — Swiss baseline says MOTION_INTENSITY: 1). v1.2 adds three specific moments where motion clarifies state. **No new ambient motion.**

### Approved motion (keep)

| Where | What | Duration | Easing |
|-------|------|----------|--------|
| Modal entry | Slide-in 6px + fade | 180ms | ease-out |
| Wizard entry | Slide-in 8px + fade | 300ms | ease-out |
| Toast | Spring overshoot | 180ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Mobile sheet up | translateY 100%→0 | 320ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Bar drag release | left/width snap | 120ms | ease-out |
| Gantt pulse (onboarding) | inset box-shadow | 1800ms × 3 | ease-in-out |
| Completion flash | background pulse | 1200ms | ease-out |
| Today line — no motion | — | — | — |

### New motion (add in v1.2)

| Where | What | Duration | Why |
|-------|------|----------|-----|
| **Status badge change** | 200ms color transition + 1-shake on critical-path entry | 200ms | Confirms state changed without alert UX |
| **Critical Path toggle** | 240ms cross-fade between dimmed/highlighted bars | 240ms | The on/off switch needs to feel deliberate |
| **Filter chip add/remove** | 160ms scale 0.95→1 (entry only) | 160ms | The chip "lands" instead of popping |

### Hard-banned motion

- `transition-all duration-300` (vague global transitions)
- `hover:scale-105` on cards
- Generic fade-up stagger on every section
- Ambient floating loops on hero
- Magnetic buttons
- Cursor trails
- Parallax of any kind
- "Confetti" on success
- Animated SVG logos

### Reduced motion

Every animation above checks `prefers-reduced-motion`. The fallback:
- All durations drop to 0
- Color changes still apply (instant)
- Spring overshoot collapses to a hard cut

---

## 10. Opening page — SetupWizard hero redesign (THE FIRST IMPRESSION)

The current SetupWizard is the most "AI default" surface in the app: a navy color-field with a centered 420px white card holding the project-name input and two buttons. It works. It is not attractive. It is not what a buyer's eye trusts.

**v1.2 reframes the SetupWizard as the application's identity scene.** This is where the brand sings.

### Composition: split-canvas, asymmetric weight

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│   MAKE                                          [LEFT — 58%]          │
│   ───                                                                  │
│   PROJECT SCHEDULE                                                     │
│                                                                       │
│   Schedules that hold up                                              │
│   under scrutiny.                                                      │
│                                                                       │
│   For construction project managers, schedulers, and field           │
│   teams. Built for accuracy under real-world variance.                │
│                                                                       │
│   ┌─────────────────────────────────────────────┐                     │
│   │  Project name                                │                     │
│   │  [Memorial Hospital — Phase 2 Build_______]  │                     │
│   └─────────────────────────────────────────────┘                     │
│                                                                       │
│   [ Start blank ]    [ Load example schedule ]                        │
│                                                                       │
│   ─────────────────────────────                                       │
│   v0.1.0 · No account required · Local storage                       │
│                                                                       │
│                                              [RIGHT — 42%]            │
│                                                                       │
│                          ┌─────────────────────────────────┐          │
│                          │                                  │          │
│                          │   [construction site image      │          │
│                          │    or architectural blueprint   │          │
│                          │    drawing — single image,      │          │
│                          │    high crop, navy duotone      │          │
│                          │    overlay 18% opacity]         │          │
│                          │                                  │          │
│                          │                                  │          │
│                          └─────────────────────────────────┘          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Detailed design spec

**Layout:**
- Full viewport (`min-height: 100dvh`).
- CSS Grid 12-column, gap 32px, max-width 1200px, centered horizontally with 64px outer padding.
- Left column: cols 1–7 (58%). Right column: cols 8–12 (42%).
- On mobile (< 768px): stack vertically. Image moves below text. Image becomes a 16:9 hero band.

**Background:**
- Layer 0 fills the viewport with **off-white** (`--color-bg`) — NOT brand navy (that's the current AI-default).
- Top-right corner: a subtle 480×480px positive-space artwork — line-drawn architectural plan (single-line-weight SVG, 12% opacity, navy ink). Sits behind everything, off-canvas top-right by 120px so only a slice shows. This is the **"craft detail"** that says a designer worked here.
- No card chrome behind the form. The form sits directly on the canvas. (De-vibecoded move #1: ungrounded centered card is the AI tell. Anchored composition is the fix.)

**Left column content:**

1. **Wordmark** — "MAKE" in Plus Jakarta Sans 700, tracking 0.32em, color `--ink-strong`, size 32px.
2. **A 1px navy rule** under the wordmark, 64px wide. (Swiss eyebrow detail.)
3. **Eyebrow label** — "PROJECT SCHEDULE" in eyebrow role (11px, 600, 0.06em, uppercase), `--ink-tertiary`.
4. **Display headline** — "Schedules that hold up under scrutiny." Display role, clamp(32px, 5vw, 48px), 700, -0.02em, `--ink-strong`. Two-line break — the line break is intentional after "up":
   ```
   Schedules that hold up
   under scrutiny.
   ```
5. **Lead paragraph** — Body 14px, `--ink-secondary`, max-width 52ch. Two sentences max. Real text:
   > "For construction project managers, schedulers, and field teams building hospitals, community centres, and large public-sector facilities. Built for accuracy under real-world variance — not for demos."
6. **Project name input** — 56px height (not 44px). 1.5px solid `--rule`. Border-radius 4px. Padding 0 20px. Font 16px (prevents iOS zoom). On focus: 2px solid `--accent`. Placeholder copy is industry-flavored: "e.g., Memorial Hospital — Phase 2 Build".
7. **Action group** — Two buttons in a row:
   - **Primary:** "Start blank schedule" — 48px height, navy fill, white text, weight 600, padding 0 24px, no shadow. On hover: tint 8% lighter. On press: tint 8% darker.
   - **Secondary:** "Load example schedule" — 48px height, transparent fill, 1.5px navy outline, navy text, same padding/weight.
   - Gap 12px between buttons.
   - On mobile, stack with secondary below primary.
8. **Footer micro-text** — A 1px `--rule-soft` divider, 32px wide, then footnote text "v0.1.0 · No account required · Local storage." in annotation role (10px, 500, `--ink-tertiary`).

**Right column content:**

A single, large, intentional image. Three image options to choose from for the v1.2 ship:

| Option | Subject | Treatment | Why |
|--------|---------|-----------|-----|
| A | Hospital under construction — exterior shot, scaffold + structural steel visible | Navy-cyan duotone at 18% opacity overlay, slight crop on top, dominant verticals | Most literal connection to the buyer's world |
| B | Architectural blueprint / building plan — top-down line drawing of a community-centre layout | Cyan ink on off-white, hand-drawn feeling, slight grain | Strongest brand-craft signal — least "stock photo" |
| C | Real-world Gantt screenshot zoomed to a specific moment — bars, dependencies, today line visible | Slight perspective tilt (3D rotation 6deg right), strong navy frame | Product-led — shows what the buyer is buying |

**Recommendation: Option B** for v1.2 ship. It's the most defensible against "vibecoded" critique because no AI would default to a hand-drawn architectural blueprint. We commission a single SVG illustration (or source from a Creative Commons archive of public-building blueprints) and tone it to the cyan palette. Falls back to Option A if commissioning is out of scope; A is sourceable from Unsplash.

**Image frame:**
- 5px border-radius (matches Gantt bars — a quiet rhyme).
- 1px `--rule` outer border.
- No shadow. No glow.
- Aspect ratio 4:5 portrait OR 5:4 landscape — picked per image.

**Optional bottom-right credit:**
- Below the image, 12px below: a small caption in annotation role. Examples:
  - For Option A: "Northshore Community Health Centre, Vancouver BC — Phase 3 build, 2024" (made up but specific)
  - For Option B: "Plan view, public assembly hall — illustrative."
  - For Option C: "MAKE Scheduling Tool — operator view at 12-month zoom."

The caption is the **de-vibecoded move**: AI doesn't add credit lines to stock images. Designers do.

### Motion (sparingly)

- On wizard mount: 
  - Wordmark fades + drops 8px → 0 over 280ms ease-out.
  - Each subsequent block (rule, eyebrow, headline, lead, input, buttons, footer) staggers 60ms after the previous, same transform.
  - Image fades in from 0 → 100% opacity over 420ms ease-out, starting 100ms after wordmark.
- On image hover (desktop only): subtle crop reframe over 600ms (`transform: scale(1.02)`), respects prefers-reduced-motion.
- All motion completes within 900ms. No ambient loops.

### What this redesign eliminates

| AI tell | Eliminated by |
|---------|---------------|
| Color-field background | Replaced with off-white canvas + craft artwork |
| Centered card on color | Replaced with split asymmetric layout |
| Generic "Get Started" hierarchy | Replaced with named outcomes |
| Featureless emptiness around the form | Replaced with display headline + lead + real image |
| Bare wordmark with no detail | Replaced with wordmark + rule + eyebrow stack |
| No proof of seriousness | Replaced with industry-specific lead copy |
| No grounded image | Replaced with intentional photography or blueprint |

### Accessibility

- Heading hierarchy: `<h1>` for the display headline, `<p>` for the lead.
- Image: `alt` text describes the image (e.g., "Architectural blueprint of a community assembly hall.").
- Tab order: wordmark/heading (not focusable) → input (autofocus) → primary button → secondary button → footer text (not focusable).
- High-contrast mode: image stays visible; navy duotone overlay drops to maintain contrast.
- Reduced motion: all transforms collapse to 0ms duration.

---

## 11. Component-by-component refinement

The opening page is the marquee work. The rest of the app gets focused polish.

### 11.1 TopBar

**Current state:** Navy band, 52px tall, 8 buttons separated by 5 dividers + emoji icons.

**v1.2 changes:**
- Reduce dividers from 5 to 2 (per Swiss audit item 9). Group the toolbar into: [Brand] [Zoom] [Baselines + Capture] [Calendar/Phases/Parties] [Import/Export/Print] [CP toggle] [Reset] [New Task]. Use 20px gaps between groups instead of dividers — keep dividers only before "Reset" (destructive) and before "New Task" (primary CTA).
- Replace all emoji icons with Phosphor (per §7).
- Print button demoted to ghost (per Swiss audit item 10).
- Wordmark "MAKE" gets 0.32em tracking (slight increase from 0.3em), color `--brand-on-brand` (white).
- Project title input: thin 1px underline appears on hover/focus. No background change on focus — just the underline color shifts from `--brand-tint-2` to `--accent-on-brand`.
- "+ New Task" button: keep accent fill, but add a subtle 1px inner-top highlight (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.16)`) for that "instrument" feel.
- N-key badge: keep mono, but reduce to `--text-3xs` (10px) and add `font-feature-settings: "tnum"`.

### 11.2 StatBar

**Current state:** 32px tall, 3 stats (Window / Tasks / Progress).

**v1.2 changes:**
- Add 2 stats: **Critical** (count of critical-path tasks if CP is on) and **Variance** (sum of days slipped vs baseline, if baseline is active). Both conditional — only shown when the relevant feature is engaged.
- Progress bar widens from 60px → 100px. Tri-color logic: green if avg pct ≥ baseline expectation, amber if within 5% slip, red if > 5% behind. Subtle 8px-wide diagonal stripe overlay on the "fill" portion if any tasks are at-risk — signals "ahead but with risk."
- Right-align a "Today: TUE 21 MAY" pill (using `Calendar` icon prefix) — fixed 110px width, mono dates, `--ink-tertiary`. Connects the bar to the today line in the Gantt.

### 11.3 FilterBar

**Current state:** Search input + chip rows for phase/status/party + count.

**v1.2 changes:**
- Search input gets a `MagnifyingGlass` icon prefix (16px, `--ink-tertiary`).
- Add a segmented "View" control to the right of search: `All · Active · Critical · Late`. Selected state = navy fill, white text, others = transparent with `--ink-secondary`. Height 28px, padding 0 12px per segment.
- Filter chips: hover state lifts color from `--ink-tertiary` to `--ink-secondary` (no background change). Selected chip = accent dim background + accent text (already correct).
- "Showing N of M" count: move to far right, prefix with a thin 1px vertical rule.

### 11.4 TaskList

**Current state:** 490px wide, sticky 64px header, column grid `1fr 52px 80px 48px`.

**v1.2 changes:**
- WBS column to 24px (per Swiss audit item 5). Both group and task rows align to the same column.
- Group row: add a thin 4px wide progress meter at the far right (column position 472–484). Shows "% of tasks in phase complete." Fill color = phase color. Background = `--surface-sunken`.
- Task row hover: shift `background: var(--surface-sunken)` (not just `--color-surface-2`). The recessed feel makes hover legible without being loud.
- Selected row: 2px solid `--accent` rail on the left, 4px wide. Background: `--color-selected-bg`. No bottom border on the row (the rail makes it obvious).
- Status badge: convert from CSS pill to Phosphor-icon + label combo. Icon size 12px, label `--text-3xs`. Five variants per §7.
- Float column: explicit sign — `+3d` (green), `−2d` (red), `0d` (neutral mono). Tabular numerals enforced.
- Note badge (existing): retain, but switch from emoji-like glyph to `NoteBlank` Phosphor at 11px.
- Party abbreviation: switch from `party.color + '22'` hex8 to `color-mix(in srgb, var(--party-color) 13%, transparent)` (per Swiss audit item 11).

### 11.5 Gantt — the diagrammatic centerpiece

**Current state:** Custom HTML/CSS bars, dependency arrows, baseline ghosts, milestones.

**v1.2 changes:**
- **Bars:** add a 1px inner-top highlight (`inset 0 1px 0 rgba(255,255,255,0.18)`) — gives quiet "physical" depth without leaving the flat material rule.
- **Critical path styling:** change from "red outline + dimmed others" to "red 3px left rail + 60% opacity on non-critical bars." Easier to scan, more Swiss.
- **Milestone diamonds:** keep the 45° rotated square (16px). Add a 1px outline in the milestone's phase color. On complete: fill with phase color; on incomplete: outline only.
- **Today line:** add a small label pill at the top — "TODAY · TUE 21 MAY" in `--text-3xs` mono, on a 22px tall `--accent` chip with white text. Sits above the gantt header tier, anchored to today's x-coordinate.
- **Dependency arrows:** stroke width 1px (currently might be heavier — verify). Color: `--ink-tertiary`. On critical path: stroke 1.5px in `--data-negative`.
- **Baseline ghosts:** the stripe pattern angle currently 45°. Change to 30° (matches the brand grade — the cyan accent line in marketing should also be 30°). Add a 1px solid `--rule` outline.
- **Header tiers:** primary tier (months/quarters) gets `--color-surface-2` background fill and weight 700. Secondary tier stays `--surface-raised` with weight 400 (per Swiss audit item 12).
- **Weekend bands:** slight darker tint — change from `--color-surface-2` to `--surface-sunken` (recessed feel).
- **Ghost-style toggle:** convert from glyph buttons to a Phosphor segmented control: stripe (`LineSegments`) / solid (`Square`) / outline (`SquareSplitHorizontal`).
- **Zoom pill:** currently top-right floating. Keep position. Switch glyphs to Phosphor `Plus`/`Minus`. Label shows current zoom level mode ("Week" / "Month" / "Quarter" / "Year").

### 11.6 SidePanel

**Current state:** 360px right rail, six sections, footer with Links + Delete + Autosaves hint.

**v1.2 changes:**
- Section headers get a 1px `--rule-soft` rule above (32px wide, not full-width) — Swiss section divider.
- Progress slider: thumb tooltip on drag/focus shows percent value, mono, 11px, on a navy chip.
- Date inputs: 16px `Calendar` icon prefix. Native date pickers stay native.
- Actual Dates section: when both `actualStart` and `actualFinish` are set, show an inline computed "Variance: +2d" or "On time" annotation below the inputs.
- Dependency preview: tighten the chip pattern. Show "Earthworks → Footings (FS + 0d)" with the predecessor task name truncated to 22 chars, the dep type abbreviated, and lag explicit.
- Footer: per Swiss audit item 4, lift "Autosaves" hint from `--ink-quiet` to `--ink-tertiary` (already in v1.0/v1.1).
- Delete button: already promoted in v1.0. v1.2 polish — add a 1px inner-top highlight for the "physical" feel.

### 11.7 Modals (LinkBuilder, Workweek, Groups, Parties, CsvImport, PrintPreview)

**Universal v1.2 changes:**
- Remove `backdrop-filter: blur(3px)` (Swiss audit item 3).
- Add a 3px top accent rule (`--accent`) to every modal header — same gesture as the SetupWizard card, creates family resemblance.
- Standardize header padding to `20px 24px 16px`.
- Footer: right-align primary, left-align secondary. Right-align dangerous actions to the far right.
- Modal box: switch `--radius-lg` from 10px → 6px (radius scale tightening).
- Tabs/segmented controls inside modals (e.g., CSV import mode toggle) use the same segmented control language as FilterBar.

**Component-specific:**
- **LinkBuilderModal:** dependency rows get a hover state (subtle `--surface-sunken` background). The `type` and `lag` controls become Phosphor segmented controls instead of select dropdowns where appropriate.
- **CsvImportDialog:** drop zone gets a `FileArrowUp` Phosphor at 32px instead of `📄`. Dotted border becomes a 2px solid `--accent` when dragging. Preview table headers get a 1px `--rule-strong` bottom border for "this is a heavy table" signaling.
- **PrintPreviewModal:** chrome gets a top thumbnail strip showing both modes side-by-side at 60px tall — click to switch. Readability chip becomes a status badge (green "OK" / amber "Tight" / red "Won't fit") using the Phosphor icon set.

### 11.8 Mobile bottom sheet (built in v1.1 Phase 4 — v1.2 visual polish)

- Drag handle: 32px × 4px rounded bar (`--rule-strong`) centered at the top. Touch-target 44px.
- Sheet background: `--color-surface` with a 1px `--rule` top border.
- Peek mode (40vh): visible content = task name (large) + status + progress bar. Everything else clipped.
- Full mode (85vh): full SidePanel content.
- Snap motion: spring `cubic-bezier(0.34, 1.56, 0.64, 1)` over 320ms.

### 11.9 Print preview canvas

**v1.2 polish:**
- A3 canvas gets a 1px `--rule-strong` outer border — looks like a printed deliverable.
- Top title bar inside the canvas: "MEMORIAL HOSPITAL — PHASE 2 BUILD · BASELINE: 2025-04-12 · GENERATED 2025-05-21" in eyebrow role, mono dates.
- Bottom-right corner: page number "1 / 1" in annotation role.
- Print output (`@media print`) keeps these in place — they're part of the deliverable.

---

## 12. Marketing landing — full Swiss treatment

**Current state:** Scaffolded with Nav, Hero, Capabilities, Interface, Process, ClosingCta, Footer in [src/marketing/MarketingPage.tsx](../src/marketing/MarketingPage.tsx). Static SVG GanttMock in hero.

**v1.2 changes:**

### Hero
- Off-white background (`--color-bg`). No navy color-field.
- Layout: 12-column grid, max 1320px, content cols 1–7, image cols 8–12.
- Left: same eyebrow + display + lead structure as the SetupWizard, but with bolder display headline and a primary CTA "Open the app →" (cyan accent) + a secondary "See capabilities" (navy outline). Below: stat strip in mono numerals — "5 zoom levels · A3 print-ready · CPM critical path · 20-step undo."
- Right: replace the static SVG GanttMock with a **real screenshot** of the app at a representative moment — Gantt visible, today line, baseline ghost bars, critical path on. 3D perspective transform 6° right + 4° down. 5px border-radius matching the app. A subtle navy 18% duotone overlay binds it to brand. Crop tight on a busy section so it reads as real software.

### Capabilities section (NOT three cards)
- Poster-grid 12-column composition, deliberately uneven:
  - **Cell 1 (cols 1–5, rows 1–2):** Large image — Gantt with critical path on, cropped tight on a 3-week window. Caption below: "Critical Path Method computed live."
  - **Cell 2 (cols 6–8, row 1):** Text block — "Baseline + Variance" headline + 2-sentence description.
  - **Cell 3 (cols 9–12, row 1):** Text block — "Dependency Types" with all four (FS/SS/FF/SF) listed mono.
  - **Cell 4 (cols 6–12, row 2):** Image — Print preview showing A3 mode at scale, cropped to show a corner. Caption: "Prints to A3 — the size your stakeholders expect."
- 32px gaps. 1px `--rule-soft` between cells.

### Interface section
- Full-bleed band (negative margin from container) with `--brand` (navy) background.
- Inside: a sequence of three real product screenshots, each cropped to show one specific behavior (drag to reschedule, baseline ghost showing slip, mobile bottom sheet open).
- Captions below each screenshot in `--brand-on-brand-dim`.

### Process section
- Numbered timeline rail (5 steps): Set up phases → Add tasks → Set dependencies → Capture baseline → Print to A3 stakeholder review.
- Each step: large Phosphor numeral (32px, `--accent`), one-line headline, one-paragraph description.
- Connecting 1px line between steps.

### Closing CTA
- Full-bleed `--brand` background.
- Split: cols 1–7 large headline "Schedules that hold up under scrutiny." + lead. Cols 8–12: image (another construction-site photograph).
- Primary CTA: "Open the app — no account, no signup."

### Footer
- Off-white. 4-column grid: Brand (wordmark + tagline + version), Capabilities (4 links), Resources (4 links — keyboard shortcuts, sample CSV, about), Legal (privacy, license, contact).
- 1px `--rule` top border.
- Bottom row: "MAKE Scheduling Tool · A construction project management tool by [TEAM NAME] · 2026" — annotation role, `--ink-tertiary`.

### Marketing design dial settings
- DESIGN_VARIANCE: 4 (offset, not symmetric — poster-grid capabilities, full-bleed sections breaking the container)
- MOTION_INTENSITY: 3 (one hero reveal + per-section fade-up scroll triggers, nothing more)
- VISUAL_DENSITY: 5 (daily-app density — balanced)

---

## 13. Photography & imagery direction

Imagery is for **marketing only**. The app surface stays text/data-led — no decorative imagery inside the operator UI.

### Sourcing principles
- **Subject:** real construction sites of institutional buildings — hospital, community centre, school, civic facility.
- **Treatment:** natural light, architectural focus, no people front-and-center (no hard-hat-with-clipboard stock energy). Structural elements (rebar, formwork, concrete, scaffolding, structural steel, glazing) preferred over heavy-machinery shots.
- **Color grade:** images get a navy-cyan duotone overlay at 12–18% opacity to bind to brand. Original images skew slightly cool. Avoid warm-orange sunset shots.
- **Format:** large, never tiny. Crop tight — a sliver of a hospital exterior is stronger than a wide site photo.

### Sourcing order
1. Original photography commissioned (preferred — most defensible against "vibecoded" critique).
2. Unsplash search: "hospital construction", "community centre architecture", "civic building exterior", "scaffolding building", "rebar concrete", "structural steel building" — filter to those with cool light grade.
3. Architectural blueprint archives (Public Architecture Foundation, Library of Congress, Open Source Architecture) — for Option B opening page.
4. Last resort: generate via image AI, but only if the result passes the "would this be in an architectural magazine?" test.

### Banned imagery
- People in stock-photo "team meeting" poses.
- Hard-hat closeups with white teeth.
- Drone shots of suburbs.
- Anything with a watermark.
- Anything with visible AI-generation tells (extra fingers, melting structures, "Insta-Lab" lighting).

---

## 14. Empty / loading / error states

**Currently underdesigned.** A real designer thinks about these as much as the happy path. v1.2 designs each.

### Empty states

| Where | Current | v1.2 |
|-------|---------|------|
| No tasks (post-wizard, blank schedule) | The Gantt area renders empty white | Center a Phosphor `GridFour` icon (32px, `--ink-quiet`) + headline "No tasks yet" + sub "Press N to add your first task, or load example data above." |
| No baselines | Baselines menu just shows "Capture" button | Add a one-line above: "No baselines captured. Capture the current schedule to track variance over time." |
| No filter results | Task list shows blank | "No tasks match 'XYZ'. Clear filters?" with a button to reset. |
| No dependencies | Side panel "Dependencies" section shows "No predecessors set" | Keep, but add a button "+ Add dependency" linking to the LinkBuilder modal. |
| No notes | Side panel "Log" section shows the input only | Add a one-line above: "Log changes here. Ctrl+Enter to save." |

### Loading states

- TaskList: when re-computing `enrichedTasks` for > 500 rows, show a thin 2px progress bar at the top of the TaskList in `--accent`. Indeterminate animation. Hide after 200ms — don't flash for short operations.
- Gantt: same approach — top of Gantt header.
- Modal: when CSV import is parsing > 1000 rows, replace the import button with a Phosphor `CircleNotch` spinner + "Parsing 1,200 rows…" text.

### Error states

- CSV import row error: per-row inline message with row number, field, reason. Keep first 5, indicate "+12 more — see console for full report."
- Invalid date in side panel: red 1px outline on the date input + a `Warning` Phosphor icon + 11px error text below ("Date must be after start.")
- localStorage full: top-of-app banner — 1px `--data-caution` background + Phosphor `Warning` + "Storage full — export to CSV and clear browser data."

### Disabled states

- Buttons: 50% opacity + cursor not-allowed. No tooltip required by default but available via `title`.
- Inputs: `--surface-sunken` background, `--ink-quiet` text. Border stays `--rule`.

---

## 15. Dark mode polish

Current dark mode is functional but not institutional — it skews a bit "gamer" with the heavy contrast and navy depth.

**v1.2 changes:**
- `--brand` in dark mode shifts from `#0e1c2c` to `#0a1421` (a touch deeper, more matte).
- Surface ladder gets the third tier: `--surface-sunken` dark = `#0e1c2c` (between bg and surface).
- Cyan accent stays at `#27aae1` — do NOT brighten in dark mode (gamer signal).
- Add a faint warm-grain noise overlay (8% opacity, `var(--noise)` SVG) to dark backgrounds only — adds material warmth without breaking the flat Swiss principle. Implemented as a CSS background-image, not a child element.
- Status colors get a 6% brightness lift to maintain contrast on dark surfaces.
- Shadow tokens already in place — verify dark-mode shadows don't bloom too aggressively.

**Audit checklist in dark mode:**
- TopBar wordmark legible.
- Today line readable.
- Gantt bars distinguishable from background.
- Baseline ghost bars distinguishable from live bars.
- Critical path red still semantic (not muddy).
- Form inputs have visible borders.
- Focus rings have 4.5:1 contrast.

---

## 16. Phased task breakdown

Like v1.1, each task is ≤ 3 files / 1 commit. Phases are ordered by dependency.

### Phase A — Foundation tokens & icon library

| # | Task | Files |
|---|------|-------|
| A.1 | Add v1.2 color tokens (surface-sunken, brand-tint, accent variants, data semantics, ink ladder, phase rails, ring) to `:root` and dark mode | `src/styles/tokens.css` |
| A.2 | Tighten radius scale (sm 2 / base 4 / lg 6 / xl 8) — sweep components for hardcoded radius values | `src/styles/tokens.css` + component sweeps |
| A.3 | Install `@phosphor-icons/react` — add to `package.json` (~6KB gzipped including tree-shake) | `package.json` |
| A.4 | Create `src/lib/icons.ts` — central export of every Phosphor icon used (named exports only) | `src/lib/icons.ts` (new) |
| A.5 | Document the token additions and icon list in `docs/design-system.md` | `docs/design-system.md` (new) |

### Phase B — Iconography swap

| # | Task | Files |
|---|------|-------|
| B.1 | Replace TopBar emoji glyphs with Phosphor icons | `src/components/topbar/TopBar.tsx` |
| B.2 | Replace SidePanel close × and modal back ← with Phosphor | `src/components/panels/SidePanel.tsx`, `src/components/modals/*.tsx` |
| B.3 | Replace CSV drop zone 📄 with `FileArrowUp` Phosphor | `src/components/modals/CsvImportDialog.tsx` |
| B.4 | Update StatusBadge to use Phosphor per-status (CircleHalf/Warning/Clock/Check) | `src/components/task-list/StatusBadge.tsx` |
| B.5 | Group row caret: replace CSS triangle with Phosphor `CaretRight`/`CaretDown` | `src/components/task-list/TaskList.tsx` |

### Phase C — Surface ladder & materiality

| # | Task | Files |
|---|------|-------|
| C.1 | Add `--surface-sunken` and use it for: progress slider track, gantt weekend bands, scrollbar tracks | `src/styles/app.css`, `src/components/gantt/GanttGrid.tsx` |
| C.2 | Group row progress meter — 4px wide bar at end of row showing phase completion % | `src/components/task-list/TaskList.tsx` |
| C.3 | Gantt bar inner-top highlight (1px white at 18%) | `src/components/gantt/GanttBar.tsx` |
| C.4 | Selected task row: 2px accent rail on left + remove the bottom border | `src/components/task-list/TaskList.tsx` |
| C.5 | StatBar: tri-color progress meter logic + diagonal stripe for at-risk | `src/components/StatBar.tsx` |

### Phase D — Opening page (SetupWizard) redesign

| # | Task | Files |
|---|------|-------|
| D.1 | Replace SetupWizard composition: split-canvas asymmetric layout, off-white canvas, no centered card | `src/components/overlays/SetupWizard.tsx` |
| D.2 | Add display headline, eyebrow, lead paragraph with industry copy | `src/components/overlays/SetupWizard.tsx` |
| D.3 | Add image asset (Option B — architectural blueprint SVG OR Option A — sourced photo with duotone overlay) | `public/setup-wizard.svg` or `public/setup-wizard.jpg` (new), `src/components/overlays/SetupWizard.tsx` |
| D.4 | Add wordmark detail (rule + tracking refinement) and footer micro-text | `src/components/overlays/SetupWizard.tsx` |
| D.5 | Add staggered entry motion (60ms stagger across 5 blocks, max 900ms total); respect prefers-reduced-motion | `src/components/overlays/SetupWizard.tsx`, `src/styles/app.css` |
| D.6 | Add the background "craft artwork" SVG in the top-right corner (12% opacity line drawing) | `public/wizard-bg.svg` (new), `src/components/overlays/SetupWizard.tsx` |

**This phase ships as a single visual milestone — the "first impression" PR.**

### Phase E — TopBar polish

| # | Task | Files |
|---|------|-------|
| E.1 | Reduce dividers from 5 → 2; widen group gaps to 20px | `src/components/topbar/TopBar.tsx` |
| E.2 | Demote Print button to ghost variant (per Swiss item 10) | `src/components/topbar/TopBar.tsx` |
| E.3 | Wordmark tracking refinement + project title underline-on-focus | `src/components/topbar/TopBar.tsx` |
| E.4 | New Task button inner-top highlight + N-key badge mono refinement | `src/components/topbar/TopBar.tsx` |

### Phase F — Gantt diagrammatic polish

| # | Task | Files |
|---|------|-------|
| F.1 | Critical path styling: 3px left rail + 60% opacity on non-critical | `src/components/gantt/GanttBar.tsx` |
| F.2 | Today line pill ("TODAY · TUE 21 MAY") | `src/components/gantt/Gantt.tsx`, `src/components/gantt/GanttGrid.tsx` |
| F.3 | Header tier weight differentiation (per Swiss item 12) | `src/components/gantt/GanttHeader.tsx` |
| F.4 | Baseline ghost stripe angle: 45° → 30°; add 1px outline | `src/components/gantt/BaselineGhostBars.tsx` |
| F.5 | Dependency arrow refinement: 1px default, 1.5px on critical path with `--data-negative` | `src/components/gantt/DependencyArrows.tsx` |
| F.6 | Milestone diamond outline + fill logic per completion state | `src/components/gantt/GanttBar.tsx` |
| F.7 | Ghost-style toggle: convert to Phosphor segmented control | `src/components/gantt/Gantt.tsx` |
| F.8 | Zoom pill: Plus/Minus Phosphor + mode label | `src/components/gantt/Gantt.tsx` |

### Phase G — TaskList refinement

| # | Task | Files |
|---|------|-------|
| G.1 | WBS column to 24px universal (per Swiss item 5) | `src/components/task-list/TaskList.tsx` |
| G.2 | Float column: explicit sign + tabular numerals | `src/components/task-list/TaskList.tsx` |
| G.3 | Party color: swap hex8 for `color-mix` (per Swiss item 11) | `src/components/task-list/TaskList.tsx` |
| G.4 | Hover state: `--surface-sunken` background, not `--color-surface-2` | `src/components/task-list/TaskList.tsx` |

### Phase H — SidePanel & ActualDates polish

| # | Task | Files |
|---|------|-------|
| H.1 | Section headers: 1px `--rule-soft` rule above (32px wide) | `src/components/panels/SidePanel.tsx` |
| H.2 | Progress slider thumb tooltip on drag (mono chip showing %) | `src/components/panels/SidePanel.tsx`, `src/styles/app.css` |
| H.3 | Date inputs: `Calendar` icon prefix + Variance computation in ActualDates | `src/components/panels/SidePanel.tsx`, `src/components/panels/ActualDatesSection.tsx` |
| H.4 | Dependency preview chip tightening | `src/components/panels/SidePanel.tsx` |

### Phase I — Modal universal polish

| # | Task | Files |
|---|------|-------|
| I.1 | Remove `backdrop-filter` from every modal overlay (per Swiss item 3) | `src/styles/app.css`, all modal files |
| I.2 | Add 3px top accent rule to every modal box | All modal files |
| I.3 | Standardize header padding `20px 24px 16px` across all modals | All modal files |
| I.4 | Footer alignment: primary right, secondary left | All modal files |

### Phase J — StatBar, FilterBar, modals

| # | Task | Files |
|---|------|-------|
| J.1 | StatBar: Critical + Variance stats (conditional); right-aligned Today pill | `src/components/StatBar.tsx` |
| J.2 | FilterBar: search icon prefix + segmented View control + chip hover polish | `src/components/filter/FilterBar.tsx` |
| J.3 | LinkBuilderModal: row hover state + type/lag as segmented controls (decision) | `src/components/modals/LinkBuilderModal.tsx` |
| J.4 | CsvImportDialog: drop zone visual polish (Phosphor 32px, 2px accent on drag) | `src/components/modals/CsvImportDialog.tsx` |
| J.5 | PrintPreviewModal: thumbnail mode strip in modal header | `src/components/modals/PrintPreviewModal.tsx` |
| J.6 | Print canvas: title bar inside canvas (project + baseline + date in eyebrow) | `src/components/modals/PrintPreviewModal.tsx` |

### Phase K — Empty / loading / error states

| # | Task | Files |
|---|------|-------|
| K.1 | Gantt empty state (centered icon + headline + sub) | `src/components/gantt/Gantt.tsx` |
| K.2 | TaskList no-filter-results empty state | `src/components/task-list/TaskList.tsx` |
| K.3 | SidePanel empty-deps / empty-log helper text | `src/components/panels/SidePanel.tsx` |
| K.4 | CSV import error report (first 5 rows) | `src/components/modals/CsvImportDialog.tsx` |
| K.5 | localStorage-full banner | `src/components/App.tsx`, `src/styles/app.css` |
| K.6 | Loading indicators (thin 2px bar pattern) for > 500 task computation | `src/components/task-list/TaskList.tsx`, `src/components/gantt/Gantt.tsx` |

### Phase L — Marketing landing full treatment

| # | Task | Files |
|---|------|-------|
| L.1 | Hero: off-white background, asymmetric split, real screenshot image with 6° tilt | `src/marketing/MarketingPage.tsx`, `src/marketing/marketing.css` |
| L.2 | Capabilities: poster-grid 12-col composition (replace any three-card pattern) | `src/marketing/MarketingPage.tsx` |
| L.3 | Interface section: full-bleed navy band with 3 screenshot crops | `src/marketing/MarketingPage.tsx` |
| L.4 | Process: numbered timeline rail (5 steps with Phosphor numerals) | `src/marketing/MarketingPage.tsx` |
| L.5 | Closing CTA: split navy band with image + headline | `src/marketing/MarketingPage.tsx` |
| L.6 | Footer: 4-column structured layout + version line | `src/marketing/MarketingPage.tsx` |
| L.7 | Source/commission 3 hero images (Hero, Interface, Closing) — duotone treated | `public/hero-*.{jpg,svg}` |
| L.8 | Display headline + lead copy review (no AI tells) | `src/marketing/MarketingPage.tsx` |

### Phase M — Dark mode polish

| # | Task | Files |
|---|------|-------|
| M.1 | Dark `--brand` shift to `#0a1421`; add `--surface-sunken` dark | `src/styles/tokens.css` |
| M.2 | Warm-grain SVG noise overlay at 8% (dark mode only) | `src/styles/app.css`, `public/grain.svg` (new) |
| M.3 | Status color lift in dark mode (6%) | `src/styles/tokens.css` |
| M.4 | Audit walk: dark-mode screenshots of every primary surface | `docs/dark-mode-audit-1.2.md` (new) |

### Phase N — Motion additions

| # | Task | Files |
|---|------|-------|
| N.1 | Status badge color transition (200ms) + critical-path 1-shake on entry | `src/components/task-list/StatusBadge.tsx`, `src/styles/app.css` |
| N.2 | Critical Path toggle: 240ms cross-fade | `src/components/gantt/GanttBar.tsx`, `src/styles/app.css` |
| N.3 | Filter chip entry: 160ms scale 0.95→1 | `src/components/filter/FilterBar.tsx`, `src/styles/app.css` |
| N.4 | `prefers-reduced-motion` audit: confirm all v1.2 animations collapse to 0ms | manual + Phase K test coverage |

### Phase O — Brand identity asset kit

| # | Task | Files |
|---|------|-------|
| O.1 | Favicon: navy "M" mark, 32×32 SVG + 16×16 PNG fallback | `public/favicon.svg`, `public/favicon.png` |
| O.2 | Apple-touch-icon: 180×180 with rounded-square frame and "MAKE" wordmark | `public/apple-touch-icon.png` |
| O.3 | OG image (1200×630): navy band + wordmark + tagline + small Gantt screenshot | `public/og.png` |
| O.4 | Print canvas: title-bar pattern inside the A3 deliverable | `src/components/modals/PrintPreviewModal.tsx` |
| O.5 | App wordmark refinement (custom letterform tweak — the "K" baseline align) | `src/styles/tokens.css` font-feature-settings or inline SVG wordmark |

---

## 17. Parallel vs sequential

| Group | Tasks | Why |
|-------|-------|-----|
| **G1** | A.1, A.2, A.3, A.4 | All foundation token + library setup. Independent files. |
| **G2** | B.1, B.2, B.3, B.4, B.5 | Each component's icon swap is independent once Phase A lands. |
| **G3** | C.2, C.3, C.4, C.5 | Surface ladder applied per-component once C.1 (token) lands. |
| **G4** | D.1–D.6 | Single visual milestone — sequence them within a single PR for cohesion. |
| **G5** | F.1–F.8 | Gantt is one component; bundle these into 2–3 PRs by topic (bars+CP, header+baseline, controls). |
| **G6** | L.1–L.8 | Marketing is its own entry — independent of app component work. Can ship in parallel with app phases. |

| Sequential | Depends on |
|-----------|-----------|
| Phase B (icons) | Phase A (Phosphor install) |
| Phase C (surface) | Phase A (token additions) |
| Phase D (wizard) | Phase A + B (uses new tokens + icons) |
| Phase E–J (component polish) | Phase A + B |
| Phase K (states) | Phases A through J (need polished base) |
| Phase M (dark mode) | Phases A through L (audit after visual changes land) |
| Phase N (motion) | Phases A through K |

---

## 18. Quality gates — Gate 2 checklist

### Architecture
- [x] No new state libraries, no new persistence schema
- [x] All token changes go through `src/styles/tokens.css`
- [x] Icon imports centralized in `src/lib/icons.ts` for tree-shake control
- [x] No inline hex colors anywhere in components (every color via `var(--token)`)
- [x] Marketing entry point stays decoupled from app runtime

### De-vibecoded test (run on every PR)
- [ ] No purple/indigo/violet accents added
- [ ] No emoji icons added or remaining
- [ ] No `rounded-2xl` or radius > 8px outside the wizard
- [ ] No three-equal-card sections in marketing
- [ ] No centered-card-on-color-field pattern (wizard fixed it)
- [ ] No generic CTAs ("Get Started", "Learn More")
- [ ] No AI SaaS copy ("Transform", "Unlock", "Elevate")
- [ ] No `backdrop-filter: blur(...)` anywhere
- [ ] No `linear-gradient` on text or backgrounds
- [ ] Every CTA names the outcome

### Component breakdown
- [x] All files listed per task
- [x] Each task ≤ 3 files / 1 commit
- [x] Parallel / sequential dependencies documented
- [x] No skipped layers (tokens before components before integration)

### Testing & visual proof
- Visual: before/after screenshots committed to `docs/v1.2-screenshots/` for every component change
- Dark mode: every surface verified in dark mode (Phase M audit doc)
- Reduced motion: every animation has a collapsed fallback (Phase N audit)
- Accessibility: focus rings visible on every interactive surface after token changes
- Print: A3 output unchanged by visual changes (Phase O.4 specifically)

---

## 19. Acceptance criteria — v1.2 ship gate

- [ ] Every phase A–O lands its individual acceptance
- [ ] `npm run build`, `lint`, `type-check`, `test:unit`, `test:e2e` all green
- [ ] Bundle delta: Phosphor adds ~6KB gzipped; total app bundle still under 150KB gzipped
- [ ] **The seven AI tells test passes on every primary surface** (run with fresh eyes — open SetupWizard, App, Modals, Marketing in a clean browser)
- [ ] **The wordmark-swap test passes** — replace "MAKE" with a different name in a screenshot; if the design still looks specific (not interchangeable with any other PM SaaS), it works
- [ ] SetupWizard: the first impression test — show the wizard to someone who's never seen the project; they describe it without using the words "AI," "SaaS," or "template"
- [ ] Marketing Lighthouse: Performance ≥ 95, Accessibility ≥ 95, SEO = 100
- [ ] Dark mode: every primary surface walks clean in `docs/dark-mode-audit-1.2.md`
- [ ] Print A3 output identical to v1.1 — no regression in deliverable quality

---

## 20. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Wizard redesign goes too far — buyer doesn't recognize it as the same product | Low | Medium | The wordmark + cyan + navy combination stays — only composition changes. A/B with internal team before ship. |
| Phosphor icon swap introduces inconsistent strokes if components import directly | Medium | Low | Centralize through `src/lib/icons.ts`. Reject PRs that import from `@phosphor-icons/react` directly. |
| Surface ladder tokens get diluted — `--surface-sunken` used where it shouldn't | Medium | Low | Document strict usage in `docs/design-system.md`. Code review gate. |
| Marketing photography looks "stock" despite curation | Medium | High | Test against an art director or design lead before ship. Default to Option B (blueprint illustration) if photo curation underperforms. |
| Radius tightening breaks visual balance somewhere | Low | Medium | Sweep with screenshots phase-by-phase. Wizard, modals, and buttons get visual verification. |
| Dark mode warm-grain noise hurts scroll performance on low-end devices | Low | Medium | Test on a 2019 MacBook Air baseline. If FPS drops, drop grain to 0% on dark mode or limit to specific containers. |
| Display headline doesn't translate cleanly to other languages | Medium | Low | Keep English-only for v1.2 ship. Localization is a v2+ concern. |
| Phosphor license change | Very Low | Low | MIT license, mature project. Add a fallback icon set (`react-icons` heroicons as a 1-day rollback path). |
| Removing emoji glyphs breaks accessibility for screen readers that announce them | Low | Medium | Every Phosphor icon gets an `aria-label` or is decorative with `aria-hidden="true"` alongside a text label. |
| Marketing screenshot images expose UI state we don't want to ship publicly | Low | High | Use the example data (residential build) for all marketing screenshots. Never real customer data. |

---

## 21. Out of scope (deferred to v2.0 or beyond)

- New components or product surface
- Persisted schema changes
- New persistence keys
- Internationalization
- Custom font commissioning (we stay with Plus Jakarta + Space Mono — both are excellent and free)
- Variable font weight axis (single weight per role is fine)
- Animation library introduction (no Framer Motion, no GSAP — current CSS keyframes are enough)
- Custom illustration system (one wizard image + 3 marketing images is the entire v1.2 image budget)
- Theme variants beyond light/dark (no high-contrast, no print-only theme switch)
- Brand kit for external use (logo files, brand guidelines PDF) — separate work
- Customer-specific theming (white-label) — separate workstream

---

## 22. Closing note — the "would another product look identical" test

The single test that gates v1.2 ship:

> Take a screenshot of the SetupWizard, the App, the Print Preview, and the Marketing Hero. Cover the "MAKE" wordmark with a black bar. Show it to a designer who has never seen the project. Ask: "What kind of product is this for?"
>
> The answer should be: **"Construction or engineering project management — looks institutional, scheduling-focused, serious. For hospitals or civic facilities."**
>
> The answer should NOT be: "Some kind of SaaS dashboard," "A productivity tool," "A startup landing page," "AI tool."

If the answer is right, v1.2 shipped. If not, we go back to the surface that broke the read and iterate until the test passes.

The brand identity is not in the wordmark. It's in the typography, the surface ladder, the icon weight, the photography, the absence of glow, the asymmetric wizard, the navy-on-off-white palette, the construction-PM voice. The wordmark just signs the work.

---

## 23. Build Changelog

Running log of work executed against this plan. Each entry: date, scope, files touched, verification.

> **Codex update rule:** After you append an entry here, also update `.claude/AGENT-HANDOFF.md` (last touch + what landed + next action). Those two updates are your full handoff surface — nothing else needs to change for a task landing. When a full version ships, also update `.claude/version-status.md`.

- **2026-05-22 — HK-1 (pre-v1.2 housekeeping): removed orphan worktree**
  - Files: none (local git metadata cleanup only)
  - Actions: `git worktree remove .worktrees/phases-3-6 --force`, `git branch -D feature/phases-3-6`, verified `git worktree list` shows only main checkout.
  - Verification: local git state only; no code/build gate required.

- **2026-05-22 — HK-2 (pre-v1.2 housekeeping): track `.github/` CI assets**
  - Files: `.gitignore`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/copilot-instructions.md`, `.github/workflows/ci.yaml`
  - Notes: removed `.github/` ignore rule and committed tracking so workflow definitions are in-repo.
  - Verification: local commit complete; push/CI-run confirmation deferred (user requested no push without approval).

- **2026-05-22 — HK-3 (pre-v1.2 housekeeping): mobile real-device QA stub**
  - Files: `docs/mobile-qa.md`
  - Notes: recorded owed touch-device validation prior to Phase 11.8 shipment.
  - Verification: documentation-only change.

- **2026-05-22 — Phase A.1: foundation semantic tokens in light/dark**
  - Files: `src/styles/tokens.css`
  - Added: surface ladder, brand tint/on-brand, accent variants, data semantics, ink ladder, rule hierarchy, phase tokens, ring tokens.
  - Verification: `npm run lint`, `npm run type-check`, `npm run test:unit`, `npm run build`, `npm run test:e2e` (all pass).

- **2026-05-22 — Phase A.2: radius scale tightening + tokenized radius usage**
  - Files: `src/styles/tokens.css`, `src/styles/app.css`, `src/marketing/marketing.css`
  - Changes: radius scale set to `2/4/6/8` (`sm/base/lg/xl`), replaced hardcoded px radii with token references where applicable.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase A.3: Phosphor dependency installed**
  - Files: `package.json`, `package-lock.json`
  - Changes: added `@phosphor-icons/react`.
  - Verification: full local gate run passed; build output app bundle remained `29.10 kB` gzip (well below `< 150 kB` acceptance ceiling).

- **2026-05-22 — Phase A.4: centralized icon export module**
  - Files: `src/lib/icons.ts`
  - Changes: created single source of Phosphor icon exports (named exports only).
  - Verification: full local gate run passed; grep check confirms no other direct `@phosphor-icons/react` imports in `src/`.

- **2026-05-22 — Phase A.5: design-system foundation documentation**
  - Files: `docs/design-system.md`
  - Changes: documented v1.2 token additions, radius scale, icon import policy, and canonical icon list.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase B.1: TopBar iconography swap**
  - Files: `src/components/topbar/TopBar.tsx`
  - Changes: replaced glyph/emoji controls with Phosphor icons (`Minus`, `Plus`, `Bookmarks`, `Camera`, `CalendarBlank`, `SquaresFour`, `UsersThree`, `UploadSimple`, `Download`, `Printer`, `Path`, `ArrowCounterClockwise`) and updated New Task button affordance.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase B.2: SidePanel close + modal back icon swap**
  - Files: `src/components/panels/SidePanel.tsx`, `src/components/modals/CsvImportDialog.tsx`
  - Changes: replaced `×` close with `X` icon; replaced `← Back` with `ArrowLeft` + text.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase B.3: CSV drop zone icon swap**
  - Files: `src/components/modals/CsvImportDialog.tsx`
  - Changes: replaced `📄` emoji with `FileArrowUp` icon (24px).
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase B.4: status badge icon semantics**
  - Files: `src/components/task-list/StatusBadge.tsx`
  - Changes: added per-status Phosphor icons (`CircleHalf`, `Warning`, `Clock`, `Check`) and kept not-started as a semantic dot.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase B.5: TaskList group caret swap**
  - Files: `src/components/task-list/TaskList.tsx`
  - Changes: replaced inline SVG triangle caret with Phosphor `CaretRight` / `CaretDown`.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase C.1: surface-sunken applied to recessed tracks**
  - Files: `src/styles/app.css`, `src/components/gantt/GanttGrid.tsx`
  - Changes: moved scrollbar tracks, SidePanel progress-slider tracks, and Gantt weekend bands to `--surface-sunken`.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase C.2: TaskList group completion meter**
  - Files: `src/components/App.tsx`, `src/components/task-list/TaskList.tsx`
  - Changes: added a 4px end-of-row vertical completion meter on group rows; wired filtered task data into `TaskList` so completion stays accurate even when groups are collapsed.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase C.3: Gantt bar inner highlight**
  - Files: `src/components/gantt/GanttBar.tsx`
  - Changes: added 1px inset top highlight to bars (`inset 0 1px 0 rgba(255,255,255,0.18)`).
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase C.4: selected TaskList row rail treatment**
  - Files: `src/components/task-list/TaskList.tsx`
  - Changes: selected rows now use 2px accent left rail and remove bottom border for clearer selection state.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase C.5: StatBar tri-color meter**
  - Files: `src/components/StatBar.tsx`
  - Changes: converted progress meter to status-distribution segments (positive/caution/negative) and added diagonal stripe treatment for at-risk segment.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase D.1–D.6: SetupWizard visual milestone**
  - Files: `src/components/overlays/SetupWizard.tsx`, `src/styles/app.css`, `public/setup-wizard.svg`, `public/wizard-bg.svg`
  - Changes:
  - Replaced centered-card wizard with split-canvas asymmetric layout.
  - Added display/eyebrow/lead copy and refined wordmark treatment with rule detail.
  - Added right-panel reference visual (`setup-wizard.svg`) and top-right craft artwork overlay (`wizard-bg.svg`, 12% opacity).
  - Added staggered entry motion (`wizard-rise`, 60ms increments) with `prefers-reduced-motion` collapse.
  - Added footer micro-text and retained keyboard-first Enter-to-start behavior.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase E.1–E.4: TopBar polish**
  - Files: `src/components/topbar/TopBar.tsx`, `src/components/topbar/EditableTitle.tsx`
  - Changes:
  - Consolidated separator treatment from many small dividers down to two structural dividers and increased control-group spacing.
  - Demoted Print to ghost-level treatment to reduce visual competition.
  - Refined wordmark tracking and added keyboard-focus underline affordance for editable project title.
  - Added inner-top highlight to New Task button and tightened mono keycap badge styling.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.1: critical path rail + dim calibration**
  - Files: `src/components/gantt/GanttBar.tsx`
  - Changes: added 3px critical left rail and tuned non-critical dim state to 60% opacity for clearer context retention.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.2: Today line pill labeling**
  - Files: `src/components/gantt/GanttGrid.tsx`
  - Changes: updated today pill to explicit `TODAY · <DAY DATE>` format in uppercase.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.3: header tier weight differentiation**
  - Files: `src/components/gantt/GanttHeader.tsx`
  - Changes: strengthened primary tier emphasis and softened secondary tier with distinct surface/background and ink hierarchy.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.4: baseline ghost stripe refinement**
  - Files: `src/components/gantt/BaselineGhostBars.tsx`
  - Changes: adjusted stripe angle from 45° to 30° and added subtle outline for baseline/live separation.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.5: dependency arrow refinement**
  - Files: `src/components/gantt/DependencyArrows.tsx`
  - Changes: set standard arrows to 1px and critical arrows to 1.5px, with critical color unified to `--data-negative`.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.6: milestone completion-state styling**
  - Files: `src/components/gantt/GanttBar.tsx`
  - Changes: added milestone fill/outline semantics for complete, at-risk, delayed, and default states.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase F.7–F.8: iconized gantt control pills**
  - Files: `src/components/gantt/Gantt.tsx`
  - Changes: converted ghost-style toggle to icon-based segmented control and replaced zoom +/- glyphs with Phosphor icons plus explicit `Zoom · <mode>` label.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase G.1: WBS column width normalization**
  - Files: `src/components/task-list/TaskList.tsx`
  - Changes: standardized WBS column width to 24px for consistent alignment.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase G.2: float column signed/tabular formatting**
  - Files: `src/components/task-list/TaskList.tsx`
  - Changes: enforced explicit `+/-` formatting and tabular numeral alignment in float values.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase G.3: party tint token usage confirmed**
  - Files: none (no source edit required)
  - Changes: validated existing `color-mix` party tint implementation already matched v1.2 requirement.
  - Verification: covered by subsequent full local gate run.

- **2026-05-22 — Phase G.4: TaskList hover surface correction**
  - Files: `src/components/task-list/TaskList.tsx`, `src/styles/app.css`
  - Changes: non-selected task-row hover now uses `--surface-sunken` via scoped row class/data attribute.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

- **2026-05-22 — Phase H.1–H.4: SidePanel & ActualDates polish milestone**
  - Files: `src/components/panels/SidePanel.tsx`, `src/components/panels/ActualDatesSection.tsx`, `src/styles/app.css`
  - Changes:
  - Added 32px `--rule-soft` section rules ahead of SidePanel section headers.
  - Added progress slider drag tooltip chip (`%`) with mono styling.
  - Added `CalendarBlank` date-input prefixes for planned and actual dates; added start/finish variance display in Actual Dates.
  - Tightened dependency preview chips with recessed surface + subtle rule border/padding tuning.
  - Verification: full local gate run passed (lint, type-check, unit, build, e2e).

---

**Last updated:** 2026-05-22
**Status:** Active — Phase H complete (HK-1..HK-3 + A.1..A.5 + B.1..B.5 + C.1..C.5 + D.1..D.6 + E.1..E.4 + F.1..F.8 + G.1..G.4 + H.1..H.4 landed locally)
