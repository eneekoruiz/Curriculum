// WCAG 2.2 AA checks with axe-core, keyboard operation, dialog focus and text-spacing reflow.
// Light and dark theme, desktop and phone, LTR and RTL; the page itself
// and each dialog (photo, cover letter, PDF options) open.
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { startServer, launch, loadTranslations } from './lib.mjs';

const CASES = [
  ['es', 'light', { width: 1366, height: 800 }], ['es', 'dark', { width: 1366, height: 800 }],
  ['es', 'light', { width: 390, height: 844 }], ['es', 'dark', { width: 390, height: 844 }],
  ['en', 'light', { width: 1366, height: 800 }], ['ar', 'light', { width: 1366, height: 800 }],
  ['ar', 'dark', { width: 390, height: 844 }], ['ja', 'light', { width: 1366, height: 800 }]
];

const { server, origin } = await startServer();
const { browser, context } = await launch({ reducedMotion: 'reduce' });
let total = 0;
const manual = new Set();
const { T } = loadTranslations();
const contrast = (first, second) => {
  const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number)
    .map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
};
assert.equal(contrast('rgb(0, 0, 0)', 'rgb(255, 255, 255)'), 21);
try {
  for (const [lang, theme, viewport] of CASES) {
    const page = await context.newPage();
    await page.setViewportSize(viewport);
    await page.goto(`${origin}/?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
    assert.equal(await page.locator('#topbar').getAttribute('aria-label'), T[lang].aria_controls);
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('[aria-controls]')]
      .flatMap(el => el.getAttribute('aria-controls').split(/\s+/)).filter(id => !document.getElementById(id))), [], 'ARIA controls must reference existing elements');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.matches('.skip-link')), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');

    const language = page.locator('#lang-trigger');
    await language.focus();
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.evaluate(() => document.activeElement.matches('[role="option"]')), true);
    await page.keyboard.press('Home');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.code), 'auto');
    await page.keyboard.press('e');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.code), 'en');
    await page.keyboard.press('End');
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('#lang-menu').lastElementChild), true);
    await page.keyboard.press('ArrowUp');
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('#lang-menu').lastElementChild), false);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'lang-trigger');
    assert.equal(await language.getAttribute('aria-expanded'), 'false');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    assert.equal(await language.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => document.documentElement.lang), lang);

    const themeButton = page.locator('#theme-btn');
    assert.equal(await themeButton.getAttribute('aria-pressed'), String(theme === 'dark'));
    await themeButton.press('Space');
    await page.waitForFunction(theme => document.documentElement.dataset.theme !== theme, theme);
    await themeButton.press('Space');
    await page.waitForFunction(theme => document.documentElement.dataset.theme === theme, theme);

    if (viewport.width <= 920) {
      for (const target of ['#letter-btn', '#print-opts-btn']) {
        await page.locator('#more-btn').press('Enter');
        await page.locator(`.mm-item[data-forward="${target}"]`).press('Enter');
        assert.equal(await page.locator('dialog[open]').count(), 1);
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.activeElement.id === 'more-btn');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'more-btn');
      }
    }
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } }));
    await page.locator('[data-copy]').first().click();
    await page.waitForFunction(() => document.getElementById('action-status').textContent.length > 0);
    // openWith: a selector to click; { script } clicks it programmatically (the desktop buttons are hidden on phones)
    const audit = async (label, openWith) => {
      if (openWith) {
        if (openWith.script) await page.evaluate((selector) => document.querySelector(selector).click(), openWith.script);
        else await page.click(openWith);
        await page.waitForTimeout(250);
      }
      if (await page.locator('dialog[open]').count()) {
        for (const key of ['Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
          await page.keyboard.press(key);
          assert.equal(await page.evaluate(() => !document.hasFocus() || !!document.activeElement.closest('dialog[open]')), true, `${label}: background content received keyboard focus`);
        }
      }
      if (await page.locator('#print-dialog[open]').count()) {
        await page.waitForTimeout(450);
        const switches = await page.locator('.opt-switch').evaluateAll(elements => elements.map(el => ({
          track: getComputedStyle(el).backgroundColor,
          border: getComputedStyle(el).borderColor,
          thumb: getComputedStyle(el, '::after').backgroundColor,
          surface: getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim()
        })));
        for (const control of switches) {
          const surface = control.surface.startsWith('#') ? `rgb(${control.surface.slice(1).match(/../g).map(value => parseInt(value, 16)).join(',')})` : control.surface;
          assert.ok(contrast(control.track, control.thumb) >= 3, `${label}: switch state needs 3:1 contrast`);
          assert.ok(contrast(control.border, surface) >= 3, `${label}: switch boundary needs 3:1 contrast`);
        }
      }
      const { violations, incomplete } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      incomplete.forEach(rule => manual.add(rule.id));
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
    await audit(`${label} · letter dialog`, { script: '#letter-btn' });
    await audit(`${label} · PDF options dialog`, { script: '#print-opts-btn' });
    await audit(`${label} · portrait on`, { script: '#photo-btn' });
    await audit(`${label} · photo dialog`, '#portrait-btn');
    await page.evaluate(() => document.getElementById('photo-btn').click());
    if (viewport.width <= 920) await audit(`${label} · menu`, '#more-btn');
    await page.close();
  }
  for (const lang of ['es', 'ar']) {
    for (const theme of ['light', 'dark']) {
      const page = await context.newPage();
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(`${origin}/?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => !document.documentElement.classList.contains('cv-loading'));
      await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
      const problems = await page.evaluate(() => {
        const out = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) out.push('horizontal overflow');
        for (const el of document.querySelectorAll('a,button,h1,h2,h3,p,.pill')) {
          const style = getComputedStyle(el);
          if (!el.getClientRects().length || style.visibility === 'hidden' || el.closest('.sr-only')) continue;
          if (el.clientWidth && el.scrollWidth > el.clientWidth + 1 && /(hidden|clip)/.test(style.overflowX)) out.push(el.textContent.trim().slice(0, 60));
        }
        return out;
      });
      assert.deepEqual(problems, [], `${lang} ${theme}: 320px reflow with WCAG text spacing`);
      console.log(`✓ ${lang} ${theme} · 320px reflow and text spacing`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
if (total) {
  console.error(`\n${total} accessibility violation(s)`);
  process.exit(1);
}
console.log('\nNo automated WCAG 2.2 AA violations detected.');
console.log(`Rules requiring manual review: ${[...manual].join(', ') || 'none returned by axe (assistive-technology testing is still needed)'}`);
