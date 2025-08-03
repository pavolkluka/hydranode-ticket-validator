/**
 * Service Worker for Hydranode Ticket Validator PWA
 * Provides offline caching and background sync capabilities
 */

const CACHE_NAME = 'hydranode-ticket-validator-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Core files to cache for offline functionality
const CORE_CACHE_FILES = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    // External libraries
    'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
];

// Static assets to cache
const STATIC_CACHE_FILES = [
    // Icons - Light theme
    './icons/icon-light-96x96.png',
    './icons/icon-light-128x128.png',
    './icons/icon-light-144x144.png',
    './icons/icon-light-152x152.png',
    './icons/icon-light-192x192.png',
    './icons/icon-light-384x384.png',
    './icons/icon-light-512x512.png',
    // Icons - Dark theme
    './icons/icon-dark-96x96.png',
    './icons/icon-dark-128x128.png',
    './icons/icon-dark-144x144.png',
    './icons/icon-dark-152x152.png',
    './icons/icon-dark-192x192.png',
    './icons/icon-dark-384x384.png',
    './icons/icon-dark-512x512.png',
    // Logos
    './logos/hydranode-horizontal-dark.png',
    './logos/hydranode-horizontal-light.png'
];

// All files to cache
const ALL_CACHE_FILES = [...CORE_CACHE_FILES, ...STATIC_CACHE_FILES];

// URLs that should always fetch from network (bypass cache)
const NETWORK_FIRST_URLS = [
    'https://api.getpostman.com/',
    '/api/'
];

// URLs that should use cache first strategy
const CACHE_FIRST_URLS = [
    '/icons/',
    '/logos/',
    'https://cdn.sheetjs.com/',
    'https://cdn.jsdelivr.net/'
];

/**
 * Service Worker Installation
 * Pre-cache core files needed for offline functionality
 */
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core files...');
                return cache.addAll(ALL_CACHE_FILES);
            })
            .then(() => {
                console.log('[SW] Core files cached successfully');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Failed to cache core files:', error);
                throw error;
            })
    );
});

/**
 * Service Worker Activation
 * Clean up old caches and take control of all clients
 */
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            // Take control of all clients immediately
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Service worker activated successfully');
        })
    );
});

/**
 * Fetch Event Handler
 * Implement caching strategies based on request type
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Determine caching strategy based on URL
    if (shouldUseNetworkFirst(url)) {
        event.respondWith(networkFirst(request));
    } else if (shouldUseCacheFirst(url)) {
        event.respondWith(cacheFirst(request));
    } else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

/**
 * Background Sync Event Handler
 * Handle background synchronization for offline actions
 */
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'scan-data-sync') {
        event.waitUntil(syncScanData());
    }
});

/**
 * Message Event Handler
 * Handle messages from the main application
 */
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_SCAN_DATA':
            cacheScanData(data);
            break;
            
        case 'GET_CACHE_INFO':
            getCacheInfo().then(info => {
                event.ports[0].postMessage(info);
            });
            break;
            
        case 'CLEAR_CACHE':
            clearCache().then(success => {
                event.ports[0].postMessage({ success });
            });
            break;
            
        default:
            console.log('[SW] Unknown message type:', type);
    }
});

/**
 * Push Event Handler
 * Handle push notifications (for future use)
 */
self.addEventListener('push', event => {
    console.log('[SW] Push notification received');
    
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: './icons/icon-light-192x192.png',
                badge: './icons/icon-light-96x96.png',
                tag: 'ticket-validator',
                requireInteraction: true,
                actions: [
                    {
                        action: 'open',
                        title: 'Open App'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss'
                    }
                ]
            })
        );
    }
});

/**
 * Notification Click Event Handler
 */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.destination === 'document') {
            return caches.match('./index.html');
        }
        
        throw error;
    }
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache first failed for:', request.url, error);
        throw error;
    }
}

/**
 * Stale While Revalidate Strategy
 * Return cache immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.log('[SW] Network request failed:', request.url, error);
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

/**
 * Determine if URL should use network-first strategy
 */
function shouldUseNetworkFirst(url) {
    return NETWORK_FIRST_URLS.some(pattern => url.href.includes(pattern));
}

/**
 * Determine if URL should use cache-first strategy
 */
function shouldUseCacheFirst(url) {
    return CACHE_FIRST_URLS.some(pattern => url.href.includes(pattern));
}

/**
 * Clean up old caches
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('hydranode-ticket-validator-') && name !== CACHE_NAME
    );
    
    console.log('[SW] Cleaning up old caches:', oldCaches);
    
    return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
}

/**
 * Cache scan data for offline access
 */
async function cacheScanData(data) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
        
        await cache.put('/offline-scan-data', response);
        console.log('[SW] Scan data cached successfully');
    } catch (error) {
        console.error('[SW] Failed to cache scan data:', error);
    }
}

/**
 * Sync scan data when online
 */
async function syncScanData() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/offline-scan-data');
        
        if (!cachedResponse) {
            return;
        }
        
        const scanData = await cachedResponse.json();
        
        // Send data to server (implement based on API)
        const response = await fetch('/api/sync-scan-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scanData)
        });
        
        if (response.ok) {
            // Remove cached data after successful sync
            await cache.delete('/offline-scan-data');
            console.log('[SW] Scan data synced successfully');
        }
    } catch (error) {
        console.error('[SW] Failed to sync scan data:', error);
        throw error;
    }
}

/**
 * Get cache information
 */
async function getCacheInfo() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const totalSize = await estimateCacheSize(cache, keys);
        
        return {
            name: CACHE_NAME,
            version: CACHE_VERSION,
            entryCount: keys.length,
            estimatedSize: totalSize,
            coreFilesCached: await checkCoreFilesCached(cache),
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('[SW] Failed to get cache info:', error);
        return null;
    }
}

/**
 * Estimate cache size
 */
async function estimateCacheSize(cache, keys) {
    let totalSize = 0;
    
    for (const request of keys.slice(0, 10)) { // Sample first 10 for estimation
        try {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        } catch (error) {
            // Ignore errors for individual entries
        }
    }
    
    // Estimate total size
    return Math.round((totalSize * keys.length) / Math.min(keys.length, 10));
}

/**
 * Check if core files are cached
 */
async function checkCoreFilesCached(cache) {
    const coreFilesStatus = {};
    
    for (const file of CORE_CACHE_FILES) {
        try {
            const response = await cache.match(file);
            coreFilesStatus[file] = !!response;
        } catch (error) {
            coreFilesStatus[file] = false;
        }
    }
    
    return coreFilesStatus;
}

/**
 * Clear all caches
 */
async function clearCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[SW] All caches cleared');
        return true;
    } catch (error) {
        console.error('[SW] Failed to clear caches:', error);
        return false;
    }
}

/**
 * Utility function to format bytes
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Log service worker version on startup
console.log(`[SW] Hydranode Ticket Validator Service Worker v${CACHE_VERSION} loaded`);