const path = require('path');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

// Singleton browser instance for serverless reuse
let _browser = null;
let _browserLock = null;

const getBrowser = async () => {
  // 1. If we have a healthy browser, return it immediately
  if (_browser && _browser.isConnected()) return _browser;

  // 2. If a launch is already in progress, wait for it
  if (_browserLock) return _browserLock;

  // 3. Launch with a lock
  _browserLock = (async () => {
    try {
      let retries = 3;
      while (retries > 0) {
        try {
          const executablePath = await chromium.executablePath();
          
          if (executablePath.includes('/tmp/')) {
            process.env.LD_LIBRARY_PATH = `${path.dirname(executablePath)}:${process.env.LD_LIBRARY_PATH || ''}`;
          }
          
          _browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            headless: chromium.headless,
          });
          return _browser;
        } catch (error) {
          retries--;
          console.error(`Launch fail (${3-retries}/3):`, error.message);
          if (retries === 0) throw error;
          await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        }
      }
    } finally {
      // Always reset the lock so the next request can check health via isConnected()
      _browserLock = null;
    }
  })();

  return _browserLock;
};

module.exports = async (req, res) => {
  let page = null;
  
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Security: strictly construct the target URL from the request host
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const VALID_LANGS = ['es','en','eu','fr','de','it','pt','ca','gl','nl','ru','zh','ja','ko','ar','he','sv','pl','no','da'];
    const rawLang = (req.query.lang || 'es').slice(0, 5).replace(/[^a-z]/gi, '').toLowerCase();
    const lang = VALID_LANGS.includes(rawLang) ? rawLang : 'es';
    // Force light theme and print mode
    const targetUrl = new URL(`/?print=true&lang=${lang}&theme=light`, `${protocol}://${host}`);
    
    // Set viewport to A4 dimensions at 96 DPI to ensure consistent layout rendering
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setCacheEnabled(true);
    page.setDefaultNavigationTimeout(12000);
    page.setDefaultTimeout(12000);

    // Use networkidle2 for faster page load while still waiting for main resources
    await page.goto(targetUrl.toString(), { 
      waitUntil: 'networkidle2', 
      timeout: 12000 
    });

    // Ensure fonts are ready and layout is stable before printing
    await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve());
    await new Promise(r => setTimeout(r, 250));

    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Content-Disposition', `attachment; filename="Eneko_Ruiz_CV_${lang.toUpperCase()}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(pdf);

  } catch (error) {
    // Log full error server-side, but do not expose internal messages to clients
    console.error('PDF API Error:', error);
    res.status(500).json({
      error: 'Error generating PDF'
    });
  } finally {
    if (page) {
      try { await page.close(); } catch(e) {}
    }
    // We DON'T close the browser here to keep it warm for the next request
  }
};
