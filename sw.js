const CACHE_NAME = 'eneko-cv-v8';
const FONTS_CACHE = 'eneko-fonts-v1';

const ASSETS = [
  './',
  './index.html',
  './translations.js',
  './favicon.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== FONTS_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Skip API calls and PDF generation
  if (url.pathname.startsWith('/api/') || url.pathname.includes('CV_Eneko_Ruiz.pdf')) return;

  // Cache Google Fonts
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONTS_CACHE).then((cache) => {
        return cache.match(e.request).then((res) => {
          return res || fetch(e.request).then((response) => {
            cache.put(e.request, response.clone());
            return response;
          });
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse || Response.error());

        return cachedResponse || fetchPromise;
      })
    );
  }
});
