// Shared helpers for the CV build/check scripts.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { chromium } from 'playwright';

export const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));

/** Printable A4 area at 96 dpi: 210mm − 2×13mm wide (see @page in print.css). */
export const PRINT_VIEWPORT = { width: 695, height: 1051 };

/** Loads T (copy) and M (language metadata) from translations.js. */
export function loadTranslations() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${readFileSync(join(ROOT, 'translations.js'), 'utf8')}\nthis.T = T; this.M = M;`, context);
  return { T: context.T, M: context.M, langs: Object.keys(context.M) };
}

export const pdfPath = (lang) => join(ROOT, 'pdf', `Eneko_Ruiz_CV_${lang.toUpperCase()}.pdf`);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf',
  '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain'
};

/** Minimal static server for the repo root (no caching, no directory listing). */
export async function startServer() {
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = normalize(join(ROOT, path));
      if (!file.startsWith(ROOT)) throw new Error('outside root');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

/**
 * Chromium + a context. With CV_FONTS_VIA_CURL=1, Google Fonts requests are fetched with curl
 * (for sandboxes whose TLS proxy the browser does not trust); CI fetches them directly.
 */
export async function launch(contextOptions = {}) {
  // CV_CHROMIUM_PATH: use a preinstalled Chromium instead of Playwright's bundled one
  const browser = await chromium.launch(process.env.CV_CHROMIUM_PATH ? { executablePath: process.env.CV_CHROMIUM_PATH } : {});
  const context = await browser.newContext(contextOptions);
  if (process.env.CV_FONTS_VIA_CURL === '1') {
    const cache = new Map();
    await context.route(/fonts\.(googleapis|gstatic)\.com/, async route => {
      const url = route.request().url();
      if (!cache.has(url)) {
        cache.set(url, execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0', url], { maxBuffer: 1 << 26 }));
      }
      await route.fulfill({
        body: cache.get(url),
        contentType: url.includes('googleapis') ? 'text/css' : 'font/woff2',
        headers: { 'access-control-allow-origin': '*' }
      });
    });
  }
  return { browser, context };
}

/** Plain text of every page of a PDF, in content-stream order (what ATS parsers read). */
export async function pdfText(buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: false, verbosity: 0 }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map(item => item.str + (item.hasEOL ? '\n' : '')).join(''));
  }
  return { pages: doc.numPages, text: pages.join('\n') };
}

export const normalizeText = (text) => text.replace(/\s+/g, ' ').trim();
