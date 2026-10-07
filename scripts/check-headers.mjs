// Loads the page with the production security headers (vercel.json) and uses every control:
// a Content-Security-Policy violation (an inline style or script, a blocked font or image) only shows up
// in production otherwise, because the plain local server sends no headers.
import { readFile } from 'node:fs/promises';
import { startServer, productionHeaders, launch } from './lib.mjs';

const { server, origin } = await startServer({ headers: productionHeaders() });
const { browser, context } = await launch({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const problems = [];
page.on('console', message => {
  if (/Content Security Policy|Refused to/i.test(message.text())) problems.push(`CSP: ${message.text().slice(0, 200)}`);
  else if (message.type() === 'error' && !/fonts\.g/.test(message.location().url || '')) problems.push(`console error: ${message.text().slice(0, 160)}`);
});
page.on('pageerror', error => problems.push(`page error: ${error.message}`));
await page.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', event => window.__csp.push(`${event.violatedDirective} → ${event.blockedURI || 'inline'}`));
});

const reveal = () => page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
await page.goto(`${origin}/?lang=es`, { waitUntil: 'networkidle' });
await reveal();
await page.click('#lang-trigger');
await page.click('#lang-menu .lm-item:nth-child(2)');             // another language
await page.waitForTimeout(400);
await page.click('#theme-btn');                                    // theme switch (view transition)
await page.waitForTimeout(500);
await page.click('.contact-row[data-copy]');                       // copy-to-clipboard toast
await page.waitForTimeout(400);
if (!(await page.evaluate(() => !!document.querySelector('.copy-tip')))) problems.push('the copy toast did not appear');

const download = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
await page.click('#print-btn');                                    // PDF download + success toast
const file = await download;
if (!file) {
  problems.push('the PDF button did not download a file');
} else {
  const bytes = (await readFile(await file.path())).length;
  if (bytes < 20000) problems.push(`the downloaded PDF is only ${bytes} bytes`);
}
await page.waitForTimeout(600);
await page.click('#vcard-btn').catch(() => problems.push('the vCard button could not be clicked'));
await page.waitForTimeout(400);
for (const violation of new Set(await page.evaluate(() => window.__csp))) problems.push(`securitypolicyviolation: ${violation}`);

await browser.close();
server.close();
if (problems.length) {
  console.log(problems.map(p => `✗ ${p}`).join('\n'));
  console.error(`\n${problems.length} problem(s) under the production headers`);
  process.exit(1);
}
console.log('headers: no CSP violations or console errors while using language, theme, copy, PDF and vCard under the production headers.');
console.log('\nAll header checks OK.');
