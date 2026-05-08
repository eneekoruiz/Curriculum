const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    // Security: strictly construct the target URL from the request host to prevent SSRF
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const targetUrl = new URL('/?print=true', `${protocol}://${host}`);
    const url = targetUrl.toString();

    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 20000 
    });

    // Emulate print media
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Eneko_Ruiz_CV.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).send(`Error generating PDF: ${error.message}`);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
