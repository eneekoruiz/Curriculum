/**
 * SERVERLESS PDF GENERATION API (Vercel Serverless Function)
 * Renders the interactive CV dynamically using Puppeteer and compiles it as an A4 PDF.
 * Uses a warm browser singleton and launch retries for more reliable iframe/mobile downloads.
 */

const path = require('path');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const VALID_LANGS = [
  'es', 'en', 'eu', 'fr', 'de', 'it', 'pt', 'ca', 'gl', 'nl',
  'ru', 'zh', 'ja', 'ko', 'ar', 'sv', 'pl', 'no', 'da',
  'cs', 'ro', 'tr', 'uk'
];

let browserInstance = null;
let browserLaunchLock = null;

const getBrowser = async () => {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  if (browserLaunchLock) {
    return browserLaunchLock;
  }

  browserLaunchLock = (async () => {
    try {
      let retries = 3;

      while (retries > 0) {
        try {
          const executablePath = await chromium.executablePath();

          if (executablePath.includes('/tmp/')) {
            process.env.LD_LIBRARY_PATH = `${path.dirname(executablePath)}:${process.env.LD_LIBRARY_PATH || ''}`;
          }

          browserInstance = await puppeteer.launch({
            args: [
              ...chromium.args,
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ],
            defaultViewport: { width: 1080, height: 1528, deviceScaleFactor: 2 },
            executablePath,
            headless: chromium.headless
          });

          return browserInstance;
        } catch (error) {
          retries -= 1;
          console.error(`PDF browser launch failed (${3 - retries}/3):`, error.message);

          if (retries === 0) {
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        }
      }
    } finally {
      browserLaunchLock = null;
    }
  })();

  return browserLaunchLock;
};

module.exports = async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    response.status(204).end();
    return;
  }

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET, OPTIONS');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let page = null;

  try {
    const rawLang = String(request.query?.lang || 'es').slice(0, 5).replace(/[^a-z]/gi, '').toLowerCase();
    const lang = VALID_LANGS.includes(rawLang) ? rawLang : 'es';
    // Same options as the download dialog: ?photo=0 leaves the photo out, ?letter=1 puts the cover letter first
    const withPhoto = String(request.query?.photo) !== '0';
    const withLetter = String(request.query?.letter) === '1';
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const targetUrl = new URL(`/?pdf=1&lang=${lang}&theme=light`, `${protocol}://${host}`);

    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1528, deviceScaleFactor: 1 });
    await page.setCacheEnabled(true);
    await page.setBypassServiceWorker(true);
    await page.setRequestInterception(true);
    page.on('request', (route) => {
      const url = route.url();
      const resourceType = route.resourceType();
      const skipResource =
        url.endsWith('/manifest.json') ||
        url.endsWith('/sw.js');

      if (skipResource) {
        route.abort();
        return;
      }

      route.continue();
    });
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);

    await page.goto(targetUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Lay out at the printable A4 width (210mm - 2 × 13mm) so the one-page check measures the real page.
    await page.setViewport({ width: 695, height: 1051, deviceScaleFactor: 1 });
    await page.emulateMediaType('print');
    await page.evaluate(async (withPhoto, withLetter) => {
      document.documentElement.classList.add('pdf-render', 'print-ready');
      document.documentElement.classList.toggle('opt-no-photo', !withPhoto);
      document.documentElement.classList.toggle('opt-letter', withLetter);
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
      window.scrollTo(0, 0);

      const fontReady = document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
      const imageReady = Promise.all(
        Array.from(document.images).map((image) => {
          if (image.complete) {
            return Promise.resolve();
          }
          return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
        })
      );

      await Promise.race([
        Promise.all([fontReady, imageReady]),
        new Promise((resolve) => setTimeout(resolve, 1200))
      ]);

      if (typeof window.fitPrintToOnePage === 'function') {
        window.fitPrintToOnePage();
      }
    }, withPhoto, withLetter);
    await new Promise(resolve => setTimeout(resolve, 40));

    // Guarantee one page: if this Chromium lays it out slightly longer, shrink 1% and re-render
    const renderPdf = () => page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });
    // Raw Chromium output has one "/Type /Page" dictionary per page: the CV is one page, the letter another
    const expectedPages = withLetter ? 2 : 1;
    const isTooLong = (buffer) => (buffer.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length > expectedPages;
    let pdfBuffer = await renderPdf();
    for (let attempt = 0; attempt < 10 && isTooLong(pdfBuffer); attempt++) {
      await page.evaluate(() => {
        const wrapper = document.querySelector('.wrapper');
        const zoom = parseFloat(wrapper.style.zoom || '1') - 0.01;
        wrapper.style.zoom = String(Math.round(zoom * 100) / 100);
        if (typeof window.fitRoleLine === 'function') {
          window.fitRoleLine();
        }
      });
      pdfBuffer = await renderPdf();
    }

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Length', pdfBuffer.length);
    response.setHeader('Content-Disposition', `attachment; filename="Eneko_Ruiz_CV_${lang.toUpperCase()}${withLetter ? '_Letter' : ''}${withPhoto ? '' : '_NoPhoto'}.pdf"`);
    response.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=86400');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.status(200).end(pdfBuffer);
  } catch (error) {
    console.error('PDF API Error:', error);
    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.status(500).json({ error: 'Error generating PDF' });
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
};
