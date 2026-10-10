// WCAG 2.1 AA audit with axe-core: light and dark theme, desktop and phone, LTR and RTL; the page itself
// and each dialog (photo, cover letter, PDF options) open.
import AxeBuilder from '@axe-core/playwright';
import { startServer, launch } from './lib.mjs';

const CASES = [
  ['es', 'light', { width: 1366, height: 800 }], ['es', 'dark', { width: 1366, height: 800 }],
  ['es', 'light', { width: 390, height: 844 }], ['es', 'dark', { width: 390, height: 844 }],
  ['en', 'light', { width: 1366, height: 800 }], ['ar', 'light', { width: 1366, height: 800 }],
  ['ar', 'dark', { width: 390, height: 844 }], ['ja', 'light', { width: 1366, height: 800 }]
];

const { server, origin } = await startServer();
const { browser, context } = await launch({ reducedMotion: 'reduce' });
let total = 0;
try {
  for (const [lang, theme, viewport] of CASES) {
    const page = await context.newPage();
    await page.setViewportSize(viewport);
    await page.goto(`${origin}/?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
    const audit = async (label, openWith) => {
      if (openWith) {
        await page.click(openWith);
        await page.waitForTimeout(150);
      }
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      if (!violations.length) console.log(`✓ ${label}`);
      for (const v of violations) {
        total++;
        console.log(`✗ ${label}  [${v.impact}] ${v.id}: ${v.help}`);
        for (const node of v.nodes.slice(0, 6)) console.log(`     ${node.target.join(' ')}  ${node.failureSummary.split('\n').slice(1, 2).join(' ').trim()}`);
      }
      if (openWith) await page.keyboard.press('Escape');
    };
    const label = `${lang} ${theme} ${viewport.width}x${viewport.height}`;
    await audit(label);
    await audit(`${label} · letter dialog`, '#letter-btn');
    await audit(`${label} · PDF options dialog`, '#print-btn');
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (total) {
  console.error(`\n${total} accessibility violation(s)`);
  process.exit(1);
}
console.log('\nNo WCAG 2.1 AA violations.');
