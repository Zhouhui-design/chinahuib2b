/**
 * Service Worker for PWA Offline Support
 * v16 - Never intercept or cache RSC (React Server Component) requests.
 *       - Skip requests carrying the RSC header / _rsc query / text/x-component
 *         accept entirely; the Next.js router must always talk to the network.
 *       - handleHTMLRequest only falls back to cached responses whose
 *         Content-Type is text/html, so a flight payload can never be served
 *         as a document (raw "0:{...}" page bug).
 *       - Cache version bumped to wipe any poisoned entries from v15.
 */

const CACHE_NAME = 'x2xhub-v16';
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

  // RSC / router-prefetch requests must NEVER be intercepted or cached by the
  // SW: they return flight payloads (text/x-component) keyed by the same URL
  // as HTML documents. Let them pass straight through to the network.
  if (
    request.headers.get('RSC') === '1' ||
    url.searchParams.has('_rsc') ||
    request.headers.get('accept')?.includes('text/x-component')
  ) {
    return;
  }

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

    // Guard against non-ok / non-200 responses that might cause hydration issues
    if (!response || !response.ok || response.status !== 200) {
      // Don't cache error pages (404, 500, etc.)
      if (response && (response.status === 404 || response.status >= 500)) {
        return response;
      }
      return response || new Response('Service Unavailable', { status: 503 });
    }

    // Cache successful HTML responses for offline fallback
    try {
      const clonedResponse = response.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, clonedResponse);
    } catch (e) {
      console.warn('[SW] Failed to cache HTML:', e);
    }

    return response;
  } catch (e) {
    // Network failure: serve from cache, or offline page.
    // Only trust cached responses that are actual HTML documents — never a
    // stale RSC flight payload that may have been cached under the same URL.
    console.warn('[SW] Network request failed, serving from cache:', request.url, e);
    const cached = await caches.match(request);
    if (cached && cached.headers.get('content-type')?.includes('text/html')) {
      return cached;
    }
    const offline = await caches.match(OFFLINE_PAGE);
    if (offline) {
      return offline;
    }
    // Ensure we always return a valid Response object (never undefined)
    return new Response('You are offline and this page is not cached.', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
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
      return networkResponse || fallbackNotFound();
    } catch (e) {
      const cached = await caches.match(request);
      return cached || fallbackNotFound();
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
    return networkResponse || fallbackNotFound();
  } catch (e) {
    const cached = await caches.match(request);
    return cached || fallbackNotFound();
  }
}

// Guaranteed-valid Response fallback (never return undefined → prevents
// "Failed to convert value to 'Response'" errors).
function fallbackNotFound() {
  return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
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
