import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'scripts/500-tasks.json'), 'utf8'));
const tasks = fixture.tasks;

const palette = ['#378ADD','#8B5CF6','#F59E0B','#22C55E','#EF4444','#06B6D4','#EC4899','#10B981','#F97316','#6366F1','#14B8A6','#A855F7'];
const groups = Array.from(new Set(tasks.map((t) => t.group))).map((id, index) => ({ id, name: `Group ${index + 1}`, color: palette[index % palette.length] }));

const resources = Array.from({ length: 25 }, (_, i) => ({
  id: `res-${i + 1}`,
  name: `Resource ${i + 1}`,
  category: i % 5 === 0 ? 'equipment' : 'labor',
  unit: 'hours',
  capacity: 2,
  costRate: 85 + (i % 7) * 5,
  color: palette[i % palette.length],
}));

const assignments = [];
for (let i = 0; i < tasks.length; i += 1) {
  for (let k = 0; k < 3; k += 1) {
    const ridx = (i + k) % resources.length;
    assignments.push({
      id: `a-${i}-${k}`,
      taskId: tasks[i].id,
      resourceId: resources[ridx].id,
      quantity: 1.2,
      notes: '',
    });
  }
}

const linkedTasks = tasks.map((t, i) => ({
  ...t,
  status: i % 17 === 0 ? 'delayed' : i % 11 === 0 ? 'at_risk' : t.status,
  pct: i % 13 === 0 ? 40 : t.pct,
}));

const dependencies = [];
for (let i = 1; i < Math.min(linkedTasks.length, 220); i += 1) {
  dependencies.push({ fromId: linkedTasks[i - 1].id, toId: linkedTasks[i].id, type: 'FS', lag: 0 });
}

const state = {
  persistedSchemaVersion: 2,
  projectName: 'Perf Density Baseline',
  tasks: linkedTasks,
  groups,
  parties: [],
  notes: [],
  dependencies,
  collapsedGroups: [],
  baselines: [],
  workweek: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
  holidays: [],
  onboardingPhase: 'complete',
  ghostStyle: 'stripe',
  resources,
  assignments,
};

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isWorkday(dateStr, workweek) {
  const day = parseDate(dateStr).getDay();
  const map = [workweek.sun, workweek.mon, workweek.tue, workweek.wed, workweek.thu, workweek.fri, workweek.sat];
  return !!map[day];
}

function countWorkdays(s, e, workweek) {
  let cur = parseDate(s);
  const end = parseDate(e);
  let count = 0;
  while (cur <= end) {
    if (isWorkday(fmtDate(cur), workweek)) count += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function computeTaskCostsPerf(tasksInput, resourcesInput, assignmentsInput, workweek) {
  const rmap = new Map(resourcesInput.map((r) => [r.id, r]));
  const out = new Map();
  for (const task of tasksInput) {
    const duration = countWorkdays(task.s, task.e, workweek);
    let sum = 0;
    for (const a of assignmentsInput) {
      if (a.taskId !== task.id) continue;
      const r = rmap.get(a.resourceId);
      if (!r || a.quantity <= 0 || r.costRate < 0) continue;
      if (r.category === 'material') {
        sum += a.quantity * r.costRate;
      } else {
        sum += a.quantity * duration * r.costRate;
      }
    }
    out.set(task.id, sum);
  }
  return out;
}

function computeDemandPerf(resourceId, tasksInput, resourcesInput, assignmentsInput, workweek) {
  const r = resourcesInput.find((x) => x.id === resourceId);
  if (!r) return [];
  const tmap = new Map(tasksInput.map((t) => [t.id, t]));
  const min = tasksInput.reduce((a, b) => (a.s < b.s ? a : b)).s;
  const max = tasksInput.reduce((a, b) => (a.e > b.e ? a : b)).e;
  const points = [];
  let cur = parseDate(min);
  const end = parseDate(max);
  while (cur <= end) {
    const dayStr = fmtDate(cur);
    let demand = 0;
    for (const a of assignmentsInput) {
      if (a.resourceId !== resourceId || a.quantity <= 0) continue;
      const t = tmap.get(a.taskId);
      if (!t) continue;
      if (dayStr < t.s || dayStr > t.e) continue;
      if (!isWorkday(dayStr, workweek)) continue;
      const totalWorkdays = countWorkdays(t.s, t.e, workweek);
      const increment = r.category === 'material' ? (totalWorkdays > 0 ? a.quantity / totalWorkdays : 0) : a.quantity;
      demand += increment;
    }
    points.push({
      day: dayStr,
      demand,
      overAllocation: r.category === 'material' ? 0 : Math.max(0, demand - Math.max(0, r.capacity)),
    });
    cur.setDate(cur.getDate() + 1);
  }
  return points;
}

function sampleMs(fn, runs = 20) {
  const samples = [];
  for (let i = 0; i < runs; i += 1) {
    const t0 = performance.now();
    fn();
    samples.push(performance.now() - t0);
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return { mean, max: Math.max(...samples), min: Math.min(...samples), samples };
}

const costPerf = sampleMs(() => {
  const taskCosts = computeTaskCostsPerf(linkedTasks, resources, assignments, state.workweek);
  let total = 0;
  for (const value of taskCosts.values()) total += value;
  return total;
}, 30);

const demandPerf = sampleMs(() => {
  return computeDemandPerf(resources[12].id, linkedTasks, resources, assignments, state.workweek);
}, 30);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

await page.addInitScript((payload) => {
  localStorage.setItem('schedule-tool-v1', JSON.stringify(payload));
}, state);

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const statbarMetrics = await page.evaluate(() => {
  const bar = document.querySelector('.stat-bar');
  if (!bar) return null;
  const barRect = bar.getBoundingClientRect();
  const children = Array.from(bar.children);
  let maxRight = barRect.left;
  for (const child of children) {
    const rect = child.getBoundingClientRect();
    if (rect.width === 0 || getComputedStyle(child).display === 'none') continue;
    if (rect.right > maxRight) maxRight = rect.right;
  }
  const used = Math.max(0, maxRight - barRect.left);
  const density = (used / barRect.width) * 100;
  return { width: barRect.width, used, density };
});

const firstBar = page.locator("div[title='Task 1']").first();
await firstBar.waitFor({ timeout: 5000 });
const dragBox = await firstBar.boundingBox();
let dragFrame = { maxDelta: 0, avgDelta: 0, frames: 0 };
if (dragBox) {
  const frameProbe = page.evaluate(async () => {
    return await new Promise((resolve) => {
      const deltas = [];
      let last = performance.now();
      let stop = false;
      function tick(now) {
        deltas.push(now - last);
        last = now;
        if (!stop) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      setTimeout(() => {
        stop = true;
        const maxDelta = Math.max(...deltas);
        const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        resolve({ maxDelta, avgDelta, frames: deltas.length });
      }, 1200);
    });
  });

  await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + dragBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(dragBox.x + dragBox.width / 2 + 180, dragBox.y + dragBox.height / 2, { steps: 24 });
  await page.mouse.up();
  dragFrame = await frameProbe;
}

const screenshotPath = path.join(root, 'docs', 'v1.3-screenshots', 'statbar-1280.png');
fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
await page.screenshot({ path: screenshotPath, fullPage: false });

await browser.close();

const out = {
  timestamp: new Date().toISOString(),
  fixture: {
    tasks: linkedTasks.length,
    resources: resources.length,
    assignments: assignments.length,
  },
  costPerf,
  demandPerf,
  dragFrame,
  statbarMetrics,
  screenshotPath,
};

const outPath = path.join(root, 'test-results', 'qa', 'phase0-metrics.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));