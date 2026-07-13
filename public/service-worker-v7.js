/**
 * Service Worker for PWA Offline Support - v7
 */

const CACHE_NAME = 'x2xhub-v7';
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((e) => console.error('[SW] Install failed:', e))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
      .catch((e) => console.error('[SW] Activate failed:', e))
    );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleHTMLRequest(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  if (isAPIRequest(url.pathname)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

async function handleHTMLRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response && response.ok) {
      try {
        const clonedResponse = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, clonedResponse);
      } catch (e) {
        console.warn('[SW] Failed to cache HTML:', e);
      }
    }
    
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || (await caches.match(OFFLINE_PAGE));
  }
}

async function handleStaticAsset(request) {
  try {
    const cached = await caches.match(request);
    
    if (cached) {
      updateCacheInBackground(request);
      return cached;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok) {
      try {
        const clonedResponse = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, clonedResponse);
      } catch (e) {
        console.warn('[SW] Failed to cache static asset:', e);
      }
    }
    
    return networkResponse;
  } catch (e) {
    const cached = await caches.match(request);
    return cached;
  }
}

async function handleAPIRequest(request) {
  try {
    const cached = await caches.match(request);
    
    if (cached) {
      updateCacheInBackground(request);
      return cached;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok) {
      try {
        const clonedResponse = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, clonedResponse);
      } catch (e) {
        console.warn('[SW] Failed to cache API response:', e);
      }
    }
    
    return networkResponse;
  } catch (e) {
    const cached = await caches.match(request);
    return cached;
  }
}

async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok) {
      const clonedResponse = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, clonedResponse);
    }
  } catch (e) {
    console.warn('[SW] Background cache update failed:', e);
  }
}

function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}