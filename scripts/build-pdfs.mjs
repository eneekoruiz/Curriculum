// Pre-renders the CV as a one-page A4 PDF in every language and checks it is ATS-safe.
//
//   node build-pdfs.mjs          → writes pdf/Eneko_Ruiz_CV_XX.pdf (all languages) and print-zoom.js
//   node build-pdfs.mjs --check  → fails if the PDFs were built from older sources (someone forgot to
//                                  rebuild), if a committed PDF breaks an ATS rule, or if a fresh
//                                  render in this browser breaks one
//
// Staleness is judged on the sources (a hash of the files the PDFs are made from), not on the PDF
// bytes or text: those shift slightly between Chromium versions without any content change.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { ROOT, PRINT_VIEWPORT, loadTranslations, pdfPath, startServer, launch, pdfText } from './lib.mjs';

const CHECK = process.argv.includes('--check');
const { T, M, langs } = loadTranslations();

/** Files the PDFs are rendered from; any change to them requires a rebuild. */
const SOURCES = ['index.html', 'print.css', 'translations.js', 'index.js'];
const sourceHash = () => {
  const hash = createHash('sha1');
  // Normalise line endings: Windows checkouts use CRLF, CI (Linux) uses LF; the hash must not depend on it.
  for (const file of SOURCES) hash.update(file).update(readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n'));
  return hash.digest('hex').slice(0, 12);
};

/** Renders the PDF, shrinking 1% at a time until it really is one page in this browser. */
async function renderOnePage(page) {
  let zoom = await page.evaluate(() => window.fitPrintToOnePage());
  for (;;) {
    const buffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    if ((await pdfText(buffer)).pages === 1 || zoom <= 0.8) return { buffer, zoom };
    zoom = Math.round((zoom - 0.01) * 100) / 100;
    await page.evaluate(z => { document.querySelector('.wrapper').style.zoom = String(z); }, zoom);
  }
}

const KEYWORDS = ['Software Engineer', 'Full Stack', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js',
  'PostgreSQL', 'Supabase', 'Firebase', 'Git', 'UPV/EHU', 'English C1', 'Basque C1'];

/** The rules a PDF must meet for ATS parsers. Returns a list of failures. */
function atsProblems(lang, { pages, text }) {
  const problems = [];
  const at = (s, from = 0) => text.indexOf(s, from);
  if (pages !== 1) problems.push(`${pages} pages (must be 1)`);
  if (M[lang].dir === 'ltr' && !text.trim().startsWith('Eneko Ruiz Mollón')) problems.push('name is not the first line');
  // Education → languages → experience → projects (the section order of the page)
  const order = [at('UPV/EHU')];
  // Project titles are translated, so the first and last project are found by their stack
  order.push(at('C1', order[0]), at('SST PRO DYNAMICS'), at('Resend'), at('Capacitor'));
  if (order.some(i => i < 0) || order.some((i, n) => n && i <= order[n - 1])) problems.push(`reading order broken ${JSON.stringify(order)}`);
  if (/[ﬀ-ﬆ]/.test(text)) problems.push('contains ligature glyphs (ﬁ/ﬂ…) that break keyword search');
  for (const needle of ['eneekoruiz@gmail.com', '+34 600 02 51 61', 'linkedin.com/in/eneko-ruiz-421254410', 'github.com/eneekoruiz']) {
    if (!text.includes(needle)) problems.push(`missing "${needle}"`);
  }
  return problems;
}

async function withMetadata(buffer, lang, title) {
  const doc = await PDFDocument.load(buffer);
  doc.setTitle(title);
  doc.setAuthor('Eneko Ruiz Mollón');
  doc.setSubject(T[lang].meta_desc);
  doc.setKeywords(KEYWORDS);
  doc.setLanguage(lang);
  doc.setCreator('eneko-cv build-pdfs');
  return Buffer.from(await doc.save());
}

const { server, origin } = await startServer();
const { browser, context } = await launch({ viewport: PRINT_VIEWPORT });
const zooms = {};
const failures = [];
const committedSource = (() => {
  try {
    return /PDF_SOURCE = '([0-9a-f]+)'/.exec(readFileSync(join(ROOT, 'print-zoom.js'), 'utf8'))?.[1];
  } catch {
    return undefined;
  }
})();

if (CHECK && committedSource !== sourceHash()) {
  failures.push('sources');
  console.log('✗ PDFs are out of date with index.html / print.css / translations.js / index.js: run `npm run build` in scripts/ and commit pdf/ and print-zoom.js');
}

try {
  if (!CHECK) await mkdir(join(ROOT, 'pdf'), { recursive: true });
  for (const lang of langs) {
    const page = await context.newPage();
    await page.goto(`${origin}/?pdf=1&lang=${lang}&theme=light`, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const title = await page.title();
    const { buffer: raw, zoom } = await renderOnePage(page);
    zooms[lang] = zoom;
    await page.close();

    const pdf = await withMetadata(raw, lang, title);
    const problems = atsProblems(lang, await pdfText(pdf)).map(p => `render: ${p}`);

    if (CHECK) {
      const committed = pdfPath(lang);
      if (!existsSync(committed)) {
        problems.push(`missing ${committed.replace(ROOT, '')}`);
      } else {
        problems.push(...atsProblems(lang, await pdfText(await readFile(committed))).map(p => `committed: ${p}`));
      }
    } else {
      await writeFile(pdfPath(lang), pdf);
    }

    console.log(`${lang}  zoom ${zooms[lang].toFixed(2)}  ${problems.length ? '✗ ' + problems.join('; ') : '✓'}`);
    if (problems.length) failures.push(lang);
  }

  if (!CHECK) {
    await writeFile(join(ROOT, 'print-zoom.js'),
      '// Generated by scripts/build-pdfs.mjs — do not edit.\n' +
      '// PRINT_ZOOM: per-language scale that keeps the printed CV on one A4 page.\n' +
      '// PDF_SOURCE: hash of the files the PDFs were built from (CI checks it is current).\n' +
      '// PDF_VERSION: cache-busting version for the PDF downloads.\n' +
      `window.PRINT_ZOOM = ${JSON.stringify(zooms)};\n` +
      `window.PDF_SOURCE = '${sourceHash()}';\n` +
      `window.PDF_VERSION = '${sourceHash()}';\n`);
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\nATS/PDF checks failed for: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`\nAll ${langs.length} languages OK${CHECK ? '' : ' — PDFs written to pdf/'}.`);
