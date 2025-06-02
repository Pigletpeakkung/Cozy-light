/**
 * Cozy Light - Advanced Gesture Handler
 * Touch, swipe, and gesture controls for mobile and desktop
 * Version 2.0.0
 */

class GestureHandler {
    constructor() {
        this.isEnabled = true;
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.touchEndPos = { x: 0, y: 0 };
        this.lastTouchTime = 0;
        this.tapCount = 0;
        this.isLongPress = false;
        this.longPressTimer = null;
        this.pinchStartDistance = 0;
        this.pinchScale = 1;
        this.rotationStart = 0;
        this.currentRotation = 0;
        this.activeTouches = new Map();
        this.gestureHistory = [];
        
        // Configuration
        this.config = {
            swipeThreshold: 50,
            swipeVelocityThreshold: 0.3,
            longPressDelay: 500,
            doubleTapDelay: 300,
            pinchThreshold: 10,
            rotationThreshold: 15,
            maxGestureHistory: 10,
            vibrationEnabled: true,
            soundFeedback: true
        };
        
        // Gesture patterns
        this.patterns = new Map();
        this.customGestures = new Map();
        
        // Event handlers
        this.handlers = new Map();
        
        this.init();
    }

    /**
     * Initialize gesture handling
     */
    init() {
        this.setupEventListeners();
        this.registerDefaultGestures();
        this.loadSettings();
        
        console.log('🎮 Gesture handler initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Touch events
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });

        // Mouse events for desktop testing
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Pointer events (modern browsers)
        if (window.PointerEvent) {
            document.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
            document.addEventListener('pointermove', (e) => this.handlePointerMove(e));
            document.addEventListener('pointerup', (e) => this.handlePointerUp(e));
            document.addEventListener('pointercancel', (e) => this.handlePointerCancel(e));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Device orientation
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.handleDeviceOrientation(e));
        }

        // Device motion
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => this.handleDeviceMotion(e));
        }

        // Prevent default behaviors
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
    }

    /**
     * Register default gesture patterns
     */
    registerDefaultGestures() {
        // Lighting controls
        this.registerGesture('swipeUp', {
            pattern: 'swipe',
            direction: 'up',
            action: 'increaseBrightness',
            description: 'Swipe up to increase brightness'
        });

        this.registerGesture('swipeDown', {
            pattern: 'swipe',
            direction: 'down',
            action: 'decreaseBrightness',
            description: 'Swipe down to decrease brightness'
        });

        this.registerGesture('swipeLeft', {
            pattern: 'swipe',
            direction: 'left',
            action: 'previousPreset',
            description: 'Swipe left for previous preset'
        });

        this.registerGesture('swipeRight', {
            pattern: 'swipe',
            direction: 'right',
            action: 'nextPreset',
            description: 'Swipe right for next preset'
        });

        // Advanced gestures
        this.registerGesture('doubleTap', {
            pattern: 'tap',
            count: 2,
            action: 'togglePower',
            description: 'Double tap to toggle power'
        });

        this.registerGesture('longPress', {
            pattern: 'longPress',
            action: 'openSettings',
            description: 'Long press to open settings'
        });

        this.registerGesture('pinchIn', {
            pattern: 'pinch',
            direction: 'in',
            action: 'decreaseWarmth',
            description: 'Pinch in to decrease warmth'
        });

        this.registerGesture('pinchOut', {
            pattern: 'pinch',
            direction: 'out',
            action: 'increaseWarmth',
            description: 'Pinch out to increase warmth'
        });

        this.registerGesture('rotateClockwise', {
            pattern: 'rotate',
            direction: 'clockwise',
            action: 'increaseSaturation',
            description: 'Rotate clockwise to increase saturation'
        });

        this.registerGesture('rotateCounterClockwise', {
            pattern: 'rotate',
            direction: 'counterclockwise',
            action: 'decreaseSaturation',
            description: 'Rotate counter-clockwise to decrease saturation'
        });

        // Three-finger gestures
        this.registerGesture('threeFingerTap', {
            pattern: 'tap',
            fingers: 3,
            action: 'toggleFullscreen',
            description: 'Three-finger tap for fullscreen'
        });

        this.registerGesture('threeFingerSwipeUp', {
            pattern: 'swipe',
            direction: 'up',
            fingers: 3,
            action: 'showQuickActions',
            description: 'Three-finger swipe up for quick actions'
        });

        // Four-finger gestures
        this.registerGesture('fourFingerTap', {
            pattern: 'tap',
            fingers: 4,
            action: 'emergencyMode',
            description: 'Four-finger tap for emergency bright mode'
        });

        // Custom patterns
        this.registerGesture('heartPattern', {
            pattern: 'custom',
            path: this.generateHeartPath(),
            action: 'romanticMode',
            description: 'Draw a heart for romantic mode'
        });

        this.registerGesture('circlePattern', {
            pattern: 'custom',
            path: this.generateCirclePath(),
            action: 'cyclePresets',
            description: 'Draw a circle to cycle presets'
        });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        if (!this.isEnabled) return;

        const touch = e.touches[0];
        const now = Date.now();

        // Store touch information
        this.touchStartTime = now;
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        
        // Track all touches
        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            this.activeTouches.set(t.identifier, {
                startX: t.clientX,
                startY: t.clientY,
                currentX: t.clientX,
                currentY: t.clientY,
                startTime: now
            });
        }

        // Handle multi-touch gestures
        if (e.touches.length === 2) {
            this.handlePinchStart(e);
        }

        // Start long press timer
        this.longPressTimer = setTimeout(() => {
            this.handleLongPress(touch.clientX, touch.clientY);
        }, this.config.longPressDelay);

        // Detect double tap
        if (now - this.lastTouchTime < this.config.doubleTapDelay) {
            this.tapCount++;
        } else {
            this.tapCount = 1;
        }

        this.lastTouchTime = now;

        // Prevent default for gesture areas
        if (this.isGestureArea(touch.clientX, touch.clientY)) {
            e.preventDefault();
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (!this.isEnabled) return;

        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        // Update touch positions
        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            const touchData = this.activeTouches.get(t.identifier);
            if (touchData) {
                touchData.currentX = t.clientX;
                touchData.currentY = t.clientY;
            }
        }

        // Handle multi-touch gestures
        if (e.touches.length === 2) {
            this.handlePinchMove(e);
        }

        // Track gesture path for custom patterns
        if (e.touches.length === 1) {
            this.trackGesturePath(e.touches[0].clientX, e.touches[0].clientY);
        }

        // Prevent scrolling during gestures
        if (this.activeTouches.size > 0) {
            e.preventDefault();
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (!this.isEnabled) return;

        const now = Date.now();
        const touch = e.changedTouches[0];
        
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }

        // Calculate gesture metrics
        const duration = now - this.touchStartTime;
        const deltaX = touch.clientX - this.touchStartPos.x;
        const deltaY = touch.clientY - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;

        // Remove ended touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            this.activeTouches.delete(t.identifier);
        }

        // Handle different gesture types
        if (e.touches.length === 0) {
            // All touches ended
            if (distance < this.config.swipeThreshold && duration < this.config.longPressDelay) {
                this.handleTap(touch.clientX, touch.clientY, this.tapCount);
            } else if (distance >= this.config.swipeThreshold && velocity >= this.config.swipeVelocityThreshold) {
                this.handleSwipe(deltaX, deltaY, velocity);
            }

            // Check for custom gesture patterns
            this.checkCustomGestures();
            
            // Reset gesture tracking
            this.resetGestureTracking();
        }

        // Handle pinch end
        if (e.touches.length < 2 && this.pinchScale !== 1) {
            this.handlePinchEnd();
        }
    }

    /**
     * Handle touch cancel
     */
    handleTouchCancel(e) {
        this.resetGestureTracking();
    }

    /**
     * Handle tap gesture
     */
    handleTap(x, y, count) {
        const element = document.elementFromPoint(x, y);
        const fingerCount = this.getFingerCount();

        const gestureData = {
            type: 'tap',
            x: x,
            y: y,
            count: count,
            fingers: fingerCount,
            element: element,
            timestamp: Date.now()
        };

        this.addToHistory(gestureData);

        // Find matching gesture
        const gesture = this.findMatchingGesture('tap', { count, fingers: fingerCount });
        if (gesture) {
            this.executeGesture(gesture, gestureData);
        }

        // Provide haptic feedback
        this.provideFeedback('tap', count);
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe(deltaX, deltaY, velocity) {
        const direction = this.getSwipeDirection(deltaX, deltaY);
        const fingerCount = this.getFingerCount();

        const gestureData = {
            type: 'swipe',
            direction: direction,
            deltaX: deltaX,
            deltaY: deltaY,
            velocity: velocity,
            fingers: fingerCount,
            timestamp: Date.now()
        };

        this.addToHistory(gestureData);

        // Find matching gesture
        const gesture = this.findMatchingGesture('swipe', { direction, fingers: fingerCount });
        if (gesture) {
            this.executeGesture(gesture, gestureData);
        }

        // Provide haptic feedback
        this.provideFeedback('swipe', direction);
    }

    /**
     * Handle long press gesture
     */
    handleLongPress(x, y) {
        this.isLongPress = true;
        const element = document.elementFromPoint(x, y);

        const gestureData = {
            type: 'longPress',
            x: x,
            y: y,
            element: element,
            timestamp: Date.now()
        };

        this.addToHistory(gestureData);

        // Find matching gesture
        const gesture = this.findMatchingGesture('longPress');
        if (gesture) {
            this.executeGesture(gesture, gestureData);
        }

        // Provide haptic feedback
        this.provideFeedback('longPress');
    }

    /**
     * Handle pinch start
     */
    handlePinchStart(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        this.pinchStartDistance = this.getDistance(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
        );
        
        this.rotationStart = this.getAngle(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
        );
    }

    /**
     * Handle pinch move
     */
    handlePinchMove(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentDistance = this.getDistance(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
        );
        
        const currentAngle = this.getAngle(
            touch1.clientX, touch1.clientY,
            touch2.clientX, touch2.clientY
        );

        // Calculate pinch scale
        this.pinchScale = currentDistance / this.pinchStartDistance;
        
        // Calculate rotation
        this.currentRotation = currentAngle - this.rotationStart;

        // Emit real-time pinch/rotation events
        this.emitGestureEvent('pinchMove', {
            scale: this.pinchScale,
            rotation: this.currentRotation
        });
    }

    /**
     * Handle pinch end
     */
    handlePinchEnd() {
        const scaleChange = this.pinchScale - 1;
        const rotationChange = this.currentRotation;

        // Determine gesture type
        if (Math.abs(scaleChange) > 0.1) {
            const direction = scaleChange > 0 ? 'out' : 'in';
            const gestureData = {
                type: 'pinch',
                direction: direction,
                scale: this.pinchScale,
                scaleChange: scaleChange,
                timestamp: Date.now()
            };

            this.addToHistory(gestureData);

            const gesture = this.findMatchingGesture('pinch', { direction });
            if (gesture) {
                this.executeGesture(gesture, gestureData);
            }

            this.provideFeedback('pinch', direction);
        }

        if (Math.abs(rotationChange) > this.config.rotationThreshold) {
            const direction = rotationChange > 0 ? 'clockwise' : 'counterclockwise';
            const gestureData = {
                type: 'rotate',
                direction: direction,
                rotation: rotationChange,
                timestamp: Date.now()
            };

            this.addToHistory(gestureData);

            const gesture = this.findMatchingGesture('rotate', { direction });
            if (gesture) {
                this.executeGesture(gesture, gestureData);
            }

            this.provideFeedback('rotate', direction);
        }

        // Reset pinch state
        this.pinchScale = 1;
        this.currentRotation = 0;
    }

    /**
     * Handle device orientation
     */
    handleDeviceOrientation(e) {
        if (!this.isEnabled) return;

        const orientation = {
            alpha: e.alpha, // Z axis
            beta: e.beta,   // X axis
            gamma: e.gamma  // Y axis
        };

        // Detect tilt gestures
        if (Math.abs(orientation.gamma) > 30) {
            const direction = orientation.gamma > 0 ? 'right' : 'left';
            this.emitGestureEvent('tilt', { direction, angle: orientation.gamma });
        }

        if (Math.abs(orientation.beta) > 30) {
            const direction = orientation.beta > 0 ? 'forward' : 'backward';
            this.emitGestureEvent('tilt', { direction, angle: orientation.beta });
        }
    }

    /**
     * Handle device motion
     */
    handleDeviceMotion(e) {
        if (!this.isEnabled) return;

        const acceleration = e.accelerationIncludingGravity;
        const threshold = 15;

        // Detect shake gesture
        if (Math.abs(acceleration.x) > threshold || 
            Math.abs(acceleration.y) > threshold || 
            Math.abs(acceleration.z) > threshold) {
            
            this.handleShake(acceleration);
        }
    }

    /**
     * Handle shake gesture
     */
    handleShake(acceleration) {
        const now = Date.now();
        
        // Debounce shake events
        if (now - this.lastShakeTime < 1000) return;
        this.lastShakeTime = now;

        const gestureData = {
            type: 'shake',
            acceleration: acceleration,
            timestamp: now
        };

        this.addToHistory(gestureData);

        const gesture = this.findMatchingGesture('shake');
        if (gesture) {
            this.executeGesture(gesture, gestureData);
        }

        this.provideFeedback('shake');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyDown(e) {
        if (!this.isEnabled) return;

        const key = e.key.toLowerCase();
        const modifiers = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey
        };

        const gestureData = {
            type: 'keyboard',
            key: key,
            modifiers: modifiers,
            timestamp: Date.now()
        };

        // Check for registered keyboard gestures
        const gesture = this.findMatchingGesture('keyboard', { key, modifiers });
        if (gesture) {
            e.preventDefault();
            this.executeGesture(gesture, gestureData);
        }
    }

    /**
     * Register a new gesture
     */
    registerGesture(name, config) {
        this.patterns.set(name, {
            ...config,
            name: name,
            enabled: true,
            priority: config.priority || 0
        });
    }

    /**
     * Register a custom gesture pattern
     */
    registerCustomGesture(name, pathPoints, action) {
        this.customGestures.set(name, {
            name: name,
            path: pathPoints,
            action: action,
            tolerance: 50, // pixels
            enabled: true
        });
    }

    /**
     * Find matching gesture
     */
    findMatchingGesture(type, criteria = {}) {
        const gestures = Array.from(this.patterns.values())
            .filter(g => g.pattern === type && g.enabled)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));

        for (const gesture of gestures) {
            if (this.matchesGesture(gesture, criteria)) {
                return gesture;
            }
        }

        return null;
    }

    /**
     * Check if gesture matches criteria
     */
    matchesGesture(gesture, criteria) {
        // Check direction
        if (gesture.direction && criteria.direction !== gesture.direction) {
            return false;
        }

        // Check finger count
        if (gesture.fingers && criteria.fingers !== gesture.fingers) {
            return false;
        }

        // Check tap count
        if (gesture.count && criteria.count !== gesture.count) {
            return false;
        }

        // Check keyboard modifiers
        if (gesture.modifiers && criteria.modifiers) {
            for (const [mod, required] of Object.entries(gesture.modifiers)) {
                if (criteria.modifiers[mod] !== required) {
                    return false;
                }
            }
        }

        // Check key
        if (gesture.key && criteria.key !== gesture.key) {
            return false;
        }

        return true;
    }

    /**
     * Execute gesture action
     */
    executeGesture(gesture, gestureData) {
        console.log('🎮 Executing gesture:', gesture.name, gestureData);

        // Emit gesture event
        this.emitGestureEvent('gestureExecuted', {
            gesture: gesture,
            data: gestureData
        });

        // Execute the action
        if (typeof gesture.action === 'string') {
            this.executeAction(gesture.action, gestureData);
        } else if (typeof gesture.action === 'function') {
            gesture.action(gestureData);
        }

        // Track gesture usage
        this.trackGestureUsage(gesture.name);
    }

    /**
     * Execute predefined actions
     */
    executeAction(action, gestureData) {
        const actions = {
            // Power controls
            togglePower: () => window.lightController?.togglePower(),
            
            // Brightness controls
            increaseBrightness: () => {
                const current = window.lightController?.getBrightness() || 50;
                window.lightController?.setBrightness(Math.min(100, current + 10));
            },
            decreaseBrightness: () => {
                const current = window.lightController?.getBrightness() || 50;
                window.lightController?.setBrightness(Math.max(0, current - 10));
            },
            
            // Warmth controls
            increaseWarmth: () => {
                const current = window.lightController?.getWarmth() || 50;
                window.lightController?.setWarmth(Math.min(100, current + 10));
            },
            decreaseWarmth: () => {
                const current = window.lightController?.getWarmth() || 50;
                window.lightController?.setWarmth(Math.max(0, current - 10));
            },
            
            // Saturation controls
            increaseSaturation: () => {
                const current = window.lightController?.getSaturation() || 50;
                window.lightController?.setSaturation(Math.min(100, current + 10));
            },
            decreaseSaturation: () => {
                const current = window.lightController?.getSaturation() || 50;
                window.lightController?.setSaturation(Math.max(0, current - 10));
            },
            
            // Preset controls
            nextPreset: () => window.presetManager?.nextPreset(),
            previousPreset: () => window.presetManager?.previousPreset(),
            cyclePresets: () => window.presetManager?.cyclePresets(),
            
            // Special modes
            romanticMode: () => window.presetManager?.applyPreset('romantic'),
            emergencyMode: () => {
                window.lightController?.setBrightness(100);
                window.lightController?.setWarmth(0);
                window.lightController?.setSaturation(0);
            },
            
            // UI controls
            toggleFullscreen: () => this.toggleFullscreen(),
            openSettings: () => this.openSettings(),
            showQuickActions: () => this.showQuickActions(),
            
            // Audio controls
            toggleAudio: () => window.audioManager?.toggleMute(),
            nextTrack: () => window.audioManager?.nextTrack(),
            previousTrack: () => window.audioManager?.previousTrack()
        };

        if (actions[action]) {
            actions[action]();
        } else {
            console.warn('Unknown gesture action:', action);
        }
    }

    /**
     * Provide haptic and audio feedback
     */
    provideFeedback(type, data) {
        // Haptic feedback
        if (this.config.vibrationEnabled && navigator.vibrate) {
            const patterns = {
                tap: [10],
                doubleTap: [10, 50, 10],
                longPress: [50],
                swipe: [20],
                pinch: [30],
                rotate: [15, 15, 15],
                shake: [100]
            };

            const pattern = patterns[type] || [10];
            navigator.vibrate(pattern);
        }

        // Audio feedback
        if (this.config.soundFeedback) {
            this.playFeedbackSound(type);
        }
    }

    /**
     * Play feedback sound
     */
    playFeedbackSound(type) {
        const audioContext = window.audioContext || new (window.AudioContext || window.webkitAudioContext)();
        
        const frequencies = {
            tap: 800,
            swipe: 600,
            longPress: 400,
            pinch: 1000,
            rotate: 1200
        };

        const frequency = frequencies[type] || 800;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    /**
     * Utility functions
     */
    getSwipeDirection(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }

    getFingerCount() {
        return this.activeTouches.size;
    }

    isGestureArea(x, y) {
        // Define areas where gestures should be captured
        const element = document.elementFromPoint(x, y);
        return element && (
            element.classList.contains('gesture-area') ||
            element.closest('.light-container') ||
            element.closest('.controls-panel')
        );
    }

    /**
     * Custom gesture pattern matching
     */
    trackGesturePath(x, y) {
        if (!this.currentPath) {
            this.currentPath = [];
        }
        
        this.currentPath.push({ x, y, timestamp: Date.now() });
        
        // Limit path length
        if (this.currentPath.length > 100) {
            this.currentPath.shift();
        }
    }

    checkCustomGestures() {
        if (!this.currentPath || this.currentPath.length < 10) {
            return;
        }

        for (const [name, gesture] of this.customGestures) {
            if (gesture.enabled && this.matchesPath(this.currentPath, gesture.path, gesture.tolerance)) {
                this.executeAction(gesture.action, {
                    type: 'customGesture',
                    name: name,
                    path: this.currentPath
                });
                break;
            }
        }
    }

    matchesPath(drawnPath, targetPath, tolerance) {
        // Simplified path matching algorithm
        if (drawnPath.length < targetPath.length * 0.5) {
            return false;
        }

        // Normalize paths
        const normalizedDrawn = this.normalizePath(drawnPath);
        const normalizedTarget = this.normalizePath(targetPath);

        // Calculate similarity
        const similarity = this.calculatePathSimilarity(normalizedDrawn, normalizedTarget);
        return similarity > 0.7; // 70% similarity threshold
    }

    normalizePath(path) {
        // Normalize path to 0-1 coordinate system
        const minX = Math.min(...path.map(p => p.x));
        const maxX = Math.max(...path.map(p => p.x));
        const minY = Math.min(...path.map(p => p.y));
        const maxY = Math.max(...path.map(p => p.y));

        const width = maxX - minX || 1;
        const height = maxY - minY || 1;

        return path.map(p => ({
            x: (p.x - minX) / width,
            y: (p.y - minY) / height
        }));
    }

    calculatePathSimilarity(path1, path2) {
        // Dynamic Time Warping for path similarity
        const n = path1.length;
        const m = path2.length;
        const dtw = Array(n + 1).fill().map(() => Array(m + 1).fill(Infinity));

        dtw[0][0] = 0;

        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const cost = this.getDistance(
                    path1[i - 1].x, path1[i - 1].y,
                    path2[j - 1].x, path2[j - 1].y
                );
                dtw[i][j] = cost + Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
            }
        }

        const maxDistance = Math.sqrt(2); // Maximum possible distance in normalized space
        return 1 - (dtw[n][m] / (Math.max(n, m) * maxDistance));
    }

    /**
     * Generate predefined paths
     */
    generateHeartPath() {
        const points = [];
        for (let t = 0; t < 2 * Math.PI; t += 0.1) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            points.push({ x: x + 200, y: y + 200 });
        }
        return points;
    }

    generateCirclePath() {
        const points = [];
        const centerX = 200, centerY = 200, radius = 100;
        for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
            points.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
        return points;
    }

    /**
     * Event management
     */
    emitGestureEvent(type, data) {
        const event = new CustomEvent('gesture', {
            detail: { type, data }
        });
        document.dispatchEvent(event);
    }

    addToHistory(gestureData) {
        this.gestureHistory.push(gestureData);
        if (this.gestureHistory.length > this.config.maxGestureHistory) {
            this.gestureHistory.shift();
        }
    }

    resetGestureTracking() {
        this.activeTouches.clear();
        this.currentPath = null;
        this.tapCount = 0;
        this.isLongPress = false;
        this.pinchScale = 1;
        this.currentRotation = 0;
        
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    /**
     * Settings and configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('cozylight_gestures');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings };
            }
        } catch (error) {
            console.warn('Failed to load gesture settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('cozylight_gestures', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save gesture settings:', error);
        }
    }

    /**
     * Public API
     */
    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.resetGestureTracking();
    }

    getGestureList() {
        return Array.from(this.patterns.values()).map(g => ({
            name: g.name,
            description: g.description,
            enabled: g.enabled
        }));
    }

    toggleGesture(name, enabled) {
        const gesture = this.patterns.get(name);
        if (gesture) {
            gesture.enabled = enabled;
            this.saveSettings();
        }
    }

    getGestureHistory() {
        return [...this.gestureHistory];
    }

    clearGestureHistory() {
        this.gestureHistory = [];
    }

    /**
     * UI helper methods
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    openSettings() {
        const event = new CustomEvent('openSettings');
        document.dispatchEvent(event);
    }

    showQuickActions() {
        const event = new CustomEvent('showQuickActions');
        document.dispatchEvent(event);
    }

    /**
     * Analytics and usage tracking
     */
    trackGestureUsage(gestureName) {
        const usage = JSON.parse(localStorage.getItem('cozylight_gesture_usage') || '{}');
        usage[gestureName] = (usage[gestureName] || 0) + 1;
        localStorage.setItem('cozylight_gesture_usage', JSON.stringify(usage));
    }

    getGestureUsageStats() {
        return JSON.parse(localStorage.getItem('cozylight_gesture_usage') || '{}');
    }

    /**
     * Mouse event handlers (for desktop testing)
     */
    handleMouseDown(e) {
        this.handleTouchStart({
            touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }],
            preventDefault: () => e.preventDefault()
        });
    }

    handleMouseMove(e) {
        if (this.activeTouches.size > 0) {
            this.handleTouchMove({
                touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }],
                preventDefault: () => e.preventDefault()
            });
        }
    }

    handleMouseUp(e) {
        if (this.activeTouches.size > 0) {
            this.handleTouchEnd({
                changedTouches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }],
                touches: [],
                preventDefault: () => e.preventDefault()
            });
        }
    }

    /**
     * Pointer event handlers
     */
    handlePointerDown(e) {
        this.handleTouchStart({
            touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: e.pointerId }],
            preventDefault: () => e.preventDefault()
        });
    }

    handlePointerMove(e) {
        if (this.activeTouches.has(e.pointerId)) {
            this.handleTouchMove({
                touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: e.pointerId }],
                preventDefault: () => e.preventDefault()
            });
        }
    }

    handlePointerUp(e) {
        if (this.activeTouches.has(e.pointerId)) {
            this.handleTouchEnd({
                changedTouches: [{ clientX: e.clientX, clientY: e.clientY, identifier: e.pointerId }],
                touches: Array.from(this.activeTouches.entries())
                    .filter(([id]) => id !== e.pointerId)
                    .map(([id, data]) => ({ identifier: id, clientX: data.currentX, clientY: data.currentY })),
                preventDefault: () => e.preventDefault()
            });
        }
    }

    handlePointerCancel(e) {
        this.activeTouches.delete(e.pointerId);
    }

    handleKeyUp(e) {
        // Handle key release events if needed
    }
}

// Initialize gesture handler
if (typeof window !== 'undefined') {
    window.GestureHandler = GestureHandler;
    
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.gestureHandler) {
            window.gestureHandler = new GestureHandler();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureHandler;
}

console.log('🎮 Gesture handler module loaded');
