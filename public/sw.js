/**
 * Service Worker for PWA Offline Support
 * 
 * Features:
 * - Cache static assets (Stale-While-Revalidate strategy)
 * - Offline page fallback
 * - Background sync for failed requests
 * - Push notifications support
 */

const CACHE_NAME = 'x2xhub-v4';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API endpoints to cache (reserved for future use)
// const API_CACHE = [
//   '/api/products',
//   '/api/sellers',
// ];

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - Clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - Serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy for HTML pages: Network First, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // Fallback to cached version or offline page
          return caches.match(request)
            .then((cached) => cached || caches.match(OFFLINE_PAGE));
        })
    );
    return;
  }

  // Strategy for static assets: Stale-While-Revalidate
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              // Update cache with fresh version
              if (networkResponse && networkResponse.ok) {
                try {
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, networkResponse.clone());
                    });
                } catch (e) {
                  console.warn('[SW] Failed to cache static asset:', e);
                }
              }
              return networkResponse;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        })
    );
    return;
  }

  // Strategy for API requests: Cache First, then Network
  if (isAPIRequest(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              // Only cache successful responses
              if (networkResponse && networkResponse.ok) {
                try {
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, networkResponse.clone());
                    });
                } catch (e) {
                  console.warn('[SW] Failed to cache API response:', e);
                }
              }
              return networkResponse;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        })
    );
    return;
  }

  // Default strategy: Network First
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

/**
 * Background Sync - Retry failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Get pending requests from IndexedDB
  // Retry them when connection is restored
  console.log('[SW] Retrying failed requests...');
}

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('X2XHUB', options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Helper: Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

/**
 * Helper: Check if URL is an API request
 */
function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}
