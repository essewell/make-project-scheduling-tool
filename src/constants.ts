export const STORAGE_KEY             = 'schedule-tool-v1'

// Layout
export const ROW_HEIGHT              = 36   // px — task row + gantt row height
export const TASK_LIST_WIDTH         = 490  // px — fixed left pane width
export const SIDE_PANEL_WIDTH        = 360  // px — right pane when open
export const TOPBAR_HEIGHT           = 52   // px
export const STAT_BAR_HEIGHT         = 32   // px
export const FILTER_BAR_HEIGHT       = 44   // px
export const GANTT_HEADER_HEIGHT     = 64   // px — sticky two-tier header
export const HISTOGRAM_HEIGHT        = 140  // px
export const HISTOGRAM_PAD_X         = 8    // px
export const HISTOGRAM_BAR_GAP       = 1    // px

// Gantt bars
export const BAR_HEIGHT              = 20   // px — main bar height
export const GHOST_BAR_HEIGHT        = 8    // px — baseline ghost bar height
export const MIN_BAR_PX              = 3    // px — minimum rendered bar width
export const MILESTONE_SIZE          = 16   // px — rotated square diamond

// Timeline padding
export const TIMELINE_PAD_BEFORE     = 14   // days before first task start
export const TIMELINE_PAD_AFTER      = 21   // days after last task end

// Undo
export const UNDO_STACK_MAX          = 20

// Toast
export const TOAST_DURATION_MS       = 5000

// Print
export const PRINT_SCALE             = 0.55
export const PRINT_DAY_PX_BASE       = 4
export const A3_W                    = 1587  // px at 96dpi
export const A3_H                    = 1122
export const PRINT_TL_W              = 220   // task list column width in print
export const PRINT_ROW_H             = 20    // row height in print
export const PRINT_HDR_H             = 36    // header height in print

// Variance label
export const SLIP_LABEL_THRESHOLD    = 3     // days — min slip to show variance badge

// Mobile bottom sheet
export const SHEET_DISMISS_VELOCITY  = 0.5   // px/ms
export const SHEET_DISMISS_DELTA     = 80    // px
export const SHEET_TAP_THRESHOLD     = 12    // px — drag below this = tap
export const SHEET_PEEK_HEIGHT       = '40vh'
export const SHEET_FULL_HEIGHT       = '85vh'

// Onboarding timing
export const GANTT_PULSE_DURATION_MS = 3200
export const BASELINE_TIP_DELAY_MS   = 900

// Animations
export const PRINT_LOADING_DELAY_MS  = 800
export const COMPLETION_FLASH_MS     = 600

// Phase/party color palette (12 colors, cycled)
export const GROUP_PALETTE = [
  '#378ADD', '#7F77DD', '#EF9F27', '#1D9E75',
  '#D85A30', '#B07012', '#E24B4A', '#185FA5',
  '#5E9120', '#C24E78', '#7C7B73', '#3AACB8',
] as const

// Zoom levels
export const ZOOM_LEVELS = [
  { label: 'Day',     dayPx: 40 },
  { label: 'Week',    dayPx: 16 },
  { label: 'Month',   dayPx: 5  },
  { label: 'Quarter', dayPx: 2  },
  { label: 'Year',    dayPx: 0.5 },
] as const

export const DEFAULT_ZOOM_INDEX = 1  // Week

export const LARGE_TASK_THRESHOLD = 500  // task count above which loading bar appears
export const RESOURCE_MAX_PER_PROJECT = 200
export const MAX_OVERLAY_RESOURCES = 4

// Schedule quality
export const EXCESSIVE_LAG_RATIO = 0.5
export const HEALTH_GREEN_THRESHOLD = 80
export const HEALTH_AMBER_THRESHOLD = 60
export const HEALTH_WEIGHTS = {
  logic: 0.3,
  resource: 0.25,
  baseline: 0.2,
  float: 0.15,
  completeness: 0.1,
} as const
