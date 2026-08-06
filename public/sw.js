/**
 * Service Worker for PWA Offline Support
 * v11 - Aggressive cache wipe to clear stale dev-mode assets.
 *       Fixes: dev-mode JS (main-app.js?v=...) was cached by v10 and served
 *       via cache-first strategy, breaking production login flow.
 */

const CACHE_NAME = 'x2xhub-v11';
const OFFLINE_PAGE = '/offline.html';
const SW_SELF_PATHS = ['/sw.js', '/sw-worker.js', '/service-worker.js'];

// Only these immutable app-shell URLs are precached on install.
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
        // CRITICAL: Delete EVERY cache (including old x2xhub-v10 that holds
        // stale dev-mode HTML/JS). Only keep the fresh v11 cache.
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting stale cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        // Notify all open tabs to reload so they pick up production assets.
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      })
      .then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
        });
      })
      .catch((e) => console.error('[SW] Activate failed:', e))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Always serve sw.js from network to ensure updates are picked up
  if (SW_SELF_PATHS.some(p => url.pathname === p)) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned)).catch(() => {});
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Auth & delegate-login endpoints must NEVER be cached (security + correctness)
  if (url.pathname.startsWith('/api/auth/') || url.pathname.includes('delegate-login')) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ error: 'Network error' }), { status: 503, headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleHTMLRequest(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request, url.pathname));
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

// HTML: network-first (always fresh in production, cache only for offline fallback)
async function handleHTMLRequest(request) {
  try {
    const response = await fetch(request);

    if (response && response.ok && response.status === 200) {
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
    const offline = await caches.match(OFFLINE_PAGE);
    return cached || offline || new Response('Offline', { status: 503 });
  }
}

// Static assets: hashed _next/static/* → cache-first (immutable).
// Anything else (e.g. legacy /main-app.js?v=…) → network-first to avoid
// serving stale dev-mode bundles.
async function handleStaticAsset(request, pathname) {
  const isHashedNextAsset = pathname.startsWith('/_next/static/');

  if (isHashedNextAsset) {
    try {
      const cached = await caches.match(request);
      if (cached) {
        updateCacheInBackground(request);
        return cached;
      }
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.ok) {
        const clonedResponse = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, clonedResponse);
      }
      return networkResponse;
    } catch (e) {
      const cached = await caches.match(request);
      return cached || new Response('Not found', { status: 404 });
    }
  }

  // Non-hashed static asset: network-first, cache only as fallback.
  try {
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
    return cached || new Response('Not found', { status: 404 });
  }
}

// API: network-first (never serve stale API data)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok && request.method === 'GET') {
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
    return cached || new Response(JSON.stringify({ error: 'Network error' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
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
  // Never cache Service Worker files
  if (SW_SELF_PATHS.some(p => pathname === p)) return false;

  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}
