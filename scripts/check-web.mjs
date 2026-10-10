// Checks the live page in a real browser:
//  - every language has exactly the same translation keys and the HTML uses no missing key
//  - first screen: the profile is seen in full (12 viewports)
//  - no horizontal overflow on phones, no JavaScript errors
//  - the visitor's browser language is picked up (unsupported ones fall back to English)
//  - printing the live page (Ctrl+P) stays on one page with all sections
//  - the cover letter (web text in its dialog, paper text in the printout) and the PDF options (photo, letter):
//    the choice is remembered, the right pre-rendered variant downloads, Ctrl+P follows the choice
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, VARIANTS, variantName, loadTranslations, startServer, launch, pdfText } from './lib.mjs';

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

  // ── Cover letter + PDF options ──
  // (a fresh browser context each time: the chosen options are remembered in localStorage)
  for (const lang of ['es', 'en', 'ar']) {
    const fresh = await browser.newContext({ acceptDownloads: true });
    const page = await fresh.newPage();
    await page.setViewportSize({ width: 1366, height: 800 });
    await page.goto(`${origin}/?lang=${lang}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));

    // The web letter lives in a dialog and uses its own text, adapted to the screen
    await page.click('#letter-btn');
    const web = await page.evaluate(() => {
      const dialog = document.getElementById('letter-dialog');
      return { open: dialog.open, text: dialog.innerText };
    });
    if (!web.open) fail(`letter (${lang}): the dialog did not open`);
    if (!web.text.includes(T[lang].letter_p1.slice(0, 40))) fail(`letter (${lang}): web text missing`);
    if (!web.text.includes(T[lang].letter_web_p2.slice(0, 40))) fail(`letter (${lang}): the web version of the second paragraph is missing`);
    if (web.text.includes(T[lang].letter_print_p2.slice(-40))) fail(`letter (${lang}): the paper wording leaked into the web letter`);
    await page.keyboard.press('Escape');
    if (await page.evaluate(() => document.getElementById('letter-dialog').open)) fail(`letter (${lang}): Escape did not close the dialog`);

    // The paper text is its own copy, hidden on screen
    const paper = await page.evaluate(() => {
      const el = document.getElementById('letter-print');
      return { shown: getComputedStyle(el).display !== 'none', text: el.textContent };
    });
    if (paper.shown) fail(`letter (${lang}): the paper letter is visible on screen`);
    if (!paper.text.includes(T[lang].letter_print_p2.slice(-40))) fail(`letter (${lang}): paper text missing`);

    // Options dialog: defaults, remembered choice
    await page.click('#print-btn');
    const defaults = await page.evaluate(() => ({ photo: document.getElementById('opt-photo').checked, letter: document.getElementById('opt-letter').checked }));
    if (!defaults.photo || defaults.letter) fail(`PDF options (${lang}): defaults should be photo on, letter off`);
    await page.locator('label.opt-row:has(#opt-letter)').click();
    await page.locator('label.opt-row:has(#opt-photo)').click();
    const classes = await page.evaluate(() => [...document.documentElement.classList].filter(c => c.startsWith('opt-')).sort().join());
    if (classes !== 'opt-letter,opt-no-photo') fail(`PDF options (${lang}): classes after choosing are "${classes}"`);

    // The pre-rendered variant for that choice downloads
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#opt-download')]);
    const expectedName = `Eneko_Ruiz_CV_${lang.toUpperCase()}_Letter_NoPhoto.pdf`;
    if (download.suggestedFilename() !== expectedName) fail(`PDF options (${lang}): downloaded "${download.suggestedFilename()}", expected ${expectedName}`);
    const pdf = await pdfText(readFileSync(await download.path()));
    if (pdf.pages !== 2) fail(`PDF options (${lang}): the downloaded PDF has ${pdf.pages} pages, expected the letter + the CV`);

    // Reload: the choice is remembered, and Ctrl+P follows it
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
    const kept = await page.evaluate(() => [...document.documentElement.classList].filter(c => c.startsWith('opt-')).sort().join());
    if (kept !== 'opt-letter,opt-no-photo') fail(`PDF options (${lang}): the choice was not remembered (${kept})`);
    await fresh.close();
  }

  // Ctrl+P in every variant stays within its pages: the CV on one, the letter before it on another
  for (const lang of ['es', 'de', 'ru', 'ar']) {
    for (const variant of VARIANTS) {
      const fresh = await browser.newContext();
      const page = await fresh.newPage();
      await page.setViewportSize({ width: 1366, height: 800 });
      await page.goto(`${origin}/?lang=${lang}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
      await page.evaluate(({ photo, letter }) => {
        document.getElementById('print-btn').click();
        for (const [id, wanted] of [['opt-photo', photo], ['opt-letter', letter]]) {
          const box = document.getElementById(id);
          if (box.checked !== wanted) box.click();
        }
        document.getElementById('print-dialog').close();
        window.dispatchEvent(new Event('beforeprint'));
      }, variant);
      const { pages, text } = await pdfText(await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
      const expected = variant.letter ? 2 : 1;
      if (pages !== expected) fail(`Ctrl+P (${lang}${variantName(variant)}): ${pages} pages, expected ${expected}`);
      // The letter repeats the contact line in its header: the email shows up twice with it, once without
      const emails = text.split('eneekoruiz@gmail.com').length - 1;
      if (emails !== (variant.letter ? 2 : 1)) fail(`Ctrl+P (${lang}${variantName(variant)}): the email appears ${emails} times, so the letter is ${variant.letter ? 'missing' : 'present though not chosen'}`);
      await fresh.close();
    }
  }
  console.log('cover letter and PDF options checked');
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\n${failures.length} web check(s) failed`);
  process.exit(1);
}
console.log('\nAll web checks OK.');
