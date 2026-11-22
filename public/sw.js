// MODANOVA — Service Worker for Android / Mobile App (PWA) & Offline Support
const CACHE_NAME = 'modanova-app-v1';
const RUNTIME_CACHE = 'modanova-runtime-v1';

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/logo.png',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => null)
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache live API endpoints (orders, stock, admin config, carriers)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first for HTML navigations & main app bundle so updates appear immediately,
  // with cached fallback when offline
  if (
    request.mode === 'navigate' ||
    url.pathname === '/app-bundle.v2.js' ||
    url.pathname === '/app-bundle.js' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (request.mode === 'navigate') {
            const rootCached = await caches.match('/');
            if (rootCached) return rootCached;
          }
          return new Response('Offline — Vérifiez votre connexion Internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Cache-first for Google Fonts and static images/icons
  const isGoogleFont =
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com';
  const isStaticAsset =
    url.origin === self.location.origin &&
    /\.(png|jpg|jpeg|webp|svg|ico|woff2?|css)$/i.test(url.pathname);

  if (isGoogleFont || isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        });
      })
    );
  }
});
