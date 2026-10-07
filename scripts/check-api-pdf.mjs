// Runs the PDF fallback (api/pdf.js) exactly as Vercel does: its own Chromium (@sparticuz/chromium) driven by
// puppeteer-core, rendering this site. Nothing else exercises it, and Dependabot updates those two packages,
// so a bad upgrade would break the fallback silently.
// It needs Linux (the bundled Chromium is a Linux binary), so it runs in CI and is skipped on macOS/Windows.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, startServer, pdfText } from './lib.mjs';

if (process.platform !== 'linux' && !process.env.CV_API_CHECK) {
  console.log('api/pdf: skipped here (it runs Vercel\'s Linux Chromium); CI runs it. Set CV_API_CHECK=1 to force.');
  process.exit(0);
}
if (!existsSync(join(ROOT, 'node_modules', '@sparticuz'))) {
  console.error('✗ api/pdf: the root dependencies are missing. Run `npm install --ignore-scripts` in the repository root first.');
  process.exit(1);
}

const handler = createRequire(import.meta.url)(join(ROOT, 'api', 'pdf.js'));
const { server, origin } = await startServer();
const { port } = new URL(origin);
const failures = [];

for (const lang of ['es', 'en', 'ru']) {
  const response = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = JSON.stringify(body); }, end(body) { this.body = body; } };
  const started = Date.now();
  await handler({ method: 'GET', query: { lang }, headers: { host: `127.0.0.1:${port}`, 'x-forwarded-proto': 'http' } }, response);
  if (response.code !== 200 || !Buffer.isBuffer(response.body)) {
    failures.push(`${lang}: status ${response.code} ${String(response.body).slice(0, 120)}`);
    continue;
  }
  const { pages, text } = await pdfText(response.body);
  if (response.headers['Content-Type'] !== 'application/pdf') failures.push(`${lang}: wrong content type ${response.headers['Content-Type']}`);
  if (pages !== 1) failures.push(`${lang}: ${pages} pages (must be 1)`);
  if (!text.trim().startsWith('Eneko Ruiz Mollón')) failures.push(`${lang}: the name is not the first line`);
  for (const needle of ['eneekoruiz@gmail.com', 'linkedin.com/in/eneko-ruiz-421254410', 'Capacitor']) {
    if (!text.includes(needle)) failures.push(`${lang}: missing "${needle}"`);
  }
  console.log(`api/pdf ${lang}: ${response.body.length} bytes, ${pages} page, ${Date.now() - started} ms`);
}

server.close();
if (failures.length) {
  console.log(failures.map(f => `✗ ${f}`).join('\n'));
  console.error(`\n${failures.length} api/pdf problem(s)`);
  process.exit(1);
}
console.log('\nAll api/pdf checks OK.');
process.exit(0); // the function keeps a warm browser open on purpose
