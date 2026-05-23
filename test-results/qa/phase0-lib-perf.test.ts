import { describe, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { computeTaskCosts, computeProjectTotalCost } from '../../src/lib/cost'
import { computeResourceDemand } from '../../src/lib/resourceDemand'
import { buildTimeline } from '../../src/lib/timeline'
import type { PersistedState, Resource, ResourceAssignment, Task } from '../../src/types'

function sampleMs(fn: () => void, runs = 30) {
  const samples: number[] = []
  for (let i = 0; i < runs; i += 1) {
    const t0 = performance.now()
    fn()
    samples.push(performance.now() - t0)
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length
  return { mean, min: Math.min(...samples), max: Math.max(...samples), samples }
}

describe('phase0 perf metrics', () => {
  it('measures cost+demand recompute', () => {
    const root = process.cwd()
    const fixture = JSON.parse(fs.readFileSync(path.join(root, 'scripts/500-tasks.json'), 'utf8')) as { tasks: Task[] }

    const tasks = fixture.tasks
    const resources: Resource[] = Array.from({ length: 25 }, (_, i) => ({
      id: `res-${i + 1}`,
      name: `Resource ${i + 1}`,
      category: i % 5 === 0 ? 'equipment' : 'labor',
      unit: 'hours',
      capacity: 2,
      costRate: 85 + (i % 7) * 5,
      color: '#378ADD',
    }))

    const assignments: ResourceAssignment[] = []
    for (let i = 0; i < tasks.length; i += 1) {
      for (let k = 0; k < 3; k += 1) {
        const ridx = (i + k) % resources.length
        assignments.push({
          id: `a-${i}-${k}`,
          taskId: tasks[i]!.id,
          resourceId: resources[ridx]!.id,
          quantity: 1.2,
          notes: '',
        })
      }
    }

    const minDate = tasks.reduce((min, t) => (t.s < min ? t.s : min), tasks[0]!.s)
    const maxDate = tasks.reduce((max, t) => (t.e > max ? t.e : max), tasks[0]!.e)
    const timeline = buildTimeline(minDate, maxDate, 4)

    const state: PersistedState = {
      persistedSchemaVersion: 2,
      projectName: 'Perf',
      tasks,
      groups: [],
      parties: [],
      notes: [],
      dependencies: [],
      collapsedGroups: [],
      baselines: [],
      workweek: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
      holidays: [],
      onboardingPhase: 'complete',
      ghostStyle: 'stripe',
      resources,
      assignments,
    }

    const costPerf = sampleMs(() => {
      const taskCosts = computeTaskCosts(state.tasks, {
        resources: state.resources,
        assignments: state.assignments,
        workweek: state.workweek,
        holidays: state.holidays,
      })
      computeProjectTotalCost(taskCosts)
    })

    const demandPerf = sampleMs(() => {
      computeResourceDemand(state.resources[12]!.id, {
        tasks: state.tasks,
        assignments: state.assignments,
        resources: state.resources,
        timeline,
        workweek: state.workweek,
        holidays: state.holidays,
      })
    })

    const outPath = path.join(root, 'test-results', 'qa', 'phase0-lib-perf.json')
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      tasks: tasks.length,
      resources: resources.length,
      assignments: assignments.length,
      costPerf,
      demandPerf,
    }, null, 2))

    console.log(`COST_MEAN_MS=${costPerf.mean.toFixed(2)}`)
    console.log(`DEMAND_MEAN_MS=${demandPerf.mean.toFixed(2)}`)
  })
})
