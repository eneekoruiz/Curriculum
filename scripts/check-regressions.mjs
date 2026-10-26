import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { ROOT, startServer, launch, loadTranslations } from './lib.mjs';

// Exercise the real handler without launching Linux Chromium on Windows.
const require = createRequire(import.meta.url);
const requests = [];
let destination;
let intercept;
let navigationStatus = 200;
const pdfPage = {
  setViewport: async () => {}, setCacheEnabled: async () => {}, setBypassServiceWorker: async () => {},
  setRequestInterception: async () => {}, setDefaultNavigationTimeout() {}, setDefaultTimeout() {},
  on(_event, listener) { intercept = listener; },
  goto: async (url) => { destination = url; return { status: () => navigationStatus }; },
  url: () => destination, emulateMediaType: async () => {}, evaluate: async () => {},
  pdf: async () => new Uint8Array(Buffer.from('%PDF-1.7\n/Type /Page\n')),
  close: async () => {}
};
const env = {};
const sandbox = {
  module: { exports: {} }, Buffer, URL, setTimeout, console: { error() {} }, process: { env },
  require(name) {
    if (name === '@sparticuz/chromium') return { default: { executablePath: async () => '/test/chromium', args: [] } };
    if (name === 'puppeteer-core') return { launch: async () => ({ connected: true, newPage: async () => pdfPage }) };
    return require(name);
  }
};
vm.runInNewContext(readFileSync(join(ROOT, 'api/pdf.js'), 'utf8'), sandbox);
const requestPdf = async () => {
  const response = { setHeader() {}, status(code) { this.code = code; return this; }, json() {}, end(body) { this.body = body; } };
  await sandbox.module.exports({ method: 'GET', query: {}, headers: {
    host: 'evil.example', 'x-forwarded-host': '127.0.0.1:1234', 'x-forwarded-proto': 'http'
  } }, response);
  return response;
};
const firstPdf = await requestPdf();
assert.equal(firstPdf.code, 200);
assert.ok(Buffer.isBuffer(firstPdf.body));
assert.equal(new URL(destination).origin, 'https://eneko-ruiz-curriculum.vercel.app');
for (const [url, allowed] of [
  [destination, true], ['https://fonts.googleapis.com/css2', true],
  ['https://fonts.gstatic.com/font.woff2', true], ['http://127.0.0.1/private', false],
  ['https://eneko-ruiz-curriculum.vercel.app.evil.example/', false]
]) {
  intercept({ url: () => url, abort() { requests.push(false); }, continue() { requests.push(true); } });
  assert.equal(requests.at(-1), allowed, url);
}
navigationStatus = 404;
assert.equal((await requestPdf()).code, 500);
navigationStatus = 200;
env.CV_SITE_ORIGIN = 'http://evil.example';
assert.equal((await requestPdf()).code, 500);
env.VERCEL_URL = 'preview.vercel.app';
assert.equal((await requestPdf()).code, 200);
assert.equal(new URL(destination).origin, 'https://preview.vercel.app');
console.log('PDF origin, redirect destinations, failed navigation and Uint8Array output checked');

const config = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
const pdfCache = config.headers.find(rule => rule.source === '/pdf/(.*)').headers.find(h => h.key === 'Cache-Control').value;
assert.match(pdfCache, /must-revalidate/);
assert.doesNotMatch(pdfCache, /immutable/);
assert.match(loadTranslations().T.es.letter_web_p2, /comprobaciones automáticas de accesibilidad/);
const missingPortrait = spawnSync(process.execPath, [join(ROOT, 'scripts/generate-headshot.mjs')], { encoding: 'utf8' });
assert.notEqual(missingPortrait.status, 0);
assert.match(missingPortrait.stderr, /Usage:/);
const portraitFiles = ['foto.webp', 'foto.jpg'].map(file => join(ROOT, file));
const portraitsBefore = portraitFiles.map(file => readFileSync(file));
const smallPortrait = spawnSync(process.execPath, [join(ROOT, 'scripts/generate-headshot.mjs'), join(ROOT, 'icon-192.png')], {
  encoding: 'utf8', timeout: 120000
});
assert.ifError(smallPortrait.error);
assert.notEqual(smallPortrait.status, 0);
assert.match(smallPortrait.stderr, /at least 744 × 885/);
portraitFiles.forEach((file, i) => assert.deepEqual(readFileSync(file), portraitsBefore[i]));

const { server, origin } = await startServer();
const { browser, context } = await launch();
try {
  const page = await context.newPage();
  await page.goto(`${origin}/?lang=es&keep=1`, { waitUntil: 'networkidle' });
  await page.click('#lang-trigger');
  await page.locator('[data-code="en"]').click();
  assert.equal(new URL(page.url()).searchParams.get('lang'), 'en');
  assert.equal(new URL(page.url()).searchParams.get('keep'), '1');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('.footer-link').count(), 1);
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
  await page.locator('#theme-btn').click();
  assert.equal(await page.locator('link[rel="icon"]').getAttribute('href'), favicon, 'theme changes must preserve the site icon');
  await page.click('#lang-trigger');
  await page.locator('[data-code="auto"]').click();
  assert.equal(new URL(page.url()).searchParams.has('lang'), false);

  await page.setViewportSize({ width: 1280, height: 720 });
  let releaseImage;
  const imageReleased = new Promise(resolve => { releaseImage = resolve; });
  await page.route('**/__delayed-load.png', async route => {
    await imageReleased;
    await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' });
  });
  await page.addInitScript(() => {
    if (window.parent !== window) {
      const image = new Image();
      image.src = 'https://slow-resource.example/__delayed-load.png';
      window.__delayedImage = image;
    }
  });
  await page.setContent(`<iframe title="Curriculum" src="/?lang=es" style="width:100%;height:650px;border:0"></iframe>
    <script>window.readyMessages = 0; addEventListener('message', event => {
      const frame = document.querySelector('iframe');
      if (event.source === frame.contentWindow && event.data?.type === 'set-cv-height') {
        frame.style.height = event.data.height + 'px';
        window.readyMessages++;
      }
    });</script>`, { waitUntil: 'domcontentloaded' });
  const frame = page.frames().find(frame => frame !== page.mainFrame());
  await frame.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
  await page.waitForFunction(() => window.readyMessages === 1);
  assert.equal(await frame.evaluate(() => document.readyState), 'interactive', 'the host must know the CV is ready before slow resources finish');
  releaseImage();
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 720 });
    const iframeHeight = await page.locator('iframe').evaluate(el => el.getBoundingClientRect().height);
    assert.equal(iframeHeight, 650, 'the iframe must not grow with its own viewport');
    const name = await frame.locator('h1').boundingBox();
    assert.ok(name.y >= 0 && name.y + name.height < 650, 'the name must be visible inside the iframe');
    await frame.locator('#letter-btn').evaluate(el => el.click());
    const dialog = await frame.locator('#letter-dialog').boundingBox();
    assert.ok(dialog.y >= 0 && dialog.y + dialog.height <= 651, 'embedded dialogs must fit the iframe viewport');
    await frame.locator('#letter-close-btn').click();
  }
  assert.equal(await page.evaluate(() => window.readyMessages), 1, 'resizing must not start another height feedback loop');
  await page.setViewportSize({ width: 1280, height: 720 });
  const send = data => page.evaluate(data => document.querySelector('iframe').contentWindow.postMessage(data, location.origin), data);
  await page.evaluate(() => { window.readyMessages = 0; });
  await send({ type: 'request-cv-ready' });
  await page.waitForFunction(() => window.readyMessages === 1);
  await send({ type: 'set-theme', theme: 'dark' });
  await frame.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await frame.evaluate(() => {
    for (const [origin, source, data] of [
      ['https://eneko-ruiz.vercel.app.evil.example', window.parent, { type: 'leaving' }],
      [location.origin, window, { type: 'leaving' }],
      [location.origin, window.parent, null],
      [location.origin, window.parent, { type: 'set-theme', theme: 'invalid' }]
    ]) window.dispatchEvent(new MessageEvent('message', { origin, source, data }));
  });
  assert.equal(await frame.evaluate(() => document.body.style.opacity), '');
  assert.equal(await frame.locator('html').getAttribute('data-theme'), 'dark');
  await send({ type: 'leaving' });
  await frame.waitForFunction(() => document.body.style.opacity === '0');

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true);
  await context.setOffline(true);
  await page.goto(`${origin}/?lang=fr&unvisited=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.lang === 'fr');
  assert.equal(await page.locator('.footer-link').count(), 1);
  console.log('Language URL/reload/auto, footer link, parent messages and offline navigation checked');
} finally {
  await browser.close();
  server.close();
}
console.log('All regression checks OK.');
