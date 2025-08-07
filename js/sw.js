// Enhanced Service Worker for Hydranode Ticket Validator - Performance Optimized
// Version 4 with advanced caching strategies and resource optimization

const CACHE_VERSION = '4';
const CACHE_NAME = `ticket-validator-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-v${CACHE_VERSION}`;
const ASSETS_CACHE = `assets-v${CACHE_VERSION}`;

// Cache strategy configuration
const CACHE_STRATEGIES = {
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
};

// Critical assets to cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  // Minified CSS files for better performance
  './css/base.min.css',
  './css/layout.min.css', 
  './css/components.min.css',
  './css/themes.min.css',
  './css/utilities.min.css',
  // Minified JavaScript files
  './js/core/app-core.min.js',
  './js/ui/theme-lang.min.js',
  './js/ui/icons.js',
  './js/ui/ui-enhancements.js',
  './js/debug-logger.js',
  './js/jsQR.min.js',
  // Both PNG and WebP icons for optimal performance
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
  './icons/icon-dark-512x512.png',
  // WebP versions for modern browsers
  './icons/icon-light-96x96.webp',
  './icons/icon-light-128x128.webp',
  './icons/icon-light-144x144.webp',
  './icons/icon-light-152x152.webp',
  './icons/icon-light-192x192.webp',
  './icons/icon-light-384x384.webp',
  './icons/icon-light-512x512.webp',
  './icons/icon-dark-96x96.webp',
  './icons/icon-dark-128x128.webp',
  './icons/icon-dark-144x144.webp',
  './icons/icon-dark-152x152.webp',
  './icons/icon-dark-192x192.webp',
  './icons/icon-dark-384x384.webp',
  './icons/icon-dark-512x512.webp',
  // Logos
  './logos/hydranode-horizontal-dark.png',
  './logos/hydranode-horizontal-light.png'
];

// Runtime cache assets (cached on first request)
const RUNTIME_CACHE_PATTERNS = [
  /^https:\/\/cdn\.sheetjs\.com\//,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/
];

// Install event - Cache critical assets
self.addEventListener('install', (event) => {
  console.log(`SW v${CACHE_VERSION}: Installing...`);
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log(`SW v${CACHE_VERSION}: Precaching ${PRECACHE_ASSETS.length} assets`);
        return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, {cache: 'reload'})))
          .catch((error) => {
            console.error(`SW v${CACHE_VERSION}: Precaching failed:`, error);
            // Try caching individually to identify problematic assets
            return Promise.allSettled(
              PRECACHE_ASSETS.map(asset => 
                cache.add(new Request(asset, {cache: 'reload'}))
                  .catch(err => {
                    console.warn(`SW v${CACHE_VERSION}: Failed to cache ${asset}:`, err);
                    return null;
                  })
              )
            );
          });
      }),
      // Initialize runtime cache
      caches.open(RUNTIME_CACHE),
      caches.open(ASSETS_CACHE)
    ]).then(() => {
      console.log(`SW v${CACHE_VERSION}: Installation complete`);
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log(`SW v${CACHE_VERSION}: Activating...`);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(`v${CACHE_VERSION}`)) {
              console.log(`SW v${CACHE_VERSION}: Deleting old cache:`, cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ]).then(() => {
      console.log(`SW v${CACHE_VERSION}: Activated and controlling all pages`);
    })
  );
});

// Fetch event - Advanced caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isExternal = requestUrl.origin !== location.origin;
  
  event.respondWith(handleRequest(event.request, isExternal));
});

async function handleRequest(request, isExternal) {
  const url = request.url;
  
  try {
    // HTML documents - Network first with cache fallback
    if (request.headers.get('accept')?.includes('text/html')) {
      return await networkFirstStrategy(request, CACHE_NAME);
    }
    
    // External CDN resources - Cache first with long expiry
    if (isExternal && RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(url))) {
      return await cacheFirstStrategy(request, RUNTIME_CACHE);
    }
    
    // CSS/JS assets - Cache first for performance
    if (url.includes('.css') || url.includes('.js')) {
      return await cacheFirstStrategy(request, ASSETS_CACHE);
    }
    
    // Images - Cache first with WebP preference
    if (/\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url)) {
      return await cacheFirstStrategy(request, ASSETS_CACHE);
    }
    
    // App shell assets - Cache first
    if (url.includes('/icons/') || url.includes('/logos/') || url.includes('manifest.json')) {
      return await cacheFirstStrategy(request, CACHE_NAME);
    }
    
    // Default: Network first
    return await networkFirstStrategy(request, RUNTIME_CACHE);
    
  } catch (error) {
    console.error(`SW v${CACHE_VERSION}: Request failed:`, url, error);
    return await handleRequestError(request);
  }
}

// Cache-first strategy: Check cache first, then network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Optionally update cache in background for long-term assets
    if (cacheName === RUNTIME_CACHE) {
      updateCacheInBackground(request, cacheName);
    }
    return cachedResponse;
  }
  
  return await fetchAndCache(request, cacheName);
}

// Network-first strategy: Try network first, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      await cacheResponse(request, networkResponse.clone(), cacheName);
      return networkResponse;
    }
  } catch (error) {
    console.warn(`SW v${CACHE_VERSION}: Network failed, trying cache:`, error);
  }
  
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw new Error('No network or cache available');
}

// Fetch and cache helper
async function fetchAndCache(request, cacheName) {
  const response = await fetch(request);
  if (response && response.status === 200 && response.type === 'basic') {
    await cacheResponse(request, response.clone(), cacheName);
  }
  return response;
}

// Cache response helper with size management
async function cacheResponse(request, response, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    
    // Manage cache size to prevent storage quota issues
    await manageCacheSize(cacheName);
  } catch (error) {
    console.warn(`SW v${CACHE_VERSION}: Failed to cache response:`, error);
  }
}

// Background cache update for runtime assets
function updateCacheInBackground(request, cacheName) {
  fetch(request).then(response => {
    if (response && response.status === 200) {
      cacheResponse(request, response.clone(), cacheName);
    }
  }).catch(() => {
    // Ignore background update failures
  });
}

// Cache size management to prevent quota exceeded errors
async function manageCacheSize(cacheName, maxEntries = 100) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      const entriesToDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(entriesToDelete.map(key => cache.delete(key)));
      console.log(`SW v${CACHE_VERSION}: Cleaned ${entriesToDelete.length} entries from ${cacheName}`);
    }
  } catch (error) {
    console.warn(`SW v${CACHE_VERSION}: Cache size management failed:`, error);
  }
}

// Handle request errors with fallbacks
async function handleRequestError(request) {
  // HTML requests: return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlinePage = await caches.match('./offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // Image requests: return placeholder if available
  if (/\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(request.url)) {
    const placeholder = await caches.match('./icons/icon-light-192x192.png');
    if (placeholder) {
      return placeholder;
    }
  }
  
  // Return generic network error
  return new Response('Network error', {
    status: 408,
    headers: {'Content-Type': 'text/plain'}
  });
}

// Performance monitoring - track cache hit rates
let cacheHits = 0;
let cacheMisses = 0;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    const totalRequests = cacheHits + cacheMisses;
    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests * 100).toFixed(1) : 0;
    
    event.ports[0].postMessage({
      cacheHits,
      cacheMisses,
      totalRequests,
      hitRate: `${hitRate}%`,
      version: CACHE_VERSION
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Cache performance tracking
function trackCacheHit() {
  cacheHits++;
}

function trackCacheMiss() {
  cacheMisses++;
}