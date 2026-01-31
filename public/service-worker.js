const CACHE_VERSION = 'v1-destroy-2026-01-31';

self.addEventListener('install', (event) => {
    console.log('[SW] Installing cleanup worker', CACHE_VERSION);
    // Force immediate activation
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating cleanup worker', CACHE_VERSION);
    event.waitUntil(
        // 1. Delete ALL caches
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('[SW] Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
        // 2. Unregister this service worker
        .then(() => {
            console.log('[SW] Unregistering service worker');
            return self.registration.unregister();
        })
        // 3. Force reload all clients
        .then(() => self.clients.matchAll())
        .then(clients => {
            clients.forEach(client => {
                console.log('[SW] Reloading client:', client.url);
                client.navigate(client.url);
            });
        })
    );
});

// Ensure no caching during fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
