// Renders the social preview card (og.png, 1200×630) shown when the CV link is shared
// on LinkedIn, WhatsApp, Slack or email.
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ROOT, launch } from './lib.mjs';

const CARD = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Manrope:wght@400..700&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    padding: 68px 76px 64px;
    background: #090d16;
    color: #f1f5f9;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Decorative background aura and subtle grid */
  .bg-glow-1 {
    position: absolute;
    top: -120px;
    right: -80px;
    width: 580px;
    height: 580px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(37, 99, 235, 0.05) 45%, transparent 70%);
    pointer-events: none;
  }
  .bg-glow-2 {
    position: absolute;
    bottom: -140px;
    left: 80px;
    width: 540px;
    height: 540px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.10) 0%, transparent 65%);
    pointer-events: none;
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* Header Section */
  .header {
    position: relative;
    z-index: 2;
  }
  .badge-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .role-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: rgba(56, 189, 248, 0.08);
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 9999px;
    font-size: 13.5px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #38bdf8;
  }
  .role-pill .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 10px #38bdf8;
  }
  .status-tag {
    font-size: 14px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.02em;
  }

  h1 {
    margin-top: 18px;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 700;
    font-size: 78px;
    line-height: 1.0;
    letter-spacing: -0.025em;
    color: #ffffff;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
  }
  .subtitle {
    margin-top: 14px;
    font-size: 21px;
    line-height: 1.4;
    color: #94a3b8;
    max-width: 980px;
    font-weight: 400;
  }
  .subtitle strong {
    color: #e2e8f0;
    font-weight: 600;
  }

  /* Cards Section (Grid 3 columns) */
  .cards-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }
  .card {
    position: relative;
    padding: 26px 26px 24px;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 28px;
    right: 28px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
  }
  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .card-tag {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
  }
  .card-accent-pill {
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .pill-edu {
    background: rgba(99, 102, 241, 0.14);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  .pill-lang {
    background: rgba(16, 185, 129, 0.14);
    color: #6ee7b7;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .pill-tech {
    background: rgba(56, 189, 248, 0.14);
    color: #7dd3fc;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  .card-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.15;
    color: #f8fafc;
    letter-spacing: -0.01em;
  }
  .card-desc {
    margin-top: 6px;
    font-size: 15.5px;
    line-height: 1.4;
    color: #cbd5e1;
    font-weight: 500;
  }
  .card-meta {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 13.5px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style></head>
<body>
  <div class="grid-pattern"></div>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>

  <div class="header">
    <div class="badge-row">
      <div class="role-pill">
        <span class="dot"></span>
        <span>Ingeniero de Software</span>
      </div>
      <span class="status-tag">Full Stack & DevOps · Rentería (Gipuzkoa)</span>
    </div>
    <h1>Eneko Ruiz Mollón</h1>
    <p class="subtitle">
      Desarrollo de aplicaciones web con <strong>React, TypeScript y Node.js</strong>, despliegues en contenedores <strong>Docker</strong> y automatización de pipelines mediante <strong>CI/CD</strong>.
    </p>
  </div>

  <div class="cards-grid">
    <div class="card">
      <div>
        <div class="card-top">
          <span class="card-tag">Titulación Oficial</span>
          <span class="card-accent-pill pill-edu">UPV/EHU · 2027</span>
        </div>
        <div class="card-title">Ingeniería del Software</div>
        <div class="card-desc">Grado en Ingeniería Informática con mención específica en software.</div>
      </div>
      <div class="card-meta">Universidad del País Vasco</div>
    </div>

    <div class="card">
      <div>
        <div class="card-top">
          <span class="card-tag">Idiomas Certificados</span>
          <span class="card-accent-pill pill-lang">C1 Avanzado</span>
        </div>
        <div class="card-title">Inglés & Euskera</div>
        <div class="card-desc">Cambridge English C1 · HABE C1 con competencia profesional completa.</div>
      </div>
      <div class="card-meta">Certificaciones oficiales acreditadas</div>
    </div>

    <div class="card">
      <div>
        <div class="card-top">
          <span class="card-tag">Plataforma Web</span>
          <span class="card-accent-pill pill-tech">Accesible & Global</span>
        </div>
        <div class="card-title">23 Idiomas & PDFs</div>
        <div class="card-desc">Currículum interactivo internacional adaptado a estándares WCAG 2.2 AA.</div>
      </div>
      <div class="card-meta">Exportación PDF y carta integrada</div>
    </div>
  </div>
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
