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
  'ru', 'zh', 'ja', 'ko', 'ar', 'he', 'sv', 'pl', 'no', 'da'
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
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const targetUrl = new URL(`/?pdf=1&lang=${lang}&theme=light`, `${protocol}://${host}`);

    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1528, deviceScaleFactor: 2 });
    await page.setCacheEnabled(true);
    page.setDefaultNavigationTimeout(15000);
    page.setDefaultTimeout(15000);

    await page.goto(targetUrl.toString(), {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await page.emulateMediaType('print');
    await page.evaluate(async () => {
      document.documentElement.classList.add('pdf-render');
      document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });
    await new Promise(resolve => setTimeout(resolve, 180));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Length', pdfBuffer.length);
    response.setHeader('Content-Disposition', `attachment; filename="Eneko_Ruiz_CV_${lang.toUpperCase()}.pdf"`);
    response.setHeader('Cache-Control', 'no-store, max-age=0');
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
