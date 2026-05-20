import type { Group, Party, Task } from '../types'

// ─── Example project data — residential construction workflow ─────────────────

export const EXAMPLE_GROUPS: Group[] = [
  { id: 'g-site',     name: 'Site Preparation',  color: '#7C5CBF' },
  { id: 'g-found',   name: 'Foundation',          color: '#E0862A' },
  { id: 'g-frame',   name: 'Framing',             color: '#2E8B57' },
  { id: 'g-mep',     name: 'MEP Rough-In',        color: '#27aae1' },
  { id: 'g-finish',  name: 'Finishes',            color: '#BF3B2E' },
]

export const EXAMPLE_PARTIES: Party[] = [
  { id: 'p-gc',   name: 'General Contractor', abbr: 'GC',  color: '#1c3048' },
  { id: 'p-sub',  name: 'Civil Sub',          abbr: 'CV',  color: '#7C5CBF' },
  { id: 'p-conc', name: 'Concrete Sub',       abbr: 'CC',  color: '#E0862A' },
  { id: 'p-mep',  name: 'MEP Contractor',     abbr: 'MEP', color: '#27aae1' },
]

export const EXAMPLE_TASKS: Task[] = [
  // Site Preparation
  {
    id: 't-01', name: 'Site survey & stakeout',
    group: 'g-site', s: '2025-06-02', e: '2025-06-04',
    actualStart: '2025-06-02', actualFinish: '2025-06-04',
    pct: 100, status: 'complete',
    party: 'p-sub', notes: '', milestone: false, manualStatus: true, manualPct: true, deps: [],
  },
  {
    id: 't-02', name: 'Demolition & clearing',
    group: 'g-site', s: '2025-06-05', e: '2025-06-11',
    actualStart: '2025-06-05', actualFinish: '2025-06-11',
    pct: 100, status: 'complete',
    party: 'p-gc', notes: '', milestone: false, manualStatus: true, manualPct: true, deps: ['t-01'],
  },
  {
    id: 't-03', name: 'Earthworks & grading',
    group: 'g-site', s: '2025-06-12', e: '2025-06-20',
    actualStart: '2025-06-12', actualFinish: null,
    pct: 75, status: 'in_progress',
    party: 'p-sub', notes: '', milestone: false, manualStatus: true, manualPct: true, deps: ['t-02'],
  },
  // Foundation
  {
    id: 't-04', name: 'Footings excavation',
    group: 'g-found', s: '2025-06-18', e: '2025-06-23',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-conc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-03'],
  },
  {
    id: 't-05', name: 'Footing pour & cure',
    group: 'g-found', s: '2025-06-24', e: '2025-07-01',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-conc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-04'],
  },
  {
    id: 't-06', name: 'Foundation walls',
    group: 'g-found', s: '2025-07-02', e: '2025-07-11',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-conc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-05'],
  },
  {
    id: 't-07', name: 'Foundation complete',
    group: 'g-found', s: '2025-07-11', e: '2025-07-11',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: true, manualStatus: false, manualPct: false, deps: ['t-06'],
  },
  // Framing
  {
    id: 't-08', name: 'Floor system & subfloor',
    group: 'g-frame', s: '2025-07-14', e: '2025-07-21',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-07'],
  },
  {
    id: 't-09', name: 'Wall framing',
    group: 'g-frame', s: '2025-07-22', e: '2025-08-04',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-08'],
  },
  {
    id: 't-10', name: 'Roof framing & sheathing',
    group: 'g-frame', s: '2025-08-05', e: '2025-08-18',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-09'],
  },
  // MEP Rough-In
  {
    id: 't-11', name: 'Rough plumbing',
    group: 'g-mep', s: '2025-08-11', e: '2025-08-22',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-mep', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-09'],
  },
  {
    id: 't-12', name: 'Rough electrical',
    group: 'g-mep', s: '2025-08-14', e: '2025-08-25',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-mep', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-09'],
  },
  {
    id: 't-13', name: 'HVAC rough-in',
    group: 'g-mep', s: '2025-08-18', e: '2025-08-29',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-mep', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-09'],
  },
  // Finishes
  {
    id: 't-14', name: 'Insulation & drywall',
    group: 'g-finish', s: '2025-09-02', e: '2025-09-19',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-11', 't-12', 't-13'],
  },
  {
    id: 't-15', name: 'Paint & trim',
    group: 'g-finish', s: '2025-09-22', e: '2025-10-03',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: false, manualStatus: false, manualPct: false, deps: ['t-14'],
  },
  {
    id: 't-16', name: 'Substantial completion',
    group: 'g-finish', s: '2025-10-10', e: '2025-10-10',
    actualStart: null, actualFinish: null,
    pct: 0, status: 'not_started',
    party: 'p-gc', notes: '', milestone: true, manualStatus: false, manualPct: false, deps: ['t-15'],
  },
]
