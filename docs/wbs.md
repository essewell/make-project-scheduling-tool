# WBS Hierarchy Spec (v1.7)

## Purpose

v1.7 promotes WBS from a render-time cosmetic value to persisted schedule data. Every `Group` and `Task` carries a `wbsCode` and groups support nesting through `parentId`.

## Data Model

- `Task`
  - `wbsCode: string`
  - `actualCost: number`
- `Group`
  - `parentId: string | null`
  - `wbsCode: string`

## Code Generation Rules

- Top-level groups are numbered by array order: `1`, `2`, `3`, ...
- Child groups use dotted segments by sibling order under parent: `1.1`, `1.2`, `2.1`, ...
- Tasks inside a group append a final segment by task order in that group: `1.2.1`, `1.2.2`, ...
- Orphan groups (invalid `parentId`) are treated as top-level groups during code computation.

## Helper APIs

`src/lib/wbs.ts` provides:

- `computeWbsCodes(groups, tasks)`
- `walkGroupTree(groups)`
- `getGroupDepth(groupId, groups)`
- `getDescendantTaskIds(groupId, groups, tasks)`

## Rollups

`src/lib/rollups.ts` computes recursive group summary values:

- `taskCount`
- `completionPct`
- `totalCost`
- `resourceCount`

## Actual Cost

`src/lib/actualCost.ts` provides `computeTotalActualCost(tasks)` for EVM AC/CPI integration.

## Persistence Contract

Schema version is bumped to `4` in v1.7. Migration from v3 must:

1. Default `Group.parentId` to `null`.
2. Default `Task.actualCost` to `0`.
3. Recompute and stamp `wbsCode` for all groups/tasks.

The migration is additive and must remain round-trip safe.
