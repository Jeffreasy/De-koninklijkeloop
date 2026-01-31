self.addEventListener('install', () => {
    // Skip verification and take over immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Unregister this service worker immediately
    event.waitUntil(
        self.registration.unregister().then(() => {
            return self.clients.matchAll();
        }).then((clients) => {
            // Force reload all connected clients to fetch the new version
            clients.forEach((client) => client.navigate(client.url));
        })
    );
});
