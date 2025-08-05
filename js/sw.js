const CACHE_NAME = 'ticket-validator-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/scanner.js',
  './js/icons.js',
  './js/theme.js',
  './js/lang.js',
  './js/ui-enhancements.js',
  './manifest.json',
  './offline.html',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  './js/jsQR.min.js'
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
