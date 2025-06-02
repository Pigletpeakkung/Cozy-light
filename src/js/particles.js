/**
 * Cozy Light - Advanced Particle System
 * Creates beautiful particle effects for ambient lighting
 * Version 2.0.0
 */

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.isActive = false;
        this.settings = {
            enabled: true,
            maxParticles: 150,
            particleSize: { min: 1, max: 4 },
            speed: { min: 0.2, max: 1.5 },
            opacity: { min: 0.1, max: 0.8 },
            colors: ['#ff8c42', '#ff6b35', '#ffa726', '#ffb74d'],
            effects: {
                fireflies: true,
                embers: false,
                sparkles: false,
                floating: false,
                rain: false,
                snow: false
            },
            performance: {
                fps: 60,
                quality: 'high', // low, medium, high
                reduceMotion: false
            }
        };
        
        this.effects = new Map();
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fpsInterval = 1000 / this.settings.performance.fps;
        
        this.mouse = { x: 0, y: 0, isMoving: false };
        this.mouseTimeout = null;
        
        this.init();
    }

    /**
     * Initialize the particle system
     */
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.registerEffects();
        this.loadSettings();
        
        console.log('🌟 Particle system initialized');
    }

    /**
     * Create and setup the canvas
     */
    createCanvas() {
        // Remove existing canvas if any
        const existingCanvas = document.getElementById('particle-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.8;
            mix-blend-mode: screen;
        `;

        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.resize());
        
        // Mouse tracking for interactive effects
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Settings changes
        window.addEventListener('settingsChanged', (e) => {
            if (e.detail.particles) {
                this.updateSettings(e.detail.particles);
            }
        });

        // Preset changes
        window.addEventListener('presetChanged', (e) => {
            this.adaptToPreset(e.detail);
        });

        // Performance monitoring
        window.addEventListener('performanceMode', (e) => {
            this.adjustPerformance(e.detail.enabled);
        });
    }

    /**
     * Register particle effects
     */
    registerEffects() {
        this.effects.set('fireflies', new FireflyEffect());
        this.effects.set('embers', new EmberEffect());
        this.effects.set('sparkles', new SparkleEffect());
        this.effects.set('floating', new FloatingEffect());
        this.effects.set('rain', new RainEffect());
        this.effects.set('snow', new SnowEffect());
        this.effects.set('aurora', new AuroraEffect());
        this.effects.set('stars', new StarEffect());
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.isMoving = true;

        clearTimeout(this.mouseTimeout);
        this.mouseTimeout = setTimeout(() => {
            this.mouse.isMoving = false;
        }, 100);

        // Create interactive particles on mouse move
        if (this.settings.effects.fireflies && this.isActive) {
            this.createInteractiveParticle(e.clientX, e.clientY);
        }
    }

    /**
     * Handle touch movement
     */
    handleTouchMove(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.handleMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    /**
     * Resize canvas
     */
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * Start the particle system
     */
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.lastTime = performance.now();
        this.animate();
        
        console.log('🌟 Particle system started');
    }

    /**
     * Stop the particle system
     */
    stop() {
        this.isActive = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.particles = [];
        this.clearCanvas();
        
        console.log('🌟 Particle system stopped');
    }

    /**
     * Pause the particle system
     */
    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Resume the particle system
     */
    resume() {
        if (this.isActive && !this.animationId) {
            this.lastTime = performance.now();
            this.animate();
        }
    }

    /**
     * Main animation loop
     */
    animate(currentTime = performance.now()) {
        if (!this.isActive) return;

        this.deltaTime = currentTime - this.lastTime;

        // Limit FPS
        if (this.deltaTime >= this.fpsInterval) {
            this.update(this.deltaTime);
            this.render();
            this.lastTime = currentTime - (this.deltaTime % this.fpsInterval);
        }

        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }

    /**
     * Update particles
     */
    update(deltaTime) {
        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.isAlive());

        // Update existing particles
        this.particles.forEach(particle => {
            particle.update(deltaTime, this.mouse, this.canvas);
        });

        // Generate new particles based on active effects
        this.generateParticles();

        // Limit particle count for performance
        if (this.particles.length > this.settings.maxParticles) {
            this.particles.splice(0, this.particles.length - this.settings.maxParticles);
        }
    }

    /**
     * Generate new particles based on active effects
     */
    generateParticles() {
        Object.entries(this.settings.effects).forEach(([effectName, isEnabled]) => {
            if (isEnabled && this.effects.has(effectName)) {
                const effect = this.effects.get(effectName);
                const newParticles = effect.generate(this.canvas, this.settings);
                this.particles.push(...newParticles);
            }
        });
    }

    /**
     * Render particles
     */
    render() {
        this.clearCanvas();

        // Group particles by blend mode for better performance
        const particleGroups = new Map();
        
        this.particles.forEach(particle => {
            const blendMode = particle.blendMode || 'normal';
            if (!particleGroups.has(blendMode)) {
                particleGroups.set(blendMode, []);
            }
            particleGroups.get(blendMode).push(particle);
        });

        // Render each group with its blend mode
        particleGroups.forEach((particles, blendMode) => {
            this.ctx.globalCompositeOperation = blendMode;
            particles.forEach(particle => {
                particle.render(this.ctx);
            });
        });

        // Reset blend mode
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Clear the canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Create interactive particle at position
     */
    createInteractiveParticle(x, y) {
        const particle = new InteractiveParticle(x, y, this.settings);
        this.particles.push(particle);
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // Update canvas opacity
        if (this.canvas) {
            this.canvas.style.opacity = this.settings.opacity || 0.8;
        }

        // Adjust performance
        this.fpsInterval = 1000 / this.settings.performance.fps;
        
        console.log('🌟 Particle settings updated', this.settings);
    }

    /**
     * Adapt particles to current preset
     */
    adaptToPreset(preset) {
        const presetConfigs = {
            cozy: {
                colors: ['#ff8c42', '#ff6b35', '#ffa726'],
                effects: { fireflies: true, embers: true },
                maxParticles: 100
            },
            focus: {
                colors: ['#64b5f6', '#42a5f5', '#2196f3'],
                effects: { sparkles: true },
                maxParticles: 50
            },
            relax: {
                colors: ['#81c784', '#66bb6a', '#4caf50'],
                effects: { floating: true, fireflies: true },
                maxParticles: 80
            },
            romantic: {
                colors: ['#f48fb1', '#f06292', '#e91e63'],
                effects: { fireflies: true, sparkles: true },
                maxParticles: 120
            },
            nature: {
                colors: ['#a5d6a7', '#81c784', '#66bb6a'],
                effects: { floating: true, rain: false },
                maxParticles: 100
            },
            sunset: {
                colors: ['#ffab40', '#ff9800', '#ff5722'],
                effects: { embers: true, aurora: true },
                maxParticles: 150
            }
        };

        const config = presetConfigs[preset.name] || presetConfigs.cozy;
        this.updateSettings(config);
    }

    /**
     * Adjust performance based on device capabilities
     */
    adjustPerformance(lowPerformance) {
        if (lowPerformance) {
            this.updateSettings({
                maxParticles: 50,
                performance: {
                    fps: 30,
                    quality: 'low'
                }
            });
        } else {
            this.updateSettings({
                maxParticles: 150,
                performance: {
                    fps: 60,
                    quality: 'high'
                }
            });
        }
    }

    /**
     * Load settings from storage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('cozylight_particles');
            if (saved) {
                const settings = JSON.parse(saved);
                this.updateSettings(settings);
            }
        } catch (error) {
            console.warn('Failed to load particle settings:', error);
        }
    }

    /**
     * Save settings to storage
     */
    saveSettings() {
        try {
            localStorage.setItem('cozylight_particles', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save particle settings:', error);
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Toggle specific effect
     */
    toggleEffect(effectName, enabled) {
        if (this.settings.effects.hasOwnProperty(effectName)) {
            this.settings.effects[effectName] = enabled;
            this.saveSettings();
        }
    }

    /**
     * Set particle colors
     */
    setColors(colors) {
        this.settings.colors = colors;
        this.saveSettings();
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            particleCount: this.particles.length,
            maxParticles: this.settings.maxParticles,
            fps: Math.round(1000 / this.deltaTime) || 0,
            targetFps: this.settings.performance.fps,
            isActive: this.isActive,
            effects: Object.entries(this.settings.effects)
                .filter(([_, enabled]) => enabled)
                .map(([name, _]) => name)
        };
    }
}

// === PARTICLE BASE CLASS ===

class Particle {
    constructor(x, y, settings = {}) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.size = this.randomBetween(settings.particleSize?.min || 1, settings.particleSize?.max || 4);
        this.opacity = this.randomBetween(settings.opacity?.min || 0.1, settings.opacity?.max || 0.8);
        this.color = this.randomColor(settings.colors || ['#ff8c42']);
        this.life = 1.0;
        this.decay = this.randomBetween(0.001, 0.005);
        this.blendMode = 'screen';
        this.rotation = 0;
        this.rotationSpeed = this.randomBetween(-0.02, 0.02);
    }

    update(deltaTime, mouse, canvas) {
        // Update position
        this.x += this.vx * deltaTime * 0.1;
        this.y += this.vy * deltaTime * 0.1;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime * 0.1;
        
        // Update life
        this.life -= this.decay * deltaTime * 0.01;
        
        // Boundary wrapping
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity * this.life;
        ctx.fillStyle = this.color;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        this.draw(ctx);
        
        ctx.restore();
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isAlive() {
        return this.life > 0;
    }

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// === FIREFLY EFFECT ===

class FireflyEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 2000; // 2 seconds
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.random() < 0.7 ? 1 : 2; // Usually 1, sometimes 2

        for (let i = 0; i < count; i++) {
            particles.push(new FireflyParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                settings
            ));
        }

        return particles;
    }
}

class FireflyParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = this.randomBetween(-0.5, 0.5);
        this.vy = this.randomBetween(-0.5, 0.5);
        this.size = this.randomBetween(2, 5);
        this.glowSize = this.size * 3;
        this.pulseSpeed = this.randomBetween(0.02, 0.05);
        this.pulse = 0;
        this.life = this.randomBetween(0.8, 1.0);
        this.decay = this.randomBetween(0.0005, 0.002);
    }

    update(deltaTime, mouse, canvas) {
        super.update(deltaTime, mouse, canvas);
        
        // Pulse effect
        this.pulse += this.pulseSpeed * deltaTime * 0.1;
        
        // Gentle floating movement
        this.vx += this.randomBetween(-0.1, 0.1) * deltaTime * 0.01;
        this.vy += this.randomBetween(-0.1, 0.1) * deltaTime * 0.01;
        
        // Limit velocity
        this.vx = Math.max(-1, Math.min(1, this.vx));
        this.vy = Math.max(-1, Math.min(1, this.vy));
    }

    draw(ctx) {
        const glowIntensity = (Math.sin(this.pulse) + 1) * 0.5;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.glowSize);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.3, this.color + '80');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha *= glowIntensity;
        ctx.beginPath();
        ctx.arc(0, 0, this.glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === EMBER EFFECT ===

class EmberEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 500;
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < count; i++) {
            particles.push(new EmberParticle(
                Math.random() * canvas.width,
                canvas.height + 10,
                settings
            ));
        }

        return particles;
    }
}

class EmberParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = this.randomBetween(-0.3, 0.3);
        this.vy = this.randomBetween(-2, -0.5);
        this.size = this.randomBetween(1, 3);
        this.color = this.randomColor(['#ff6b35', '#ff8c42', '#ffa726']);
        this.life = 1.0;
        this.decay = this.randomBetween(0.002, 0.008);
        this.flicker = 0;
        this.flickerSpeed = this.randomBetween(0.1, 0.3);
    }

    update(deltaTime, mouse, canvas) {
        super.update(deltaTime, mouse, canvas);
        
        // Flicker effect
        this.flicker += this.flickerSpeed * deltaTime * 0.1;
        
        // Gravity and air resistance
        this.vy += 0.01 * deltaTime * 0.1; // slight gravity
        this.vx *= 0.99; // air resistance
        
        // Random drift
        this.vx += this.randomBetween(-0.05, 0.05) * deltaTime * 0.01;
    }

    draw(ctx) {
        const flickerIntensity = (Math.sin(this.flicker) + 1) * 0.3 + 0.7;
        
        ctx.globalAlpha *= flickerIntensity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Small glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === SPARKLE EFFECT ===

class SparkleEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 800;
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < count; i++) {
            particles.push(new SparkleParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                settings
            ));
        }

        return particles;
    }
}

class SparkleParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = 0;
        this.vy = 0;
        this.size = this.randomBetween(1, 2);
        this.maxSize = this.randomBetween(3, 6);
        this.growing = true;
        this.growthSpeed = this.randomBetween(0.1, 0.2);
        this.life = 1.0;
        this.decay = 0.01;
        this.sparkleIntensity = 1;
    }

    update(deltaTime, mouse, canvas) {
        // Growth and shrink cycle
        if (this.growing) {
            this.size += this.growthSpeed * deltaTime * 0.1;
            if (this.size >= this.maxSize) {
                this.growing = false;
            }
        } else {
            this.size -= this.growthSpeed * deltaTime * 0.1;
            this.life -= this.decay * deltaTime * 0.1;
        }
        
        // Twinkle effect
        this.sparkleIntensity = (Math.sin(Date.now() * 0.01) + 1) * 0.5;
    }

    draw(ctx) {
        ctx.globalAlpha *= this.sparkleIntensity;
        
        // Draw star shape
        ctx.fillStyle = this.color;
        this.drawStar(ctx, 0, 0, 4, this.size, this.size * 0.5);
        
        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}

// === FLOATING EFFECT ===

class FloatingEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 1500;
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < count; i++) {
            particles.push(new FloatingParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                settings
            ));
        }

        return particles;
    }
}

class FloatingParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = this.randomBetween(-0.2, 0.2);
        this.vy = this.randomBetween(-0.3, -0.1);
        this.size = this.randomBetween(3, 8);
        this.opacity = this.randomBetween(0.1, 0.3);
        this.life = 1.0;
        this.decay = this.randomBetween(0.001, 0.003);
        this.sway = 0;
        this.swaySpeed = this.randomBetween(0.02, 0.05);
        this.swayAmount = this.randomBetween(0.1, 0.3);
    }

    update(deltaTime, mouse, canvas) {
        super.update(deltaTime, mouse, canvas);
        
        // Gentle swaying motion
        this.sway += this.swaySpeed * deltaTime * 0.1;
        this.vx += Math.sin(this.sway) * this.swayAmount * deltaTime * 0.01;
        
        // Slow upward drift
        this.vy -= 0.005 * deltaTime * 0.1;
    }

    draw(ctx) {
        // Soft, blurred circle
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color + '60');
        gradient.addColorStop(0.7, this.color + '20');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === RAIN EFFECT ===

class RainEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 100;
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.floor(Math.random() * 5) + 3;

        for (let i = 0; i < count; i++) {
            particles.push(new RainParticle(
                Math.random() * (canvas.width + 100) - 50,
                -10,
                settings
            ));
        }

        return particles;
    }
}

class RainParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = this.randomBetween(-0.5, 0.5);
        this.vy = this.randomBetween(3, 6);
        this.size = this.randomBetween(1, 2);
        this.length = this.randomBetween(10, 20);
        this.color = this.randomColor(['#64b5f6', '#42a5f5', '#2196f3']);
        this.opacity = this.randomBetween(0.3, 0.7);
        this.life = 1.0;
        this.decay = 0;
    }

    update(deltaTime, mouse, canvas) {
        this.x += this.vx * deltaTime * 0.1;
        this.y += this.vy * deltaTime * 0.1;
        
        // Remove when off screen
        if (this.y > canvas.height + 20) {
            this.life = 0;
        }
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.vx * 2, this.length);
        ctx.stroke();
    }
}

// === SNOW EFFECT ===

class SnowEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 200;
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < count; i++) {
            particles.push(new SnowParticle(
                Math.random() * canvas.width,
                -10,
                settings
            ));
        }

        return particles;
    }
}

class SnowParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = this.randomBetween(-0.3, 0.3);
        this.vy = this.randomBetween(0.5, 1.5);
        this.size = this.randomBetween(2, 5);
        this.color = '#ffffff';
        this.opacity = this.randomBetween(0.4, 0.8);
        this.life = 1.0;
        this.decay = 0;
        this.sway = 0;
        this.swaySpeed = this.randomBetween(0.01, 0.03);
    }

    update(deltaTime, mouse, canvas) {
        // Gentle swaying
        this.sway += this.swaySpeed * deltaTime * 0.1;
        this.vx = Math.sin(this.sway) * 0.2;
        
        this.x += this.vx * deltaTime * 0.1;
        this.y += this.vy * deltaTime * 0.1;
        
        // Remove when off screen
        if (this.y > canvas.height + 20) {
            this.life = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Soft glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === AURORA EFFECT ===

class AuroraEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 3000;
        this.waves = [];
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];

        // Create aurora wave
        for (let i = 0; i < canvas.width; i += 20) {
            particles.push(new AuroraParticle(i, canvas.height * 0.3, settings));
        }

        return particles;
    }
}

class AuroraParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = this.randomBetween(15, 30);
        this.height = this.randomBetween(100, 200);
        this.color = this.randomColor(['#00ff88', '#0088ff', '#8800ff']);
        this.opacity = this.randomBetween(0.1, 0.3);
        this.life = 1.0;
        this.decay = 0.002;
        this.wave = 0;
        this.waveSpeed = this.randomBetween(0.01, 0.03);
    }

    update(deltaTime, mouse, canvas) {
        this.wave += this.waveSpeed * deltaTime * 0.1;
        this.y = this.baseY + Math.sin(this.wave) * 20;
        this.life -= this.decay * deltaTime * 0.1;
    }

    draw(ctx) {
        const gradient = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, this.color + '60');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.size/2, -this.height/2, this.size, this.height);
    }
}

// === STAR EFFECT ===

class StarEffect {
    constructor() {
        this.lastGeneration = 0;
        this.generationInterval = 5000;
    }

    generate(canvas, settings) {
        const now = Date.now();
        if (now - this.lastGeneration < this.generationInterval) {
            return [];
        }

        this.lastGeneration = now;
        const particles = [];
        const count = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < count; i++) {
            particles.push(new StarParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height * 0.5,
                settings
            ));
        }

        return particles;
    }
}

class StarParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = 0;
        this.vy = 0;
        this.size = this.randomBetween(1, 3);
        this.color = '#ffffff';
        this.opacity = this.randomBetween(0.3, 0.8);
        this.life = 1.0;
        this.decay = 0.0005;
        this.twinkle = 0;
        this.twinkleSpeed = this.randomBetween(0.02, 0.08);
    }

    update(deltaTime, mouse, canvas) {
        this.twinkle += this.twinkleSpeed * deltaTime * 0.1;
        this.life -= this.decay * deltaTime * 0.1;
    }

    draw(ctx) {
        const twinkleIntensity = (Math.sin(this.twinkle) + 1) * 0.5;
        
        ctx.globalAlpha *= twinkleIntensity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Cross sparkle
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.size * 2, 0);
        ctx.lineTo(this.size * 2, 0);
        ctx.moveTo(0, -this.size * 2);
        ctx.lineTo(0, this.size * 2);
        ctx.stroke();
    }
}

// === INTERACTIVE PARTICLE ===

class InteractiveParticle extends Particle {
    constructor(x, y, settings) {
        super(x, y, settings);
        this.vx = this.randomBetween(-1, 1);
        this.vy = this.randomBetween(-1, 1);
        this.size = this.randomBetween(3, 6);
        this.life = 0.8;
        this.decay = 0.01;
        this.trail = [];
        this.maxTrailLength = 10;
    }

    update(deltaTime, mouse, canvas) {
        super.update(deltaTime, mouse, canvas);
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity * this.life });
        
        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Fade trail
        this.trail.forEach((point, index) => {
            point.opacity *= 0.9;
        });
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach((point, index) => {
            ctx.globalAlpha = point.opacity;
            ctx.fillStyle = this.color;
            const size = this.size * (index / this.trail.length);
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw main particle
        ctx.globalAlpha = this.opacity * this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// === EXPORT ===

// Initialize particle system when DOM is loaded
if (typeof window !== 'undefined') {
    window.ParticleSystem = ParticleSystem;
    
    // Auto-initialize if not already done
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.particleSystem) {
            window.particleSystem = new ParticleSystem();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}

console.log('🌟 Particle system module loaded');
