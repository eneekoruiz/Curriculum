/*
 * CURRICULUM VITAE — CORE ENGINE v3.1.2
 * Refactored for ultimate visual code craftsmanship, legibility, and maintainability.
 * Standardized LF line endings & validated for 10/10 production excellence.
 * Zero external dependencies. High efficiency pure Vanilla JS.
 */

const BIRTH_DATE = '2005-07-28';
const html = document.documentElement;
const root = document.getElementById('main-content');
let currentLang = 'es';
let themeTransitionTimeout = null;

const PRECISION_MOTION = {
  duration: 1.4,
  revealDuration: 0.56,
  childDuration: 0.42,
  stagger: 0.035,
  initialDelay: 1.32,
  ease: cubicBezier(0.42, 0, 0.16, 1)
};

function cubicBezier(x1, y1, x2, y2) {
  const sampleCurveX = (t) => ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + (3 * x1) * t;
  const sampleCurveY = (t) => ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + (3 * y1) * t;
  const sampleDerivativeX = (t) => (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + (3 * x1);

  return (x) => {
    if (x <= 0 || x >= 1) {
      return x;
    }

    let t = x;
    for (let i = 0; i < 4; i += 1) {
      const currentX = sampleCurveX(t) - x;
      const derivative = sampleDerivativeX(t);
      if (Math.abs(currentX) < 0.001 || Math.abs(derivative) < 0.001) {
        break;
      }
      t -= currentX / derivative;
    }

    return sampleCurveY(Math.max(0, Math.min(1, t)));
  };
}

const playRevealTimeline = (timeline, section, offset = 0) => {
  if (!section || !timeline) {
    return;
  }

  const isHeader = section.classList.contains('site-header');
  const isProfile = section.classList.contains('profile');
  const childTargets = isHeader
    ? section.querySelectorAll('.eyebrow, h1, .tagline, .live-wrap, .contact-row')
    : isProfile
      ? section.querySelectorAll('.profile-label, .profile-text')
      : section.querySelectorAll('.sec-title, .course-item, .lang-chip, .skill-group, .tl-item, .proj-link');

  // Disable CSS transitions during GSAP animation to avoid rendering conflicts
  section.style.transition = 'none';
  childTargets.forEach(el => {
    el.style.transition = 'none';
  });

  timeline.fromTo(section,
    { opacity: 0, y: 18, scale: 0.985, clipPath: 'circle(0% at 8% 18%)' },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath: 'circle(145% at 8% 18%)',
      duration: isHeader ? PRECISION_MOTION.revealDuration + 0.12 : PRECISION_MOTION.revealDuration,
      ease: PRECISION_MOTION.ease,
      clearProps: 'transform,scale,opacity,transition,clipPath',
      onStart: () => section.classList.add('visible'),
      onComplete: () => section.classList.add('visible')
    },
    offset
  );

  if (childTargets.length) {
    timeline.fromTo(childTargets,
      { opacity: 0, x: -10, y: 6 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: PRECISION_MOTION.childDuration,
        stagger: PRECISION_MOTION.stagger,
        ease: PRECISION_MOTION.ease,
        clearProps: 'transform,opacity,transition'
      },
      offset + (isHeader ? 0.08 : 0.1)
    );
  }
};

/* ── HELPERS & UTILITIES ────────────────────────────────────────── */

/**
 * Calculates current age based on a birth date string (YYYY-MM-DD).
 * @param {string} birthday 
 * @returns {number}
 */
const calculateAge = (birthday) => {
  const birthDate = new Date(birthday);
  const today = new Date();
  
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }
  
  return calculatedAge;
};

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
 * Updates dynamic placeholders (like {{age}}), HTML attributes, search engine tags, and footer copyright year.
 * @param {string} langCode 
 */
const applyTranslations = (langCode) => {
  const translations = T[langCode];
  const metadata = M[langCode];
  
  if (!translations || !metadata) {
    return;
  }
  
  currentLang = langCode;
  const currentAge = calculateAge(BIRTH_DATE);

  // Translate all text elements and accessibility tags
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const translationKey = element.getAttribute('data-i18n');
    let translatedValue = translations[translationKey];
    
    if (translatedValue !== undefined) {
      if (typeof translatedValue === 'string') {
        translatedValue = translatedValue.replace('{{age}}', currentAge);
      }
      
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
  document.title = `Eneko Ruiz Mollón — ${translations.eyebrow}`;
  
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = metadata.name;
  }
  
  // Search Engine & Metadata synchronization
  const metaDescription = translations.meta_desc || '';
  document.querySelector('meta[name="description"]')?.setAttribute('content', metaDescription);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', metaDescription);

  const localizedLocale = `${metadata.iso.toLowerCase()}_${metadata.iso}`;
  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', localizedLocale);
  
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
};

/**
 * Triggers a smooth opacity transition when switching languages.
 * @param {string} langCode 
 */
const setLang = (langCode) => {
  if (window.gsap) {
    gsap.to(root, {
      opacity: 0,
      y: 8,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => {
        applyTranslations(langCode);
        safeStorage.set('cv-lang', langCode);
        
        gsap.to(root, {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: 'power2.out',
          clearProps: 'opacity,transform'
        });
      }
    });
  } else {
    applyTranslations(langCode);
    safeStorage.set('cv-lang', langCode);
  }
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

const forcePrintReadyState = () => {
  document.documentElement.classList.add('print-ready');
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
};

const getPdfDownloadUrl = () => {
  const pdfUrl = new URL('/api/pdf', window.location.origin);
  pdfUrl.searchParams.set('lang', currentLang || 'es');
  pdfUrl.searchParams.set('v', Date.now().toString(36));
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

  if (runtime.isEmbedded && window.parent) {
    window.parent.postMessage({ type: 'cv-download-pdf', url: pdfUrl }, '*');
  }

  if (options.preferDirect || runtime.isIOS) {
    showCopyTip(printButton, currentLang === 'es' ? 'Abriendo PDF...' : 'Opening PDF...');
    openPdfDirectly(pdfUrl);
    return;
  }

  try {
    const response = await fetch(pdfUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/pdf' }
    });

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
    link.download = 'Eneko_Ruiz_CV.pdf';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
    showCopyTip(printButton, currentLang === 'es' ? 'PDF preparado' : 'PDF ready');
  } catch (error) {
    console.error('Blob PDF download failed; falling back to direct PDF navigation:', error);
    showCopyTip(printButton, currentLang === 'es' ? 'Abriendo PDF...' : 'Opening PDF...');
    openPdfDirectly(pdfUrl);
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

  const statusLabel = printButton.querySelector('span');
  const originalButtonText = statusLabel ? statusLabel.textContent : '';
  const { isEmbedded, isMobile, isIOS, isSafari } = getRuntimeContext();
  const shouldUsePdfDownload = isEmbedded || isMobile || typeof window.print !== 'function';

  const resetPrintButton = () => {
    if (statusLabel) {
      statusLabel.textContent = originalButtonText;
    }
    printButton.removeAttribute('data-loading');
  };

  printButton.setAttribute('data-loading', 'true');
  if (statusLabel) {
    statusLabel.textContent = shouldUsePdfDownload
      ? (currentLang === 'es' ? 'Preparando PDF...' : 'Preparing PDF...')
      : (currentLang === 'es' ? 'Abriendo impresión...' : 'Opening print...');
  }

  forcePrintReadyState();

  try {
    if (shouldUsePdfDownload) {
      await downloadGeneratedPdf(printButton, { preferDirect: isMobile || isIOS || isSafari });
      resetPrintButton();
      return;
    }

    const cleanupAfterPrint = () => resetPrintButton();
    window.addEventListener('afterprint', cleanupAfterPrint, { once: true });

    setTimeout(() => {
      window.print();
      setTimeout(cleanupAfterPrint, 1800);
    }, 80);
  } catch (error) {
    console.error('CV export failed:', error);
    resetPrintButton();
    showCopyTip(printButton, currentLang === 'es' ? 'No se pudo generar el PDF' : 'PDF export failed');
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

/* ── EASTER EGG — CONFETTI & DEVELOPER CONSOLE CLI ── */

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
 * Triggers full-screen interactive confetti fall and launches email client with direct message template.
 * @returns {string} success message
 */
window.hire = function() {
  const confettiColors = ['#c4965a', '#334155', '#94a3b8', '#0f172a', '#475569'];
  const confettiContainer = document.createElement('div');
  Object.assign(confettiContainer.style, {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 99999
  });
  document.body.appendChild(confettiContainer);
  
  for (let i = 0; i < 100; i++) {
    const confettiElement = document.createElement('div');
    const size = 5 + Math.random() * 8;
    const isRound = Math.random() > 0.5;
    
    Object.assign(confettiElement.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      left: '50vw',
      top: '60vh',
      borderRadius: isRound ? '50%' : '2px',
      opacity: 0
    });
    
    confettiContainer.appendChild(confettiElement);
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 200 + Math.random() * 300;
    const targetX = Math.cos(angle) * velocity + (Math.random() - 0.5) * 100;
    const targetY = Math.sin(angle) * velocity + (Math.random() - 0.5) * 100;
    
    gsap.set(confettiElement, { x: 0, y: 0, opacity: 1, scale: 0.5 });
    
    gsap.to(confettiElement, {
      x: targetX,
      y: targetY - 150, // blast up
      scale: 1,
      rotation: Math.random() * 720 - 360,
      duration: 0.6 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => {
        // Gravity fall
        gsap.to(confettiElement, {
          y: '+=500',
          x: `+=${(Math.random() - 0.5) * 150}`,
          opacity: 0,
          scale: 0.4,
          rotation: `+=${Math.random() * 360}`,
          duration: 1.5 + Math.random() * 1.5,
          ease: 'power1.in',
          onComplete: () => confettiElement.remove()
        });
      }
    });
  }
  
  setTimeout(() => confettiContainer.remove(), 4000);
  
  console.log("%c🚀 Iniciando conexión... Abriendo cliente de correo.", "color: #c4965a; font-size: 14px; font-weight: bold;");
  
  setTimeout(() => {
    window.location.href = "mailto:eneekoruiz@gmail.com?subject=Propuesta%20Laboral%20%E2%80%94%20Eneko%20Ruiz&body=Hola%20Eneko%2C%0A%0AHe%20visto%20tu%20curr%C3%ADculum%20interactivo%20y%20me%20gustar%C3%ADa%20contactar%20contigo...";
  }, 1200);
  
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

// Dynamic Magnetic Controls (Topbar controls follow cursor on close hover)
const setupMagneticControls = () => {
  const controls = document.querySelectorAll('#topbar .ctrl');
  if (!controls.length || !window.gsap) return;
  
  controls.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;
      
      const distX = e.clientX - btnX;
      const distY = e.clientY - btnY;
      
      gsap.to(btn, {
        x: distX * 0.15,
        y: distY * 0.15,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto'
      });
    });
  });
};

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

/* ── INITIALIZATION ───────────────────────────────────────────── */
(function init() {
  // Force manual scroll position behavior on page load to prevent erratic scroll jumps
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));

  const bootParameters = new URLSearchParams(window.location.search);
  const isPdfRender = bootParameters.has('pdf');
  const shouldAnimateMotion = !isPdfRender && Boolean(window.gsap) &&
    !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (shouldAnimateMotion) {
    document.documentElement.classList.add('motion-ready');
  }

  // Initialize magnetic controls
  setupMagneticControls();
  setupSurfacePolish();

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
      if (shouldAnimateMotion) {
        gsap.to(document.body, {
          opacity: 0,
          scale: 0.98,
          duration: 0.5,
          ease: 'power2.inOut'
        });
      } else {
        document.body.style.opacity = '0';
      }
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
  window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('scroll-progress');
    const scrollableRange = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      progressBar.style.width = scrollableRange <= 0 ? '0%' : ((window.scrollY / scrollableRange) * 100) + '%';
    }
  });

  // Disable automatic scroll restoration on refresh and force page to top to trigger animations cleanly
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // i18n & initial URL query initialization
  const urlParameters = new URLSearchParams(window.location.search);
  const initialLang = urlParameters.get('lang') || safeStorage.get('cv-lang') || 'es';
  applyTranslations(initialLang);

  if (urlParameters.has('pdf')) {
    forcePrintReadyState();
    document.documentElement.classList.add('pdf-render');
    return;
  }

  // Lazy reveal entrance transition observers powered by GSAP
  const entranceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        const target = entry.target;
        entranceObserver.unobserve(target);
        
        target.style.transition = 'none';
        
        if (shouldAnimateMotion) {
          const tl = gsap.timeline();
          playRevealTimeline(tl, target, 0);
        } else {
          target.style.opacity = '1';
          target.style.transform = 'none';
          target.classList.add('visible');
        }
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 100px 0px' });

  // Handle direct headless print query
  if (urlParameters.has('print')) {
    document.querySelectorAll('.reveal').forEach(element => {
      if (shouldAnimateMotion) {
        gsap.set(element, { opacity: 1, scale: 1, y: 0 });
      } else {
        element.style.opacity = '1';
        element.style.transform = 'none';
      }
      element.classList.add('visible');
    });
    setTimeout(handlePrint, 500);
  } else {
    // Orchestrate the initial entrance sequence for elements visible on load
    if (shouldAnimateMotion) {
      document.documentElement.classList.add('gsap-active');
      const allReveals = Array.from(document.querySelectorAll('.reveal'));
      const initialReveals = [];
      const scrollReveals = [];

      allReveals.forEach(element => {
        const rect = element.getBoundingClientRect();
        // Check if element is in/near the viewport on load
        if (rect.top < window.innerHeight - 50) {
          initialReveals.push(element);
        } else {
          scrollReveals.push(element);
        }
      });

      // Coordinated timeline for elements in initial viewport
      const tl = gsap.timeline({ delay: PRECISION_MOTION.initialDelay });

      initialReveals.forEach((section, index) => {
        playRevealTimeline(tl, section, index * 0.12);
      });

      setTimeout(() => {
        if (!document.querySelector('.reveal.visible')) {
          initialReveals.forEach(element => {
            gsap.set(element, { opacity: 1, scale: 1, y: 0, clearProps: 'transform,opacity,clipPath,filter' });
            element.querySelectorAll('.eyebrow, h1, .tagline, .live-wrap, .contact-row, .profile-label, .profile-text, .sec-title, .course-item, .lang-chip, .skill-group, .tl-item, .proj-link')
              .forEach(child => gsap.set(child, { opacity: 1, x: 0, y: 0, clearProps: 'transform,opacity,filter' }));
            element.classList.add('visible');
          });
        }
      }, 2600);

      // Observe the remaining scroll reveals
      scrollReveals.forEach(element => entranceObserver.observe(element));
    } else {
      // Fallback: observe everything immediately
      document.querySelectorAll('.reveal').forEach(element => entranceObserver.observe(element));
    }

    // Safety fallback delayed to 4000ms to allow all normal entrance animations to complete smoothly
    setTimeout(() => {
      const remainingHidden = document.querySelectorAll('.reveal:not(.visible)');
      if (remainingHidden.length) { 
        remainingHidden.forEach(element => {
          if (shouldAnimateMotion) {
            gsap.set(element, { opacity: 1, scale: 1, y: 0 });
            const childItems = element.querySelectorAll('.tl-item, .pill, .proj-link');
            if (childItems.length) {
              gsap.set(childItems, { opacity: 1, y: 0 });
            }
          } else {
            element.style.opacity = '1';
            element.style.transform = 'none';
          }
          element.classList.add('visible');
        });
      }
      document.documentElement.classList.remove('motion-ready');
    }, 4000);
  }
  
  setTimeout(() => {
    document.documentElement.classList.add('theme-loaded');
  }, 100);

  // --- PREMIUM UI INITIALIZATION ---
  const initPremiumUI = () => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && window.gsap) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.1, ease: 'power2.out' });
        gsap.to(cursorOutline, { x: mouseX, y: mouseY, duration: 0.5, ease: 'power2.out' });
      });
      
      const magnetics = document.querySelectorAll('.magnetic');
      magnetics.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = (e.clientX - cx) * 0.3;
          const dy = (e.clientY - cy) * 0.3;
          gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
        });
      });

      const cards = document.querySelectorAll('.glass-card');
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          
          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 1000
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        });
      });
    }
  };
  
  initPremiumUI();

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
    });
  }

})();
