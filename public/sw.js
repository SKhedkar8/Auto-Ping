// AutoPing Progressive Web App Service Worker
const CACHE_NAME = 'autoping-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/vehicles',
  '/bookings',
  '/services/book',
  '/profile',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA: Failed to precache some assets', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin or non-GET requests
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // Network-first for dynamic navigation and API calls
  if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful page responses
          if (response.status === 200 && request.mode === 'navigate') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            if (request.mode === 'navigate') {
              return caches.match('/dashboard') || caches.match('/');
            }
            return new Response(JSON.stringify({ error: 'Offline mode active' }), {
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Cache-first for images, fonts, and static chunks
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
