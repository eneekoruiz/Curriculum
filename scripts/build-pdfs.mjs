// Pre-renders the CV as a one-page A4 PDF in every language and checks it is ATS-safe.
//
//   node build-pdfs.mjs          → writes pdf/Eneko_Ruiz_CV_XX[_Letter][_NoPhoto].pdf (every language, the four
//                                  variants of the download dialog) and print-zoom.js
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
import { ROOT, PRINT_VIEWPORT, VARIANTS, variantName, loadTranslations, pdfPath, startServer, launch, pdfText } from './lib.mjs';

const CHECK = process.argv.includes('--check');
const { T, M, langs } = loadTranslations();

/** Files the PDFs are rendered from; any change to them requires a rebuild. */
const SOURCES = ['index.html', 'print.css', 'translations.js', 'index.js', 'foto-small.jpg'];
const sourceHash = () => {
  const hash = createHash('sha1');
  // Normalise line endings of the text files: Windows checkouts use CRLF, CI (Linux) uses LF; the hash must not depend on it.
  for (const file of SOURCES) {
    const bytes = readFileSync(join(ROOT, file));
    hash.update(file).update(file.endsWith('.jpg') ? bytes : bytes.toString('utf8').replace(/\r\n/g, '\n'));
  }
  return hash.digest('hex').slice(0, 12);
};

/** The role line's font size when the page fit had to shrink it to stay on one line (px), else null. */
const roleSize = (page) => page.evaluate(() => parseFloat(document.querySelector('.header-id .eyebrow').style.fontSize) || null);

/** True if the role line is split over several lines in the current layout. */
const roleWraps = (page) => page.evaluate(() => {
  const role = document.querySelector('.header-id .eyebrow');
  const zoom = parseFloat(document.querySelector('.wrapper').style.zoom) || 1;
  const lineHeight = (parseFloat(getComputedStyle(role).lineHeight) || parseFloat(getComputedStyle(role).fontSize) * 1.3) * zoom;
  return role.getBoundingClientRect().height > lineHeight * 1.5;
});

/** Puts the page in one of the four variants and fits it. Resets what the previous variant left behind. */
async function setVariant(page, { photo, letter }) {
  await page.evaluate(({ photo, letter }) => {
    document.documentElement.classList.toggle('opt-no-photo', !photo);
    document.documentElement.classList.toggle('opt-letter', letter);
  }, { photo, letter });
}

/** The letter's own zoom (null when it needed none or is not shown). */
const letterZoom = (page) => page.evaluate(() => parseFloat(document.getElementById('letter-print').style.zoom) || null);

/** Renders the PDF, shrinking 1% at a time until it really has the expected pages in this browser (CV = 1, + letter = 2). */
async function renderOnePage(page, { letter }) {
  const expectedPages = letter ? 2 : 1;
  let zoom = await page.evaluate(() => window.fitPrintToOnePage());
  for (;;) {
    const buffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    if ((await pdfText(buffer)).pages === expectedPages || zoom <= 0.8) {
      return { buffer, zoom, role: await roleSize(page), roleWrapped: await roleWraps(page), letterZoom: letter ? await letterZoom(page) : null };
    }
    zoom = Math.round((zoom - 0.01) * 100) / 100;
    await page.evaluate(z => { document.querySelector('.wrapper').style.zoom = String(z); window.fitRoleLine(); }, zoom);
  }
}

const KEYWORDS = ['Software Engineer', 'Full Stack', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Next.js',
  'PostgreSQL', 'Supabase', 'Firebase', 'Git', 'UPV/EHU', 'English C1', 'Basque C1'];

/** The rules a PDF must meet for ATS parsers. Returns a list of failures. */
function atsProblems(lang, { pages, text: fullText }, { letter }) {
  const problems = [];
  const expectedPages = letter ? 2 : 1;
  if (pages !== expectedPages) problems.push(`${pages} pages (must be ${expectedPages})`);
  if (M[lang].dir === 'ltr' && !fullText.trim().startsWith('Eneko Ruiz Mollón')) problems.push('name is not the first line');
  // The cover letter is its own page before the CV and repeats the contact line in its header, so the email
  // appears twice with a letter and once without (independent of language and script); the CV's reading order is judged from its own start
  const email = 'eneekoruiz@gmail.com';
  const emails = fullText.split(email).length - 1;
  if (letter && emails < 2) problems.push('cover letter missing');
  if (!letter && emails > 1) problems.push('cover letter present but not asked for');
  const cvStart = letter ? fullText.indexOf(email, fullText.indexOf(email) + 1) : 0;
  const text = cvStart > 0 ? fullText.slice(cvStart) : fullText;
  const at = (s, from = 0) => text.indexOf(s, from);
  // Education → languages → experience → projects (the section order of the page)
  const order = [at('UPV/EHU')];
  // Project titles are translated, so the first and last project are found by their stack
  order.push(at('C1', order[0]), at('SST PRO DYNAMICS'), at('Resend'), at('Capacitor'));
  if (order.some(i => i < 0) || order.some((i, n) => n && i <= order[n - 1])) problems.push(`reading order broken ${JSON.stringify(order)}`);
  if (/[ﬀ-ﬆ]/.test(fullText)) problems.push('contains ligature glyphs (ﬁ/ﬂ…) that break keyword search');
  for (const needle of ['eneekoruiz@gmail.com', '+34 600 02 51 61', 'linkedin.com/in/eneko-ruiz-421254410', 'github.com/eneekoruiz']) {
    if (!fullText.includes(needle)) problems.push(`missing "${needle}"`);
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
const fits = {};
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
  console.log('✗ PDFs are out of date with index.html / print.css / translations.js / index.js / foto-small.jpg: run `npm run build` in scripts/ and commit pdf/ and print-zoom.js');
}

try {
  if (!CHECK) await mkdir(join(ROOT, 'pdf'), { recursive: true });
  for (const lang of langs) {
    const page = await context.newPage();
    await page.goto(`${origin}/?pdf=1&lang=${lang}&theme=light`, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    const title = await page.title();
    const problems = [];
    const summary = [];
    fits[lang] = {};

    for (const variant of VARIANTS) {
      const name = variantName(variant) || 'base';
      await setVariant(page, variant);
      const { buffer: raw, zoom, role, roleWrapped, letterZoom: letterFit } = await renderOnePage(page, variant);
      // What Ctrl+P needs (print-zoom.js): the CV's scale per photo option, and the letter's own scale
      fits[lang][variant.photo ? 'photo' : 'nophoto'] = { zoom, role };
      if (variant.letter && variant.photo) fits[lang].letter = letterFit || 1;
      summary.push(`${zoom.toFixed(2)}${letterFit ? `/${letterFit.toFixed(2)}` : ''}`);

      const pdf = await withMetadata(raw, lang, title);
      const found = atsProblems(lang, await pdfText(pdf), variant).map(p => `render ${name}: ${p}`);
      if (roleWrapped) found.push(`render ${name}: the role line is split over two lines`);
      if (variant.letter && letterFit && letterFit < 0.8) found.push(`render ${name}: the letter had to shrink to ${letterFit}`);

      if (CHECK) {
        const committed = pdfPath(lang, variant);
        if (!existsSync(committed)) {
          found.push(`missing ${committed.replace(ROOT, '')}`);
        } else {
          found.push(...atsProblems(lang, await pdfText(await readFile(committed)), variant).map(p => `committed ${name}: ${p}`));
        }
      } else {
        await writeFile(pdfPath(lang, variant), pdf);
      }
      problems.push(...found);
    }
    await page.close();

    console.log(`${lang}  zoom ${summary.join(' · ')}  ${problems.length ? '✗ ' + problems.join('; ') : '✓'}`);
    if (problems.length) failures.push(lang);
  }

  if (!CHECK) {
    await writeFile(join(ROOT, 'print-zoom.js'),
      '// Generated by scripts/build-pdfs.mjs — do not edit.\n' +
      '// PRINT_FIT: per language, the scale that keeps the printed CV on one A4 page (with and without the photo;\n' +
      '//   "role" is the font size in px of the role line where it had to shrink to stay on one line) and the scale of the cover letter.\n' +
      '// PDF_SOURCE: hash of the files the PDFs were built from (CI checks it is current).\n' +
      '// PDF_VERSION: cache-busting version for the PDF downloads.\n' +
      `window.PRINT_FIT = ${JSON.stringify(fits)};\n` +
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
