import { startServer, launch } from './lib.mjs';
const out = '/tmp/claude-0/-home-user-Curriculum/4c45e7be-22b4-54fc-96b3-ead9844e5871/scratchpad';
const { server, origin } = await startServer();
const { browser, context } = await launch();
const sizes = [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[900,700],[820,1180],[768,1024],[700,900],[600,900],[480,800],[430,932],[390,844],[375,667],[360,640],[320,568]];
for (const lang of ['es','ar']) for (const [w,h] of sizes) {
  const page = await context.newPage();
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${origin}/?lang=${lang}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const btn = page.locator('#print-btn');
  if (!(await btn.isVisible())) { console.log(lang, w, 'button hidden'); await page.close(); continue; }
  await btn.hover();
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const p = document.querySelector('.pdf-preview'); const b = p.getBoundingClientRect();
    const cs = getComputedStyle(p);
    // ancestors that clip
    const clips = []; let el = p.parentElement;
    while (el && el !== document.documentElement) { const s = getComputedStyle(el); if (/(hidden|clip)/.test(s.overflow + s.overflowX + s.overflowY) || /paint|strict|content/.test(s.contain)) { const r = el.getBoundingClientRect(); clips.push(`${el.id||el.className}:${s.overflow}/${s.contain} ${Math.round(r.top)}-${Math.round(r.bottom)}`); } el = el.parentElement; }
    return { l: Math.round(b.left), r: Math.round(b.right), t: Math.round(b.top), bo: Math.round(b.bottom), op: cs.opacity, vis: cs.visibility, clips };
  });
  const off = r.l < 0 || r.r > w || r.bo > h;
  console.log(lang, `${w}x${h}`, JSON.stringify(r), off ? 'OFFSCREEN' : '');
  if (w === 390 || w === 1366) await page.screenshot({ path: `${out}/pv-${lang}-${w}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, 320) } });
  await page.close();
}
await browser.close(); server.close();
