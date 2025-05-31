// sw.js - Service Worker for Cozy Light Quote Generator

const CACHE_NAME = 'cozy-light-cache-v1';
const OFFLINE_URL = '/Cozy-light/offline.html'; // Optional: fallback page if available

// List of files to cache
const urlsToCache = [
  '/',
  '/Cozy-light/',
  '/Cozy-light/index.html',
  '/Cozy-light/style.css',
  '/Cozy-light/script.js',
  '/Cozy-light/manifest.json',
  '/Cozy-light/favicon.ico',
  '/Cozy-light/icon-192.png',
  '/Cozy-light/icon-512.png'
];

// Install event: Cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate this service worker immediately
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      // If not in cache, fetch from network
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).catch(() => {
        // If network fails, try serving the offline page
        return caches.match(OFFLINE_URL);
      });
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Old caches deleted');
      return self.clients.claim(); // Take control of all clients
    })
  );
});
