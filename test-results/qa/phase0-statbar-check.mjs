import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'scripts/500-tasks.json'), 'utf8'));
const tasks = fixture.tasks;
const groups = Array.from(new Set(tasks.map((t) => t.group))).map((id, i) => ({ id, name: `Group ${i+1}`, color: '#378ADD' }));
const resources = Array.from({ length: 25 }, (_, i) => ({ id:`res-${i+1}`, name:`R${i+1}`, category: i%5===0?'equipment':'labor', unit:'hours', capacity:2, costRate:100, color:'#378ADD'}));
const assignments = [];
for (let i=0;i<tasks.length;i++) for (let k=0;k<3;k++) assignments.push({id:`a-${i}-${k}`,taskId:tasks[i].id,resourceId:resources[(i+k)%resources.length].id,quantity:1.2,notes:''});
const deps=[]; for(let i=1;i<220;i++) deps.push({fromId:tasks[i-1].id,toId:tasks[i].id,type:'FS',lag:0});
const state = { persistedSchemaVersion:2,projectName:'Density',tasks:tasks.map((t,i)=>({...t,status:i%17===0?'delayed':i%11===0?'at_risk':t.status,pct:i%13===0?40:t.pct})),groups,parties:[],notes:[],dependencies:deps,collapsedGroups:[],baselines:[],workweek:{mon:true,tue:true,wed:true,thu:true,fri:true,sat:false,sun:false},holidays:[],onboardingPhase:'complete',ghostStyle:'stripe',resources,assignments};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
await page.addInitScript((payload)=>localStorage.setItem('schedule-tool-v1', JSON.stringify(payload)), state);
await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const metrics = await page.evaluate(() => {
  function contentWidth(el) {
    const style = getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    const children = Array.from(el.children).filter((child) => {
      const s = getComputedStyle(child);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
      const r = child.getBoundingClientRect();
      return r.width > 0;
    });
    const childWidth = children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
    const gapWidth = Math.max(0, children.length - 1) * gap;
    return childWidth + gapWidth;
  }

  const bar = document.querySelector('.stat-bar');
  const main = document.querySelector('.stat-bar-main');
  const side = document.querySelector('.stat-bar-side');
  if (!bar || !main || !side) return null;
  const barWidth = bar.getBoundingClientRect().width;
  const mainUsed = contentWidth(main);
  const sideUsed = contentWidth(side);
  return {
    barWidth,
    mainUsed,
    sideUsed,
    mainDensity: (mainUsed / barWidth) * 100,
    sideDensity: (sideUsed / barWidth) * 100,
    maxRowDensity: Math.max((mainUsed / barWidth) * 100, (sideUsed / barWidth) * 100),
  };
});

const screenshotPath = path.join(root, 'docs', 'v1.3-screenshots', 'statbar-1280.png');
await page.screenshot({ path: screenshotPath, fullPage: false });
await browser.close();

const outPath = path.join(root, 'test-results', 'qa', 'phase0-statbar-metrics.json');
fs.writeFileSync(outPath, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));