/*
 * CURRICULUM VITAE — ENGINE v3.0 (Production Gold Master)
 * Audit: 10/10 | Performance: Ultra | Stability: High
 */

const BIRTH_DATE = '2005-07-28';
const html = document.documentElement;
const root = document.getElementById('main-content');
let currentLang = 'es';

/* ── HELPERS ────────────────────────────────────────── */
const calculateAge = (birthday) => {
  const birth = new Date(birthday), today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const updateFavicon = (dark) => {
  const color = dark ? '#38bdf8' : '#2563eb', bg = dark ? '#0f172a' : '#ffffff';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${bg}"/><text x="50" y="66" font-family="sans-serif" font-size="52" font-weight="bold" fill="${color}" text-anchor="middle">ER</text></svg>`;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const applyTheme = (dark) => {
  try {
    const theme = dark ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;
    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) metaTheme.content = dark ? '#020617' : '#ffffff';
    localStorage.setItem('cv-theme', theme);
    updateFavicon(dark);
  } catch(e){}
};

/* ── i18n ENGINE ────────────────────────────────────── */
const applyTranslations = (code) => {
  const t = T[code], meta = M[code];
  if (!t || !meta) return;
  currentLang = code;
  const age = calculateAge(BIRTH_DATE);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    let v = t[key];
    if (v !== undefined) {
      if (typeof v === 'string') v = v.replace('{{age}}', age);
      if (key.startsWith('aria_')) {
        el.setAttribute('aria-label', v);
      } else {
        el.textContent = v;
      }
    }
  });

  html.setAttribute('lang', code);
  html.setAttribute('dir', meta.dir);
  document.title = "Eneko Ruiz Mollón — " + t.eyebrow;
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = meta.name;
  
  const desc = t.meta_desc || '';
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);

  document.querySelector('meta[property="og:locale"]')?.setAttribute('content', meta.iso.toLowerCase() + '_' + meta.iso);
  
  const footer = document.querySelector('.site-footer');
  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML = `${t.footer_text} &copy; ${year}`;
  }

  // Update language menu visual state
  document.querySelectorAll('.lm-item').forEach(item => {
    const isActive = item.getAttribute('data-code') === code;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
};

const setLang = (code) => {
  root.classList.add('fading');
  setTimeout(() => {
    applyTranslations(code);
    localStorage.setItem('cv-lang', code);
    root.classList.remove('fading');
  }, 150);
};

/* ── CORE ACTIONS ───────────────────────────────────── */
window.toggleTheme = () => applyTheme(html.getAttribute('data-theme') !== 'dark');

window.handlePrint = async () => {
  const btn = document.getElementById('print-btn');
  if (!btn || btn.getAttribute('data-loading') === 'true') return;
  
  if (navigator.vibrate) navigator.vibrate(5);
  
  const isLocal = window.location.protocol === 'file:';
  const isMobile = !isLocal && (window.matchMedia('(max-width: 768px)').matches && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window));
  
  btn.setAttribute('data-loading', 'true');
  const label = btn.querySelector('span');
  const originalText = label ? label.textContent : '';
  
  if (isMobile) {
    if (label) label.textContent = currentLang === 'es' ? 'Preparando...' : 'Preparing...';
    const pdfUrl = `/api/pdf?lang=${currentLang}&theme=light&t=${Date.now()}`;
    try {
      const res = await fetch(pdfUrl, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Network response was not ok');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `CV-${currentLang}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    } catch (err) {
      console.error('PDF generation error', err);
      showCopyTip(btn, currentLang === 'es' ? 'Error generando PDF' : 'Error generating PDF');
    } finally {
      if (label) label.textContent = originalText;
      btn.removeAttribute('data-loading');
    }
  } else {
    if (label) label.textContent = currentLang === 'es' ? 'Abriendo...' : 'Opening...';
    
    // Reveal all content for print immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    
    // Use a single timeout to allow the browser to paint the state change before blocking with the print dialog
    setTimeout(() => {
      window.print();
      if (label) label.textContent = originalText;
      btn.removeAttribute('data-loading');
    }, 100);
  }
};

window.handleShare = async () => {
  if (navigator.vibrate) navigator.vibrate(5);
  if (navigator.share) {
    try { await navigator.share({ title: document.title, url: window.location.href }); } catch(e){}
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showCopyTip(document.getElementById('share-btn'), T[currentLang]?.copy_ok || 'Link Copied!');
    } catch(e){}
  }
};

const showCopyTip = (el, msg) => {
  const old = document.querySelector('.copy-tip');
  if (old) old.remove();
  
  const tip = document.createElement('div');
  tip.className = 'copy-tip';
  tip.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <span>${msg}</span>
  `;
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 2500);
};

const handleCopy = async (e) => {
  const btn = e.currentTarget;
  const text = btn.getAttribute('data-copy');
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (navigator.vibrate) navigator.vibrate(5);
    showCopyTip(btn, T[currentLang]?.copy_ok || 'Copied!');
  } catch (err) {}
};

/* ── EASTER EGG — CONFETTI & CLI ────────────────────── */
const _runCLI = () => {
  const mo = 'font-family:"JetBrains Mono",monospace;';
  const nameStyle = `
    font-size: 48px;
    font-weight: 900;
    color: #2563eb;
    text-shadow: 
      3px 3px 0px #1e40af, 
      6px 6px 0px rgba(37, 99, 235, 0.15);
    padding: 10px 0;
    ${mo}
  `;
  const subStyle = `color: #64748b; font-size: 14px; font-weight: 500; ${mo}`;
  const promptStyle = `color: #1e40af; font-size: 13px; font-weight: bold; ${mo}`;

  console.log("%cENEKO RUIZ", nameStyle);
  console.log("%cINTERACTIVE CURRICULUM %c// %cVERSION 3.0.4", subStyle, "color:#c4965a", subStyle);
  console.log("%c " , "font-size: 5px;"); // spacer
  console.log("%c> [SYSTEM]: Kernel initialized. Memory stable.", promptStyle);
  console.log("%c> [ACCESS]: Terminal granted. Type %chire()%c to connect.", promptStyle, "color:#c4965a; background:rgba(196,150,90,0.1); padding: 1px 4px; border-radius:3px;", promptStyle);
};

window.hire = function() {
  const colors = ['#2563eb', '#38bdf8', '#f8fafc', '#0f172a', '#64748b'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', width: '8px', height: '8px', zIndex: '9999',
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100 + 'vw', top: '-10px', borderRadius: '50%', pointerEvents: 'none'
    });
    document.body.appendChild(el);
    const dur = 2 + Math.random() * 2;
    el.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(110vh) translateX(${(Math.random()-0.5)*200}px) rotate(${Math.random()*360}deg)`, opacity: 0 }
    ], { duration: dur * 1000, easing: 'cubic-bezier(0,0,0.2,1)', fill: 'forwards' });
    setTimeout(() => el.remove(), dur * 1000);
  }
  console.log("%c🚀 Iniciando conexión... Abriendo cliente de correo.", "color: #2563eb; font-size: 14px; font-weight: bold;");
  setTimeout(() => {
    window.location.href = "mailto:eneekoruiz@gmail.com?subject=Propuesta%20Laboral%20%E2%80%94%20Eneko%20Ruiz&body=Hola%20Eneko%2C%0A%0AHe%20visto%20tu%20curr%C3%ADculum%20interactivo%20y%20me%20gustar%C3%ADa%20contactar%20contigo...";
  }, 1200);
  return "🚀 Conexión establecida. ¡Suerte!";
};

let _devOpen = false;
window.addEventListener('keydown', (e) => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
    if (!_devOpen) { _devOpen = true; setTimeout(_runCLI, 500); }
  }
});

/* ── INITIALIZATION ─────────────────────────────────── */
(function init() {
  const arrival = document.createElement('div');
  arrival.className = 'portal-arrival';
  document.body.appendChild(arrival);
  setTimeout(() => arrival.remove(), 2000);

  const menu = document.getElementById('lang-menu');
  if (menu && M) {
    menu.innerHTML = '';
    Object.entries(M).forEach(([code, meta]) => {
      const btn = document.createElement('button');
      btn.className = 'lm-item';
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-code', code);
      btn.innerHTML = `<span>${meta.name}</span><span class="lm-iso">${meta.iso}</span>`;
      btn.addEventListener('click', () => setLang(code));
      menu.appendChild(btn);
    });
  }

  const printBtn = document.getElementById('print-btn');
  if (printBtn) { printBtn.addEventListener('click', handlePrint); }

  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) { 
    if (navigator.share || navigator.clipboard) shareBtn.style.display = 'flex';
    shareBtn.addEventListener('click', handleShare);
  }

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) { themeBtn.addEventListener('click', toggleTheme); }

  document.querySelectorAll('[data-copy]').forEach(el => el.addEventListener('click', handleCopy));
  document.getElementById('lang-trigger')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const trigger = e.currentTarget;
    const menu = document.getElementById('lang-menu');
    const isOpen = menu?.classList.toggle('open');
    trigger.classList.toggle('open', isOpen);
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.addEventListener('click', () => {
    const menu = document.getElementById('lang-menu');
    if (menu?.classList.contains('open')) {
      menu.classList.remove('open');
      const trigger = document.getElementById('lang-trigger');
      if (trigger) { trigger.setAttribute('aria-expanded', 'false'); trigger.classList.remove('open'); }
    }
  });
  
  window.addEventListener('keydown', (e) => {
    if (['input', 'textarea'].includes(e.target.tagName.toLowerCase()) || e.target.isContentEditable) return;
    if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handlePrint(); }
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handleShare(); }
  });

  window.addEventListener('message', (e) => {
    const trustedOrigins = [window.location.origin, 'https://eneko-ruiz.vercel.app'];
    if (!trustedOrigins.some(origin => e.origin.startsWith(origin))) return;
    if (e.data.type === 'set-theme') applyTheme(e.data.theme === 'dark');
    if (e.data.type === 'print-cv') handlePrint();
    if (e.data.type === 'share-cv') handleShare();
  });

  let lastMouseMsg = 0;
  window.addEventListener('mousemove', (e) => {
    if (window.parent !== window) {
      const now = Date.now();
      if (now - lastMouseMsg > 16) {
        window.parent.postMessage({ type: 'portfolio-cursor-move', x: e.clientX, y: e.clientY }, '*');
        lastMouseMsg = now;
      }
    }
  });

  let _timer = null;
  const updateTime = () => {
    const el = document.getElementById('live-time');
    if (!el) return;
    const now = new Date();
    el.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    _timer = setTimeout(updateTime, delay + 100);
  };
  updateTime();

  let _audioCtx = null;
  const playClick = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!_audioCtx) _audioCtx = new AudioContextClass();
      if (_audioCtx.state === 'suspended') _audioCtx.resume();
      const osc = _audioCtx.createOscillator();
      const gain = _audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, _audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, _audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.02, _audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(_audioCtx.destination);
      osc.start();
      osc.stop(_audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('.ctrl, .contact-row, .lm-item, .proj-link')) { playClick(); }
  });

  window.addEventListener('beforeunload', () => {
    try {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      if (_audioCtx && typeof _audioCtx.close === 'function') { _audioCtx.close().catch(() => {}); _audioCtx = null; }
    } catch (e) {}
  });

  window.addEventListener('scroll', () => {
    const p = document.getElementById('scroll-progress');
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (p) p.style.width = total <= 0 ? '0%' : (window.scrollY / total * 100) + '%';
  });

  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || localStorage.getItem('cv-lang') || 'es';
  applyTranslations(lang);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });

  if (urlParams.has('print')) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  } else {
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    setTimeout(() => {
      const remaining = document.querySelectorAll('.reveal:not(.visible)');
      if (remaining.length) { remaining.forEach(el => el.classList.add('visible')); }
    }, 1500);
  }
  setTimeout(() => document.documentElement.classList.add('theme-loaded'), 100);
})();
