import { launch, startServer } from './lib.mjs';

const { server, origin } = await startServer();
const { browser, context } = await launch();

try {
  console.log('--- Testing Precision Motion in normal mode ---');
  const page = await context.newPage({ viewport: { width: 1366, height: 768 } });
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  // Navigate and inspect immediately at 100ms
  await page.goto(`${origin}/`);
  await page.waitForTimeout(100);

  const initialMotion = await page.evaluate(() => {
    const el = document.querySelector('.precision-motion');
    if (!el) return null;
    const style = getComputedStyle(el);
    return {
      present: true,
      opacity: style.opacity,
      visibility: style.visibility,
      display: style.display,
      playState: style.animationPlayState
    };
  });
  console.log('Initial state (100ms):', initialMotion);
  if (!initialMotion || initialMotion.display === 'none' || initialMotion.visibility === 'hidden') {
    throw new Error('Precision motion overlay was not visible on start!');
  }
  if (initialMotion.playState !== 'running') {
    throw new Error(`Precision motion animation is paused! playState=${initialMotion.playState}`);
  }

  // Wait 1.8s for animation to conclude and clean up
  await page.waitForTimeout(1800);
  const concludedMotion = await page.evaluate(() => {
    return {
      inDOM: !!document.querySelector('.precision-motion'),
      rootVisible: getComputedStyle(document.querySelector('#root-container')).visibility === 'visible',
      headerOpacity: getComputedStyle(document.querySelector('.site-header')).opacity
    };
  });
  console.log('After conclusion (1900ms):', concludedMotion);
  if (concludedMotion.inDOM) {
    throw new Error('Precision motion was not cleaned up after completion!');
  }
  if (!concludedMotion.rootVisible || Number(concludedMotion.headerOpacity) < 0.9) {
    throw new Error('Root container or header is not fully visible after transition!');
  }

  await page.close();

  console.log('--- Testing Precision Motion with prefers-reduced-motion ---');
  const reducedContext = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1366, height: 768 }
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${origin}/`);
  await reducedPage.waitForTimeout(150);

  const reducedState = await reducedPage.evaluate(() => {
    const el = document.querySelector('.precision-motion');
    return {
      inDOM: !!el,
      display: el ? getComputedStyle(el).display : 'none'
    };
  });
  console.log('Reduced motion state:', reducedState);
  if (reducedState.inDOM && reducedState.display !== 'none') {
    throw new Error('Precision motion should be hidden for reduced-motion users!');
  }
  await reducedContext.close();

  console.log('--- Testing Precision Motion in PDF render mode (?pdf=1) ---');
  const pdfPage = await context.newPage({ viewport: { width: 1366, height: 768 } });
  await pdfPage.goto(`${origin}/?pdf=1`);
  await pdfPage.waitForTimeout(150);
  const pdfState = await pdfPage.evaluate(() => {
    const el = document.querySelector('.precision-motion');
    return {
      inDOM: !!el,
      display: el ? getComputedStyle(el).display : 'none'
    };
  });
  console.log('PDF render state:', pdfState);
  if (pdfState.inDOM && pdfState.display !== 'none') {
    throw new Error('Precision motion should not display in PDF render mode!');
  }
  await pdfPage.close();

  if (errors.length) {
    throw new Error('Browser errors detected: ' + errors.join('; '));
  }

  console.log('All Precision Motion verification tests passed successfully! ✅');
} finally {
  await browser.close();
  server.close();
}
