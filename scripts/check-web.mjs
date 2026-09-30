// Checks the live page in a real browser:
//  - every language has exactly the same translation keys and the HTML uses no missing key
//  - first screen: the profile is seen in full (12 viewports)
//  - no horizontal overflow on phones, no JavaScript errors
//  - the visitor's browser language is picked up (unsupported ones fall back to English)
//  - printing the live page (Ctrl+P) stays on one page with all sections
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadTranslations, startServer, launch, pdfText } from './lib.mjs';

const failures = [];
const fail = (message) => { failures.push(message); console.log(`✗ ${message}`); };

// ── Translations ────────────────────────────────────────────────
const { T } = loadTranslations();
const reference = Object.keys(T.es).sort().join();
for (const [lang, copy] of Object.entries(T)) {
  if (Object.keys(copy).sort().join() !== reference) fail(`translations: "${lang}" keys differ from "es"`);
  for (const [key, value] of Object.entries(copy)) if (typeof value !== 'string' || !value.trim()) fail(`translations: ${lang}.${key} is empty`);
}
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
for (const key of new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]))) {
  if (!(key in T.es)) fail(`index.html uses missing key "${key}"`);
}
console.log(`translations: ${Object.keys(T).length} languages checked`);

// ── Browser checks ─────────────────────────────────────────────
const VIEWPORTS = [[1920, 1080], [1920, 890], [1536, 730], [1440, 800], [1366, 657], [1280, 640],
  [1024, 700], [768, 1024], [430, 932], [390, 844], [375, 667], [360, 640]];

const { server, origin } = await startServer();
const { browser, context } = await launch();
try {
  for (const [width, height] of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/?lang=es`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'), null, { timeout: 5000 });
    const m = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      return {
        profileBottom: box('.profile').bottom,
        wrapperWidth: box('.wrapper').width
      };
    });
    const label = `${width}x${height}`;
    if (m.profileBottom > height) fail(`${label}: profile cut by the fold (bottom ${Math.round(m.profileBottom)})`);
    if (m.wrapperWidth > width + 1) fail(`${label}: page wider than the viewport (${Math.round(m.wrapperWidth)}px)`);
    if (errors.length) fail(`${label}: JavaScript errors: ${errors.join(' | ')}`);
    await page.close();
  }
  console.log(`first screen: ${VIEWPORTS.length} viewports checked`);

  for (const [locale, expected] of [['fr-FR', 'fr'], ['de-DE', 'de'], ['fi-FI', 'en'], ['es-ES', 'es']]) {
    const ctx = await browser.newContext({ locale });
    const page = await ctx.newPage();
    await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    const lang = await page.evaluate(() => document.documentElement.lang);
    if (lang !== expected) fail(`browser language ${locale}: page opened in "${lang}", expected "${expected}"`);
    await ctx.close();
  }
  console.log('language detection checked');

  for (const lang of ['es', 'en', 'ru']) {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1366, height: 800 });
    await page.goto(`${origin}/?lang=${lang}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    const { pages, text } = await pdfText(await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
    if (pages !== 1) fail(`Ctrl+P (${lang}): ${pages} pages`);
    if (!text.includes('Capacitor') || !text.includes('UPV/EHU')) fail(`Ctrl+P (${lang}): sections missing from the printout`);
    await page.close();
  }
  console.log('browser printing (Ctrl+P) checked');
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\n${failures.length} web check(s) failed`);
  process.exit(1);
}
console.log('\nAll web checks OK.');
