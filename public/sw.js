const CACHE_VERSION = 'v1-destroy-2026-01-31';

self.addEventListener('install', (event) => {
    // Force immediate activation
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // 1. Delete ALL caches
        caches.keys()
        .then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        })
        // 2. Unregister this service worker
        .then(() => self.registration.unregister())
        // 3. Force reload all clients
        .then(() => self.clients.matchAll())
        .then(clients => {
            clients.forEach(client => client.navigate(client.url));
        })
    );
});

// Ensure no caching during fetch
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
