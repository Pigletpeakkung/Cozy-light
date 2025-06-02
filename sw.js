/**
 * Cozy Light - Advanced Service Worker
 * Enhanced PWA with Smart Caching & Offline Support
 * Version 2.0.0
 */

// Cache configuration
const CACHE_CONFIG = {
    version: '2.0.0',
    prefix: 'cozy-light',
    caches: {
        static: 'static-v2.0.0',
        dynamic: 'dynamic-v2.0.0',
        api: 'api-v2.0.0',
        images: 'images-v2.0.0',
        audio: 'audio-v2.0.0',
        fonts: 'fonts-v2.0.0',
        runtime: 'runtime-v2.0.0'
    },
    limits: {
        dynamic: 50, // MB
        api: 25,     // MB
        images: 150, // MB
        audio: 300,  // MB
        fonts: 10,   // MB
        runtime: 25  // MB
    },
    maxAge: {
        static: 365 * 24 * 60 * 60 * 1000,    // 1 year
        dynamic: 7 * 24 * 60 * 60 * 1000,     // 1 week
        api: 30 * 60 * 1000,                  // 30 minutes
        images: 30 * 24 * 60 * 60 * 1000,     // 30 days
        audio: 7 * 24 * 60 * 60 * 1000,       // 1 week
        fonts: 365 * 24 * 60 * 60 * 1000      // 1 year
    }
};

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // CSS files
    '/src/css/main.css',
    '/src/css/components.css',
    '/src/css/responsive.css',
    '/src/css/animations.css',
    '/src/css/api-enhancements.css',
    
    // Core JavaScript files
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
    
    // API modules
    '/src/js/api/weatherAPI.js',
    '/src/js/api/soundAPI.js',
    '/src/js/api/colorAPI.js',
    '/src/js/api/quoteAPI.js',
    '/src/js/api/imageAPI.js',
    
    // Essential icons
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/icon-maskable-192x192.png',
    '/assets/icons/icon-maskable-512x512.png',
    
    // Shortcut icons
    '/assets/icons/shortcut-cozy.png',
    '/assets/icons/shortcut-focus.png',
    '/assets/icons/shortcut-relax.png',
    '/assets/icons/shortcut-timer.png',
    
    // Default sounds (small files)
    '/assets/sounds/rain.mp3',
    '/assets/sounds/fireplace.mp3',
    '/assets/sounds/ocean.mp3',
    '/assets/sounds/forest.mp3',
    
    // Offline fallback page
    '/offline.html'
];

// API endpoints and patterns
const API_PATTERNS = {
    weather: [
        /api\.openweathermap\.org/,
        /weatherapi\.com/,
        /api\.weather\.gov/
    ],
    quotes: [
        /api\.quotable\.io/,
        /zenquotes\.io/,
        /quotegarden\.com/
    ],
    images: [
        /source\.unsplash\.com/,
        /images\.unsplash\.com/,
        /api\.nasa\.gov/,
        /collectionapi\.metmuseum\.org/,
        /picsum\.photos/
    ],
    sounds: [
        /freesound\.org/,
        /zapsplat\.com/,
        /soundjay\.com/
    ],
    colors: [
        /coolors\.co/,
        /colormind\.io/,
        /paletton\.com/
    ]
};

// CDN and external resources
const CDN_PATTERNS = [
    /cdnjs\.cloudflare\.com/,
    /cdn\.jsdelivr\.net/,
    /unpkg\.com/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
    /code\.iconify\.design/,
    /cdn\.animate\.style/
];

// Performance monitoring
let performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    offlineRequests: 0,
    errors: 0,
    startTime: Date.now()
};

// Background sync queue
let syncQueue = [];
let isOnline = true;

// Install event - Cache static assets
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing v' + CACHE_CONFIG.version);
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            cacheStaticAssets(),
            
            // Initialize performance tracking
            initializePerformanceTracking(),
            
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - Clean up and take control
self.addEventListener('activate', event => {
    console.log('✅ Service Worker activating v' + CACHE_CONFIG.version);
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            cleanupOldCaches(),
            
            // Initialize background sync
            initializeBackgroundSync(),
            
            // Claim all clients
            self.clients.claim(),
            
            // Send activation message to clients
            notifyClientsOfActivation()
        ])
    );
});

// Fetch event - Handle all network requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests for caching
    if (request.method !== 'GET') {
        if (request.method === 'POST' && url.pathname === '/api/sync') {
            event.respondWith(handleBackgroundSync(request));
        }
        return;
    }
    
    // Route requests to appropriate handlers
    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(url)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(url)) {
        event.respondWith(handleImageRequest(request));
    } else if (isAudioRequest(url)) {
        event.respondWith(handleAudioRequest(request));
    } else if (isFontRequest(url)) {
        event.respondWith(handleFontRequest(request));
    } else if (isCDNResource(url)) {
        event.respondWith(handleCDNResource(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// Background sync event
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(processBackgroundSync());
    } else if (event.tag === 'api-refresh') {
        event.waitUntil(refreshAPIs());
    } else if (event.tag === 'cache-cleanup') {
        event.waitUntil(performCacheCleanup());
    }
});

// Periodic background sync
self.addEventListener('periodicsync', event => {
    if (event.tag === 'content-refresh') {
        event.waitUntil(periodicContentRefresh());
    }
});

// Push notification event
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'New update available',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        image: data.image,
        vibrate: [200, 100, 200, 100, 200],
        data: data.data || {},
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
        ],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        timestamp: Date.now(),
        tag: data.tag || 'cozy-light-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Cozy Light', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data;
    
    if (action === 'open' || !action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Check if app is already open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                const url = data.url || '/';
                return clients.openWindow(url);
            })
        );
    } else if (action === 'dismiss') {
        // Just close the notification (already done above)
        console.log('📱 Notification dismissed');
    }
});

// Message event - Handle messages from main thread
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_STATUS':
            event.ports[0].postMessage(getCacheStatus());
            break;
            
        case 'CLEAR_CACHE':
            clearSpecificCache(data.cacheName).then(success => {
                event.ports[0].postMessage({ success });
            });
            break;
            
        case 'CLEAR_ALL_CACHES':
            clearAllCaches().then(success => {
                event.ports[0].postMessage({ success });
            });
            break;
            
        case 'GET_PERFORMANCE_METRICS':
            event.ports[0].postMessage(getPerformanceMetrics());
            break;
            
        case 'QUEUE_BACKGROUND_SYNC':
            queueBackgroundSync(data);
            event.ports[0].postMessage({ queued: true });
            break;
            
        case 'UPDATE_SETTINGS':
            updateServiceWorkerSettings(data);
            break;
            
        default:
            console.warn('Unknown message type:', type);
    }
});

// Online/offline event handlers
self.addEventListener('online', () => {
    isOnline = true;
    console.log('🌐 Back online - Processing sync queue');
    processBackgroundSync();
});

self.addEventListener('offline', () => {
    isOnline = false;
    console.log('📱 Gone offline - Queuing requests');
});

// === CACHE MANAGEMENT FUNCTIONS ===

async function cacheStaticAssets() {
    try {
        const cache = await caches.open(CACHE_CONFIG.caches.static);
        console.log('📦 Caching static assets...');
        
        // Cache assets in batches to avoid overwhelming the browser
        const batchSize = 10;
        for (let i = 0; i < STATIC_ASSETS.length; i += batchSize) {
            const batch = STATIC_ASSETS.slice(i, i + batchSize);
            await Promise.allSettled(
                batch.map(url => 
                    cache.add(url).catch(err => 
                        console.warn(`Failed to cache ${url}:`, err)
                    )
                )
            );
        }
        
        console.log(`✅ Cached ${STATIC_ASSETS.length} static assets`);
    } catch (error) {
        console.error('❌ Failed to cache static assets:', error);
    }
}

async function cleanupOldCaches() {
    try {
        const cacheNames = await caches.keys();
        const currentCaches = Object.values(CACHE_CONFIG.caches);
        
        const deletionPromises = cacheNames
            .filter(cacheName => 
                cacheName.startsWith(CACHE_CONFIG.prefix) && 
                !currentCaches.includes(cacheName)
            )
            .map(cacheName => {
                console.log('🗑️ Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            });
        
        await Promise.all(deletionPromises);
        console.log('✅ Cache cleanup completed');
    } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
    }
}

// === REQUEST HANDLERS ===

async function handleStaticAsset(request) {
    const cacheName = CACHE_CONFIG.caches.static;
    
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.maxAge.static)) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        // Try network first for fresh content
        try {
            const networkResponse = await fetchWithTimeout(request, 5000);
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('Network failed for static asset, using cache:', networkError);
        }
        
        // Fallback to cache even if expired
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        // Ultimate fallback
        performanceMetrics.cacheMisses++;
        return createOfflineResponse('Static asset not available offline');
        
    } catch (error) {
        console.error('Static asset handler error:', error);
        performanceMetrics.errors++;
        return createErrorResponse('Failed to load static asset');
    }
}

async function handleAPIRequest(request) {
    const cacheName = CACHE_CONFIG.caches.api;
    const url = new URL(request.url);
    
    try {
        // Network first strategy for APIs
        try {
            const networkResponse = await fetchWithTimeout(request, 10000);
            
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                
                // Only cache successful responses
                const responseClone = networkResponse.clone();
                await manageCacheSize(cacheName, CACHE_CONFIG.limits.api);
                cache.put(request, responseClone);
                
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('API network request failed:', networkError);
        }
        
        // Fallback to cache
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            
            // Add offline indicator header
            const response = new Response(cachedResponse.body, {
                status: cachedResponse.status,
                statusText: cachedResponse.statusText,
                headers: {
                    ...Object.fromEntries(cachedResponse.headers.entries()),
                    'X-Served-From': 'cache',
                    'X-Cache-Date': cachedResponse.headers.get('date') || 'unknown'
                }
            });
            
            return response;
        }
        
        // Return offline fallback
        performanceMetrics.offlineRequests++;
        return getAPIOfflineFallback(url);
        
    } catch (error) {
        console.error('API request handler error:', error);
        performanceMetrics.errors++;
        return createErrorResponse('API request failed');
    }
}

async function handleImageRequest(request) {
    const cacheName = CACHE_CONFIG.caches.images;
    
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        // Cache first for images
        if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.maxAge.images)) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        try {
            const networkResponse = await fetchWithTimeout(request, 15000);
            
            if (networkResponse.ok) {
                await manageCacheSize(cacheName, CACHE_CONFIG.limits.images);
                cache.put(request, networkResponse.clone());
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('Image network request failed:', networkError);
        }
        
        // Fallback to cached version even if expired
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        // Return placeholder image
        performanceMetrics.cacheMisses++;
        return createPlaceholderImage();
        
    } catch (error) {
        console.error('Image request handler error:', error);
        performanceMetrics.errors++;
        return createPlaceholderImage();
    }
}

async function handleAudioRequest(request) {
    const cacheName = CACHE_CONFIG.caches.audio;
    
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        // Cache first for audio files
        if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.maxAge.audio)) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        try {
            const networkResponse = await fetchWithTimeout(request, 30000); // Longer timeout for audio
            
            if (networkResponse.ok) {
                await manageCacheSize(cacheName, CACHE_CONFIG.limits.audio);
                cache.put(request, networkResponse.clone());
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('Audio network request failed:', networkError);
        }
        
        // Fallback to cached version
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        // Return error response for audio
        performanceMetrics.cacheMisses++;
        return createOfflineResponse('Audio not available offline', 503);
        
    } catch (error) {
        console.error('Audio request handler error:', error);
        performanceMetrics.errors++;
        return createErrorResponse('Audio request failed');
    }
}

async function handleFontRequest(request) {
    const cacheName = CACHE_CONFIG.caches.fonts;
    
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        // Cache first for fonts (they rarely change)
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        try {
            const networkResponse = await fetchWithTimeout(request, 10000);
            
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('Font network request failed:', networkError);
        }
        
        performanceMetrics.cacheMisses++;
        return createOfflineResponse('Font not available offline', 503);
        
    } catch (error) {
        console.error('Font request handler error:', error);
        performanceMetrics.errors++;
        return createErrorResponse('Font request failed');
    }
}

async function handleCDNResource(request) {
    const cacheName = CACHE_CONFIG.caches.static;
    
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        // Cache first for CDN resources
        if (cachedResponse && !isExpired(cachedResponse, CACHE_CONFIG.maxAge.static)) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        try {
            const networkResponse = await fetchWithTimeout(request, 10000);
            
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('CDN network request failed:', networkError);
        }
        
        // Fallback to cache even if expired
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        performanceMetrics.cacheMisses++;
        return createOfflineResponse('CDN resource not available offline', 503);
        
    } catch (error) {
        console.error('CDN request handler error:', error);
        performanceMetrics.errors++;
        return createErrorResponse('CDN request failed');
    }
}

async function handleDynamicRequest(request) {
    const cacheName = CACHE_CONFIG.caches.dynamic;
    const url = new URL(request.url);
    
    try {
        // Network first for dynamic content
        try {
            const networkResponse = await fetchWithTimeout(request, 8000);
            
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                await manageCacheSize(cacheName, CACHE_CONFIG.limits.dynamic);
                cache.put(request, networkResponse.clone());
                performanceMetrics.networkRequests++;
                return networkResponse;
            }
        } catch (networkError) {
            console.warn('Dynamic request network failed:', networkError);
        }
        
        // Fallback to cache
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            performanceMetrics.cacheHits++;
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineCache = await caches.open(CACHE_CONFIG.caches.static);
            const offlinePage = await offlineCache.match('/offline.html');
            
            if (offlinePage) {
                performanceMetrics.offlineRequests++;
                return offlinePage;
            }
        }
        
        performanceMetrics.cacheMisses++;
        return createOfflineResponse('Page not available offline');
        
    } catch (error) {
        console.error('Dynamic request handler error:', error);
        performanceMetrics.errors++;
        return createErrorResponse('Request failed');
    }
}

// === UTILITY FUNCTIONS ===

function isStaticAsset(url) {
    return url.origin === self.location.origin && (
        url.pathname.startsWith('/src/') ||
        url.pathname.startsWith('/assets/') ||
        url.pathname === '/' ||
        url.pathname === '/index.html' ||
        url.pathname === '/manifest.json' ||
        url.pathname === '/offline.html'
    );
}

function isAPIRequest(url) {
    return Object.values(API_PATTERNS).some(patterns =>
        patterns.some(pattern => pattern.test(url.hostname))
    );
}

function isImageRequest(url) {
    return (
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(url.pathname) ||
        Object.values(API_PATTERNS.images).some(pattern => pattern.test(url.hostname))
    );
}

function isAudioRequest(url) {
    return (
        /\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i.test(url.pathname) ||
        Object.values(API_PATTERNS.sounds).some(pattern => pattern.test(url.hostname))
    );
}

function isFontRequest(url) {
    return (
        /\.(woff|woff2|ttf|otf|eot)$/i.test(url.pathname) ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('fonts.googleapis.com')
    );
}

function isCDNResource(url) {
    return CDN_PATTERNS.some(pattern => pattern.test(url.hostname));
}

function isExpired(response, maxAge) {
    const dateHeader = response.headers.get('date');
    if (!dateHeader) return false;
    
    const responseDate = new Date(dateHeader);
    const now = new Date();
    
    return (now.getTime() - responseDate.getTime()) > maxAge;
}

async function fetchWithTimeout(request, timeout = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(request, {
            signal: controller.signal,
            headers: {
                ...Object.fromEntries(request.headers.entries()),
                'Cache-Control': 'no-cache'
            }
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function manageCacheSize(cacheName, limitMB) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length === 0) return;
        
        // Calculate total size
        let totalSize = 0;
        const sizePromises = keys.map(async key => {
            try {
                const response = await cache.match(key);
                const blob = await response.blob();
                return { key, size: blob.size, date: response.headers.get('date') };
            } catch (error) {
                return { key, size: 0, date: null };
            }
        });
        
        const sizes = await Promise.all(sizePromises);
        totalSize = sizes.reduce((sum, item) => sum + item.size, 0);
        
        const limitBytes = limitMB * 1024 * 1024;
        
        if (totalSize > limitBytes) {
            // Sort by date (oldest first) for LRU eviction
            sizes.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateA - dateB;
            });
            
            let removedSize = 0;
            for (const item of sizes) {
                if (totalSize - removedSize <= limitBytes) break;
                
                await cache.delete(item.key);
                removedSize += item.size;
                
                console.log(`🗑️ Evicted from ${cacheName}: ${item.key.url} (${(item.size / 1024 / 1024).toFixed(2)}MB)`);
            }
            
            console.log(`📊 Cache ${cacheName} size reduced by ${(removedSize / 1024 / 1024).toFixed(2)}MB`);
        }
    } catch (error) {
        console.error(`Cache size management failed for ${cacheName}:`, error);
    }
}

// === OFFLINE FALLBACKS ===

function getAPIOfflineFallback(url) {
    const hostname = url.hostname;
    
    // Weather API fallback
    if (API_PATTERNS.weather.some(pattern => pattern.test(hostname))) {
        return new Response(JSON.stringify({
            weather: [{ 
                main: "Clear", 
                description: "clear sky", 
                icon: "01d" 
            }],
            main: { 
                temp: 22, 
                feels_like: 22,
                humidity: 50,
                pressure: 1013
            },
            name: "Your Location",
            wind: { speed: 3.5, deg: 180 },
            visibility: 10000,
            clouds: { all: 0 },
            sys: { 
                sunrise: Date.now() - 3600000,
                sunset: Date.now() + 3600000
            },
            offline: true
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'X-Served-From': 'offline-fallback'
            }
        });
    }
    
    // Quote API fallback
    if (API_PATTERNS.quotes.some(pattern => pattern.test(hostname))) {
        const fallbackQuotes = [
            {
                content: "The best way to predict the future is to create it.",
                author: "Peter Drucker",
                tags: ["inspirational", "future"]
            },
            {
                content: "In the middle of difficulty lies opportunity.",
                author: "Albert Einstein",
                tags: ["inspirational", "opportunity"]
            },
            {
                content: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon",
                tags: ["life", "wisdom"]
            },
            {
                content: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                tags: ["work", "passion"]
            }
        ];
        
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        
        return new Response(JSON.stringify({
            ...randomQuote,
            offline: true
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'X-Served-From': 'offline-fallback'
            }
        });
    }
    
    // Color API fallback
    if (API_PATTERNS.colors.some(pattern => pattern.test(hostname))) {
        const generateRandomColor = () => {
            return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        };
        
        const palette = Array.from({ length: 5 }, generateRandomColor);
        
        return new Response(JSON.stringify({
            colors: palette,
            offline: true
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'X-Served-From': 'offline-fallback'
            }
        });
    }
    
    // Generic API fallback
    return new Response(JSON.stringify({
        error: 'API not available offline',
        offline: true,
        message: 'This service requires an internet connection'
    }), {
        status: 503,
        headers: { 
            'Content-Type': 'application/json',
            'X-Served-From': 'offline-fallback'
        }
    });
}

function createPlaceholderImage() {
    const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#2a2a2a;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <circle cx="200" cy="120" r="30" fill="#444" opacity="0.5"/>
            <text x="50%" y="60%" text-anchor="middle" dy=".3em" fill="#666" font-family="Arial, sans-serif" font-size="16">
                🖼️ Image not available offline
            </text>
            <text x="50%" y="70%" text-anchor="middle" dy=".3em" fill="#555" font-family="Arial, sans-serif" font-size="12">
                Connect to internet to load images
            </text>
        </svg>
    `;
    
    return new Response(svg, {
        status: 200,
        headers: { 
            'Content-Type': 'image/svg+xml',
            'X-Served-From': 'placeholder'
        }
    });
}

function createOfflineResponse(message, status = 503) {
    return new Response(JSON.stringify({
        error: 'Offline',
        message: message,
        offline: true,
        timestamp: new Date().toISOString()
    }), {
        status: status,
        headers: { 
            'Content-Type': 'application/json',
            'X-Served-From': 'offline-response'
        }
    });
}

function createErrorResponse(message, status = 500) {
    return new Response(JSON.stringify({
        error: 'Service Worker Error',
        message: message,
        timestamp: new Date().toISOString()
    }), {
        status: status,
        headers: { 
            'Content-Type': 'application/json',
            'X-Served-From': 'error-response'
        }
    });
}

// === BACKGROUND SYNC ===

async function initializeBackgroundSync() {
    try {
        // Register for background sync
        if ('sync' in self.registration) {
            console.log('🔄 Background sync initialized');
        }
        
        // Register for periodic sync if available
        if ('periodicSync' in self.registration) {
            await self.registration.periodicSync.register('content-refresh', {
                minInterval: 24 * 60 * 60 * 1000 // 24 hours
            });
            console.log('⏰ Periodic sync registered');
        }
    } catch (error) {
        console.warn('Background sync initialization failed:', error);
    }
}

async function processBackgroundSync() {
    try {
        console.log('🔄 Processing background sync queue...');
        
        // Process queued requests
        const processedItems = [];
        
        for (const item of syncQueue) {
            try {
                await processQueueItem(item);
                processedItems.push(item);
            } catch (error) {
                console.warn('Failed to process queue item:', error);
                // Keep failed items in queue for retry
            }
        }
        
        // Remove processed items from queue
        syncQueue = syncQueue.filter(item => !processedItems.includes(item));
        
        // Refresh API data
        await refreshAPIs();
        
        console.log(`✅ Background sync completed. Processed ${processedItems.length} items.`);
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function processQueueItem(item) {
    switch (item.type) {
        case 'api-request':
            return await fetch(item.url, item.options);
            
        case 'cache-update':
            const cache = await caches.open(item.cacheName);
            return await cache.add(item.url);
            
        case 'user-action':
            // Handle user actions that were queued while offline
            return await handleQueuedUserAction(item);
            
        default:
            console.warn('Unknown queue item type:', item.type);
    }
}

async function handleQueuedUserAction(item) {
    // Send queued user actions to the main app
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
        client.postMessage({
            type: 'QUEUED_ACTION',
            action: item.action,
            data: item.data,
            timestamp: item.timestamp
        });
    }
}

function queueBackgroundSync(data) {
    syncQueue.push({
        ...data,
        timestamp: Date.now(),
        id: generateId()
    });
    
    // Register for sync when back online
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        self.registration.sync.register('background-sync');
    }
}

async function refreshAPIs() {
    try {
        const apiCache = await caches.open(CACHE_CONFIG.caches.api);
        
        // List of API endpoints to refresh
        const apiEndpoints = [
            'https://api.quotable.io/random',
            // Add other API endpoints that should be refreshed
        ];
        
        const refreshPromises = apiEndpoints.map(async url => {
            try {
                const response = await fetchWithTimeout(new Request(url), 5000);
                if (response.ok) {
                    await apiCache.put(url, response);
                    console.log(`✅ Refreshed API: ${url}`);
                }
            } catch (error) {
                console.warn(`Failed to refresh API ${url}:`, error);
            }
        });
        
        await Promise.allSettled(refreshPromises);
    } catch (error) {
        console.error('API refresh failed:', error);
    }
}

async function periodicContentRefresh() {
    try {
        console.log('⏰ Performing periodic content refresh...');
        
        // Refresh quotes
        await refreshAPIs();
        
        // Clean up old cache entries
        await performCacheCleanup();
        
        // Update performance metrics
        await updatePerformanceMetrics();
        
        console.log('✅ Periodic content refresh completed');
    } catch (error) {
        console.error('Periodic content refresh failed:', error);
    }
}

// === PERFORMANCE MONITORING ===

function initializePerformanceTracking() {
    performanceMetrics = {
        cacheHits: 0,
        cacheMisses: 0,
        networkRequests: 0,
        offlineRequests: 0,
        errors: 0,
        startTime: Date.now(),
        version: CACHE_CONFIG.version
    };
    
    console.log('📊 Performance tracking initialized');
}

function getPerformanceMetrics() {
    const uptime = Date.now() - performanceMetrics.startTime;
    const totalRequests = performanceMetrics.cacheHits + performanceMetrics.cacheMisses + performanceMetrics.networkRequests;
    
    return {
        ...performanceMetrics,
        uptime: uptime,
        cacheHitRate: totalRequests > 0 ? (performanceMetrics.cacheHits / totalRequests * 100).toFixed(2) : 0,
        totalRequests: totalRequests,
        averageResponseTime: totalRequests > 0 ? (uptime / totalRequests).toFixed(2) : 0
    };
}

async function updatePerformanceMetrics() {
    try {
        // Get cache sizes
        const cacheStatus = await getCacheStatus();
        
        // Send metrics to main app
        const clients = await self.clients.matchAll();
        for (const client of clients) {
            client.postMessage({
                type: 'PERFORMANCE_UPDATE',
                metrics: getPerformanceMetrics(),
                cacheStatus: cacheStatus
            });
        }
    } catch (error) {
        console.error('Performance metrics update failed:', error);
    }
}

// === CACHE STATUS AND MANAGEMENT ===

async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {};
        
        for (const cacheName of cacheNames) {
            if (cacheName.startsWith(CACHE_CONFIG.prefix)) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                
                let totalSize = 0;
                const sizePromises = keys.map(async key => {
                    try {
                        const response = await cache.match(key);
                        const blob = await response.blob();
                        return blob.size;
                    } catch (error) {
                        return 0;
                    }
                });
                
                const sizes = await Promise.all(sizePromises);
                totalSize = sizes.reduce((sum, size) => sum + size, 0);
                
                status[cacheName] = {
                    entries: keys.length,
                    size: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
                    lastUpdated: new Date().toISOString()
                };
            }
        }
        
        return status;
    } catch (error) {
        console.error('Failed to get cache status:', error);
        return {};
    }
}

async function clearSpecificCache(cacheName) {
    try {
        const success = await caches.delete(cacheName);
        console.log(`🗑️ Cache ${cacheName} cleared:`, success);
        return success;
    } catch (error) {
        console.error(`Failed to clear cache ${cacheName}:`, error);
        return false;
    }
}

async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        const deletionPromises = cacheNames
            .filter(name => name.startsWith(CACHE_CONFIG.prefix))
            .map(name => caches.delete(name));
        
        await Promise.all(deletionPromises);
        console.log('🗑️ All caches cleared');
        return true;
    } catch (error) {
        console.error('Failed to clear all caches:', error);
        return false;
    }
}

async function performCacheCleanup() {
    try {
        console.log('🧹 Performing cache cleanup...');
        
        // Clean up each cache based on its limits
        const cleanupPromises = Object.entries(CACHE_CONFIG.caches).map(([type, cacheName]) => {
            const limit = CACHE_CONFIG.limits[type];
            if (limit) {
                return manageCacheSize(cacheName, limit);
            }
        });
        
        await Promise.all(cleanupPromises.filter(Boolean));
        
        console.log('✅ Cache cleanup completed');
    } catch (error) {
        console.error('Cache cleanup failed:', error);
    }
}

// === UTILITY FUNCTIONS ===

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function notifyClientsOfActivation() {
    try {
        const clients = await self.clients.matchAll();
        
        for (const client of clients) {
            client.postMessage({
                type: 'SW_ACTIVATED',
                version: CACHE_CONFIG.version,
                timestamp: Date.now()
            });
        }
        
        console.log(`📱 Notified ${clients.length} clients of activation`);
    } catch (error) {
        console.error('Failed to notify clients:', error);
    }
}

function updateServiceWorkerSettings(settings) {
    // Update service worker behavior based on app settings
    if (settings.performanceMode) {
        // Reduce cache limits in performance mode
        Object.keys(CACHE_CONFIG.limits).forEach(key => {
            CACHE_CONFIG.limits[key] = Math.floor(CACHE_CONFIG.limits[key] * 0.5);
        });
    }
    
    if (settings.offlineMode) {
        // Prioritize cache over network
        // This would require modifying the request handlers
    }
    
    console.log('⚙️ Service worker settings updated:', settings);
}

async function handleBackgroundSync(request) {
    try {
        const data = await request.json();
        queueBackgroundSync(data);
        
        return new Response(JSON.stringify({
            success: true,
            queued: true,
            id: data.id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Log service worker startup
console.log(`🕯️ Cozy Light Service Worker v${CACHE_CONFIG.version} loaded`);
console.log('📊 Cache configuration:', CACHE_CONFIG);

// Performance monitoring interval
setInterval(() => {
    if (performanceMetrics.startTime) {
        updatePerformanceMetrics();
    }
}, 5 * 60 * 1000); // Every 5 minutes
