/**
 * Cozy Light - Dynamic Background Manager
 * Manages dynamic backgrounds, gradients, and visual effects
 * Version 2.0.0
 */

class BackgroundManager {
    constructor() {
        this.currentBackground = null;
        this.backgroundElement = null;
        this.overlayElement = null;
        this.transitionElement = null;
        this.isTransitioning = false;
        this.animationId = null;
        this.imageCache = new Map();
        this.gradientCache = new Map();
        this.videoCache = new Map();
        
        // Configuration
        this.config = {
            enabled: true,
            type: 'gradient', // gradient, image, video, particles, canvas
            transition: {
                duration: 2000,
                easing: 'ease-in-out',
                type: 'fade' // fade, slide, zoom, blur
            },
            gradient: {
                animated: true,
                speed: 0.5,
                complexity: 'medium', // simple, medium, complex
                colorHarmony: true
            },
            image: {
                source: 'unsplash', // unsplash, nasa, local, custom
                category: 'nature',
                quality: 'high',
                blur: 0,
                overlay: 0.3,
                parallax: false
            },
            video: {
                enabled: false,
                muted: true,
                loop: true,
                playbackRate: 0.5
            },
            canvas: {
                enabled: true,
                effects: ['waves', 'particles', 'aurora'],
                performance: 'auto' // low, medium, high, auto
            },
            responsive: {
                mobile: {
                    quality: 'medium',
                    animations: 'reduced',
                    preload: false
                },
                desktop: {
                    quality: 'high',
                    animations: 'full',
                    preload: true
                }
            },
            cache: {
                maxSize: 50, // MB
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                preloadNext: 3
            }
        };

        // Background collections
        this.collections = {
            gradients: new Map(),
            images: new Map(),
            videos: new Map(),
            canvasEffects: new Map()
        };

        // API endpoints
        this.apis = {
            unsplash: 'https://api.unsplash.com/photos/random',
            nasa: 'https://api.nasa.gov/planetary/apod',
            pexels: 'https://api.pexels.com/v1/search'
        };

        // Performance monitoring
        this.performance = {
            loadTimes: [],
            memoryUsage: 0,
            renderTime: 0,
            frameRate: 60
        };

        this.init();
    }

    /**
     * Initialize background manager
     */
    async init() {
        this.createBackgroundElements();
        this.setupEventListeners();
        this.loadSettings();
        this.initializeCollections();
        await this.setInitialBackground();
        this.startPerformanceMonitoring();
        
        console.log('🖼️ Background manager initialized');
    }

    /**
     * Create background DOM elements
     */
    createBackgroundElements() {
        // Remove existing elements
        const existing = document.querySelectorAll('.background-layer');
        existing.forEach(el => el.remove());

        // Main background container
        this.backgroundElement = document.createElement('div');
        this.backgroundElement.className = 'background-layer background-main';
        this.backgroundElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            overflow: hidden;
            transition: opacity ${this.config.transition.duration}ms ${this.config.transition.easing};
        `;

        // Overlay for lighting effects
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'background-layer background-overlay';
        this.overlayElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            mix-blend-mode: multiply;
            transition: opacity 1000ms ease;
        `;

        // Transition element for smooth changes
        this.transitionElement = document.createElement('div');
        this.transitionElement.className = 'background-layer background-transition';
        this.transitionElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            opacity: 0;
            overflow: hidden;
            transition: opacity ${this.config.transition.duration}ms ${this.config.transition.easing};
        `;

        // Add to DOM
        document.body.appendChild(this.backgroundElement);
        document.body.appendChild(this.overlayElement);
        document.body.appendChild(this.transitionElement);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Lighting changes
        document.addEventListener('lightingChanged', (e) => {
            this.updateForLighting(e.detail);
        });

        // Preset changes
        document.addEventListener('presetChanged', (e) => {
            this.updateForPreset(e.detail);
        });

        // Weather updates
        document.addEventListener('weatherUpdate', (e) => {
            this.updateForWeather(e.detail);
        });

        // Time of day changes
        document.addEventListener('timeChanged', (e) => {
            this.updateForTime(e.detail);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Performance monitoring
        window.addEventListener('performanceMode', (e) => {
            this.adjustPerformance(e.detail.enabled);
        });

        // Settings changes
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail.background) {
                this.updateConfig(e.detail.background);
            }
        });
    }

    /**
     * Initialize background collections
     */
    initializeCollections() {
        this.initializeGradients();
        this.initializeImages();
        this.initializeVideos();
        this.initializeCanvasEffects();
    }

    /**
     * Initialize gradient collection
     */
    initializeGradients() {
        const gradients = {
            // Cozy gradients
            cozyWarm: {
                colors: ['#ff8c42', '#ff6b35', '#ffa726'],
                direction: '135deg',
                animated: true,
                keyframes: [
                    { offset: 0, colors: ['#ff8c42', '#ff6b35'] },
                    { offset: 50, colors: ['#ffa726', '#ff8c42'] },
                    { offset: 100, colors: ['#ff6b35', '#ffa726'] }
                ]
            },
            cozyEvening: {
                colors: ['#2c1810', '#4a2c17', '#6b3e1a'],
                direction: '45deg',
                animated: false
            },
            
            // Focus gradients
            focusCool: {
                colors: ['#64b5f6', '#42a5f5', '#2196f3'],
                direction: '180deg',
                animated: true,
                keyframes: [
                    { offset: 0, colors: ['#64b5f6', '#42a5f5'] },
                    { offset: 100, colors: ['#2196f3', '#64b5f6'] }
                ]
            },
            focusClean: {
                colors: ['#f5f5f5', '#e0e0e0', '#bdbdbd'],
                direction: '90deg',
                animated: false
            },

            // Relax gradients
            relaxNature: {
                colors: ['#81c784', '#66bb6a', '#4caf50'],
                direction: '225deg',
                animated: true,
                keyframes: [
                    { offset: 0, colors: ['#81c784', '#66bb6a'] },
                    { offset: 50, colors: ['#4caf50', '#81c784'] },
                    { offset: 100, colors: ['#66bb6a', '#4caf50'] }
                ]
            },
            relaxOcean: {
                colors: ['#4fc3f7', '#29b6f6', '#03a9f4'],
                direction: '270deg',
                animated: true
            },

            // Romantic gradients
            romanticSoft: {
                colors: ['#f48fb1', '#f06292', '#e91e63'],
                direction: '315deg',
                animated: true,
                keyframes: [
                    { offset: 0, colors: ['#f48fb1', '#f06292'] },
                    { offset: 100, colors: ['#e91e63', '#f48fb1'] }
                ]
            },
            romanticWarm: {
                colors: ['#ffab40', '#ff9800', '#ff5722'],
                direction: '45deg',
                animated: false
            },

            // Nature gradients
            natureMorning: {
                colors: ['#a5d6a7', '#81c784', '#66bb6a'],
                direction: '0deg',
                animated: true
            },
            natureEvening: {
                colors: ['#8bc34a', '#689f38', '#558b2f'],
                direction: '180deg',
                animated: false
            },

            // Sunset gradients
            sunsetGolden: {
                colors: ['#ffab40', '#ff9800', '#ff5722', '#e65100'],
                direction: '135deg',
                animated: true,
                keyframes: [
                    { offset: 0, colors: ['#ffab40', '#ff9800'] },
                    { offset: 50, colors: ['#ff5722', '#ffab40'] },
                    { offset: 100, colors: ['#e65100', '#ff9800'] }
                ]
            },
            sunsetPurple: {
                colors: ['#ba68c8', '#9c27b0', '#7b1fa2'],
                direction: '225deg',
                animated: true
            },

            // Dynamic gradients
            aurora: {
                colors: ['#00ff88', '#0088ff', '#8800ff', '#ff0088'],
                direction: '45deg',
                animated: true,
                complex: true,
                keyframes: [
                    { offset: 0, colors: ['#00ff88', '#0088ff'] },
                    { offset: 25, colors: ['#0088ff', '#8800ff'] },
                    { offset: 50, colors: ['#8800ff', '#ff0088'] },
                    { offset: 75, colors: ['#ff0088', '#00ff88'] },
                    { offset: 100, colors: ['#00ff88', '#0088ff'] }
                ]
            },
            cosmic: {
                colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
                direction: '270deg',
                animated: true,
                complex: true
            }
        };

        Object.entries(gradients).forEach(([name, config]) => {
            this.collections.gradients.set(name, config);
        });
    }

    /**
     * Initialize image collection
     */
    initializeImages() {
        const imageCategories = {
            nature: [
                'forest', 'mountains', 'ocean', 'sunset', 'sunrise', 'clouds',
                'trees', 'flowers', 'landscape', 'sky', 'water', 'beach'
            ],
            cozy: [
                'fireplace', 'candles', 'warm lighting', 'interior', 'home',
                'comfort', 'soft lighting', 'ambient', 'cozy room'
            ],
            abstract: [
                'abstract', 'geometric', 'patterns', 'textures', 'minimal',
                'gradient', 'artistic', 'modern', 'design'
            ],
            space: [
                'stars', 'galaxy', 'nebula', 'space', 'cosmos', 'astronomy',
                'night sky', 'milky way', 'planets'
            ]
        };

        Object.entries(imageCategories).forEach(([category, keywords]) => {
            this.collections.images.set(category, {
                keywords: keywords,
                cache: new Map(),
                lastFetch: 0,
                quality: this.config.image.quality
            });
        });
    }

    /**
     * Initialize video collection
     */
    initializeVideos() {
        const videos = {
            fireplace: {
                url: 'assets/videos/fireplace.mp4',
                loop: true,
                muted: true,
                playbackRate: 0.8
            },
            ocean: {
                url: 'assets/videos/ocean-waves.mp4',
                loop: true,
                muted: true,
                playbackRate: 0.6
            },
            forest: {
                url: 'assets/videos/forest-ambient.mp4',
                loop: true,
                muted: true,
                playbackRate: 0.5
            },
            rain: {
                url: 'assets/videos/rain-window.mp4',
                loop: true,
                muted: true,
                playbackRate: 1.0
            },
            aurora: {
                url: 'assets/videos/aurora-borealis.mp4',
                loop: true,
                muted: true,
                playbackRate: 0.3
            }
        };

        Object.entries(videos).forEach(([name, config]) => {
            this.collections.videos.set(name, config);
        });
    }

    /**
     * Initialize canvas effects
     */
    initializeCanvasEffects() {
        const effects = {
            waves: {
                type: 'canvas',
                renderer: this.renderWaves.bind(this),
                config: {
                    amplitude: 50,
                    frequency: 0.02,
                    speed: 0.01,
                    colors: ['#4fc3f7', '#29b6f6']
                }
            },
            particles: {
                type: 'canvas',
                renderer: this.renderParticles.bind(this),
                config: {
                    count: 100,
                    speed: 0.5,
                    size: { min: 1, max: 3 },
                    colors: ['#ffffff', '#f0f0f0']
                }
            },
            aurora: {
                type: 'canvas',
                renderer: this.renderAurora.bind(this),
                config: {
                    layers: 3,
                    speed: 0.005,
                    colors: ['#00ff88', '#0088ff', '#8800ff']
                }
            },
            geometric: {
                type: 'canvas',
                renderer: this.renderGeometric.bind(this),
                config: {
                    shapes: 20,
                    rotation: 0.01,
                    colors: ['#ff8c42', '#ff6b35']
                }
            }
        };

        Object.entries(effects).forEach(([name, config]) => {
            this.collections.canvasEffects.set(name, config);
        });
    }

    /**
     * Set initial background
     */
    async setInitialBackground() {
        const savedBackground = this.getSavedBackground();
        
        if (savedBackground) {
            await this.setBackground(savedBackground.type, savedBackground.id, savedBackground.options);
        } else {
            // Default to a cozy gradient
            await this.setBackground('gradient', 'cozyWarm');
        }
    }

    /**
     * Set background
     */
    async setBackground(type, id, options = {}) {
        if (this.isTransitioning) {
            return false;
        }

        this.isTransitioning = true;
        const startTime = performance.now();

        try {
            let backgroundContent;

            switch (type) {
                case 'gradient':
                    backgroundContent = await this.createGradientBackground(id, options);
                    break;
                case 'image':
                    backgroundContent = await this.createImageBackground(id, options);
                    break;
                case 'video':
                    backgroundContent = await this.createVideoBackground(id, options);
                    break;
                case 'canvas':
                    backgroundContent = await this.createCanvasBackground(id, options);
                    break;
                default:
                    throw new Error(`Unknown background type: ${type}`);
            }

            if (backgroundContent) {
                await this.transitionToBackground(backgroundContent);
                
                this.currentBackground = {
                    type: type,
                    id: id,
                    options: options,
                    timestamp: Date.now()
                };

                this.saveCurrentBackground();
                this.trackPerformance('loadTime', performance.now() - startTime);
                
                // Emit background changed event
                document.dispatchEvent(new CustomEvent('backgroundChanged', {
                    detail: this.currentBackground
                }));

                console.log('🖼️ Background changed:', type, id);
                return true;
            }
        } catch (error) {
            console.error('🖼️ Error setting background:', error);
        } finally {
            this.isTransitioning = false;
        }

        return false;
    }

    /**
     * Create gradient background
     */
    async createGradientBackground(gradientId, options = {}) {
        const gradient = this.collections.gradients.get(gradientId);
        if (!gradient) {
            throw new Error(`Gradient not found: ${gradientId}`);
        }

        const element = document.createElement('div');
        element.className = 'background-gradient';
        element.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(${gradient.direction}, ${gradient.colors.join(', ')});
        `;

        // Add animation if enabled
        if (gradient.animated && this.config.gradient.animated) {
            this.addGradientAnimation(element, gradient);
        }

        return element;
    }

    /**
     * Add gradient animation
     */
    addGradientAnimation(element, gradient) {
        if (!gradient.keyframes) return;

        const keyframes = gradient.keyframes.map(frame => ({
            offset: frame.offset / 100,
            background: `linear-gradient(${gradient.direction}, ${frame.colors.join(', ')})`
        }));

        const animation = element.animate(keyframes, {
            duration: 10000 / this.config.gradient.speed,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out'
        });

        // Store animation reference for performance control
        element._animation = animation;
    }

    /**
     * Create image background
     */
    async createImageBackground(imageId, options = {}) {
        let imageUrl;

        if (imageId.startsWith('http')) {
            // Direct URL
            imageUrl = imageId;
        } else if (this.collections.images.has(imageId)) {
            // Category - fetch random image
            imageUrl = await this.fetchRandomImage(imageId);
        } else {
            throw new Error(`Image source not found: ${imageId}`);
        }

        if (!imageUrl) {
            throw new Error('Failed to get image URL');
        }

        // Check cache first
        if (this.imageCache.has(imageUrl)) {
            return this.createImageElement(this.imageCache.get(imageUrl), options);
        }

        // Load image
        const img = await this.loadImage(imageUrl);
        this.imageCache.set(imageUrl, img);

        return this.createImageElement(img, options);
    }

    /**
     * Fetch random image from API
     */
    async fetchRandomImage(category) {
        const categoryConfig = this.collections.images.get(category);
        if (!categoryConfig) return null;

        // Check rate limiting
        const now = Date.now();
        if (now - categoryConfig.lastFetch < 5000) {
            // Use cached image if available
            const cached = Array.from(categoryConfig.cache.values());
            if (cached.length > 0) {
                return cached[Math.floor(Math.random() * cached.length)];
            }
        }

        try {
            const keyword = categoryConfig.keywords[Math.floor(Math.random() * categoryConfig.keywords.length)];
            const apiKey = this.getApiKey('unsplash');
            
            if (!apiKey) {
                console.warn('🖼️ No Unsplash API key found');
                return this.getFallbackImage(category);
            }

            const response = await fetch(`${this.apis.unsplash}?query=${keyword}&orientation=landscape`, {
                headers: {
                    'Authorization': `Client-ID ${apiKey}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const imageUrl = data.urls.regular;
                
                categoryConfig.cache.set(keyword, imageUrl);
                categoryConfig.lastFetch = now;
                
                return imageUrl;
            }
        } catch (error) {
            console.error('🖼️ Error fetching image:', error);
        }

        return this.getFallbackImage(category);
    }

    /**
     * Get fallback image for category
     */
    getFallbackImage(category) {
        const fallbacks = {
            nature: 'assets/images/fallback-nature.jpg',
            cozy: 'assets/images/fallback-cozy.jpg',
            abstract: 'assets/images/fallback-abstract.jpg',
            space: 'assets/images/fallback-space.jpg'
        };

        return fallbacks[category] || 'assets/images/fallback-default.jpg';
    }

    /**
     * Load image with promise
     */
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }

    /**
     * Create image element
     */
    createImageElement(img, options = {}) {
        const element = document.createElement('div');
        element.className = 'background-image';
        
        const blur = options.blur || this.config.image.blur;
        const overlay = options.overlay || this.config.image.overlay;
        
        element.style.cssText = `
            width: 100%;
            height: 100%;
            background-image: url(${img.src});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: blur(${blur}px);
        `;

        // Add overlay if specified
        if (overlay > 0) {
            const overlayDiv = document.createElement('div');
            overlayDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, ${overlay});
            `;
            element.appendChild(overlayDiv);
        }

        // Add parallax effect if enabled
        if (this.config.image.parallax) {
            this.addParallaxEffect(element);
        }

        return element;
    }

    /**
     * Create video background
     */
    async createVideoBackground(videoId, options = {}) {
        const videoConfig = this.collections.videos.get(videoId);
        if (!videoConfig) {
            throw new Error(`Video not found: ${videoId}`);
        }

        const video = document.createElement('video');
        video.className = 'background-video';
        video.src = videoConfig.url;
        video.muted = videoConfig.muted;
        video.loop = videoConfig.loop;
        video.playbackRate = options.playbackRate || videoConfig.playbackRate;
        video.autoplay = true;
        
        video.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;

        // Wait for video to be ready
        return new Promise((resolve, reject) => {
            video.addEventListener('canplay', () => {
                video.play().then(() => resolve(video)).catch(reject);
            });
            video.addEventListener('error', reject);
        });
    }

    /**
     * Create canvas background
     */
    async createCanvasBackground(effectId, options = {}) {
        const effect = this.collections.canvasEffects.get(effectId);
        if (!effect) {
            throw new Error(`Canvas effect not found: ${effectId}`);
        }

        const canvas = document.createElement('canvas');
        canvas.className = 'background-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
        `;

        const ctx = canvas.getContext('2d');
        
        // Start rendering
        const renderLoop = () => {
            effect.renderer(ctx, canvas, { ...effect.config, ...options });
            canvas._animationId = requestAnimationFrame(renderLoop);
        };
        
        renderLoop();
        
        return canvas;
    }

    /**
     * Canvas renderers
     */
    renderWaves(ctx, canvas, config) {
        const { amplitude, frequency, speed, colors } = config;
        const time = Date.now() * speed;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        ctx.fillStyle = gradient;
        
        // Draw waves
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        for (let x = 0; x <= canvas.width; x += 5) {
            const y = canvas.height / 2 + Math.sin(x * frequency + time) * amplitude;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    renderParticles(ctx, canvas, config) {
        const { count, speed, size, colors } = config;
        
        if (!canvas._particles) {
            canvas._particles = Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                size: Math.random() * (size.max - size.min) + size.min,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.5
            }));
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        canvas._particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
    }

    renderAurora(ctx, canvas, config) {
        const { layers, speed, colors } = config;
        const time = Date.now() * speed;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let layer = 0; layer < layers; layer++) {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            const color = colors[layer % colors.length];
            
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, color + '40');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            
            for (let x = 0; x <= canvas.width; x += 10) {
                const y = canvas.height * 0.3 + 
                         Math.sin(x * 0.01 + time + layer) * 50 +
                         Math.sin(x * 0.02 + time * 2 + layer) * 30;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    renderGeometric(ctx, canvas, config) {
        const { shapes, rotation, colors } = config;
        const time = Date.now() * rotation;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < shapes; i++) {
            const x = (canvas.width / shapes) * i + (canvas.width / shapes) / 2;
            const y = canvas.height / 2;
            const size = 50 + Math.sin(time + i) * 20;
            const angle = time + i;
            const color = colors[i % colors.length];
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = color + '60';
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.restore();
        }
    }

    /**
     * Transition to new background
     */
    async transitionToBackground(newContent) {
        return new Promise((resolve) => {
            // Clear transition element
            this.transitionElement.innerHTML = '';
            this.transitionElement.appendChild(newContent);
            
            // Start transition
            this.transitionElement.style.opacity = '1';
            
            setTimeout(() => {
                // Swap elements
                const temp = this.backgroundElement.innerHTML;
                this.backgroundElement.innerHTML = this.transitionElement.innerHTML;
                this.transitionElement.innerHTML = temp;
                
                // Reset transition element
                this.transitionElement.style.opacity = '0';
                
                resolve();
            }, this.config.transition.duration);
        });
    }

    /**
     * Update background for lighting changes
     */
    updateForLighting(lightingData) {
        const { brightness, warmth, saturation } = lightingData;
        
        // Update overlay based on lighting
        const overlayOpacity = (100 - brightness) / 200; // 0 to 0.5
        const overlayColor = warmth > 50 ? 
            `rgba(255, 140, 66, ${overlayOpacity})` : 
            `rgba(66, 165, 245, ${overlayOpacity})`;
        
        this.overlayElement.style.background = overlayColor;
        this.overlayElement.style.opacity = overlayOpacity;
    }

    /**
     * Update background for preset
     */
    async updateForPreset(preset) {
        const presetBackgrounds = {
            cozy: { type: 'gradient', id: 'cozyWarm' },
            focus: { type: 'gradient', id: 'focusCool' },
            relax: { type: 'gradient', id: 'relaxNature' },
            romantic: { type: 'gradient', id: 'romanticSoft' },
            nature: { type: 'image', id: 'nature' },
            sunset: { type: 'gradient', id: 'sunsetGolden' }
        };

        const background = presetBackgrounds[preset.name];
        if (background) {
            await this.setBackground(background.type, background.id);
        }
    }

    /**
     * Update background for weather
     */
    async updateForWeather(weather) {
        if (!this.config.enabled) return;

        const weatherBackgrounds = {
            clear: { type: 'gradient', id: 'sunsetGolden' },
            clouds: { type: 'image', id: 'nature' },
            rain: { type: 'gradient', id: 'relaxOcean' },
            snow: { type: 'gradient', id: 'focusClean' },
            storm: { type: 'gradient', id: 'cosmic' }
        };

        const background = weatherBackgrounds[weather.condition];
        if (background) {
            await this.setBackground(background.type, background.id);
        }
    }

    /**
     * Update background for time of day
     */
    async updateForTime(timeData) {
        const hour = new Date().getHours();
        
        let backgroundId;
        if (hour >= 6 && hour < 12) {
            backgroundId = 'natureMorning';
        } else if (hour >= 12 && hour < 18) {
            backgroundId = 'focusCool';
        } else if (hour >= 18 && hour < 22) {
            backgroundId = 'sunsetGolden';
        } else {
            backgroundId = 'cozyEvening';
        }

        await this.setBackground('gradient', backgroundId);
    }

    /**
     * Performance and utility methods
     */
    handleResize() {
        // Update canvas sizes
        const canvases = document.querySelectorAll('.background-canvas');
        canvases.forEach(canvas => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    pauseAnimations() {
        // Pause CSS animations
        const animated = document.querySelectorAll('.background-gradient');
        animated.forEach(el => {
            if (el._animation) {
                el._animation.pause();
            }
        });

        // Pause canvas animations
        const canvases = document.querySelectorAll('.background-canvas');
        canvases.forEach(canvas => {
            if (canvas._animationId) {
                cancelAnimationFrame(canvas._animationId);
            }
        });
    }

    resumeAnimations() {
        // Resume CSS animations
        const animated = document.querySelectorAll('.background-gradient');
        animated.forEach(el => {
            if (el._animation) {
                el._animation.play();
            }
        });

        // Resume canvas animations
        const canvases = document.querySelectorAll('.background-canvas');
        canvases.forEach(canvas => {
            if (canvas._renderer) {
                const renderLoop = () => {
                    canvas._renderer();
                    canvas._animationId = requestAnimationFrame(renderLoop);
                };
                renderLoop();
            }
        });
    }

    adjustPerformance(lowPerformance) {
        if (lowPerformance) {
            this.config.gradient.animated = false;
            this.config.canvas.enabled = false;
            this.config.image.quality = 'medium';
            this.pauseAnimations();
        } else {
            this.config.gradient.animated = true;
            this.config.canvas.enabled = true;
            this.config.image.quality = 'high';
            this.resumeAnimations();
        }
    }

    addParallaxEffect(element) {
        let ticking = false;
        
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            element.style.transform = `translateY(${parallax}px)`;
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            this.performance.memoryUsage = this.getMemoryUsage();
            this.performance.frameRate = this.getFrameRate();
            this.cleanupCache();
        }, 10000); // Every 10 seconds
    }

    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    getFrameRate() {
        // Simplified frame rate calculation
        return 60; // Placeholder
    }

    cleanupCache() {
        const maxSize = this.config.cache.maxSize * 1024 * 1024; // Convert to bytes
        const maxAge = this.config.cache.maxAge;
        const now = Date.now();

        // Clean image cache
        for (const [url, img] of this.imageCache) {
            if (now - img.timestamp > maxAge) {
                this.imageCache.delete(url);
            }
        }

        // Clean gradient cache
        for (const [id, gradient] of this.gradientCache) {
            if (now - gradient.timestamp > maxAge) {
                this.gradientCache.delete(id);
            }
        }
    }

    trackPerformance(metric, value) {
        if (this.performance[metric]) {
            if (Array.isArray(this.performance[metric])) {
                this.performance[metric].push(value);
                if (this.performance[metric].length > 100) {
                    this.performance[metric].shift();
                }
            } else {
                this.performance[metric] = value;
            }
        }
    }

    /**
     * Settings and storage
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('cozylight_background');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings };
            }
        } catch (error) {
            console.warn('Failed to load background settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('cozylight_background', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save background settings:', error);
        }
    }

    saveCurrentBackground() {
        try {
            localStorage.setItem('cozylight_current_background', JSON.stringify(this.currentBackground));
        } catch (error) {
            console.warn('Failed to save current background:', error);
        }
    }

    getSavedBackground() {
        try {
            const saved = localStorage.getItem('cozylight_current_background');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            return null;
        }
    }

    getApiKey(service) {
        try {
            const keys = JSON.parse(localStorage.getItem('cozylight_api_keys') || '{}');
            return keys[service];
        } catch (error) {
            return null;
        }
    }

    /**
     * Public API
     */
    async setGradient(gradientId, options = {}) {
        return this.setBackground('gradient', gradientId, options);
    }

    async setImage(imageId, options = {}) {
        return this.setBackground('image', imageId, options);
    }

    async setVideo(videoId, options = {}) {
        return this.setBackground('video', videoId, options);
    }

    async setCanvas(effectId, options = {}) {
        return this.setBackground('canvas', effectId, options);
    }

    getCurrentBackground() {
        return { ...this.currentBackground };
    }

    getAvailableBackgrounds() {
        return {
            gradients: Array.from(this.collections.gradients.keys()),
            images: Array.from(this.collections.images.keys()),
            videos: Array.from(this.collections.videos.keys()),
            canvas: Array.from(this.collections.canvasEffects.keys())
        };
    }

    getPerformanceMetrics() {
        return { ...this.performance };
    }

    enable() {
        this.config.enabled = true;
        this.saveSettings();
    }

    disable() {
        this.config.enabled = false;
        this.pauseAnimations();
        this.saveSettings();
    }

    preloadNext(count = 3) {
        // Preload next few backgrounds for smooth transitions
        // Implementation depends on your specific needs
    }
}

// Initialize background manager
if (typeof window !== 'undefined') {
    window.BackgroundManager = BackgroundManager;
    
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.backgroundManager) {
            window.backgroundManager = new BackgroundManager();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundManager;
}

console.log('🖼️ Background manager module loaded');
