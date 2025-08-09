const CACHE_NAME = 'ticket-validator-v3';
const ASSETS = [
  './',
  './index.html',
  // Organized CSS files
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/themes.css',
  './css/utilities.css',
  // Core JavaScript files
  './js/core/app-core.js',
  './js/ui/icons.js',
  './js/ui/theme-lang.js',
  './js/ui/ui-enhancements.js',
  './js/debug-logger.js',
  './manifest.json',
  './offline.html',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  './js/jsQR.min.js',
  // PWA Icons - Essential for home screen installation
  './icons/icon-light-96x96.png',
  './icons/icon-light-128x128.png',
  './icons/icon-light-144x144.png',
  './icons/icon-light-152x152.png',
  './icons/icon-light-192x192.png',
  './icons/icon-light-384x384.png',
  './icons/icon-light-512x512.png',
  './icons/icon-dark-96x96.png',
  './icons/icon-dark-128x128.png',
  './icons/icon-dark-144x144.png',
  './icons/icon-dark-152x152.png',
  './icons/icon-dark-192x192.png',
  './icons/icon-dark-384x384.png',
  './icons/icon-dark-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching assets:', ASSETS);
        return cache.addAll(ASSETS).catch((error) => {
          console.error('Failed to cache assets:', error);
          // Try to cache assets individually to identify problematic ones
          return Promise.allSettled(
            ASSETS.map(asset => 
              cache.add(asset).catch(err => {
                console.error(`Failed to cache ${asset}:`, err);
                return null;
              })
            )
          );
        });
      })
      .then(() => {
        console.log('ServiceWorker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('ServiceWorker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if found
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request)
          .then((fetchResponse) => {
            // Only cache valid responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Don't cache external resources
            const requestUrl = new URL(event.request.url);
            if (requestUrl.origin !== location.origin) {
              return fetchResponse;
            }

            // Cache the response
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('Failed to cache response:', error);
              });

            return fetchResponse;
          });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        // Return offline fallback for HTML requests
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./offline.html');
        }
      })
  );
});
