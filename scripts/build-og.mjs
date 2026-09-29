// Renders the social preview card (og.png, 1200×630) shown when the CV link is shared
// on LinkedIn, WhatsApp, Slack or email. Same fonts and palette as the CV.
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, launch } from './lib.mjs';

const CARD = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500;700&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    position: relative;
    padding: 72px 84px 64px;
    background: #fbf9f6;
    color: #0f172a;
    font-family: 'DM Sans', Arial, sans-serif;
    font-variant-numeric: lining-nums;
  }
  body::before { content: ''; position: absolute; inset: 0 0 auto; height: 6px; background: #b8894d; }
  .eyebrow { font-size: 22px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #9a6f35; }
  h1 { margin-top: 18px; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-size: 104px; line-height: .95; letter-spacing: -.01em; }
  .stack { margin-top: 22px; font-size: 30px; color: #334155; }
  .rule { margin: 42px 0 30px; height: 1px; background: #d9cdb8; }
  .facts { display: flex; gap: 0; }
  .fact { padding: 0 44px; border-left: 1px solid #d9cdb8; }
  .fact:first-child { padding-left: 0; border-left: 0; }
  .level { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 64px; line-height: .9; color: #9a6f35; font-feature-settings: "lnum" 1; }
  .label { margin-top: 8px; font-size: 22px; font-weight: 700; }
  .sub { margin-top: 2px; font-size: 19px; color: #64748b; }
  .degree { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 44px; line-height: 1.05; color: #0f172a; padding-top: 12px; }
  .url { position: absolute; right: 84px; bottom: 60px; font-size: 20px; color: #64748b; }
</style></head>
<body>
  <p class="eyebrow">Ingeniero de Software · Full Stack</p>
  <h1>Eneko Ruiz Mollón</h1>
  <div class="rule"></div>
  <div class="facts">
    <div class="fact"><p class="degree">UPV/EHU</p><p class="label">Ingeniería de Software</p><p class="sub">Grado oficial — 2027</p></div>
    <div class="fact"><p class="level">C1</p><p class="label">Inglés</p><p class="sub">Certificado Cambridge</p></div>
    <div class="fact"><p class="level">C1</p><p class="label">Euskera</p><p class="sub">Certificado HABE</p></div>
  </div>
  <p class="url">eneko-ruiz-curriculum.vercel.app</p>
</body></html>`;

const { browser, context } = await launch({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
try {
  const page = await context.newPage();
  await page.setContent(CARD, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await writeFile(join(ROOT, 'og.png'), await page.screenshot({ type: 'png' }));
  console.log('og.png written (1200×630)');
} finally {
  await browser.close();
}
