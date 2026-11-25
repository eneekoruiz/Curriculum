(function() {
  try {
    const htmlEl = document.documentElement;
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme');
    let savedTheme = null;
    try { savedTheme = localStorage.getItem('cv-theme'); } catch(e) {}
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDark = urlTheme ? urlTheme === 'dark' : (savedTheme ? savedTheme === 'dark' : prefersDark);
    
    htmlEl.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Hold the first paint until the web fonts are in (index.js reveals it), so the
    // name never jumps from a fallback font to Bricolage Grotesque. Failsafe if index.js fails.
    if (!urlParams.has('pdf')) {
      htmlEl.classList.add('cv-loading');
      setTimeout(() => htmlEl.classList.remove('cv-loading'), 2500);
    } else {
      htmlEl.classList.add('pdf-render');
    }
    htmlEl.style.backgroundColor = isDark ? '#020617' : '#ffffff';
    htmlEl.style.colorScheme = isDark ? 'dark' : 'light';

    if (location.protocol === 'https:' || location.protocol === 'http:') {
      const m = document.createElement('link');
      m.rel = 'manifest';
      m.href = 'manifest.json';
      document.head.appendChild(m);
    }
  } catch (e) {
    try {
      const htmlEl = document.documentElement;
      htmlEl.setAttribute('data-theme', 'light');
      htmlEl.style.backgroundColor = '#ffffff';
      htmlEl.style.colorScheme = 'light';
    } catch (err) { /* silent fallback */ }
  }
})();
