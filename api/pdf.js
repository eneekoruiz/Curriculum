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
    const lang = req.query.lang || 'es';
    const targetUrl = new URL(`/?print=true&lang=${lang}`, `${protocol}://${host}`);
    
    await page.goto(targetUrl.toString(), { 
      waitUntil: 'networkidle0', 
      timeout: 25000 
    });

    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Eneko_Ruiz_CV.pdf"');
    res.send(pdf);

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
