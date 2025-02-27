const CACHE_NAME = 'ticket-validator-v1.1';
const BASE_PATH = '/hydranode-ticket-validator';
const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/offline.html`,
  `${BASE_PATH}/css/styles.css`,
  `${BASE_PATH}/js/main.js`,
  `${BASE_PATH}/js/scanner.js`,
  `${BASE_PATH}/js/sw.js`,
  `${BASE_PATH}/manifest.json`,
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
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
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch new version
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache third-party resources
            if (
              !event.request.url.startsWith('http://') &&
              !event.request.url.startsWith('https://')
            ) {
              return fetchResponse;
            }

            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
              });
          });
      })
      .catch(() => {
        // Return offline fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match(`${BASE_PATH}/offline.html`);
        }
      })
  );
});