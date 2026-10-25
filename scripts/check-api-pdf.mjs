// Runs the PDF fallback (api/pdf.js) exactly as Vercel does: its own Chromium (@sparticuz/chromium) driven by
// puppeteer-core, rendering this site. Nothing else exercises it, and Dependabot updates those two packages,
// so a bad upgrade would break the fallback silently.
// It needs Linux (the bundled Chromium is a Linux binary), so it runs in CI and is skipped on macOS/Windows.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, VARIANTS, variantName, startServer, pdfText } from './lib.mjs';

if (process.platform !== 'linux' && !process.env.CV_API_CHECK) {
  console.log('api/pdf: skipped here (it runs Vercel\'s Linux Chromium); CI runs it. Set CV_API_CHECK=1 to force.');
  process.exit(0);
}
if (!existsSync(join(ROOT, 'node_modules', '@sparticuz'))) {
  console.error('✗ api/pdf: the root dependencies are missing. Run `npm ci --ignore-scripts` in the repository root first.');
  process.exit(1);
}

const handler = createRequire(import.meta.url)(join(ROOT, 'api', 'pdf.js'));
const { server, origin } = await startServer();
process.env.CV_SITE_ORIGIN = origin;
const { port } = new URL(origin);
const failures = [];

for (const lang of ['es', 'en', 'ru']) {
 for (const variant of VARIANTS) {
  const label = `${lang}${variantName(variant)}`;
  const response = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = JSON.stringify(body); }, end(body) { this.body = body; } };
  const started = Date.now();
  await handler({ method: 'GET', query: { lang, photo: variant.photo ? '1' : '0', letter: variant.letter ? '1' : '0' }, headers: { host: `127.0.0.1:${port}`, 'x-forwarded-proto': 'http' } }, response);
  if (response.code !== 200 || !Buffer.isBuffer(response.body)) {
    failures.push(`${label}: status ${response.code} ${String(response.body).slice(0, 120)}`);
    continue;
  }
  const { pages, text } = await pdfText(response.body);
  if (response.headers['Content-Type'] !== 'application/pdf') failures.push(`${label}: wrong content type ${response.headers['Content-Type']}`);
  const expectedPages = variant.letter ? 2 : 1;
  if (pages !== expectedPages) failures.push(`${label}: ${pages} pages (must be ${expectedPages})`);
  if (!text.trim().startsWith('Eneko Ruiz Mollón')) failures.push(`${label}: the name is not the first line`);
  if (text.split('eneekoruiz@gmail.com').length - 1 !== expectedPages) failures.push(`${label}: letter missing or present though not chosen`);
  for (const needle of ['eneekoruiz@gmail.com', 'linkedin.com/in/eneko-ruiz-421254410', 'Capacitor']) {
    if (!text.includes(needle)) failures.push(`${label}: missing "${needle}"`);
  }
  console.log(`api/pdf ${label}: ${response.body.length} bytes, ${pages} page(s), ${Date.now() - started} ms`);
 }
}

server.close();
if (failures.length) {
  console.log(failures.map(f => `✗ ${f}`).join('\n'));
  console.error(`\n${failures.length} api/pdf problem(s)`);
  process.exit(1);
}
console.log('\nAll api/pdf checks OK.');
process.exit(0); // the function keeps a warm browser open on purpose
