const CACHE_NAME = 'eneko-cv-cache-v32';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.css',
  '/print.css',
  '/index.js',
  '/theme.js',
  '/translations.js',
  '/print-zoom.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/foto.webp',
  '/foto.jpg',
  '/foto-small.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin ||
      requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first for the page, code and PDFs: an online visitor
  // must never get a new page with old scripts. The cache is only the offline fallback.
  const isCode = event.request.mode === 'navigate' || /\.(?:js|css|json|pdf)$/.test(requestUrl.pathname);
  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.mode === 'navigate' && ['/', '/index.html'].includes(requestUrl.pathname)) {
            return (await caches.match('/index.html')) || Response.error();
          }
          return Response.error();
        })
    );
    return;
  }

  // Stale-while-revalidate for images and other static files
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline if not in cache (already handled by caches.match)
      });

      return cachedResponse || fetchPromise;
    })
  );
});
