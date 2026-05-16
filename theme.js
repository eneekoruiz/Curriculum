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
    htmlEl.style.backgroundColor = isDark ? '#020617' : '#ffffff';
    htmlEl.style.colorScheme = isDark ? 'dark' : 'light';

    // Bug 27: Initial favicon update to match theme immediately
    const color = isDark ? '#94a3b8' : '#334155', bg = isDark ? '#0f172a' : '#ffffff';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="${bg}"/><text x="50" y="66" font-family="sans-serif" font-size="52" font-weight='bold' fill="${color}" text-anchor="middle">ER</text></svg>`;
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;

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
