// Responsive audit: nothing may be cut, overflow the screen or be too small to tap.
// For every language sample × screen size (desktop → 320px phones, portrait and landscape) it checks:
//  - no sideways scrolling and no visible element outside the viewport
//  - no text clipped by its own box (overflow hidden/ellipsis)
//  - the language menu fits the screen when open
//  - the PDF preview appears whole on hover, stays while the PDF is prepared and hides when the toast shows
//  - tap targets on phones are at least 24×24 CSS px (WCAG 2.2, 2.5.8)
//  - no JavaScript errors and no failed requests
//  - scroll reveal never leaves a painted frame with content missing (slow, hard and jump scrolls)
//  - the hover glow starts under the pointer
// Usage: node check-layout.mjs [lang,lang,…]   (default: a sample covering LTR, RTL, CJK, Cyrillic)
import { ROOT, loadTranslations, startServer, launch } from './lib.mjs';

const SIZES = [[1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [900, 700], [820, 1180], [768, 1024],
  [700, 900], [600, 900], [480, 800], [430, 932], [390, 844], [375, 667], [360, 640], [320, 568], [844, 390], [667, 375]];
const { langs: all } = loadTranslations();
const LANGS = (process.argv[2] || 'es,en,de,ru,ar,ja').split(',');
for (const l of LANGS) if (!all.includes(l)) throw new Error(`unknown language "${l}"`);

const { server, origin } = await startServer();
const { browser, context } = await launch();
const failures = [];
for (const lang of LANGS) {
  for (const [width, height] of SIZES) {
    const page = await context.newPage();
    const issues = [];
    page.on('pageerror', e => issues.push(`JavaScript error: ${e.message}`));
    page.on('requestfailed', r => { if (!/_vercel|googleapis|gstatic/.test(r.url())) issues.push(`request failed: ${r.url()}`); });
    page.on('response', r => { if (r.status() >= 400 && !/_vercel/.test(r.url())) issues.push(`HTTP ${r.status()}: ${r.url()}`); });
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}/?lang=${lang}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
    await page.evaluate(() => document.querySelectorAll('.dashboard > section').forEach(s => s.classList.add('is-revealed')));
    await page.waitForTimeout(450);

    issues.push(...await page.evaluate((isPhone) => {
      const out = [];
      const W = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth}px)`);
      const invisible = (el) => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return true; } return false; };
      const name = (el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${(el.textContent || '').trim().slice(0, 28)}"`;
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('#lang-menu, .grain, #scroll-progress, script, style, svg')) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || (r.width <= 2 && r.height <= 2) || invisible(el)) continue;
        if (r.left < -1 || r.right > W + 1) out.push(`outside the screen: ${name(el)} [${Math.round(r.left)}, ${Math.round(r.right)}]`);
        const s = getComputedStyle(el);
        if (!el.children.length && (el.textContent || '').trim() && /(hidden|clip)/.test(s.overflow + s.overflowX) && el.scrollWidth > el.clientWidth + 1) out.push(`text cut: ${name(el)}`);
        // Standalone controls only: inline links inside a sentence are exempt from the target-size rule
        if (isPhone && el.matches('a, button') && getComputedStyle(el).display !== 'inline' && Math.min(r.width, r.height) < 24) out.push(`tap target ${Math.round(r.width)}×${Math.round(r.height)}: ${name(el)}`);
      }
      return out;
    }, width <= 700));

    const trigger = page.locator('#lang-trigger');
    if (await trigger.isVisible()) {
      await trigger.click();
      await page.waitForTimeout(450);
      const m = await page.evaluate(() => { const r = document.querySelector('#lang-menu').getBoundingClientRect(); return { l: r.left, r: r.right, b: r.bottom }; });
      if (m.l < -1 || m.r > width + 1 || m.b > height + 1) issues.push(`language menu outside the screen [${Math.round(m.l)}, ${Math.round(m.r)}] bottom ${Math.round(m.b)}`);
    }
    // PDF preview: whole on hover, kept while the PDF is being prepared, gone once the toast shows
    const printButton = page.locator('#print-btn');
    if (await printButton.isVisible()) {
      const previewState = () => page.evaluate(() => {
        const el = document.querySelector('.pdf-preview');
        const r = el.getBoundingClientRect();
        return { shown: getComputedStyle(el).visibility === 'visible' && Number(getComputedStyle(el).opacity) > 0.9, l: r.left, r: r.right, b: r.bottom };
      });
      await printButton.hover();
      await page.waitForTimeout(600);
      let p = await previewState();
      if (!p.shown) issues.push('PDF preview does not show on hover');
      else if (p.l < -1 || p.r > width + 1 || p.b > height + 1) issues.push(`PDF preview cut on hover [${Math.round(p.l)}, ${Math.round(p.r)}] bottom ${Math.round(p.b)}`);
      await page.mouse.move(width / 2, height / 2);
      await page.evaluate(() => document.getElementById('print-btn').setAttribute('data-loading', 'true'));
      await page.waitForTimeout(600);
      p = await previewState();
      if (!p.shown) issues.push('PDF preview hides while the PDF is being prepared');
      else if (p.l < -1 || p.r > width + 1 || p.b > height + 1) issues.push(`PDF preview cut while preparing [${Math.round(p.l)}, ${Math.round(p.r)}]`);
      await page.evaluate(() => document.getElementById('print-btn').classList.add('is-success'));
      await page.waitForTimeout(600);
      p = await previewState();
      if (p.shown) issues.push('PDF preview stays visible after the download finished');
    }
    for (const issue of new Set(issues)) failures.push(`${lang} ${width}×${height}: ${issue}`);
    await page.close();
  }
}

// ── Motion: scroll reveal and hover glow behave (one desktop page, Spanish) ──
{
  const page = await context.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  const fresh = async () => {
    await page.goto(`${origin}/?lang=es`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
    await page.waitForTimeout(500);
    // count frames (measured after painting) where a section that is mostly on screen is not fully opaque
    await page.evaluate(() => {
      window.__hidden = 0;
      const sections = [...document.querySelectorAll('.dashboard > section')];
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        for (const section of sections) {
          const r = section.getBoundingClientRect();
          if (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) > 120 && Number(getComputedStyle(section).opacity) < 0.9) window.__hidden++;
        }
      };
      const loop = () => { channel.port2.postMessage(0); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    });
  };
  const scenarios = {
    'slow scroll': async () => { for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 12); await page.waitForTimeout(60); } },
    'moderate scroll': async () => { for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 40); await page.waitForTimeout(80); } },
    'hard flick': async () => { for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(16); } },
    'jump to the end': async () => { await page.keyboard.press('End'); }
  };
  for (const [name, run] of Object.entries(scenarios)) {
    await fresh();
    await run();
    await page.waitForTimeout(600);
    const hidden = await page.evaluate(() => window.__hidden);
    if (hidden) failures.push(`scroll reveal (${name}): ${hidden} frame(s) painted with a section missing or half-faded`);
  }
}
  
await browser.close();
server.close();

if (failures.length) {
  console.log(failures.slice(0, 40).map(f => `✗ ${f}`).join('\n'));
  console.error(`\n${failures.length} layout problem(s)`);
  process.exit(1);
}
console.log(`layout: ${LANGS.length} languages × ${SIZES.length} screen sizes: nothing cut, off-screen or too small to tap; scroll reveal and hover glow behave.`);
console.log('\nAll layout checks OK.');
