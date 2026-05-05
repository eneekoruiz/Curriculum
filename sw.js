// Simple Service Worker to enable PWA installability
const CACHE_NAME = 'eneko-cv-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/og.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
