import fs from 'fs'
import { randomUUID } from 'crypto'

function randomDate(start: Date, end: Date) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return d.toISOString().slice(0, 10)
}

const tasks = []
const start = new Date()
const end = new Date()
end.setMonth(end.getMonth() + 6)

for (let i = 0; i < 500; i++) {
  const s = randomDate(start, end)
  const e = randomDate(new Date(s), end)
  tasks.push({
    id: randomUUID(),
    name: `Task ${i + 1}`,
    group: `group-${Math.floor(i / 10)}`,
    s,
    e,
    actualStart: null,
    actualFinish: null,
    pct: 0,
    status: 'not_started',
    party: null,
    notes: '',
    milestone: false,
    manualStatus: false,
    manualPct: false,
    deps: [],
  })
}

const out = { tasks }
fs.writeFileSync('scripts/500-tasks.json', JSON.stringify(out, null, 2))
console.log('Wrote scripts/500-tasks.json')
