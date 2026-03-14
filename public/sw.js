const CACHE_NAME = 'anime-nexus-v1';
const STATIC_ASSETS = [
    '/',
    '/images/anime-nexus-logo.png',
];

// Auth-gated paths that should never be served from cache
const AUTH_PATHS = [
    '/watchlist', '/history', '/favorites', '/dashboard',
    '/profile', '/notifications', '/reviews', '/comments',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: network-first for pages/API, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Never cache auth-gated routes
    if (AUTH_PATHS.some((path) => url.pathname.startsWith(path))) {
        return;
    }

    // Cache-first for build assets (hashed filenames)
    if (url.pathname.startsWith('/build/')) {
        event.respondWith(
            caches.match(event.request).then((cached) =>
                cached || fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
            )
        );
        return;
    }

    // Network-first for everything else (public pages only)
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
