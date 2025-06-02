// Service Worker for Cozy Light PWA
const CACHE_NAME = 'cozy-light-v2.0.0';
const STATIC_CACHE = 'cozy-light-static-v2.0.0';
const DYNAMIC_CACHE = 'cozy-light-dynamic-v2.0.0';
const API_CACHE = 'cozy-light-api-v2.0.0';
const IMAGE_CACHE = 'cozy-light-images-v2.0.0';
const AUDIO_CACHE = 'cozy-light-audio-v2.0.0';

// Cache size limits (in MB)
const CACHE_LIMITS = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 10,
  [IMAGE_CACHE]: 100,
  [AUDIO_CACHE]: 200
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/css/main.css',
  '/src/css/components.css',
  '/src/css/responsive.css',
  '/src/css/animations.css',
  '/src/css/api-enhancements.css',
  '/src/js/main.js',
  '/src/js/lightController.js',
  '/src/js/audioManager.js',
  '/src/js/timerManager.js',
  '/src/js/presets.js',
  '/src/js/settings.js',
  '/src/js/storage.js',
  '/src/js/utils.js',
  '/src/js/particles.js',
  '/src/js/gestureHandler.js',
  '/src/js/notifications.js',
  '/src/js/backgroundManager.js',
  '/src/js/api/weatherAPI.js',
  '/src/js/api/soundAPI.js',
  '/src/js/api/colorAPI.js',
  '/src/js/api/quoteAPI.js',
  '/src/js/api/imageAPI.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  'api.quotable.io',
  'api.openweathermap.org',
  'source.unsplash.com',
  'api.nasa.gov',
  'collectionapi.metmuseum.org'
];

// CDN resources to cache
const CDN_RESOURCES = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'code.iconify.design'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE &&
                cacheName !== IMAGE_CACHE &&
                cacheName !== AUDIO_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAudioRequest(url)) {
    event.respondWith(handleAudioRequest(request));
  } else if (isCDNResource(url)) {
    event.respondWith(handleCDNResource(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle static assets (cache first)
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Static asset fetch failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests (network first with cache fallback)
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const networkResponse = await fetch(request, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (networkResponse.ok) {
      // Cache successful API responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.warn('API request failed, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for specific APIs
    return getOfflineFallback(request);
  }
}

// Handle image requests (cache first with size management)
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Check cache size before adding
      await manageCacheSize(IMAGE_CACHE, CACHE_LIMITS[IMAGE_CACHE]);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Image fetch failed:', error);
    return getPlaceholderImage();
  }
}

// Handle audio requests (cache first with size management)
async function handleAudioRequest(request) {
  const cache = await caches.open(AUDIO_CACHE);
  
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Check cache size before adding
      await manageCacheSize(AUDIO_CACHE, CACHE_LIMITS[AUDIO_CACHE]);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Audio fetch failed:', error);
    return new Response('Audio not available offline', { status: 503 });
  }
}

// Handle CDN resources (cache first)
async function handleCDNResource(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('CDN resource fetch failed:', error);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Resource not available offline', { status: 503 });
  }
}

// Handle dynamic requests (network first)
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Page not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Utility functions
function isStaticAsset(url) {
  return url.origin === self.location.origin && 
         (url.pathname.startsWith('/src/') || 
          url.pathname.startsWith('/assets/') ||
          url.pathname === '/' ||
          url.pathname === '/index.html' ||
          url.pathname === '/manifest.json');
}

function isAPIRequest(url) {
  return API_ENDPOINTS.some(endpoint => url.hostname.includes(endpoint));
}

function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
         url.hostname.includes('unsplash.com') ||
         url.hostname.includes('picsum.photos') ||
         url.hostname.includes('images.unsplash.com');
}

function isAudioRequest(url) {
  return url.pathname.match(/\.(mp3|wav|ogg|m4a|aac)$/i) ||
         url.hostname.includes('freesound.org') ||
         url.hostname.includes('soundjay.com');
}

function isCDNResource(url) {
  return CDN_RESOURCES.some(cdn => url.hostname.includes(cdn));
}

// Cache size management
async function manageCacheSize(cacheName, limitMB) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  let totalSize = 0;
  const sizePromises = keys.map(async key => {
    const response = await cache.match(key);
    const blob = await response.blob();
    return { key, size: blob.size };
  });
  
  const sizes = await Promise.all(sizePromises);
  totalSize = sizes.reduce((sum, item) => sum + item.size, 0);
  
  const limitBytes = limitMB * 1024 * 1024;
  
  if (totalSize > limitBytes) {
    // Sort by size (largest first) and remove until under limit
    sizes.sort((a, b) => b.size - a.size);
    
    for (const item of sizes) {
      if (totalSize <= limitBytes) break;
      
      await cache.delete(item.key);
      totalSize -= item.size;
      console.log(`🗑️ Removed ${item.key.url} from cache (${(item.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  }
}

// Offline fallbacks
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (url.hostname.includes('quotable.io')) {
    return new Response(JSON.stringify({
      content: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      tags: ["inspirational"]
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.hostname.includes('openweathermap.org')) {
    return new Response(JSON.stringify({
      weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
      main: { temp: 22, feels_like: 22 },
      name: "Your Location"
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('API not available offline', { status: 503 });
}

function getPlaceholderImage() {
  // Return a simple SVG placeholder
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial, sans-serif" font-size="16">
        Image not available offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}

// Background sync for API updates
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Update weather data
    const weatherResponse = await fetch('/api/weather');
    if (weatherResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put('/api/weather', weatherResponse);
    }
    
    // Update quotes
    const quoteResponse = await fetch('https://api.quotable.io/random');
    if (quoteResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put('https://api.quotable.io/random', quoteResponse);
    }
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.warn('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/assets/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Share target handling
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShare(event.request));
  }
});

async function handleShare(request) {
  const formData = await request.formData();
  const title = formData.get('title');
  const text = formData.get('text');
  const url = formData.get('url');
  const files = formData.getAll('images');
  
  // Store shared data for the app to access
  const shareData = { title, text, url, files: files.length };
  
  // Redirect to app with share data
  return Response.redirect(`/?share=${encodeURIComponent(JSON.stringify(shareData))}`, 302);
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  try {
    // Update cached content periodically
    const cache = await caches.open(API_CACHE);
    
    // Refresh quotes
    const quoteResponse = await fetch('https://api.quotable.io/random');
    if (quoteResponse.ok) {
      cache.put('https://api.quotable.io/random', quoteResponse);
    }
    
    console.log('✅ Periodic sync completed');
  } catch (error) {
    console.warn('Periodic sync failed:', error);
  }
}

// Cache status reporting
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    const cacheStatus = await getCacheStatus();
    event.ports[0].postMessage(cacheStatus);
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    await clearAllCaches();
    event.ports[0].postMessage({ success: true });
  }
});

async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    for (const key of keys) {
      const response = await cache.match(key);
      const blob = await response.blob();
      totalSize += blob.size;
    }
    
    status[cacheName] = {
      entries: keys.length,
      size: Math.round(totalSize / 1024 / 1024 * 100) / 100 // MB
    };
  }
  
  return status;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🗑️ All caches cleared');
}

console.log('🕯️ Cozy Light Service Worker loaded');
