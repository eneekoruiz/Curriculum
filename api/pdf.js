const path = require('path');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

// Singleton browser instance for serverless reuse
let _browser = null;

const getBrowser = async () => {
  // Check if browser exists and is still responsive
  if (_browser) {
    try {
      const contexts = _browser.browserContexts();
      if (contexts && contexts.length > 0) return _browser;
    } catch (e) {
      _browser = null; // Stale browser, reset
    }
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const executablePath = await chromium.executablePath();
      
      // Ensure libraries are found
      if (executablePath.includes('/tmp/')) {
        process.env.LD_LIBRARY_PATH = `${path.dirname(executablePath)}:${process.env.LD_LIBRARY_PATH || ''}`;
      }
      
      _browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
          '--disable-extensions',
          '--disable-component-update',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-client-side-phishing-detection',
          '--disable-default-apps',
          '--disable-hang-monitor',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
      });
      return _browser;
    } catch (error) {
      retries--;
      console.error(`Launch fail (${3-retries}/3):`, error.message);
      if (retries === 0) throw error;
      // Random delay to break ETXTBSY race conditions
      await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
    }
  }
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

    // Use networkidle0 to ensure fonts and QR code are 100% loaded
    await page.goto(targetUrl.toString(), { 
      waitUntil: 'networkidle0', 
      timeout: 20000 
    });
    
    // Final safety wait for CSS animations/transitions to settle
    await new Promise(r => setTimeout(r, 1000));

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
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.end(pdf);

  } catch (error) {
    console.error('PDF API Error:', error);
    res.status(500).json({
      error: 'Error generating PDF',
      message: error.message,
      code: error.code || 'UNKNOWN'
    });
  } finally {
    if (page) {
      try { await page.close(); } catch(e) {}
    }
    // We DON'T close the browser here to keep it warm for the next request
  }
};
