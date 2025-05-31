const CACHE_NAME = 'cozy-light-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/css/main.css',
    '/src/css/components.css',
    '/src/css/responsive.css',
    '/src/js/main.js',
    '/src/js/lightController.js',
    '/src/js/presets.js',
    '/src/js/settings.js',
    '/src/assets/icons/icon-192.png',
    '/src/assets/icons/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if
// Activate event (continued)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for settings
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-settings') {
        event.waitUntil(syncSettings());
    }
});

async function syncSettings() {
    // Sync settings when back online
    console.log('Syncing settings...');
}

// Push notifications (for future timer features)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Timer finished!',
        icon: '/src/assets/icons/icon-192.png',
        badge: '/src/assets/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/src/assets/icons/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/src/assets/icons/icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Cozy Light', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
