/*
 * Interactive CV — vanilla JS, no dependencies.
 * i18n, theme, PDF download (pre-rendered per language, /api/pdf fallback),
 * contact copy, share, vCard, first paint and scroll reveal.
 */

const html = document.documentElement;
let currentLang = 'es';
let themeTransitionTimeout = null;

/* ── HELPERS & UTILITIES ────────────────────────────────────────── */

/**
 * Safely accesses localStorage, catching any errors in security-restricted iframe environments.
 */
const safeStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.debug('localStorage is restricted or full; unable to save preference:', key, error);
    }
  }
};

/**
 * Dynamic favicon update to match the current visual theme immediately.
 * @param {boolean} isDarkTheme 
 */
const updateFavicon = (isDarkTheme) => {
  const textColor = isDarkTheme ? '#94a3b8' : '#334155';
  const backgroundColor = isDarkTheme ? '#0f172a' : '#ffffff';
  
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="${backgroundColor}"/>
      <text x="50" y="66" font-family="sans-serif" font-size="52" font-weight="bold" fill="${textColor}" text-anchor="middle">ER</text>
    </svg>
  `.trim().replace(/\s+/g, ' ');
  
  let faviconLink = document.querySelector("link[rel~='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }
  
  faviconLink.href = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

/**
 * Applies the visual theme (light/dark) to the document and updates relevant meta tags and favicon.
 * @param {boolean} isDarkTheme 
 * @param {boolean} animate 
 */
const applyTheme = (isDarkTheme, animate = true) => {
  try {
    const themeValue = isDarkTheme ? 'dark' : 'light';
    
    if (animate) {
      if (themeTransitionTimeout) {
        clearTimeout(themeTransitionTimeout);
      }
      html.classList.add('theme-transitioning');
    }
    
    html.setAttribute('data-theme', themeValue);
    html.style.colorScheme = themeValue;
    html.style.backgroundColor = '';
    
    const metaThemeColor = document.getElementById('meta-theme-color');
    if (metaThemeColor) {
      metaThemeColor.content = isDarkTheme ? '#020617' : '#ffffff';
    }
    
    safeStorage.set('cv-theme', themeValue);
    updateFavicon(isDarkTheme);
    
    if (animate) {
      themeTransitionTimeout = setTimeout(() => {
        html.classList.remove('theme-transitioning');
        themeTransitionTimeout = null;
      }, 250);
    }
  } catch (error) {
    console.debug('applyTheme failed to toggle classes (possible initial DOM setup issue):', error);
  }
};

/* ── INTERNATIONALIZATION (i18n) ENGINE ───────────────────────── */

/**
 * Dynamically applies translations to elements with data-i18n attributes.
 * Updates HTML attributes, search engine tags and the footer copyright year.
 * @param {string} langCode 
 */
const applyTranslations = (langCode, activeMenuCode = langCode) => {
  const translations = T[langCode];
  const metadata = M[langCode];
  
  if (!translations || !metadata) {
    return;
  }
  
  currentLang = langCode;

  // Translate all text elements and accessibility tags
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const translationKey = element.getAttribute('data-i18n');
    let translatedValue = translations[translationKey] ?? T.en[translationKey];
    
    if (translatedValue !== undefined) {
      
      if (translationKey.startsWith('aria_')) {
        element.setAttribute('aria-label', translatedValue);
      } else {
        element.textContent = translatedValue;
      }
    }
  });

  // Global layout language configuration
  html.setAttribute('lang', langCode);
  html.setAttribute('dir', metadata.dir);
  document.title = `Eneko Ruiz Mollón — ${translations.eyebrow || T.en.eyebrow}`;
  
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = activeMenuCode === 'auto' ? 'Auto' : metadata.name;
  }
  
  // Search Engine & Metadata synchronization
  const metaDescription = translations.meta_desc || T.en.meta_desc || '';
  document.querySelector('meta[name="description"]')?.setAttribute('content', metaDescription);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', metaDescription);

  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', metadata.locale);
  
  // Dynamic footer copyright year update
  const footerElement = document.querySelector('.site-footer');
  if (footerElement) {
    const currentYear = new Date().getFullYear();
    footerElement.textContent = `© ${currentYear} ${translations.footer_text}`;
  }

  // Synchronize language dropdown menu visual states
  document.querySelectorAll('.lm-item').forEach(menuItem => {
    const menuItemCode = menuItem.getAttribute('data-code');
    const isActive = menuItemCode === activeMenuCode;
    
    menuItem.classList.toggle('active', isActive);
    menuItem.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  updateExportButtonLabel();
};

/**
 * Triggers a smooth opacity transition when switching languages.
 * @param {string} langCode 
 */
const setLang = (langCode) => {
  if (langCode === 'auto') {
    safeStorage.removeItem('cv-lang');
    const browserLang = (navigator.languages || [navigator.language || ''])
      .map(code => String(code).slice(0, 2).toLowerCase())
      .find(code => T[code]);
    applyTranslations(browserLang || 'en', 'auto');
  } else {
    safeStorage.set('cv-lang', langCode);
    applyTranslations(langCode);
  }
};


const getRuntimeContext = () => {
  const userAgent = navigator.userAgent || '';
  let isEmbedded = false;

  try {
    isEmbedded = window.self !== window.top;
  } catch (error) {
    console.debug('Failed to verify if window is embedded (cross-origin iframe restriction likely):', error);
    isEmbedded = true;
  }

  const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
    (navigator.maxTouchPoints > 1 && window.matchMedia && window.matchMedia('(max-width: 900px)').matches);

  return { isEmbedded, isMobile, isIOS, isSafari };
};

/** Download button copy for the current language (English fallback). */
const getExportCopy = () => {
  const t = T[currentLang] || T.en;
  return {
    download: t.pdf_download,
    preparing: t.pdf_preparing,
    opening: t.pdf_opening,
    ready: t.pdf_ready,
    failed: t.pdf_failed
  };
};

const getPrintButtonLabel = (printButton = document.getElementById('print-btn')) => {
  if (!printButton) {
    return null;
  }

  return Array.from(printButton.children).find(child => child.tagName === 'SPAN') || null;
};

const updateExportButtonLabel = (forcedText = '') => {
  const printButton = document.getElementById('print-btn');
  const statusLabel = getPrintButtonLabel(printButton);
  if (!printButton || !statusLabel) {
    return;
  }

  const copy = getExportCopy();
  statusLabel.textContent = forcedText || copy.download;
  printButton.setAttribute('aria-label', copy.download);
};

const forcePrintReadyState = () => {
  document.documentElement.classList.add('print-ready');
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
};


// Every language ships a pre-rendered PDF (scripts/build-pdfs.mjs): instant and reliable.
// /api/pdf stays as a fallback for a language without one.
const getPdfDownloadUrl = () => {
  const lang = currentLang || 'es';
  if (window.PRINT_ZOOM && lang in window.PRINT_ZOOM) {
    const staticPdfUrl = new URL(`/pdf/Eneko_Ruiz_CV_${lang.toUpperCase()}.pdf`, window.location.origin);
    staticPdfUrl.searchParams.set('v', window.PDF_VERSION || '1');
    return staticPdfUrl.toString();
  }

  return getDynamicPdfUrl();
};

/** On-demand rendering (api/pdf.js): fallback when a pre-rendered PDF is missing or fails. */
const getDynamicPdfUrl = () => {
  const pdfUrl = new URL('/api/pdf', window.location.origin);
  pdfUrl.searchParams.set('lang', currentLang || 'es');
  return pdfUrl.toString();
};

const openPdfDirectly = (pdfUrl) => {
  try {
    if (getRuntimeContext().isEmbedded && window.top) {
      window.top.location.href = pdfUrl;
      return;
    }
  } catch (error) {
    console.debug('Cross-origin or sandboxed iframes blocked top navigation:', error);
  }

  window.location.href = pdfUrl;
};

const downloadGeneratedPdf = async (printButton, options = {}) => {
  const pdfUrl = getPdfDownloadUrl();
  const runtime = getRuntimeContext();
  const copy = getExportCopy();

  if (runtime.isEmbedded && window.parent) {
    window.parent.postMessage({ type: 'cv-download-pdf', url: pdfUrl }, '*');
    window.parent.postMessage({ type: 'cv-download-pdf-start', url: pdfUrl }, '*');
  }

  if (options.preferDirect || runtime.isIOS) {
    showCopyTip(printButton, copy.opening);
    openPdfDirectly(pdfUrl);
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000);

  const dynamicPdfUrl = getDynamicPdfUrl();
  let effectiveUrl = pdfUrl;

  try {
    const request = (url) => fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/pdf' },
      signal: controller.signal
    });

    let response = await request(pdfUrl);
    if (!response.ok && pdfUrl !== dynamicPdfUrl) {
      // Pre-rendered file unavailable: render it on demand instead
      effectiveUrl = dynamicPdfUrl;
      response = await request(dynamicPdfUrl);
    }

    if (!response.ok) {
      throw new Error(`PDF request failed: ${response.status}`);
    }

    const pdfBlob = await response.blob();
    if (!pdfBlob.size) {
      throw new Error('PDF response was empty');
    }

    const objectUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `Eneko_Ruiz_CV_${(currentLang || 'es').toUpperCase()}.pdf`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (runtime.isEmbedded && window.parent) {
      window.parent.postMessage({ type: 'cv-download-pdf-ready', url: pdfUrl }, '*');
    }

    setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
    showCopyTip(printButton, '¡Correctamente descargado!');
      printButton.classList.add('is-success');
      setTimeout(() => printButton.classList.remove('is-success'), 4000);
  } catch (error) {
    console.error('Blob PDF download failed; falling back to direct PDF navigation:', error);
    if (runtime.isEmbedded && window.parent) {
      window.parent.postMessage({ type: 'cv-download-pdf-fallback', url: pdfUrl }, '*');
    }
    showCopyTip(printButton, copy.opening);
    openPdfDirectly(effectiveUrl);
  } finally {
    clearTimeout(timeoutId);
  }
};
/* ── CORE ACTIONS ─────────────────────────────────────────────── */

/**
 * Toggles current theme between light and dark modes.
 */
let activeThemeTransition = null;

window.toggleTheme = (event) => {
  const isCurrentlyDark = html.getAttribute('data-theme') === 'dark';
  const targetTheme = !isCurrentlyDark;

  if (activeThemeTransition && typeof activeThemeTransition.skipTransition === 'function') {
    try { activeThemeTransition.skipTransition(); } catch (e) {}
  }

  if (!document.startViewTransition) {
    applyTheme(targetTheme, true);
    return;
  }

  let x = event && typeof event.clientX === 'number' ? event.clientX : 0;
  let y = event && typeof event.clientY === 'number' ? event.clientY : 0;
  if (x === 0 && y === 0) {
    const btn = document.getElementById('theme-btn');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }
  }

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  html.classList.add('is-view-transitioning');
  const transition = document.startViewTransition(() => {
    applyTheme(targetTheme, false);
  });
  activeThemeTransition = transition;

  transition.finished.finally(() => {
    if (activeThemeTransition === transition) {
      activeThemeTransition = null;
      html.classList.remove('is-view-transitioning');
    }
  });

  transition.ready.then(() => {
    const clipPath = [
      'circle(0px at ' + x + 'px ' + y + 'px)',
      'circle(' + endRadius + 'px at ' + x + 'px ' + y + 'px)'
    ];
    
    document.documentElement.animate(
      {
        clipPath: clipPath,
      },
      {
        duration: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }).catch(() => {
    applyTheme(targetTheme, true);
  });
};

/**
 * The PDF preview card hangs from the download button (right edges aligned). When the button
 * sits near a screen edge the card would leave the viewport, so it is nudged back (--pv-shift).
 */
const placePdfPreview = () => {
  const button = document.getElementById('print-btn');
  const preview = button && button.querySelector('.pdf-preview');
  if (!preview) {
    return;
  }
  const margin = 8;
  const right = button.getBoundingClientRect().right;
  const left = right - preview.offsetWidth;
  let shift = 0;
  if (left < margin) {
    shift = margin - left;
  } else if (right > window.innerWidth - margin) {
    shift = window.innerWidth - margin - right;
  }
  preview.style.setProperty('--pv-shift', `${Math.round(shift)}px`);
};

/**
 * Triggers CV export with a reliable path per runtime.
 * Desktop top-level windows use native print; iframes and mobile use the PDF endpoint.
 */
window.handlePrint = async () => {
  const printButton = document.getElementById('print-btn');
  if (!printButton || printButton.getAttribute('data-loading') === 'true') {
    return;
  }

  if (navigator.vibrate) {
    navigator.vibrate(5);
  }

  const statusLabel = getPrintButtonLabel(printButton);
  const { isEmbedded, isIOS, isSafari } = getRuntimeContext();
  const copy = getExportCopy();

  const resetPrintButton = () => {
    printButton.removeAttribute('data-loading');
    updateExportButtonLabel();
  };

  printButton.setAttribute('data-loading', 'true');
  placePdfPreview();
  if (statusLabel) {
    statusLabel.textContent = copy.preparing;
  }

  forcePrintReadyState();

  try {
    await downloadGeneratedPdf(printButton, { preferDirect: isIOS || (isSafari && !isEmbedded) });
    resetPrintButton();
  } catch (error) {
    console.error('CV export failed:', error);
    resetPrintButton();
    showCopyTip(printButton, copy.failed);
  }
};

/**
 * Shares the curriculum URL.
 * Automatically tries to invoke the native Web Share API on mobile,
 * falling back to copy-to-clipboard on desktop browsers.
 */
window.handleShare = async () => {
  if (navigator.vibrate) {
    navigator.vibrate(5);
  }
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href
      });
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        console.error('Web Share API failed:', shareError);
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const shareButton = document.getElementById('share-btn');
      const successMessage = T[currentLang]?.copy_ok || 'Link Copied!';
      showCopyTip(shareButton, successMessage);
    } catch (clipboardError) {
      console.error('Clipboard writeText failed in handleShare:', clipboardError);
      const shareButton = document.getElementById('share-btn');
      showCopyTip(shareButton, 'Error al copiar link');
    }
  }
};

/**
 * Displays a clean, floating accessibility tip/toast.
 * @param {HTMLElement} anchorElement
 * @param {string} message
 */
const showCopyTip = (anchorElement, message) => {
  const existingTip = document.querySelector('.copy-tip');
  if (existingTip) {
    existingTip.remove();
  }
  
  const tipElement = document.createElement('div');
  tipElement.className = 'copy-tip';
  tipElement.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;
  
  anchorElement.style.position = 'relative';
    anchorElement.appendChild(tipElement);
  
  setTimeout(() => {
    tipElement.remove();
  }, 2500);
};

/**
 * Copy click handler for phone, email, and copyable links.
 * @param {MouseEvent} event 
 */
const handleCopy = async (event) => {
  const copyButton = event.currentTarget;
  const textToCopy = copyButton.getAttribute('data-copy');
  
  if (!textToCopy) {
    return;
  }

  // Email/phone are real mailto:/tel: links (clickable in the PDF); on the web a click copies instead.
  event.preventDefault();

  try {
    await navigator.clipboard.writeText(textToCopy);
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
    const copyOkMessage = T[currentLang]?.copy_ok || 'Copied!';
    showCopyTip(copyButton, copyOkMessage);
  } catch (error) {
    console.error('Clipboard writeText failed in handleCopy:', error);
    showCopyTip(copyButton, 'Error de permisos');
  }
};

/**
 * Generates and downloads a vCard file.
 */
const handleVCardDownload = () => {
  const vcardData = `BEGIN:VCARD
VERSION:3.0
N:Ruiz Mollón;Eneko;;;
FN:Eneko Ruiz Mollón
ORG:Software Engineer
EMAIL;TYPE=INTERNET:eneekoruiz@gmail.com
TEL;TYPE=CELL:+34600025161
URL:https://eneko-ruiz.vercel.app
END:VCARD`;

  const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Eneko_Ruiz.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  const copyOkMessage = T[currentLang]?.copy_ok || 'Guardado!';
  showCopyTip(document.getElementById('vcard-btn'), copyOkMessage);
};



/**
 * Safety net for PDF export: with print media active and an A4-wide viewport,
 * sizes the CV to fill a single page: grows it (up to +12%) when there is room,
 * shrinks it when a language runs long.
 * Printable area = A4 minus the @page margins in print.css (13mm sides, 10mm + 9mm).
 * @returns {number} the zoom factor applied
 */
window.fitPrintToOnePage = () => {
  const wrapper = document.querySelector('.wrapper');
  if (!wrapper) {
    return 1;
  }
  wrapper.style.zoom = '';
  // 1.5% headroom for line-box rounding between screen layout and the PDF renderer
  const availableHeight = (((297 - 19) * 96) / 25.4) * 0.985;
  let zoom = 1;
  // Grow while there is room (bigger text reads better), up to +12%...
  while (zoom < 1.12) {
    wrapper.style.zoom = String(Math.round((zoom + 0.01) * 100) / 100);
    if (wrapper.getBoundingClientRect().height > availableHeight) {
      wrapper.style.zoom = String(zoom);
      break;
    }
    zoom = Math.round((zoom + 0.01) * 100) / 100;
  }
  // ...or shrink until it fits. Re-measure each step: zoom re-wraps the lines.
  while (wrapper.getBoundingClientRect().height > availableHeight && zoom > 0.8) {
    zoom = Math.round((zoom - 0.01) * 100) / 100;
    wrapper.style.zoom = String(zoom);
  }
  return zoom;
};

/**
 * Printing from the browser (Ctrl+P) uses the same one-page scale that
 * scripts/build-pdfs.mjs measured for each language (print-zoom.js).
 * A scale already set (fitPrintToOnePage in the PDF renderers, which newer Chromium
 * also fires beforeprint for) is left untouched.
 */
const setupPrintScale = () => {
  const wrapper = document.querySelector('.wrapper');
  if (!wrapper) {
    return;
  }
  let applied = false;
  window.addEventListener('beforeprint', () => {
    const zoom = window.PRINT_ZOOM && window.PRINT_ZOOM[currentLang];
    if (zoom && !wrapper.style.zoom) {
      wrapper.style.zoom = String(zoom);
      applied = true;
    }
  });
  window.addEventListener('afterprint', () => {
    if (applied) {
      wrapper.style.zoom = '';
      applied = false;
    }
  });
};

/**
 * Scroll reveal: each section below the cover rises and fades in once. It starts a little
 * BEFORE the section reaches the screen, so at a normal pace it is already in place when it
 * arrives. When the reader scrolls hard (or jumps), sections about to enter or already passed
 * appear instantly with no animation, so there are never empty gaps or late fade-ins.
 * Nothing is hidden without JavaScript, with reduced motion, in print or in the PDF render.
 */
const setupScrollReveal = () => {
  const sections = [...document.querySelectorAll('.dashboard > section')];
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!sections.length || reducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const FAST = 0.9;        // px per ms (900 px/s): faster than this the 0.4s fade would still be running as the section arrives
  const LOOKAHEAD = 1.6;   // while scrolling hard, everything within 1.6 screens ahead is shown
  const pending = new Set(sections);
  let speed = 0;
  let lastY = window.scrollY;
  let lastTime = performance.now();
  let frame = 0;

  const finish = () => {
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
  };

  const reveal = (section, instant) => {
    if (!pending.delete(section)) {
      return;
    }
    if (instant) {
      section.classList.add('is-instant'); void section.offsetWidth;
    }
    section.classList.add('is-revealed');
    if (!pending.size) {
      finish();
    }
  };

  const observer = new IntersectionObserver((entries) => {
    const hard = speed > FAST && performance.now() - lastTime < 150;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reveal(entry.target, hard);
      }
    });
  }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });

  const onScroll = () => {
    const now = performance.now();
    // After a pause the gap since the last event says nothing about how hard this scroll starts:
    // measure over at most ~1.5 frames, so a hard flick counts as hard from its first event
    const interval = Math.max(4, Math.min(now - lastTime, 24));
    speed = Math.abs(window.scrollY - lastY) / interval;
    lastY = window.scrollY;
    lastTime = now;
    if (speed > FAST && !frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        pending.forEach(section => {
          if (section.getBoundingClientRect().top < window.innerHeight * LOOKAHEAD) {
            reveal(section, true);
          }
        });
      });
    }
  };

  html.classList.add('scroll-reveal');
  // Sections already on (or just below) the first screen never start hidden
  sections.forEach(section => {
    if (section.getBoundingClientRect().top < window.innerHeight * 1.15) {
      reveal(section, true);
    } else {
      observer.observe(section);
    }
  });
  if (pending.size) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
};

/* ── INITIALIZATION ───────────────────────────────────────────── */
(function init() {
  // Force manual scroll position behavior on page load to prevent erratic scroll jumps
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));

  const runtimeContext = getRuntimeContext();

  // Initialize lightweight hover polish where it will not fight an iframe or touch viewport.
  if (!runtimeContext.isEmbedded && !runtimeContext.isMobile) {
  
  }

  // Setup language dropdown menu list
  const languageMenu = document.getElementById('lang-menu');
  if (languageMenu && M) {
    languageMenu.innerHTML = '';
    
    const addOption = (code, name, iso) => {
      const optionButton = document.createElement('button');
      optionButton.className = 'lm-item';
      optionButton.setAttribute('role', 'option');
      optionButton.setAttribute('data-code', code);
      optionButton.innerHTML = `<span>${name}</span><span class="lm-iso">${iso}</span>`;
      optionButton.addEventListener('click', () => setLang(code));
      languageMenu.appendChild(optionButton);
    };

    addOption('auto', 'Auto', 'SYS');

    Object.entries(M)
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .forEach(([langCode, langMetadata]) => {
        addOption(langCode, langMetadata.name, langMetadata.iso);
      });
  }

  // Setup action triggers
  const printButton = document.getElementById('print-btn');
  if (printButton) {
    printButton.addEventListener('click', handlePrint);
  }

  const shareButton = document.getElementById('share-btn');
  if (shareButton) { 
    if (navigator.share || navigator.clipboard) {
      shareButton.style.display = 'flex';
    }
    shareButton.addEventListener('click', handleShare);
  }

  const vcardBtn = document.getElementById('vcard-btn');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', handleVCardDownload);
  }

  const themeButton = document.getElementById('theme-btn');
  if (themeButton) {
    themeButton.addEventListener('click', toggleTheme);
  }

  // Copyable contact fields setup
  document.querySelectorAll('[data-copy]').forEach(element => {
    element.addEventListener('click', handleCopy);
  });

  // Language selector expanded logic
  const langTrigger = document.getElementById('lang-trigger');
  langTrigger?.addEventListener('click', (event) => {
    event.stopPropagation();
    const trigger = event.currentTarget;
    const menu = document.getElementById('lang-menu');
    const isMenuOpen = menu?.classList.toggle('open');
    trigger.classList.toggle('open', isMenuOpen);
    trigger.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');
  });

  // Click outside to collapse language menu
  document.addEventListener('click', () => {
    const menu = document.getElementById('lang-menu');
    if (menu?.classList.contains('open')) {
      menu.classList.remove('open');
      const trigger = document.getElementById('lang-trigger');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.classList.remove('open');
      }
    }
  });
  



  // Handle messages received from parent frame (if embedded inside portfolio context)
  window.addEventListener('message', (event) => {
    const trustedOrigins = [window.location.origin, 'https://eneko-ruiz.vercel.app'];
    if (!trustedOrigins.some(origin => event.origin.startsWith(origin))) {
      return;
    }
    if (event.data.type === 'set-theme') {
      applyTheme(event.data.theme === 'dark');
    }
    if (event.data.type === 'print-cv') {
      handlePrint();
    }
    if (event.data.type === 'share-cv') {
      handleShare();
    }
    if (event.data.type === 'leaving') {
      document.body.style.opacity = '0';
    }
  });

  // Throttle portfolio hover synchronization inside iframes
  let lastMouseMoveTime = 0;
  window.addEventListener('mousemove', (event) => {
    if (window.parent !== window) {
      const now = Date.now();
      if (now - lastMouseMoveTime > 16) {
        const hoverTarget = event.target.closest('a, button, [data-h], .lm-item');
        const cursorMode = hoverTarget ? 'default' : 'none';
        window.parent.postMessage({ 
          type: 'portfolio-cursor-move', 
          x: event.clientX, 
          y: event.clientY, 
          mode: cursorMode 
        }, '*');
        lastMouseMoveTime = now;
      }
    }
  });

  // Height dynamic synchronization inside iframes
  if (window.parent !== window) {
    const heightSyncObserver = new ResizeObserver(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'set-cv-height', height: scrollHeight }, '*');
    });
    heightSyncObserver.observe(document.body);
    
    // Initial height post
    window.parent.postMessage({ 
      type: 'set-cv-height', 
      height: document.documentElement.scrollHeight 
    }, '*');
  }

  // Top header screen scroll progress indicator
  const cachedProgressBar = document.getElementById('scroll-progress');
  let cachedScrollableRange = document.documentElement.scrollHeight - window.innerHeight;
  let scrollTicking = false;

  // Recalculate on resize (orientation change, dynamic content)
  window.addEventListener('resize', () => {
    cachedScrollableRange = document.documentElement.scrollHeight - window.innerHeight;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        if (cachedProgressBar) {
          const progress = cachedScrollableRange <= 0 ? 0 : (window.scrollY / cachedScrollableRange);
          cachedProgressBar.style.transform = `scaleX(${progress})`;
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Disable automatic scroll restoration on refresh and force page to top to trigger animations cleanly
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  setupPrintScale();
  const printControl = document.getElementById('print-btn');
  if (printControl) {
    printControl.addEventListener('pointerenter', placePdfPreview);
  }

  // Calm first paint: reveal once fonts are ready (max 1000ms), with a single fade
  const revealPage = () => requestAnimationFrame(() => html.classList.remove('cv-loading'));
  const loadFonts = document.fonts ? Promise.all([
    document.fonts.load('16px "Bricolage Grotesque"'),
    document.fonts.load('16px "Manrope"')
  ]) : Promise.resolve();

  Promise.race([
    loadFonts,
    new Promise(resolve => setTimeout(resolve, 1000))
  ]).then(revealPage, revealPage);

  // i18n & initial URL query initialization
  const urlParameters = new URLSearchParams(window.location.search);
  // URL → saved choice → visitor's browser language → English (international default)
  const browserLang = (navigator.languages || [navigator.language || ''])
    .map(code => String(code).slice(0, 2).toLowerCase())
    .find(code => T[code]);
  const explicitLang = urlParameters.get('lang') || safeStorage.get('cv-lang');
  const initialLang = explicitLang || browserLang || 'en';
  applyTranslations(initialLang, explicitLang ? initialLang : 'auto');
  updateExportButtonLabel();
  window.addEventListener('resize', () => updateExportButtonLabel(), { passive: true });

  if (urlParameters.has('pdf')) {
    forcePrintReadyState();
    document.documentElement.classList.add('pdf-render');
    return;
  }

  // Direct headless print query (?print)
  if (urlParameters.has('print')) {
    setTimeout(handlePrint, 500);
  }



  setupScrollReveal();

  setTimeout(() => {
    document.documentElement.classList.add('theme-loaded');
  }, 100);

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
    });
  }

})();



