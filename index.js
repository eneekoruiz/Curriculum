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
      // Fail silently if localStorage is restricted
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
    html.style.backgroundColor = isDarkTheme ? '#020617' : '#ffffff';
    
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
    // Fail silently in case of paint issues during initial DOM setup
  }
};

/* ── INTERNATIONALIZATION (i18n) ENGINE ───────────────────────── */

/**
 * Dynamically applies translations to elements with data-i18n attributes.
 * Updates HTML attributes, search engine tags and the footer copyright year.
 * @param {string} langCode 
 */
const applyTranslations = (langCode) => {
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
    langLabel.textContent = metadata.name;
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
    footerElement.innerHTML = `${translations.footer_text} &copy; ${currentYear}`;
  }

  // Synchronize language dropdown menu visual states
  document.querySelectorAll('.lm-item').forEach(menuItem => {
    const menuItemCode = menuItem.getAttribute('data-code');
    const isActive = menuItemCode === langCode;
    
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
  applyTranslations(langCode);
  safeStorage.set('cv-lang', langCode);
};


const getRuntimeContext = () => {
  const userAgent = navigator.userAgent || '';
  let isEmbedded = false;

  try {
    isEmbedded = window.self !== window.top;
  } catch (error) {
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
    // Cross-origin or sandboxed iframes may block top navigation.
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
    showCopyTip(printButton, copy.ready);
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
window.toggleTheme = () => {
  const isCurrentlyDark = html.getAttribute('data-theme') === 'dark';
  applyTheme(!isCurrentlyDark);
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
      // Silent catch (handles user canceling share drawer)
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const shareButton = document.getElementById('share-btn');
      const successMessage = T[currentLang]?.copy_ok || 'Link Copied!';
      showCopyTip(shareButton, successMessage);
    } catch (clipboardError) {
      // Silent catch
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
  
  document.body.appendChild(tipElement);
  
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
    // Fail silently if clipboard write permissions are denied
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

/* ── EASTER EGG — DEVELOPER CONSOLE CLI ── */

/**
 * Renders a clean terminal message in the developer tools.
 */
const _runCLI = () => {
  const monoFont = 'font-family:"JetBrains Mono",monospace;';
  const headerStyle = `
    font-size: 48px;
    font-weight: 900;
    color: #334155;
    text-shadow: 
      3px 3px 0px #1e293b, 
      6px 6px 0px rgba(51, 65, 85, 0.15);
    padding: 10px 0;
    ${monoFont}
  `;
  
  const subtitleStyle = `color: #64748b; font-size: 14px; font-weight: 500; ${monoFont}`;
  const systemStyle = `color: #334155; font-size: 13px; font-weight: bold; ${monoFont}`;

  console.log("%cENEKO RUIZ", headerStyle);
  console.log("%cINTERACTIVE CURRICULUM %c// %cVERSION 3.0.4", subtitleStyle, "color:#c4965a", subtitleStyle);
  console.log("%c ", "font-size: 5px;"); // Spacer
  console.log("%c> [SYSTEM]: Kernel initialized. Memory stable.", systemStyle);
  console.log(
    "%c> [ACCESS]: Terminal granted. Type %chire()%c to connect.",
    systemStyle,
    "color:#c4965a; background:rgba(196,150,90,0.1); padding: 1px 4px; border-radius:3px;",
    systemStyle
  );
};

/**
 * Console easter egg: opens the mail client with a ready-made message.
 * @returns {string} success message
 */
window.hire = function() {
  const mailtoUrl = "mailto:eneekoruiz@gmail.com?subject=Propuesta%20Laboral%20%E2%80%94%20Eneko%20Ruiz&body=Hola%20Eneko%2C%0A%0AHe%20visto%20tu%20curr%C3%ADculum%20interactivo%20y%20me%20gustar%C3%ADa%20contactar%20contigo...";

  console.log("%c🚀 Iniciando conexión... Abriendo cliente de correo.", "color: #c4965a; font-size: 14px; font-weight: bold;");
  window.location.href = mailtoUrl;
  return "🚀 Conexión establecida. ¡Suerte!";
};

let _devToolsOpened = false;
window.addEventListener('keydown', (event) => {
  const isShortcutKey = ['I', 'J', 'C'].includes(event.key.toUpperCase());
  if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && isShortcutKey)) {
    if (!_devToolsOpened) {
      _devToolsOpened = true;
      setTimeout(_runCLI, 500);
    }
  }
});

const setupSurfacePolish = () => {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const surfaces = document.querySelectorAll('.ctrl, .contact-row, .proj-link, .lm-item, .pill, .course-item, .lang-chip');
  if (!surfaces.length) {
    return;
  }

  surfaces.forEach(surface => {
    surface.addEventListener('pointerenter', () => {
      surface.style.setProperty('--mx', '50%');
      surface.style.setProperty('--my', '50%');
    });

    surface.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return;
      }

      const rect = surface.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const nextX = ((event.clientX - rect.left) / rect.width) * 100;
      const nextY = ((event.clientY - rect.top) / rect.height) * 100;

      surface.style.setProperty('--mx', `${Math.max(0, Math.min(100, nextX))}%`);
      surface.style.setProperty('--my', `${Math.max(0, Math.min(100, nextY))}%`);
    });

    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--mx', '50%');
      surface.style.setProperty('--my', '50%');
    });
  });
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
 * Calm scroll reveal: each section below the cover fades in (10px rise) the first time
 * it enters the viewport. Nothing is hidden without JavaScript, with reduced motion,
 * in print or in the PDF render.
 */
const setupScrollReveal = () => {
  const sections = document.querySelectorAll('.dashboard > section');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!sections.length || reducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  html.classList.add('scroll-reveal');
  sections.forEach(section => observer.observe(section));
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
    setupSurfacePolish();
  }

  // Setup language dropdown menu list
  const languageMenu = document.getElementById('lang-menu');
  if (languageMenu && M) {
    languageMenu.innerHTML = '';
    Object.entries(M)
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .forEach(([langCode, langMetadata]) => {
      const optionButton = document.createElement('button');
      optionButton.className = 'lm-item';
      optionButton.setAttribute('role', 'option');
      optionButton.setAttribute('data-code', langCode);
      optionButton.innerHTML = `<span>${langMetadata.name}</span><span class="lm-iso">${langMetadata.iso}</span>`;
      optionButton.addEventListener('click', () => setLang(langCode));
      languageMenu.appendChild(optionButton);
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
  
  // Custom global shortcut listener (p = print, s = share)
  window.addEventListener('keydown', (event) => {
    const targetTag = event.target.tagName.toLowerCase();
    if (['input', 'textarea'].includes(targetTag) || event.target.isContentEditable) {
      return;
    }
    if (event.key.toLowerCase() === 'p' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      handlePrint();
    }
    if (event.key.toLowerCase() === 's' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      handleShare();
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

  // Active status live time counter
  let timeUpdaterTimer = null;
  const updateTime = () => {
    const liveTimeElement = document.getElementById('live-time');
    if (!liveTimeElement) return;
    
    const now = new Date();
    const hoursString = now.getHours().toString().padStart(2, '0');
    const minutesString = now.getMinutes().toString().padStart(2, '0');
    liveTimeElement.textContent = `${hoursString}:${minutesString}`;
    
    const nextTickDelay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    timeUpdaterTimer = setTimeout(updateTime, nextTickDelay + 100);
  };
  updateTime();

  // Premium interface Audio Feedback System (Click ticks)
  let clickAudioContext = null;
  const playClickTick = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!clickAudioContext) {
        clickAudioContext = new AudioCtx();
      }
      if (clickAudioContext.state === 'suspended') {
        clickAudioContext.resume();
      }
      const oscillator = clickAudioContext.createOscillator();
      const gainNode = clickAudioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, clickAudioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, clickAudioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.02, clickAudioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, clickAudioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(clickAudioContext.destination);
      
      oscillator.start();
      oscillator.stop(clickAudioContext.currentTime + 0.1);
    } catch (audioError) {
      // Audio errors are safely suppressed (e.g. user interaction gestures restrictions)
    }
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.ctrl, .contact-row, .lm-item, .proj-link')) { 
      playClickTick(); 
    }
  });

  window.addEventListener('beforeunload', () => {
    try {
      if (timeUpdaterTimer) { 
        clearTimeout(timeUpdaterTimer); 
        timeUpdaterTimer = null; 
      }
      if (clickAudioContext && typeof clickAudioContext.close === 'function') { 
        clickAudioContext.close().catch(() => {}); 
        clickAudioContext = null; 
      }
    } catch (e) {}
  });

  // Top header screen scroll progress indicator
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const progressBar = document.getElementById('scroll-progress');
        const scrollableRange = document.documentElement.scrollHeight - window.innerHeight;
        if (progressBar) {
          const progress = scrollableRange <= 0 ? 0 : (window.scrollY / scrollableRange);
          progressBar.style.transform = `scaleX(${progress})`;
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

  // Calm first paint: reveal once fonts are ready (max 800ms), with a single fade
  const revealPage = () => requestAnimationFrame(() => html.classList.remove('cv-loading'));
  Promise.race([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    new Promise(resolve => setTimeout(resolve, 800))
  ]).then(revealPage, revealPage);

  // i18n & initial URL query initialization
  const urlParameters = new URLSearchParams(window.location.search);
  // URL → saved choice → visitor's browser language → English (international default)
  const browserLang = (navigator.languages || [navigator.language || ''])
    .map(code => String(code).slice(0, 2).toLowerCase())
    .find(code => T[code]);
  const initialLang = urlParameters.get('lang') || safeStorage.get('cv-lang') || browserLang || 'en';
  applyTranslations(initialLang);
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
