/**
 * Cozy Light - Storage Management
 * Comprehensive data storage and persistence system
 * Version 2.0.0
 */

// ===== STORAGE CONFIGURATION =====
const STORAGE_CONFIG = {
    // Storage keys
    KEYS: {
        USER_SETTINGS: 'cozy_light_settings',
        LIGHT_PRESETS: 'cozy_light_presets',
        USER_PRESETS: 'cozy_light_user_presets',
        TIMER_HISTORY: 'cozy_light_timer_history',
        USAGE_STATS: 'cozy_light_usage_stats',
        API_CACHE: 'cozy_light_api_cache',
        THEME_PREFERENCES: 'cozy_light_theme_prefs',
        GESTURE_SETTINGS: 'cozy_light_gesture_settings',
        NOTIFICATION_SETTINGS: 'cozy_light_notifications',
        BACKUP_DATA: 'cozy_light_backup',
        LAST_SESSION: 'cozy_light_last_session',
        FAVORITES: 'cozy_light_favorites',
        RECENT_COLORS: 'cozy_light_recent_colors',
        CUSTOM_ANIMATIONS: 'cozy_light_custom_animations'
    },
    
    // Storage limits
    LIMITS: {
        MAX_PRESETS: 50,
        MAX_TIMER_HISTORY: 100,
        MAX_RECENT_COLORS: 20,
        MAX_CACHE_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_BACKUP_SIZE: 5 * 1024 * 1024,  // 5MB
        CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
        SESSION_TIMEOUT: 30 * 60 * 1000     // 30 minutes
    },
    
    // Storage types
    TYPES: {
        LOCAL: 'localStorage',
        SESSION: 'sessionStorage',
        INDEXED_DB: 'indexedDB',
        MEMORY: 'memory'
    },
    
    // Compression settings
    COMPRESSION: {
        ENABLED: true,
        THRESHOLD: 1024, // Compress if data > 1KB
        LEVEL: 6 // Compression level (1-9)
    }
};

// ===== STORAGE UTILITIES =====

/**
 * Storage utility class with fallbacks and error handling
 */
class StorageManager {
    constructor() {
        this.isAvailable = this.checkStorageAvailability();
        this.memoryStorage = new Map();
        this.compressionEnabled = STORAGE_CONFIG.COMPRESSION.ENABLED;
        this.eventListeners = new Map();
        
        // Initialize storage event handling
        this.initStorageEvents();
        
        // Periodic cleanup
        this.startCleanupTimer();
    }
    
    /**
     * Check if storage is available
     * @returns {object} Storage availability status
     */
    checkStorageAvailability() {
        const availability = {
            localStorage: false,
            sessionStorage: false,
            indexedDB: false
        };
        
        // Test localStorage
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            availability.localStorage = true;
        } catch (e) {
            console.warn('localStorage not available:', e.message);
        }
        
        // Test sessionStorage
        try {
            const test = '__session_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            availability.sessionStorage = true;
        } catch (e) {
            console.warn('sessionStorage not available:', e.message);
        }
        
        // Test IndexedDB
        try {
            availability.indexedDB = 'indexedDB' in window;
        } catch (e) {
            console.warn('IndexedDB not available:', e.message);
        }
        
        return availability;
    }
    
    /**
     * Get storage size information
     * @returns {object} Storage size data
     */
    async getStorageInfo() {
        const info = {
            localStorage: { used: 0, available: 0 },
            sessionStorage: { used: 0, available: 0 },
            indexedDB: { used: 0, available: 0 },
            total: { used: 0, available: 0 }
        };
        
        // Calculate localStorage usage
        if (this.isAvailable.localStorage) {
            let localStorageSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    localStorageSize += localStorage[key].length + key.length;
                }
            }
            info.localStorage.used = localStorageSize;
            info.localStorage.available = 5 * 1024 * 1024 - localStorageSize; // ~5MB limit
        }
        
        // Calculate sessionStorage usage
        if (this.isAvailable.sessionStorage) {
            let sessionStorageSize = 0;
            for (let key in sessionStorage) {
                if (sessionStorage.hasOwnProperty(key)) {
                    sessionStorageSize += sessionStorage[key].length + key.length;
                }
            }
            info.sessionStorage.used = sessionStorageSize;
            info.sessionStorage.available = 5 * 1024 * 1024 - sessionStorageSize;
        }
        
        // Calculate IndexedDB usage (if supported)
        if (this.isAvailable.indexedDB && 'storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                info.indexedDB.used = estimate.usage || 0;
                info.indexedDB.available = (estimate.quota || 0) - (estimate.usage || 0);
            } catch (e) {
                console.warn('Could not estimate IndexedDB usage:', e);
            }
        }
        
        // Calculate totals
        info.total.used = info.localStorage.used + info.sessionStorage.used + info.indexedDB.used;
        info.total.available = info.localStorage.available + info.sessionStorage.available + info.indexedDB.available;
        
        return info;
    }
    
    /**
     * Compress data if enabled and above threshold
     * @param {string} data - Data to compress
     * @returns {string} Compressed or original data
     */
    compressData(data) {
        if (!this.compressionEnabled || data.length < STORAGE_CONFIG.COMPRESSION.THRESHOLD) {
            return data;
        }
        
        try {
            // Simple LZ-string compression (would need to include library)
            // For now, return original data
            return data;
        } catch (e) {
            console.warn('Compression failed:', e);
            return data;
        }
    }
    
    /**
     * Decompress data if compressed
     * @param {string} data - Data to decompress
     * @returns {string} Decompressed data
     */
    decompressData(data) {
        try {
            // Simple decompression logic
            return data;
        } catch (e) {
            console.warn('Decompression failed:', e);
            return data;
        }
    }
    
    /**
     * Set item in storage with metadata
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {object} options - Storage options
     * @returns {boolean} Success status
     */
    setItem(key, value, options = {}) {
        const {
            storageType = STORAGE_CONFIG.TYPES.LOCAL,
            expiry = null,
            compress = true,
            encrypt = false
        } = options;
        
        try {
            const metadata = {
                timestamp: Date.now(),
                expiry: expiry ? Date.now() + expiry : null,
                compressed: false,
                encrypted: false,
                version: '2.0.0'
            };
            
            let serializedValue = JSON.stringify(value);
            
            // Compress if enabled
            if (compress && this.compressionEnabled) {
                const compressed = this.compressData(serializedValue);
                if (compressed !== serializedValue) {
                    serializedValue = compressed;
                    metadata.compressed = true;
                }
            }
            
            // Encrypt if requested (placeholder for future implementation)
            if (encrypt) {
                // serializedValue = this.encryptData(serializedValue);
                metadata.encrypted = true;
            }
            
            const storageData = {
                data: serializedValue,
                metadata: metadata
            };
            
            const finalData = JSON.stringify(storageData);
            
            // Store based on type
            switch (storageType) {
                case STORAGE_CONFIG.TYPES.LOCAL:
                    if (this.isAvailable.localStorage) {
                        localStorage.setItem(key, finalData);
                    } else {
                        this.memoryStorage.set(key, storageData);
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.SESSION:
                    if (this.isAvailable.sessionStorage) {
                        sessionStorage.setItem(key, finalData);
                    } else {
                        this.memoryStorage.set(key, storageData);
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.MEMORY:
                    this.memoryStorage.set(key, storageData);
                    break;
                    
                default:
                    throw new Error(`Unsupported storage type: ${storageType}`);
            }
            
            // Emit storage event
            this.emitStorageEvent('set', key, value, options);
            
            return true;
            
        } catch (error) {
            console.error('Storage setItem failed:', error);
            return false;
        }
    }
    
    /**
     * Get item from storage with automatic expiry check
     * @param {string} key - Storage key
     * @param {object} options - Retrieval options
     * @returns {any} Retrieved value or null
     */
    getItem(key, options = {}) {
        const {
            storageType = STORAGE_CONFIG.TYPES.LOCAL,
            defaultValue = null,
            skipExpiry = false
        } = options;
        
        try {
            let rawData = null;
            
            // Retrieve based on type
            switch (storageType) {
                case STORAGE_CONFIG.TYPES.LOCAL:
                    if (this.isAvailable.localStorage) {
                        rawData = localStorage.getItem(key);
                    } else {
                        const memData = this.memoryStorage.get(key);
                        rawData = memData ? JSON.stringify(memData) : null;
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.SESSION:
                    if (this.isAvailable.sessionStorage) {
                        rawData = sessionStorage.getItem(key);
                    } else {
                        const memData = this.memoryStorage.get(key);
                        rawData = memData ? JSON.stringify(memData) : null;
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.MEMORY:
                    const memData = this.memoryStorage.get(key);
                    rawData = memData ? JSON.stringify(memData) : null;
                    break;
                    
                default:
                    throw new Error(`Unsupported storage type: ${storageType}`);
            }
            
            if (!rawData) {
                return defaultValue;
            }
            
            const storageData = JSON.parse(rawData);
            
            // Check if data has metadata (new format)
            if (storageData.metadata) {
                const { data, metadata } = storageData;
                
                // Check expiry
                if (!skipExpiry && metadata.expiry && Date.now() > metadata.expiry) {
                    this.removeItem(key, { storageType });
                    return defaultValue;
                }
                
                let processedData = data;
                
                // Decompress if needed
                if (metadata.compressed) {
                    processedData = this.decompressData(processedData);
                }
                
                // Decrypt if needed
                if (metadata.encrypted) {
                    // processedData = this.decryptData(processedData);
                }
                
                // Emit storage event
                this.emitStorageEvent('get', key, null, options);
                
                return JSON.parse(processedData);
            } else {
                // Legacy format - return as is
                return storageData;
            }
            
        } catch (error) {
            console.error('Storage getItem failed:', error);
            return defaultValue;
        }
    }
    
    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @param {object} options - Removal options
     * @returns {boolean} Success status
     */
    removeItem(key, options = {}) {
        const { storageType = STORAGE_CONFIG.TYPES.LOCAL } = options;
        
        try {
            switch (storageType) {
                case STORAGE_CONFIG.TYPES.LOCAL:
                    if (this.isAvailable.localStorage) {
                        localStorage.removeItem(key);
                    } else {
                        this.memoryStorage.delete(key);
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.SESSION:
                    if (this.isAvailable.sessionStorage) {
                        sessionStorage.removeItem(key);
                    } else {
                        this.memoryStorage.delete(key);
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.MEMORY:
                    this.memoryStorage.delete(key);
                    break;
                    
                default:
                    throw new Error(`Unsupported storage type: ${storageType}`);
            }
            
            // Emit storage event
            this.emitStorageEvent('remove', key, null, options);
            
            return true;
            
        } catch (error) {
            console.error('Storage removeItem failed:', error);
            return false;
        }
    }
    
    /**
     * Clear all storage
     * @param {object} options - Clear options
     * @returns {boolean} Success status
     */
    clear(options = {}) {
        const { storageType = STORAGE_CONFIG.TYPES.LOCAL, prefix = null } = options;
        
        try {
            switch (storageType) {
                case STORAGE_CONFIG.TYPES.LOCAL:
                    if (this.isAvailable.localStorage) {
                        if (prefix) {
                            // Clear only items with prefix
                            const keysToRemove = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if (key && key.startsWith(prefix)) {
                                    keysToRemove.push(key);
                                }
                            }
                            keysToRemove.forEach(key => localStorage.removeItem(key));
                        } else {
                            localStorage.clear();
                        }
                    } else {
                        if (prefix) {
                            for (const [key] of this.memoryStorage) {
                                if (key.startsWith(prefix)) {
                                    this.memoryStorage.delete(key);
                                }
                            }
                        } else {
                            this.memoryStorage.clear();
                        }
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.SESSION:
                    if (this.isAvailable.sessionStorage) {
                        if (prefix) {
                            const keysToRemove = [];
                            for (let i = 0; i < sessionStorage.length; i++) {
                                const key = sessionStorage.key(i);
                                if (key && key.startsWith(prefix)) {
                                    keysToRemove.push(key);
                                }
                            }
                            keysToRemove.forEach(key => sessionStorage.removeItem(key));
                        } else {
                            sessionStorage.clear();
                        }
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.MEMORY:
                    if (prefix) {
                        for (const [key] of this.memoryStorage) {
                            if (key.startsWith(prefix)) {
                                this.memoryStorage.delete(key);
                            }
                        }
                    } else {
                        this.memoryStorage.clear();
                    }
                    break;
            }
            
            // Emit storage event
            this.emitStorageEvent('clear', null, null, options);
            
            return true;
            
        } catch (error) {
            console.error('Storage clear failed:', error);
            return false;
        }
    }
    
    /**
     * Get all keys with optional prefix filter
     * @param {object} options - Options
     * @returns {Array} Array of keys
     */
    getKeys(options = {}) {
        const { storageType = STORAGE_CONFIG.TYPES.LOCAL, prefix = null } = options;
        const keys = [];
        
        try {
            switch (storageType) {
                case STORAGE_CONFIG.TYPES.LOCAL:
                    if (this.isAvailable.localStorage) {
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && (!prefix || key.startsWith(prefix))) {
                                keys.push(key);
                            }
                        }
                    } else {
                        for (const [key] of this.memoryStorage) {
                            if (!prefix || key.startsWith(prefix)) {
                                keys.push(key);
                            }
                        }
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.SESSION:
                    if (this.isAvailable.sessionStorage) {
                        for (let i = 0; i < sessionStorage.length; i++) {
                            const key = sessionStorage.key(i);
                            if (key && (!prefix || key.startsWith(prefix))) {
                                keys.push(key);
                            }
                        }
                    }
                    break;
                    
                case STORAGE_CONFIG.TYPES.MEMORY:
                    for (const [key] of this.memoryStorage) {
                        if (!prefix || key.startsWith(prefix)) {
                            keys.push(key);
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Storage getKeys failed:', error);
        }
        
        return keys;
    }
    
    /**
     * Initialize storage event handling
     */
    initStorageEvents() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', (event) => {
            this.emitStorageEvent('external_change', event.key, event.newValue, {
                oldValue: event.oldValue,
                url: event.url
            });
        });
    }
    
    /**
     * Add storage event listener
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }
    
    /**
     * Remove storage event listener
     * @param {string} event - Event type
     * @param {Function} callback - Callback function
     */
    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }
    
    /**
     * Emit storage event
     * @param {string} event - Event type
     * @param {string} key - Storage key
     * @param {any} value - Storage value
     * @param {object} options - Event options
     */
    emitStorageEvent(event, key, value, options = {}) {
        if (this.eventListeners.has(event)) {
            const eventData = { key, value, options, timestamp: Date.now() };
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(eventData);
                } catch (error) {
                    console.error('Storage event callback failed:', error);
                }
            });
        }
    }
    
    /**
     * Start periodic cleanup timer
     */
    startCleanupTimer() {
        // Clean up expired items every hour
        setInterval(() => {
            this.cleanupExpiredItems();
        }, 60 * 60 * 1000);
        
        // Initial cleanup
        setTimeout(() => {
            this.cleanupExpiredItems();
        }, 5000);
    }
    
    /**
     * Clean up expired items
     */
    cleanupExpiredItems() {
        const storageTypes = [
            STORAGE_CONFIG.TYPES.LOCAL,
            STORAGE_CONFIG.TYPES.SESSION,
            STORAGE_CONFIG.TYPES.MEMORY
        ];
        
        storageTypes.forEach(storageType => {
            const keys = this.getKeys({ storageType });
            keys.forEach(key => {
                // This will automatically remove expired items
                this.getItem(key, { storageType });
            });
        });
    }
    
    /**
     * Export all data for backup
     * @returns {object} Backup data
     */
    exportData() {
        const backup = {
            timestamp: Date.now(),
            version: '2.0.0',
            data: {}
        };
        
        // Export from localStorage
        if (this.isAvailable.localStorage) {
            backup.data.localStorage = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cozy_light_')) {
                    backup.data.localStorage[key] = localStorage.getItem(key);
                }
            }
        }
        
        // Export from sessionStorage
        if (this.isAvailable.sessionStorage) {
            backup.data.sessionStorage = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('cozy_light_')) {
                    backup.data.sessionStorage[key] = sessionStorage.getItem(key);
                }
            }
        }
        
        // Export from memory storage
        backup.data.memoryStorage = {};
        for (const [key, value] of this.memoryStorage) {
            if (key.startsWith('cozy_light_')) {
                backup.data.memoryStorage[key] = JSON.stringify(value);
            }
        }
        
        return backup;
    }
    
    /**
     * Import data from backup
     * @param {object} backupData - Backup data to import
     * @returns {boolean} Success status
     */
    importData(backupData) {
        try {
            if (!backupData || !backupData.data) {
                throw new Error('Invalid backup data format');
            }
            
            // Import to localStorage
            if (backupData.data.localStorage && this.isAvailable.localStorage) {
                Object.entries(backupData.data.localStorage).forEach(([key, value]) => {
                    localStorage.setItem(key, value);
                });
            }
            
            // Import to sessionStorage
            if (backupData.data.sessionStorage && this.isAvailable.sessionStorage) {
                Object.entries(backupData.data.sessionStorage).forEach(([key, value]) => {
                    sessionStorage.setItem(key, value);
                });
            }
            
            // Import to memory storage
            if (backupData.data.memoryStorage) {
                Object.entries(backupData.data.memoryStorage).forEach(([key, value]) => {
                    this.memoryStorage.set(key, JSON.parse(value));
                });
            }
            
            this.emitStorageEvent('import', null, backupData);
            return true;
            
        } catch (error) {
            console.error('Storage import failed:', error);
            return false;
        }
    }
}

// ===== SPECIALIZED STORAGE CLASSES =====

/**
 * Settings storage with validation and defaults
 */
class SettingsStorage {
    constructor(storageManager) {
        this.storage = storageManager;
        this.key = STORAGE_CONFIG.KEYS.USER_SETTINGS;
        this.defaults = this.getDefaultSettings();
    }
    
    getDefaultSettings() {
        return {
            theme: 'cozy',
            brightness: 80,
            color: '#45b7d1',
            animation: 'breathe',
            sound: {
                enabled: true,
                volume: 0.5,
                ambient: 'rain'
            },
            timer: {
                defaultDuration: 25,
                autoStart: false,
                notifications: true
            },
            gestures: {
                enabled: true,
                sensitivity: 0.7
            },
            accessibility: {
                reducedMotion: false,
                highContrast: false,
                largeText: false
            },
            privacy: {
                analytics: true,
                crashReports: true
            }
        };
    }
    
    get(key = null) {
        const settings = this.storage.getItem(this.key, {
            defaultValue: this.defaults
        });
        
        // Merge with defaults to ensure all properties exist
        const mergedSettings = { ...this.defaults, ...settings };
        
        return key ? mergedSettings[key] : mergedSettings;
    }
    
    set(key, value) {
        const currentSettings = this.get();
        
        if (typeof key === 'object') {
            // Bulk update
            Object.assign(currentSettings, key);
        } else {
            // Single property update
            currentSettings[key] = value;
        }
        
        return this.storage.setItem(this.key, currentSettings, {
            compress: true
        });
    }
    
    reset() {
        return this.storage.setItem(this.key, this.defaults);
    }
    
    validate(settings) {
        // Add validation logic here
        return true;
    }
}

/**
 * Presets storage with categorization
 */
class PresetsStorage {
    constructor(storageManager) {
        this.storage = storageManager;
        this.systemKey = STORAGE_CONFIG.KEYS.LIGHT_PRESETS;
        this.userKey = STORAGE_CONFIG.KEYS.USER_PRESETS;
    }
    
    getSystemPresets() {
        return this.storage.getItem(this.systemKey, {
            defaultValue: []
        });
    }
    
    getUserPresets() {
        return this.storage.getItem(this.userKey, {
            defaultValue: []
        });
    }
    
    getAllPresets() {
        return {
            system: this.getSystemPresets(),
            user: this.getUserPresets()
        };
    }
    
    saveUserPreset(preset) {
        const userPresets = this.getUserPresets();
        
        // Check limits
        if (userPresets.length >= STORAGE_CONFIG.LIMITS.MAX_PRESETS) {
            throw new Error('Maximum number of presets reached');
        }
        
        // Add metadata
        const presetWithMetadata = {
            ...preset,
            id: this.generatePresetId(),
            created: Date.now(),
            modified: Date.now(),
            type: 'user'
        };
        
        userPresets.push(presetWithMetadata);
        
        return this.storage.setItem(this.userKey, userPresets, {
            compress: true
        });
    }
    
    updateUserPreset(id, updates) {
        const userPresets = this.getUserPresets();
        const index = userPresets.findIndex(preset => preset.id === id);
        
        if (index === -1) {
            throw new Error('Preset not found');
        }
        
        userPresets[index] = {
            ...userPresets[index],
            ...updates,
            modified: Date.now()
        };
        
        return this.storage.setItem(this.userKey, userPresets, {
            compress: true
        });
    }
    
    deleteUserPreset(id) {
        const userPresets = this.getUserPresets();
        const filteredPresets = userPresets.filter(preset => preset.id !== id);
        
        return this.storage.setItem(this.userKey, filteredPresets, {
            compress: true
        });
    }
    
    generatePresetId() {
        return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Cache storage with TTL and size management
 */
class CacheStorage {
    constructor(storageManager) {
        this.storage = storageManager;
        this.key = STORAGE_CONFIG.KEYS.API_CACHE;
    }
    
    get(cacheKey) {
        const cache = this.storage.getItem(this.key, {
            defaultValue: {}
        });
        
        const item = cache[cacheKey];
        if (!item) return null;
        
        // Check expiry
        if (item.expiry && Date.now() > item.expiry) {
            this.delete(cacheKey);
            return null;
        }
        
        return item.data;
    }
    
    set(cacheKey, data, ttl = STORAGE_CONFIG.LIMITS.CACHE_EXPIRY) {
        const cache = this.storage.getItem(this.key, {
            defaultValue: {}
        });
        
        cache[cacheKey] = {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + ttl,
            size: JSON.stringify(data).length
        };
        
        // Check cache size and clean if necessary
        this.cleanupIfNeeded(cache);
        
        return this.storage.setItem(this.key, cache, {
            compress: true
        });
    }
    
    delete(cacheKey) {
        const cache = this.storage.getItem(this.key, {
            defaultValue: {}
        });
        
        delete cache[cacheKey];
        
        return this.storage.setItem(this.key, cache, {
            compress: true
        });
    }
    
    clear() {
        return this.storage.setItem(this.key, {});
    }
    
    cleanupIfNeeded(cache) {
        const totalSize = Object.values(cache).reduce((sum, item) => sum + (item.size || 0), 0);
        
        if (totalSize > STORAGE_CONFIG.LIMITS.MAX_CACHE_SIZE) {
            // Remove oldest items first
            const sortedEntries = Object.entries(cache).sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            while (totalSize > STORAGE_CONFIG.LIMITS.MAX_CACHE_SIZE * 0.8 && sortedEntries.length > 0) {
                const [key] = sortedEntries.shift();
                delete cache[key];
            }
        }
    }
}

// ===== MAIN STORAGE INSTANCE =====

// Create global storage manager instance
const storageManager = new StorageManager();

// Create specialized storage instances
const settingsStorage = new SettingsStorage(storageManager);
const presetsStorage = new PresetsStorage(storageManager);
const cacheStorage = new CacheStorage(storageManager);

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Quick access to settings
 */
export const settings = {
    get: (key) => settingsStorage.get(key),
    set: (key, value) => settingsStorage.set(key, value),
    reset: () => settingsStorage.reset()
};

/**
 * Quick access to presets
 */
export const presets = {
    getAll: () => presetsStorage.getAllPresets(),
    getUser: () => presetsStorage.getUserPresets(),
    getSystem: () => presetsStorage.getSystemPresets(),
    save: (preset) => presetsStorage.saveUserPreset(preset),
    update: (id, updates) => presetsStorage.updateUserPreset(id, updates),
    delete: (id) => presetsStorage.deleteUserPreset(id)
};

/**
 * Quick access to cache
 */
export const cache = {
    get: (key) => cacheStorage.get(key),
    set: (key, data, ttl) => cacheStorage.set(key, data, ttl),
    delete: (key) => cacheStorage.delete(key),
    clear: () => cacheStorage.clear()
};

/**
 * Quick access to general storage
 */
export const storage = {
    set: (key, value, options) => storageManager.setItem(key, value, options),
    get: (key, options) => storageManager.getItem(key, options),
    remove: (key, options) => storageManager.removeItem(key, options),
    clear: (options) => storageManager.clear(options),
    getKeys: (options) => storageManager.getKeys(options),
    getInfo: () => storageManager.getStorageInfo(),
    export: () => storageManager.exportData(),
    import: (data) => storageManager.importData(data),
    addEventListener: (event, callback) => storageManager.addEventListener(event, callback),
    removeEventListener: (event, callback) => storageManager.removeEventListener(event, callback)
};

// ===== EXPORTS =====
export {
    StorageManager,
    SettingsStorage,
    PresetsStorage,
    CacheStorage,
    STORAGE_CONFIG,
    storageManager,
    settingsStorage,
    presetsStorage,
    cacheStorage
};

export default {
    settings,
    presets,
    cache,
    storage,
    STORAGE_CONFIG
};
