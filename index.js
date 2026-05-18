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
 */
const applyTheme = (isDarkTheme) => {
  try {
    const themeValue = isDarkTheme ? 'dark' : 'light';
    
    html.setAttribute('data-theme', themeValue);
    html.style.colorScheme = themeValue;
    
    const metaThemeColor = document.getElementById('meta-theme-color');
    if (metaThemeColor) {
      metaThemeColor.content = isDarkTheme ? '#020617' : '#ffffff';
    }
    
    safeStorage.set('cv-theme', themeValue);
    updateFavicon(isDarkTheme);
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
  root.classList.add('fading');
  
  setTimeout(() => {
    applyTranslations(langCode);
    safeStorage.set('cv-lang', langCode);
    root.classList.remove('fading');
  }, 150);
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
 * Triggers the PDF export/print action.
 * Automatically switches between dynamic serverless Puppeteer API (for mobile and iframe sandbox environments)
 * and standard browser printing (for desktop browsers).
 */
window.handlePrint = async () => {
  const printButton = document.getElementById('print-btn');
  if (!printButton || printButton.getAttribute('data-loading') === 'true') {
    return;
  }
  
  if (navigator.vibrate) {
    navigator.vibrate(5);
  }
  
  const isLocalProtocol = window.location.protocol === 'file:';
  const isMobileDevice = !isLocalProtocol && (window.matchMedia('(max-width: 768px)').matches && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window));
  const isEmbeddedInIframe = window.parent !== window;
  
  printButton.setAttribute('data-loading', 'true');
  const statusLabel = printButton.querySelector('span');
  const originalButtonText = statusLabel ? statusLabel.textContent : '';
  
  // Use Vercel Serverless API for mobile or embedded contexts to bypass sandbox iframe printing restrictions
  if (isMobileDevice || (isEmbeddedInIframe && !isLocalProtocol)) {
    if (statusLabel) {
      statusLabel.textContent = currentLang === 'es' ? 'Preparando...' : 'Preparing...';
    }
    
    const pdfUrl = `/api/pdf?lang=${currentLang}&theme=light&t=${Date.now()}`;
    
    if (isEmbeddedInIframe) {
      // 1. Notify parent frame so the host website can handle it or trigger overlays
      window.parent.postMessage({ type: 'download-pdf', url: pdfUrl, lang: currentLang }, '*');
      
      // 2. Fallback to direct navigation which is highly reliable inside sandboxed frames
      window.location.href = pdfUrl;
      
      // Reset button state after a reasonable latency
      setTimeout(() => {
        if (statusLabel) {
          statusLabel.textContent = originalButtonText;
        }
        printButton.removeAttribute('data-loading');
      }, 2000);
      
      return;
    }

    try {
      const response = await fetch(pdfUrl, { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const pdfBlob = await response.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = `Eneko_Ruiz_CV_${currentLang.toUpperCase()}.pdf`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    } catch (error) {
      console.error('PDF generation error:', error);
      showCopyTip(printButton, currentLang === 'es' ? 'Error generando PDF' : 'Error generating PDF');
    } finally {
      if (statusLabel) {
        statusLabel.textContent = originalButtonText;
      }
      printButton.removeAttribute('data-loading');
    }
  } else {
    // Standard desktop browser print
    if (statusLabel) {
      statusLabel.textContent = currentLang === 'es' ? 'Abriendo...' : 'Opening...';
    }
    
    // Temporarily force reveal all lazy-loaded animated content for print rendering
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    
    // Slight paint delay before opening browser print view
    setTimeout(() => {
      window.print();
      if (statusLabel) {
        statusLabel.textContent = originalButtonText;
      }
      printButton.removeAttribute('data-loading');
    }, 100);
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
  const confettiColors = ['#334155', '#94a3b8', '#f8fafc', '#0f172a', '#475569'];
  
  for (let i = 0; i < 80; i++) {
    const confettiElement = document.createElement('div');
    
    Object.assign(confettiElement.style, {
      position: 'fixed',
      width: '8px',
      height: '8px',
      zIndex: '9999',
      backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      left: `${Math.random() * 100}vw`,
      top: '-10px',
      borderRadius: '50%',
      pointerEvents: 'none'
    });
    
    document.body.appendChild(confettiElement);
    const animationDuration = 2 + Math.random() * 2;
    
    confettiElement.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { 
        transform: `translateY(110vh) translateX(${(Math.random() - 0.5) * 200}px) rotate(${Math.random() * 360}deg)`, 
        opacity: 0 
      }
    ], { 
      duration: animationDuration * 1000, 
      easing: 'cubic-bezier(0,0,0.2,1)', 
      fill: 'forwards' 
    });
    
    setTimeout(() => {
      confettiElement.remove();
    }, animationDuration * 1000);
  }
  
  console.log("%c🚀 Iniciando conexión... Abriendo cliente de correo.", "color: #2563eb; font-size: 14px; font-weight: bold;");
  
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

/* ── INITIALIZATION ───────────────────────────────────────────── */
(function init() {
  // Force manual scroll position behavior on page load to prevent erratic scroll jumps
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));

  // Portal overlay intro animation sweep
  const arrivalOverlay = document.createElement('div');
  arrivalOverlay.className = 'portal-arrival';
  document.body.appendChild(arrivalOverlay);
  setTimeout(() => arrivalOverlay.remove(), 2000);

  // Setup language dropdown menu list
  const languageMenu = document.getElementById('lang-menu');
  if (languageMenu && M) {
    languageMenu.innerHTML = '';
    Object.entries(M).forEach(([langCode, langMetadata]) => {
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
      document.body.style.transform = 'scale(0.98)';
      document.body.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
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

  // i18n & initial URL query initialization
  const urlParameters = new URLSearchParams(window.location.search);
  const initialLang = urlParameters.get('lang') || safeStorage.get('cv-lang') || 'es';
  applyTranslations(initialLang);

  // Lazy reveal entrance transition observers
  const entranceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        entry.target.classList.add('visible');
        entranceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

  // Handle direct headless print query
  if (urlParameters.has('print')) {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    setTimeout(handlePrint, 500);
  } else {
    document.querySelectorAll('.reveal').forEach(element => entranceObserver.observe(element));
    setTimeout(() => {
      const remainingHidden = document.querySelectorAll('.reveal:not(.visible)');
      if (remainingHidden.length) { 
        remainingHidden.forEach(element => element.classList.add('visible')); 
      }
    }, 1500);
  }
  
  setTimeout(() => {
    document.documentElement.classList.add('theme-loaded');
  }, 100);
})();
