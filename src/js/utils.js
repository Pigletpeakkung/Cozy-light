/**
 * Cozy Light - Utility Functions
 * Core utility functions for the ambient lighting PWA
 * Version 2.0.0
 */

// ===== CORE UTILITIES =====

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Deep merge objects
 * @param {object} target - Target object
 * @param {...object} sources - Source objects
 * @returns {object} Merged object
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 * @param {any} item - Item to check
 * @returns {boolean} Is object
 */
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// ===== DOM UTILITIES =====

/**
 * Query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element
 * @returns {Element|null} Found element
 */
export function $(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
    }
}

/**
 * Query all selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element
 * @returns {NodeList} Found elements
 */
export function $$(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return [];
    }
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag
 * @param {object} attributes - Element attributes
 * @param {string|Element} content - Element content
 * @returns {Element} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Set content
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof Element) {
        element.appendChild(content);
    } else if (Array.isArray(content)) {
        content.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Add event listener with automatic cleanup
 * @param {Element} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {object} options - Event options
 * @returns {Function} Cleanup function
 */
export function addEventListenerWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Wait for DOM element to exist
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Element>} Promise resolving to element
 */
export function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = $(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = $(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {boolean} Is in viewport
 */
export function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    
    if (threshold === 0) {
        return vertInView && horInView;
    }
    
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
    
    return (visibleArea / totalArea) >= threshold;
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Target element or selector
 * @param {object} options - Scroll options
 */
export function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? $(target) : target;
    if (!element) return;

    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        offset: 0
    };

    const scrollOptions = { ...defaultOptions, ...options };
    
    if (scrollOptions.offset) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - scrollOptions.offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: scrollOptions.behavior
        });
    } else {
        element.scrollIntoView(scrollOptions);
    }
}

// ===== COLOR UTILITIES =====

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string
 * @returns {object} RGB object
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {object} HSL object
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {object} RGB object
 */
export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Get color brightness (0-255)
 * @param {string} color - Color in any format
 * @returns {number} Brightness value
 */
export function getColorBrightness(color) {
    const rgb = hexToRgb(color) || parseRgbString(color);
    if (!rgb) return 0;
    
    // Using relative luminance formula
    return Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
}

/**
 * Check if color is light or dark
 * @param {string} color - Color in any format
 * @returns {boolean} True if light, false if dark
 */
export function isLightColor(color) {
    return getColorBrightness(color) > 127;
}

/**
 * Generate complementary color
 * @param {string} color - Base color
 * @returns {string} Complementary color
 */
export function getComplementaryColor(color) {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.h = (hsl.h + 180) % 360;
    
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Parse RGB string to object
 * @param {string} rgbString - RGB string like "rgb(255, 0, 0)"
 * @returns {object|null} RGB object or null
 */
export function parseRgbString(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
    } : null;
}

/**
 * Blend two colors
 * @param {string} color1 - First color
 * @param {string} color2 - Second color
 * @param {number} ratio - Blend ratio (0-1)
 * @returns {string} Blended color
 */
export function blendColors(color1, color2, ratio = 0.5) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
    
    return rgbToHex(r, g, b);
}

// ===== MATH UTILITIES =====

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
    return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input minimum
 * @param {number} inMax - Input maximum
 * @param {number} outMin - Output minimum
 * @param {number} outMax - Output maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} integer - Return integer
 * @returns {number} Random number
 */
export function randomBetween(min, max, integer = false) {
    const value = Math.random() * (max - min) + min;
    return integer ? Math.floor(value) : value;
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate distance between two points
 * @param {object} point1 - First point {x, y}
 * @param {object} point2 - Second point {x, y}
 * @returns {number} Distance
 */
export function distance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points
 * @param {object} point1 - First point {x, y}
 * @param {object} point2 - Second point {x, y}
 * @returns {number} Angle in radians
 */
export function angle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Radians
 * @returns {number} Degrees
 */
export function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

// ===== STRING UTILITIES =====

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to camelCase
 * @param {string} str - Input string
 * @returns {string} CamelCase string
 */
export function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

/**
 * Convert string to kebab-case
 * @param {string} str - Input string
 * @returns {string} Kebab-case string
 */
export function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}

/**
 * Truncate string with ellipsis
 * @param {string} str - Input string
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export function truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Generate random string
 * @param {number} length - String length
 * @param {string} chars - Character set
 * @returns {string} Random string
 */
export function randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate UUID v4
 * @returns {string} UUID string
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Escape HTML characters
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Strip HTML tags from string
 * @param {string} str - Input string
 * @returns {string} Plain text
 */
export function stripHtml(str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent || div.innerText || '';
}

// ===== ARRAY UTILITIES =====

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random element from array
 * @param {Array} array - Source array
 * @returns {any} Random element
 */
export function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Remove duplicates from array
 * @param {Array} array - Source array
 * @param {Function} keyFn - Key function for objects
 * @returns {Array} Array without duplicates
 */
export function removeDuplicates(array, keyFn = null) {
    if (keyFn) {
        const seen = new Set();
        return array.filter(item => {
            const key = keyFn(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Source array
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Group array by key
 * @param {Array} array - Source array
 * @param {Function|string} keyFn - Key function or property name
 * @returns {object} Grouped object
 */
export function groupBy(array, keyFn) {
    const getKey = typeof keyFn === 'function' ? keyFn : item => item[keyFn];
    return array.reduce((groups, item) => {
        const key = getKey(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
        return groups;
    }, {});
}

// ===== DATE UTILITIES =====

/**
 * Format date to string
 * @param {Date} date - Date object
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * Get relative time string
 * @param {Date} date - Date object
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(date, 'MM/DD/YYYY');
}

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} Is today
 */
export function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// ===== VALIDATION UTILITIES =====

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate hex color
 * @param {string} color - Color to validate
 * @returns {boolean} Is valid hex color
 */
export function isValidHexColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
}

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} Is in range
 */
export function isInRange(value, min, max) {
    return value >= min && value <= max;
}

// ===== PERFORMANCE UTILITIES =====

/**
 * Measure function execution time
 * @param {Function} fn - Function to measure
 * @param {...any} args - Function arguments
 * @returns {object} Result and execution time
 */
export async function measureTime(fn, ...args) {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    return {
        result,
        time: end - start
    };
}

/**
 * Create a simple cache with TTL
 * @param {number} ttl - Time to live in milliseconds
 * @returns {object} Cache object
 */
export function createCache(ttl = 300000) { // 5 minutes default
    const cache = new Map();
    
    return {
        get(key) {
            const item = cache.get(key);
            if (!item) return null;
            
            if (Date.now() > item.expiry) {
                cache.delete(key);
                return null;
            }
            
            return item.value;
        },
        
        set(key, value) {
            cache.set(key, {
                value,
                expiry: Date.now() + ttl
            });
        },
        
        delete(key) {
            cache.delete(key);
        },
        
        clear() {
            cache.clear();
        },
        
        size() {
            return cache.size;
        }
    };
}

/**
 * Request animation frame with fallback
 * @param {Function} callback - Callback function
 * @returns {number} Request ID
 */
export function requestAnimFrame(callback) {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    )(callback);
}

// ===== DEVICE UTILITIES =====

/**
 * Detect device type
 * @returns {string} Device type
 */
export function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
        return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
        return 'mobile';
    }
    
    return 'desktop';
}

/**
 * Check if device supports touch
 * @returns {boolean} Supports touch
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get viewport dimensions
 * @returns {object} Viewport dimensions
 */
export function getViewportSize() {
    return {
        width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Prefers reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers dark mode
 * @returns {boolean} Prefers dark mode
 */
export function prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ===== STORAGE UTILITIES =====

/**
 * Safe localStorage wrapper
 * @param {string} key - Storage key
 * @param {any} value - Value to store (optional)
 * @returns {any} Stored value or null
 */
export function storage(key, value) {
    try {
        if (value !== undefined) {
            localStorage.setItem(key, JSON.stringify(value));
            return value;
        } else {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
    } catch (error) {
        console.warn('Storage operation failed:', error);
        return null;
    }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('Storage removal failed:', error);
    }
}

/**
 * Clear all localStorage
 */
export function clearStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.warn('Storage clear failed:', error);
    }
}

// ===== ERROR HANDLING =====

/**
 * Safe function execution with error handling
 * @param {Function} fn - Function to execute
 * @param {any} fallback - Fallback value
 * @param {...any} args - Function arguments
 * @returns {any} Function result or fallback
 */
export function safeExecute(fn, fallback = null, ...args) {
    try {
        return fn(...args);
    } catch (error) {
        console.warn('Safe execution failed:', error);
        return fallback;
    }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise resolving to function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (i === maxRetries) {
                throw lastError;
            }
            
            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// ===== EXPORT ALL UTILITIES =====
export default {
    // Core utilities
    debounce,
    throttle,
    deepClone,
    deepMerge,
    isObject,
    
    // DOM utilities
    $,
    $$,
    createElement,
    addEventListenerWithCleanup,
    waitForElement,
    isInViewport,
    smoothScrollTo,
    
    // Color utilities
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    getColorBrightness,
    isLightColor,
    getComplementaryColor,
    parseRgbString,
    blendColors,
    
    // Math utilities
    clamp,
    lerp,
    mapRange,
    randomBetween,
    randomInt,
    distance,
    angle,
    degreesToRadians,
    radiansToDegrees,
    
    // String utilities
    capitalize,
    toCamelCase,
    toKebabCase,
    truncate,
    randomString,
    generateUUID,
    escapeHtml,
    stripHtml,
    
    // Array utilities
    shuffleArray,
    randomFromArray,
    removeDuplicates,
    chunkArray,
    groupBy,
    
    // Date utilities
    formatDate,
    getRelativeTime,
    isToday,
    addDays,
    
    // Validation utilities
    isValidEmail,
    isValidUrl,
    isValidHexColor,
    isInRange,
    
    // Performance utilities
    measureTime,
    createCache,
    requestAnimFrame,
    
    // Device utilities
    getDeviceType,
    isTouchDevice,
    getViewportSize,
    prefersReducedMotion,
    prefersDarkMode,
    
    // Storage utilities
    storage,
    removeStorage,
    clearStorage,
    
    // Error handling
    safeExecute,
    retryWithBackoff
};
