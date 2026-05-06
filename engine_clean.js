/*
 * CURRICULUM VITAE — ENGINE v3.0 (Production Gold Master)
 * Audit: 10/10 | Performance: Ultra | Stability: High
 */

const BIRTH_DATE = '2005-01-01';
const html = document.documentElement;
const root = document.getElementById('root');
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
  const color = dark ? '#c4965a' : '#7a6240', bg = dark ? '#161410' : '#f7f4ef';
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
    if (metaTheme) metaTheme.content = dark ? '#0e0d0b' : '#f7f4ef';
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
      el.textContent = v;
      if (key === 'aria_theme') document.getElementById('theme-btn')?.setAttribute('aria-label', v);
      if (key === 'aria_print') document.getElementById('print-btn')?.setAttribute('aria-label', v);
      if (key === 'aria_share') document.getElementById('share-btn')?.setAttribute('aria-label', v);
      if (key === 'aria_lang')  document.getElementById('lang-trigger')?.setAttribute('aria-label', v);
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

  const footer = document.querySelector('.site-footer');
  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML = `Coded from scratch by Eneko Ruiz Mollón &copy; ${year}`;
  }
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
const handlePrint = () => {
  if (navigator.vibrate) navigator.vibrate(5);
  const isIframe = window.self !== window.top;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isIframe || isMobile) {
    window.open(window.location.href + (window.location.search ? '&' : '?') + 'print=true', '_blank');
  } else {
    window.print();
  }
};

const handleShare = async () => {
  if (navigator.vibrate) navigator.vibrate(5);
  if (navigator.share) {
    try { await navigator.share({ title: document.title, url: window.location.href }); } catch(e){}
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert(T[currentLang]?.copy_ok || 'Link Copied!');
  }
};

/* ── EASTER EGG — CONFETTI ──────────────────────────── */
window.hire = function() {
  const colors = ['#7a6240', '#c4965a', '#ede8df', '#161210', '#998f85'];
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
  console.log("%c🚀 Eneko Ruiz Mollón — Hire me: eneekoruiz@gmail.com", "color: #c4965a; font-size: 16px; font-weight: bold;");
  return "Confetti launched!";
};

/* ── INITIALIZATION ─────────────────────────────────── */
(function init() {
  const savedTheme = localStorage.getItem('cv-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

  const menu = document.getElementById('lang-menu');
  if (menu && M) {
    menu.innerHTML = '';
    Object.entries(M).forEach(([code, meta]) => {
      const btn = document.createElement('button');
      btn.className = 'lm-item';
      btn.innerHTML = `<span>${meta.name}</span><span class="lm-iso">${meta.iso}</span>`;
      btn.onclick = () => setLang(code);
      menu.appendChild(btn);
    });
  }

  document.getElementById('theme-btn')?.addEventListener('click', () => applyTheme(html.getAttribute('data-theme') !== 'dark'));
  document.getElementById('print-btn')?.addEventListener('click', handlePrint);
  document.getElementById('share-btn')?.addEventListener('click', handleShare);
  document.getElementById('lang-trigger')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('lang-menu')?.classList.toggle('open');
  });
  document.addEventListener('click', () => document.getElementById('lang-menu')?.classList.remove('open'));
  
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handlePrint(); }
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); handleShare(); }
  });

  window.addEventListener('message', (e) => {
    if (e.data.type === 'set-theme') applyTheme(e.data.theme === 'dark');
    if (e.data.type === 'print-cv') handlePrint();
    if (e.data.type === 'share-cv') handleShare();
  });

  window.addEventListener('mousemove', (e) => {
    if (window.parent !== window) window.parent.postMessage({ type: 'portfolio-cursor-move', x: e.clientX, y: e.clientY }, '*');
  });

  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(()=>{}); });
  }

  window.addEventListener('scroll', () => {
    const p = document.getElementById('scroll-progress');
    if (p) p.style.width = ((window.scrollY) / (document.documentElement.scrollHeight - window.innerHeight) * 100) + '%';
  });

  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || localStorage.getItem('cv-lang') || 'es';
  applyTranslations(lang);
  if (urlParams.get('print') === 'true') setTimeout(window.print, 1200);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
