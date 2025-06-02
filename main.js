/**
 * Cozy Light - Main Application Controller
 * Enhanced with Open Source API Integration
 * Version 2.0.0
 */

class CozyLightApp {
    constructor() {
        this.version = '2.0.0';
        this.isLoaded = false;
        this.isPoweredOn = true;
        this.loadingProgress = 0;
        this.totalLoadingSteps = 12;
        this.currentPreset = 'custom';
        this.isFullscreen = false;
        
        // App state
        this.state = {
            brightness: 50,
            warmth: 50,
            saturation: 50,
            hue: 0,
            flicker: 0,
            breathe: 0,
            color: '#ffffff',
            volume: 50,
            currentScene: null,
            timerActive: false,
            settingsOpen: false
        };

        // Performance monitoring
        this.performanceMetrics = {
            loadStartTime: performance.now(),
            apiLoadTimes: {},
            renderTimes: []
        };

        // Error tracking
        this.errors = [];
        this.apiStatus = {
            weather: 'unknown',
            sounds: 'unknown',
            images: 'unknown',
            quotes: 'unknown',
            colors: 'unknown'
        };

        this.init();
    }

    async init() {
        try {
            console.log('🕯️ Initializing Cozy Light App v' + this.version);
            
            await this.showLoadingScreen();
            await this.detectCapabilities();
            await this.loadCriticalResources();
            await this.initializeAPIs();
            await this.initializeCore();
            await this.setupEventListeners();
            await this.loadUserSettings();
            await this.initializeUI();
            await this.startBackgroundTasks();
            await this.hideLoadingScreen();
            
            this.isLoaded = true;
            this.logPerformanceMetrics();
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.handleCriticalError(error);
        }
    }

    async showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.add('animate__animated', 'animate__fadeIn');
        }
        if (appContainer) appContainer.style.display = 'none';
        
        this.updateLoadingProgress(0, 'Starting Cozy Light...');
        await this.delay(300);
    }

    async detectCapabilities() {
        this.updateLoadingProgress(5, 'Detecting device capabilities...');
        
        this.capabilities = {
            webGL: !!window.WebGLRenderingContext,
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            geolocation: !!navigator.geolocation,
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            fullscreen: !!(document.fullscreenEnabled || document.webkitFullscreenEnabled),
            vibration: 'vibrate' in navigator,
            share: !!navigator.share,
            clipboard: !!navigator.clipboard,
            deviceMotion: 'DeviceMotionEvent' in window,
            battery: 'getBattery' in navigator,
            connection: 'connection' in navigator
        };

        console.log('📱 Device capabilities:', this.capabilities);
        await this.delay(200);
    }

    async loadCriticalResources() {
        this.updateLoadingProgress(10, 'Loading critical resources...');
        
        // Initialize core utilities first
        if (typeof window.utils === 'undefined') {
            await this.loadScript('src/js/utils.js');
        }
        
        if (typeof window.storage === 'undefined') {
            await this.loadScript('src/js/storage.js');
        }

        if (typeof window.notificationManager === 'undefined') {
            await this.loadScript('src/js/notifications.js');
        }

        await this.delay(200);
    }

    async initializeAPIs() {
        this.updateLoadingProgress(20, 'Connecting to APIs...');
        
        const apiInitPromises = [
            this.initWeatherAPI(),
            this.initSoundAPI(),
            this.initColorAPI(),
            this.initQuoteAPI(),
            this.initImageAPI()
        ];

        // Initialize APIs in parallel but don't fail if some are unavailable
        const results = await Promise.allSettled(apiInitPromises);
        
        results.forEach((result, index) => {
            const apiNames = ['weather', 'sounds', 'colors', 'quotes', 'images'];
            const apiName = apiNames[index];
            
            if (result.status === 'fulfilled') {
                this.apiStatus[apiName] = 'connected';
                console.log(`✅ ${apiName} API initialized`);
            } else {
                this.apiStatus[apiName] = 'error';
                console.warn(`⚠️ ${apiName} API failed:`, result.reason);
            }
        });

        this.updateAPIStatusIndicators();
        await this.delay(300);
    }

    async initWeatherAPI() {
        const startTime = performance.now();
        
        if (window.weatherAPI) {
            await window.weatherAPI.init();
            if (this.capabilities.geolocation) {
                await window.weatherAPI.getCurrentWeather();
            }
        }
        
        this.performanceMetrics.apiLoadTimes.weather = performance.now() - startTime;
    }

    async initSoundAPI() {
        const startTime = performance.now();
        
        if (window.soundAPI && this.capabilities.webAudio) {
            await window.soundAPI.init();
            await window.soundAPI.loadDefaultSounds();
        }
        
        this.performanceMetrics.apiLoadTimes.sounds = performance.now() - startTime;
    }

    async initColorAPI() {
        const startTime = performance.now();
        
        if (window.colorAPI) {
            await window.colorAPI.init();
            await window.colorAPI.generatePalette();
        }
        
        this.performanceMetrics.apiLoadTimes.colors = performance.now() - startTime;
    }

    async initQuoteAPI() {
        const startTime = performance.now();
        
        if (window.quoteAPI) {
            await window.quoteAPI.init();
            await window.quoteAPI.getRandomQuote();
        }
        
        this.performanceMetrics.apiLoadTimes.quotes = performance.now() - startTime;
    }

    async initImageAPI() {
        const startTime = performance.now();
        
        if (window.imageAPI) {
            await window.imageAPI.preloadSceneImages();
        }
        
        this.performanceMetrics.apiLoadTimes.images = performance.now() - startTime;
    }

    async initializeCore() {
        this.updateLoadingProgress(40, 'Initializing core systems...');
        
        // Initialize core managers
        const coreInitPromises = [
            this.initLightController(),
            this.initAudioManager(),
            this.initTimerManager(),
            this.initPresetManager(),
            this.initBackgroundManager(),
            this.initParticleSystem()
        ];

        await Promise.all(coreInitPromises);
        await this.delay(200);
    }

    async initLightController() {
        if (window.lightController) {
            window.lightController.init();
            this.bindLightControls();
        }
    }

    async initAudioManager() {
        if (window.audioManager && this.capabilities.webAudio) {
            await window.audioManager.init();
            this.bindAudioControls();
        }
    }

    async initTimerManager() {
        if (window.timerManager) {
            window.timerManager.init();
            this.bindTimerControls();
        }
    }

    async initPresetManager() {
        if (window.presetManager) {
            window.presetManager.init();
            this.bindPresetControls();
        }
    }

    async initBackgroundManager() {
        if (window.backgroundManager) {
            await window.backgroundManager.init();
        }
    }

    async initParticleSystem() {
        if (window.particleSystem && this.capabilities.webGL) {
            window.particleSystem.init();
        }
    }

    async setupEventListeners() {
        this.updateLoadingProgress(60, 'Setting up interactions...');
        
        // Core UI event listeners
        this.setupPowerControls();
        this.setupSliderControls();
        this.setupPresetButtons();
        this.setupModalControls();
        this.setupAPIControls();
        this.setupKeyboardShortcuts();
        this.setupGestureControls();
        this.setupAdvancedControls();
        
        // Window event listeners
        this.setupWindowEvents();
        
        await this.delay(200);
    }

    setupPowerControls() {
        const powerBtn = document.getElementById('powerBtn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => this.togglePower());
        }
    }

    setupSliderControls() {
        // Brightness control
        const brightnessSlider = document.getElementById('brightness');
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', (e) => {
                this.state.brightness = parseInt(e.target.value);
                this.updateBrightness();
                this.updateSliderValue('brightnessValue', this.state.brightness + '%');
            });
        }

        // Warmth control
        const warmthSlider = document.getElementById('warmth');
        if (warmthSlider) {
            warmthSlider.addEventListener('input', (e) => {
                this.state.warmth = parseInt(e.target.value);
                this.updateWarmth();
                this.updateSliderValue('warmthValue', this.state.warmth + '%');
            });
        }

        // Saturation control
        const saturationSlider = document.getElementById('saturation');
        if (saturationSlider) {
            saturationSlider.addEventListener('input', (e) => {
                this.state.saturation = parseInt(e.target.value);
                this.updateSaturation();
                this.updateSliderValue('saturationValue', this.state.saturation + '%');
            });
        }

        // Hue control
        const hueSlider = document.getElementById('hue');
        if (hueSlider) {
            hueSlider.addEventListener('input', (e) => {
                this.state.hue = parseInt(e.target.value);
                this.updateHue();
                this.updateSliderValue('hueValue', this.state.hue + '°');
            });
        }

        // Flicker control
        const flickerSlider = document.getElementById('flicker');
        if (flickerSlider) {
            flickerSlider.addEventListener('input', (e) => {
                this.state.flicker = parseInt(e.target.value);
                this.updateFlicker();
                this.updateSliderValue('flickerValue', this.state.flicker + '%');
            });
        }

        // Breathe control
        const breatheSlider = document.getElementById('breathe');
        if (breatheSlider) {
            breatheSlider.addEventListener('input', (e) => {
                this.state.breathe = parseInt(e.target.value);
                this.updateBreathe();
                this.updateSliderValue('breatheValue', this.state.breathe + '%');
            });
        }

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.state.color = e.target.value;
                this.updateColor();
            });
        }

        // Master volume
        const volumeSlider = document.getElementById('masterVolume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.state.volume = parseInt(e.target.value);
                this.updateVolume();
                this.updateSliderValue('volumeValue', this.state.volume + '%');
            });
        }
    }

    setupPresetButtons() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const preset = btn.dataset.preset;
                await this.applyPreset(preset);
                
                // Update active state
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Add visual feedback
                btn.classList.add('animate__animated', 'animate__pulse');
                setTimeout(() => {
                    btn.classList.remove('animate__animated', 'animate__pulse');
                }, 600);
            });
        });
    }

    setupModalControls() {
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.closeSettings());
        }

        // Close modal on backdrop click
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }

        // Settings tabs
        this.setupSettingsTabs();
        
        // Save preset modal
        this.setupSavePresetModal();
    }

    setupSettingsTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show target tab pane
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === targetTab + 'Tab') {
                        pane.classList.add('active');
                    }
                });
            });
        });

        // Settings controls
        this.setupSettingsControls();
    }

    setupSettingsControls() {
        // API key inputs
        const weatherKeyInput = document.getElementById('weatherApiKey');
        const freesoundKeyInput = document.getElementById('freesoundApiKey');
        const unsplashKeyInput = document.getElementById('unsplashApiKey');

        if (weatherKeyInput) {
            weatherKeyInput.value = localStorage.getItem('weatherApiKey') || '';
            weatherKeyInput.addEventListener('change', (e) => {
                localStorage.setItem('weatherApiKey', e.target.value);
                if (window.weatherAPI) {
                    window.weatherAPI.apiKey = e.target.value;
                }
                this.showNotification('Weather API key updated', 'success');
            });
        }

        if (freesoundKeyInput) {
            freesoundKeyInput.value = localStorage.getItem('freesoundApiKey') || '';
            freesoundKeyInput.addEventListener('change', (e) => {
                localStorage.setItem('freesoundApiKey', e.target.value);
                if (window.soundAPI) {
                    window.soundAPI.freesoundApiKey = e.target.value;
                }
                this.showNotification('Freesound API key updated', 'success');
            });
        }

        if (unsplashKeyInput) {
            unsplashKeyInput.value = localStorage.getItem('unsplashApiKey') || '';
            unsplashKeyInput.addEventListener('change', (e) => {
                localStorage.setItem('unsplashApiKey', e.target.value);
                if (window.imageAPI) {
                    window.imageAPI.unsplashAccessKey = e.target.value;
                }
                this.showNotification('Unsplash API key updated', 'success');
            });
        }

        // Other settings
        this.setupGeneralSettings();
        this.setupAudioSettings();
        this.setupVisualSettings();
        this.setupAdvancedSettings();
    }

    setupGeneralSettings() {
        const autoSave = document.getElementById('autoSave');
        const smoothTransitions = document.getElementById('smoothTransitions');
        const keyboardShortcuts = document.getElementById('keyboardShortcuts');
        const themeSelect = document.getElementById('themeSelect');
        const languageSelect = document.getElementById('languageSelect');

        if (autoSave) {
            autoSave.checked = localStorage.getItem('autoSave') === 'true';
            autoSave.addEventListener('change', (e) => {
                localStorage.setItem('autoSave', e.target.checked);
            });
        }

        if (smoothTransitions) {
            smoothTransitions.checked = localStorage.getItem('smoothTransitions') !== 'false';
            smoothTransitions.addEventListener('change', (e) => {
                localStorage.setItem('smoothTransitions', e.target.checked);
                document.body.classList.toggle('no-transitions', !e.target.checked);
            });
        }

        if (keyboardShortcuts) {
            keyboardShortcuts.checked = localStorage.getItem('keyboardShortcuts') !== 'false';
            keyboardShortcuts.addEventListener('change', (e) => {
                localStorage.setItem('keyboardShortcuts', e.target.checked);
                this.keyboardShortcutsEnabled = e.target.checked;
            });
        }

        if (themeSelect) {
            themeSelect.value = localStorage.getItem('theme') || 'dark';
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        if (languageSelect) {
            languageSelect.value = localStorage.getItem('language') || 'en';
            languageSelect.addEventListener('change', (e) => {
                localStorage.setItem('language', e.target.value);
                // TODO: Implement language switching
            });
        }
    }

    setupAudioSettings() {
        const enableAudio = document.getElementById('enableAudio');
        const audioQuality = document.getElementById('audioQuality');
        const crossfade = document.getElementById('crossfade');
        const spatialAudio = document.getElementById('spatialAudio');

        if (enableAudio) {
            enableAudio.checked = localStorage.getItem('enableAudio') !== 'false';
            enableAudio.addEventListener('change', (e) => {
                localStorage.setItem('enableAudio', e.target.checked);
                if (window.audioManager) {
                    window.audioManager.setEnabled(e.target.checked);
                }
            });
        }

        if (audioQuality) {
            audioQuality.value = localStorage.getItem('audioQuality') || 'medium';
            audioQuality.addEventListener('change', (e) => {
                localStorage.setItem('audioQuality', e.target.value);
                if (window.soundAPI) {
                    window.soundAPI.setQuality(e.target.value);
                }
            });
        }

        if (crossfade) {
            crossfade.checked = localStorage.getItem('crossfade') !== 'false';
            crossfade.addEventListener('change', (e) => {
                localStorage.setItem('crossfade', e.target.checked);
            });
        }

        if (spatialAudio) {
            spatialAudio.checked = localStorage.getItem('spatialAudio') === 'true';
            spatialAudio.addEventListener('change', (e) => {
                localStorage.setItem('spatialAudio', e.target.checked);
            });
        }
    }

    setupVisualSettings() {
        const particleEffects = document.getElementById('particleEffects');
        const backgroundImages = document.getElementById('backgroundImages');
        const lightReflections = document.getElementById('lightReflections');
        const animationSpeed = document.getElementById('animationSpeed');

        if (particleEffects) {
            particleEffects.checked = localStorage.getItem('particleEffects') !== 'false';
            particleEffects.addEventListener('change', (e) => {
                localStorage.setItem('particleEffects', e.target.checked);
                if (window.particleSystem) {
                    window.particleSystem.setEnabled(e.target.checked);
                }
            });
        }

        if (backgroundImages) {
            backgroundImages.checked = localStorage.getItem('backgroundImages') !== 'false';
            backgroundImages.addEventListener('change', (e) => {
                localStorage.setItem('backgroundImages', e.target.checked);
                if (window.backgroundManager) {
                    window.backgroundManager.setEnabled(e.target.checked);
                }
            });
        }

        if (lightReflections) {
            lightReflections.checked = localStorage.getItem('lightReflections') !== 'false';
            lightReflections.addEventListener('change', (e) => {
                localStorage.setItem('lightReflections', e.target.checked);
            });
        }

        if (animationSpeed) {
            animationSpeed.value = localStorage.getItem('animationSpeed') || 'normal';
            animationSpeed.addEventListener('change', (e) => {
                localStorage.setItem('animationSpeed', e.target.value);
                this.setAnimationSpeed(e.target.value);
            });
        }
    }

    setupAdvancedSettings() {
        const debugMode = document.getElementById('debugMode');
        const performanceMode = document.getElementById('performanceMode');
        const cacheLimit = document.getElementById('cacheLimit');
        const clearCache = document.getElementById('clearCache');
        const resetSettings = document.getElementById('resetSettings');
        const exportSettings = document.getElementById('exportSettings');
        const importSettings = document.getElementById('importSettings');

        if (debugMode) {
            debugMode.checked = localStorage.getItem('debugMode') === 'true';
            debugMode.addEventListener('change', (e) => {
                localStorage.setItem('debugMode', e.target.checked);
                this.debugMode = e.target.checked;
                if (e.target.checked) {
                    console.log('🐛 Debug mode enabled');
                }
            });
        }

        if (performanceMode) {
            performanceMode.checked = localStorage.getItem('performanceMode') === 'true';
            performanceMode.addEventListener('change', (e) => {
                localStorage.setItem('performanceMode', e.target.checked);
                this.setPerformanceMode(e.target.checked);
            });
        }

        if (cacheLimit) {
            cacheLimit.value = localStorage.getItem('cacheLimit') || '100';
            cacheLimit.addEventListener('change', (e) => {
                localStorage.setItem('cacheLimit', e.target.value);
            });
        }

        if (clearCache) {
            clearCache.addEventListener('click', () => this.clearCache());
        }

        if (resetSettings) {
            resetSettings.addEventListener('click', () => this.resetSettings());
        }

        if (exportSettings) {
            exportSettings.addEventListener('click', () => this.exportSettings());
        }

        if (importSettings) {
            importSettings.addEventListener('click', () => this.importSettings());
        }
    }

    setupSavePresetModal() {
        const addPresetBtn = document.getElementById('addPresetBtn');
        const savePresetModal = document.getElementById('savePresetModal');
        const closeSavePreset = document.getElementById('closeSavePreset');
        const savePresetBtn = document.getElementById('savePresetBtn');
        const presetNameInput = document.getElementById('presetName');

        if (addPresetBtn) {
            addPresetBtn.addEventListener('click', () => this.openSavePresetModal());
        }

        if (closeSavePreset) {
            closeSavePreset.addEventListener('click', () => this.closeSavePresetModal());
        }

        if (savePresetBtn && presetNameInput) {
            savePresetBtn.addEventListener('click', () => {
                const name = presetNameInput.value.trim();
                if (name) {
                    this.saveCustomPreset(name);
                    this.closeSavePresetModal();
                }
            });

            presetNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    savePresetBtn.click();
                }
            });
        }
    }

    setupAPIControls() {
        // Weather controls
        const weatherBtn = document.getElementById('weatherBtn');
        const refreshWeather = document.getElementById('refreshWeather');

        if (weatherBtn) {
            weatherBtn.addEventListener('click', () => this.toggleWeatherWidget());
        }

        if (refreshWeather) {
            refreshWeather.addEventListener('click', () => this.refreshWeather());
        }

        // Background controls
        const backgroundBtn = document.getElementById('backgroundBtn');
        const nasaBtn = document.getElementById('nasaBtn');
        const artBtn = document.getElementById('artBtn');

        if (backgroundBtn) {
            backgroundBtn.addEventListener('click', () => this.toggleBackgrounds());
        }

        if (nasaBtn) {
            nasaBtn.addEventListener('click', () => this.setNASABackground());
        }

        if (artBtn) {
            artBtn.addEventListener('click', () => this.setArtBackground());
        }

        // Quote controls
        const refreshQuote = document.getElementById('refreshQuote');
        const saveQuote = document.getElementById('saveQuote');
        const shareQuote = document.getElementById('shareQuote');

        if (refreshQuote) {
            refreshQuote.addEventListener('click', () => this.refreshQuote());
        }

        if (saveQuote) {
            saveQuote.addEventListener('click', () => this.saveQuote());
        }

        if (shareQuote) {
            shareQuote.addEventListener('click', () => this.shareQuote());
        }

        // Sound controls
        const refreshSounds = document.getElementById('refreshSounds');
        if (refreshSounds) {
            refreshSounds.addEventListener('click', () => this.refreshSounds());
        }

        // Color controls
        const generatePalette = document.getElementById('generatePalette');
        if (generatePalette) {
            generatePalette.addEventListener('click', () => this.generateNewPalette());
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareApp());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }

    setupKeyboardShortcuts() {
        this.keyboardShortcutsEnabled = localStorage.getItem('keyboardShortcuts') !== 'false';
        
        document.addEventListener('keydown', (e) => {
            if (!this.keyboardShortcutsEnabled) return;
            
            // Don't handle shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ': // Spacebar - toggle power
                    e.preventDefault();
                    this.togglePower();
                    break;
                    
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    e.preventDefault();
                    const presetIndex = parseInt(e.key) - 1;
                    const presets = ['cozy', 'focus', 'relax', 'romantic', 'nature', 'sunset'];
                    if (presets[presetIndex]) {
                        this.applyPreset(presets[presetIndex]);
                    }
                    break;
                    
                case 'f':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                    
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.openSavePresetModal();
                    }
                    break;
                    
                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.refreshQuote();
                    }
                    break;
                    
                case 'w':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        this.toggleWeatherWidget();
                    }
                    break;
                    
                case 'escape':
                    this.closeAllModals();
                    break;
                    
                case '?':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                    }
                    break;
            }
        });
    }

    setupGestureControls() {
        if (!this.capabilities.deviceMotion) return;

        const lightDisplay = document.getElementById('lightDisplay');
        if (!lightDisplay) return;

        // Touch gestures using Hammer.js
        if (typeof Hammer !== 'undefined') {
            const hammer = new Hammer(lightDisplay);
            
            // Pinch to zoom brightness
            hammer.get('pinch').set({ enable: true });
            hammer.on('pinch', (e) => {
                const scale = e.scale;
                const newBrightness = Math.max(0, Math.min(100, this.state.brightness * scale));
                this.setBrightness(newBrightness);
            });

            // Swipe gestures for presets
            hammer.on('swipeleft', () => this.nextPreset());
            hammer.on('swiperight', () => this.previousPreset());
            
            // Double tap to toggle power
            hammer.on('doubletap', () => this.togglePower());
        }

        // Device motion for ambient effects
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                if (this.state.breathe > 0) {
                    const acceleration = Math.abs(e.acceleration.x) + Math.abs(e.acceleration.y);
                    if (acceleration > 2) {
                        this.triggerMotionEffect();
                    }
                }
            });
        }
    }

    setupAdvancedControls() {
        const toggleAdvanced = document.getElementById('toggleAdvanced');
        const advancedControls = document.getElementById('advancedControls');

        if (toggleAdvanced && advancedControls) {
            toggleAdvanced.addEventListener('click', () => {
                const isExpanded = advancedControls.style.display === 'block';
                advancedControls.style.display = isExpanded ? 'none' : 'block';
                
                const toggleIcon = toggleAdvanced.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.setAttribute('icon', 
                        isExpanded ? 'material-symbols:expand-more' : 'material-symbols:expand-less'
                    );
                }

                // Animate the expansion
                if (!isExpanded) {
                    advancedControls.classList.add('animate__animated', 'animate__slideInDown');
                }
            });
        }

        // EQ controls
        const eqSliders = document.querySelectorAll('.eq-slider');
        eqSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const frequency = e.target.dataset.frequency;
                const valueSpan = e.target.parentNode.querySelector('.eq-value');
                
                if (valueSpan) {
                    valueSpan.textContent = `${value}dB`;
                }
                
                if (window.audioManager) {
                    const band = frequency === '60' ? 'bass' : 
                               frequency === '1000' ? 'mid' : 'high';
                    window.audioManager.setEqualizer(band, value);
                }
            });
        });
    }

    setupWindowEvents() {
        // Fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onAppHidden();
            } else {
                this.onAppVisible();
            }
        });

        // Online/offline status
        window.addEventListener('online', () => {
            this.showNotification('🌐 Back online', 'success');
            this.refreshAPIs();
        });

        window.addEventListener('offline', () => {
            this.showNotification('📱 Working offline', 'info');
        });

        // Resize handling
        window.addEventListener('resize', _.debounce(() => {
            this.handleResize();
        }, 250));

        // Before unload
        window.addEventListener('beforeunload', () => {
            if (localStorage.getItem('autoSave') === 'true') {
                this.saveCurrentState();
            }
        });
    }

    bindLightControls() {
        // This method binds the light controller to UI elements
        if (!window.lightController) return;

        window.lightController.onBrightnessChange = (brightness) => {
            this.state.brightness = brightness;
            this.updateSliderValue('brightnessValue', brightness + '%');
        };

        window.lightController.onColorChange = (color) => {
            this.state.color = color;
            const colorPicker = document.getElementById('colorPicker');
            if (colorPicker) colorPicker.value = color;
        };
    }

    bindAudioControls() {
        // This method binds the audio manager to UI elements
        if (!window.audioManager) return;

        window.audioManager.onVolumeChange = (volume) => {
            this.state.volume = Math.round(volume * 100);
            this.updateSliderValue('volumeValue', this.state.volume + '%');
        };
    }

    bindTimerControls() {
        // Timer controls
        const startTimer = document.getElementById('startTimer');
        const pauseTimer = document.getElementById('pauseTimer');
        const stopTimer = document.getElementById('stopTimer');

        if (startTimer) {
            startTimer.addEventListener('click', () => this.startTimer());
        }

        if (pauseTimer) {
            pauseTimer.addEventListener('click', () => this.pauseTimer());
        }

        if (stopTimer) {
            stopTimer.addEventListener('click', () => this.stopTimer());
        }
    }

    bindPresetControls() {
        // Load custom presets
        this.loadCustomPresets();
    }

    async loadUserSettings() {
        this.updateLoadingProgress(70, 'Loading your preferences...');
        
        try {
            const settings = JSON.parse(localStorage.getItem('cozyLightSettings') || '{}');
            
            // Apply saved settings
            if (settings.brightness !== undefined) {
                this.state.brightness = settings.brightness;
                this.setBrightness(settings.brightness);
            }
            
            if (settings.warmth !== undefined) {
                this.state.warmth = settings.warmth;
                this.setWarmth(settings.warmth);
            }
            
            if (settings.color) {
                this.state.color = settings.color;
                this.setColor(settings.color);
            }
            
            if (settings.volume !== undefined) {
                this.state.volume = settings.volume;
                this.setVolume(settings.volume);
            }

            // Apply theme
            const theme = localStorage.getItem('theme') || 'dark';
            this.setTheme(theme);

            // Apply other settings
            const smoothTransitions = localStorage.getItem('smoothTransitions') !== 'false';
            if (!smoothTransitions) {
                document.body.classList.add('no-transitions');
            }

        } catch (error) {
            console.warn('Failed to load user settings:', error);
        }
        
        await this.delay(200);
    }

    async initializeUI() {
        this.updateLoadingProgress(80, 'Preparing interface...');
        
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }

        // Initialize tooltips
        this.initializeTooltips();
        
        // Set initial UI state
        this.updateUIState();
        
        await this.delay(200);
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    async startBackgroundTasks() {
        this.updateLoadingProgress(90, 'Starting background services...');
        
        // Start auto-refresh for APIs
        this.startAPIAutoRefresh();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Start battery monitoring if available
        if (this.capabilities.battery) {
            this.startBatteryMonitoring();
        }
        
        await this.delay(200);
    }

    startAPIAutoRefresh() {
        // Refresh quotes every 30 minutes
        if (window.quoteAPI) {
            setInterval(() => {
                if (!document.hidden) {
                    window.quoteAPI.getRandomQuote();
                }
            }, 30 * 60 * 1000);
        }

        // Refresh weather every 30 minutes
        if (window.weatherAPI) {
            setInterval(() => {
                if (!document.hidden) {
                    window.weatherAPI.getCurrentWeather();
                }
            }, 30 * 60 * 1000);
        }
    }

    startPerformanceMonitoring() {
        // Monitor frame rate
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.performanceMetrics.fps = fps;
                
                if (fps < 30 && !this.performanceMode) {
                    console.warn('⚠️ Low FPS detected, consider enabling performance mode');
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    async startBatteryMonitoring() {
        try {
            const battery = await navigator.getBattery();
            
            const updateBatteryStatus = () => {
                if (battery.level < 0.2 && !battery.charging) {
                    this.setPerformanceMode(true);
                    this.showNotification('🔋 Low battery - Performance mode enabled', 'warning');
                }
            };
            
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
            
            updateBatteryStatus();
        } catch (error) {
            console.warn('Battery monitoring not available:', error);
        }
    }

    async hideLoadingScreen() {
        this.updateLoadingProgress(100, 'Welcome to Cozy Light!');
        await this.delay(500);

        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');

        if (loadingScreen) {
            loadingScreen.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }

        if (appContainer) {
            appContainer.style.display = 'block';
            appContainer.classList.add('animate__animated', 'animate__fadeIn');
        }
    }

    // Core functionality methods
    togglePower() {
        this.isPoweredOn = !this.isPoweredOn;
        
        const powerBtn = document.getElementById('powerBtn');
        const lightDisplay = document.getElementById('lightDisplay');
        
        if (powerBtn) {
            powerBtn.classList.toggle('active', this.isPoweredOn);
        }
        
        if (lightDisplay) {
            lightDisplay.classList.toggle('powered-off', !this.isPoweredOn);
        }
        
        if (window.lightController) {
            window.lightController.setPower(this.isPoweredOn);
        }
        
        if (window.audioManager) {
            if (this.isPoweredOn) {
                window.audioManager.resume();
            } else {
                window.audioManager.pause();
            }
        }
        
        this.updatePowerStatus();
        this.showNotification(
            this.isPoweredOn ? '💡 Light turned on' : '🌙 Light turned off',
            'info'
        );
    }

    async applyPreset(presetName) {
        this.currentPreset = presetName;
        
        const presets = {
            cozy: {
                brightness: 70,
                warmth: 85,
                saturation: 60,
                hue: 15,
                color: '#ff8c42',
                flicker: 2,
                breathe: 1
            },
            focus: {
                brightness: 95,
                warmth: 20,
                saturation: 10,
                hue: 0,
                color: '#ffffff',
                flicker: 0,
                breathe: 0
            },
            relax: {
                brightness: 40,
                warmth: 30,
                saturation: 70,
                hue: 220,
                color: '#6bb6ff',
                flicker: 0,
                breathe: 3
            },
            romantic: {
                brightness: 50,
                warmth: 90,
                saturation: 80,
                hue: 340,
                color: '#ff69b4',
                flicker: 1,
                breathe: 2
            },
            nature: {
                brightness: 60,
                warmth: 40,
                saturation: 75,
                hue: 120,
                color: '#32cd32',
                flicker: 1,
                breathe: 2
            },
            sunset: {
                brightness: 75,
                warmth: 95,
                saturation: 85,
                hue: 30,
                color: '#ff6347',
                flicker: 0,
                breathe: 1
            }
        };

        const preset = presets[presetName];
        if (!preset) return;

        // Apply preset with smooth transitions
        await this.animateToPreset(preset);
        
        // Update background
        if (window.backgroundManager) {
            await window.backgroundManager.changeBackground(presetName);
        }
        
        // Update current preset display
        const currentPresetEl = document.getElementById('currentPreset');
        if (currentPresetEl) {
            currentPresetEl.textContent = presetName.charAt(0).toUpperCase() + presetName.slice(1);
        }
        
        this.showNotification(`🎨 Applied ${presetName} preset`, 'success');
    }

    async animateToPreset(preset) {
        const duration = 1000;
        const steps = 60;
        const stepDuration = duration / steps;
        
        const startValues = {
            brightness: this.state.brightness,
            warmth: this.state.warmth,
            saturation: this.state.saturation,
            hue: this.state.hue,
            flicker: this.state.flicker,
            breathe: this.state.breathe
        };

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const easeProgress = this.easeInOutCubic(progress);
            
            // Interpolate values
            const currentValues = {};
            Object.keys(startValues).forEach(key => {
                if (preset[key] !== undefined) {
                    currentValues[key] = startValues[key] + 
                        (preset[key] - startValues[key]) * easeProgress;
                }
            });
            
            // Apply interpolated values
            this.setBrightness(currentValues.brightness);
            this.setWarmth(currentValues.warmth);
            this.setSaturation(currentValues.saturation);
            this.setHue(currentValues.hue);
            this.setFlicker(currentValues.flicker);
            this.setBreathe(currentValues.breathe);
            
            if (preset.color && i === steps) {
                this.setColor(preset.color);
            }
            
            await this.delay(stepDuration);
        }
    }

    // Utility methods
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    updateLoadingProgress(percentage, message) {
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.querySelector('.loading-spinner p');

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        if (loadingText) {
            loadingText.textContent = message;
        }

        this.loadingProgress = percentage;
    }

    updateSliderValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateAPIStatusIndicators() {
        Object.keys(this.apiStatus).forEach(api => {
            const statusElement = document.querySelector(`[data-api="${api}"] .status-dot`);
            if (statusElement) {
                statusElement.className = `status-dot ${this.apiStatus[api]}`;
            }
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (window.notificationManager) {
            window.notificationManager.show({
                title: message,
                type: type,
                duration: duration
            });
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    logPerformanceMetrics() {
        const totalLoadTime = performance.now() - this.performanceMetrics.loadStartTime;
        console.log('📊 Performance Metrics:');
        console.log(`Total load time: ${totalLoadTime.toFixed(2)}ms`);
        console.log('API load times:', this.performanceMetrics.apiLoadTimes);
        
        if (this.debugMode) {
            console.table(this.performanceMetrics);
        }
    }

    showWelcomeMessage() {
        const isFirstVisit = !localStorage.getItem('hasVisited');
        
        if (isFirstVisit) {
            localStorage.setItem('hasVisited', 'true');
            this.showNotification('🕯️ Welcome to Cozy Light! Press Shift+? for shortcuts', 'info', 5000);
        } else {
            this.showNotification('🕯️ Welcome back!', 'success', 2000);
        }
    }

    handleCriticalError(error) {
        console.error('💥 Critical error:', error);
        
        const errorMessage = `
            <div style="text-align: center; padding: 2rem; color: #ff6b6b;">
                <h2>⚠️ Something went wrong</h2>
                <p>The app encountered an error during initialization.</p>
                <p>Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Setter methods for state updates
    setBrightness(value) {
        this.state.brightness = Math.max(0, Math.min(100, value));
        const slider = document.getElementById('brightness');
        if (slider) slider.value = this.state.brightness;
        this.updateSliderValue('brightnessValue', this.state.brightness + '%');
        this.updateBrightness();
    }

    setWarmth(value) {
        this.state.warmth = Math.max(0, Math.min(100, value));
        const slider = document.getElementById('warmth');
        if (slider) slider.value = this.state.warmth;
        this.updateSliderValue('warmthValue', this.state.warmth + '%');
        this.updateWarmth();
    }

    setSaturation(value) {
        this.state.saturation = Math.max(0, Math.min(100, value));
        const slider = document.getElementById('saturation');
        if (slider) slider.value = this.state.saturation;
        this.updateSliderValue('saturationValue', this.state.saturation + '%');
        this.updateSaturation();
    }

    setHue(value) {
        this.state.hue = Math.max(0, Math.min(360, value));
        const slider = document.getElementById('hue');
        if (slider) slider.value = this.state.hue;
        this.updateSliderValue('hueValue', this.state.hue + '°');
        this.updateHue();
    }

    setFlicker(value) {
        this.state.flicker = Math.max(0, Math.min(10, value));
        const slider = document.getElementById('flicker');
        if (slider) slider.value = this.state.flicker;
        this.updateSliderValue('flickerValue', this.state.flicker + '%');
        this.updateFlicker();
    }

    setBreathe(value) {
        this.state.breathe = Math.max(0, Math.min(10, value));
        const slider = document.getElementById('breathe');
        if (slider) slider.value = this.state.breathe;
        this.updateSliderValue('breatheValue', this.state.breathe + '%');
        this.updateBreathe();
    }

    setColor(color) {
        this.state.color = color;
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) colorPicker.value = color;
        this.updateColor();
    }

    setVolume(value) {
        this.state.volume = Math.max(0, Math.min(100, value));
        const slider = document.getElementById('masterVolume');
        if (slider) slider.value = this.state.volume;
        this.updateSliderValue('volumeValue', this.state.volume + '%');
        this.updateVolume();
    }

    // Update methods that apply changes to the light and audio
    updateBrightness() {
        if (window.lightController) {
            window.lightController.setBrightness(this.state.brightness / 100);
        }
        this.saveStateIfAutoSave();
    }

    updateWarmth() {
        if (window.lightController) {
            window.lightController.setWarmth(this.state.warmth / 100);
        }
        this.saveStateIfAutoSave();
    }

    updateSaturation() {
        if (window.lightController) {
            window.lightController.setSaturation(this.state.saturation / 100);
        }
        this.saveStateIfAutoSave();
    }

    updateHue() {
        if (window.lightController) {
            window.lightController.setHue(this.state.hue);
        }
        this.saveStateIfAutoSave();
    }

    updateFlicker() {
        if (window.lightController) {
            window.lightController.setFlicker(this.state.flicker / 10);
        }
        this.saveStateIfAutoSave();
    }

    updateBreathe() {
        if (window.lightController) {
            window.lightController.setBreathe(this.state.breathe / 10);
        }
        this.saveStateIfAutoSave();
    }

    updateColor() {
        if (window.lightController) {
            window.lightController.setColor(this.state.color);
        }
        
        const colorInfo = document.getElementById('colorInfo');
        if (colorInfo) {
            colorInfo.textContent = this.state.color.toUpperCase();
        }
        
        this.saveStateIfAutoSave();
    }

    updateVolume() {
        if (window.audioManager) {
            window.audioManager.setMasterVolume(this.state.volume / 100);
        }
        this.saveStateIfAutoSave();
    }

    updatePowerStatus() {
        const powerStatus = document.getElementById('powerStatus');
        if (powerStatus) {
            powerStatus.textContent = this.isPoweredOn ? 'ON' : 'OFF';
            powerStatus.classList.toggle('off', !this.isPoweredOn);
        }
    }

    updateUIState() {
        // Update all UI elements to match current state
        this.setBrightness(this.state.brightness);
        this.setWarmth(this.state.warmth);
        this.setSaturation(this.state.saturation);
        this.setHue(this.state.hue);
        this.setFlicker(this.state.flicker);
        this.setBreathe(this.state.breathe);
        this.setColor(this.state.color);
        this.setVolume(this.state.volume);
        this.updatePowerStatus();
    }

    saveStateIfAutoSave() {
        if (localStorage.getItem('autoSave') === 'true') {
            this.saveCurrentState();
        }
    }

    saveCurrentState() {
        const settings = {
            ...this.state,
            isPoweredOn: this.isPoweredOn,
            currentPreset: this.currentPreset,
            timestamp: Date.now()
        };
        
        localStorage.setItem('cozyLightSettings', JSON.stringify(settings));
    }

    // API interaction methods
    async refreshWeather() {
        if (window.weatherAPI) {
            try {
                await window.weatherAPI.getCurrentWeather();
                this.showNotification('🌤️ Weather updated', 'success');
            } catch (error) {
                this.showNotification('❌ Weather update failed', 'error');
            }
        }
    }

    async refreshQuote() {
        if (window.quoteAPI) {
            try {
                await window.quoteAPI.getRandomQuote();
                this.showNotification('💭 New quote loaded', 'success');
            } catch (error) {
                this.showNotification('❌ Quote update failed', 'error');
            }
        }
    }

    async refreshSounds() {
        if (window.soundAPI) {
            try {
                await window.soundAPI.loadNewSounds();
                this.showNotification('🎵 New sounds loaded', 'success');
            } catch (error) {
                this.showNotification('❌ Sound update failed', 'error');
            }
        }
    }

    async generateNewPalette() {
        if (window.colorAPI) {
            try {
                await window.colorAPI.generateNewPalette();
                this.showNotification('🎨 New palette generated', 'success');
            } catch (error) {
                this.showNotification('❌ Palette generation failed', 'error');
            }
        }
    }

    toggleWeatherWidget() {
        const widget = document.getElementById('weatherWidget');
        if (widget) {
            const isVisible = widget.style.display !== 'none';
            widget.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible && window.weatherAPI) {
                window.weatherAPI.getCurrentWeather();
            }
        }
    }

    toggleBackgrounds() {
        if (window.backgroundManager) {
            window.backgroundManager.toggleBackgrounds();
        }
    }

    async setNASABackground() {
        if (window.backgroundManager) {
            try {
                await window.backgroundManager.setNASABackground();
            } catch (error) {
                this.showNotification('❌ NASA background failed to load', 'error');
            }
        }
    }

    async setArtBackground() {
        if (window.backgroundManager) {
            try {
                await window.backgroundManager.setArtBackground();
            } catch (error) {
                this.showNotification('❌ Art background failed to load', 'error');
            }
        }
    }

    saveQuote() {
        if (window.quoteAPI) {
            window.quoteAPI.saveCurrentQuote();
            this.showNotification('📖 Quote saved', 'success');
        }
    }

    shareQuote() {
        if (window.quoteAPI) {
            window.quoteAPI.shareCurrentQuote();
        }
    }

    async shareApp() {
        const shareData = {
            title: 'Cozy Light - Ambient Lighting App',
            text: 'Create the perfect atmosphere with customizable lighting and sounds',
            url: window.location.href
        };

        try {
            if (this.capabilities.share) {
                await navigator.share(shareData);
            } else if (this.capabilities.clipboard) {
                await navigator.clipboard.writeText(shareData.url);
                this.showNotification('📋 Link copied to clipboard', 'success');
            } else {
                // Fallback: show share modal
                this.showShareModal(shareData);
            }
        } catch (error) {
            console.warn('Share failed:', error);
        }
    }

    toggleFullscreen() {
        if (!this.capabilities.fullscreen) {
            this.showNotification('❌ Fullscreen not supported', 'error');
            return;
        }

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            const icon = fullscreenBtn.querySelector('iconify-icon');
            if (icon) {
                icon.setAttribute('icon', 
                    this.isFullscreen ? 'material-symbols:fullscreen-exit' : 'material-symbols:fullscreen'
                );
            }
        }
    }

    // Modal management
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('animate__animated', 'animate__fadeIn');
            this.state.settingsOpen = true;
        }
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('animate__animated', 'animate__fadeOut', 'animate__fadeIn');
                this.state.settingsOpen = false;
            }, 300);
        }
    }

    openSavePresetModal() {
        const modal = document.getElementById('savePresetModal');
        const preview = document.getElementById('presetPreview');
        
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('animate__animated', 'animate__fadeIn');
        }
        
        if (preview) {
            // Show current state as preview
            preview.style.background = this.state.color;
            preview.style.opacity = this.state.brightness / 100;
        }
        
        // Focus on name input
        const nameInput = document.getElementById('presetName');
        if (nameInput) {
            setTimeout(() => nameInput.focus(), 100);
        }
    }

    closeSavePresetModal() {
        const modal = document.getElementById('savePresetModal');
        if (modal) {
            modal.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('animate__animated', 'animate__fadeOut', 'animate__fadeIn');
            }, 300);
        }
        
        // Clear input
        const nameInput = document.getElementById('presetName');
        if (nameInput) {
            nameInput.value = '';
        }
    }

    closeAllModals() {
        this.closeSettings();
        this.closeSavePresetModal();
    }

    // Custom preset management
    saveCustomPreset(name) {
        const presets = JSON.parse(localStorage.getItem('customPresets') || '{}');
        
        presets[name] = {
            ...this.state,
            name: name,
            created: Date.now()
        };
        
        localStorage.setItem('customPresets', JSON.stringify(presets));
        this.loadCustomPresets();
        this.showNotification(`💾 Preset "${name}" saved`, 'success');
    }

    loadCustomPresets() {
        const presets = JSON.parse(localStorage.getItem('customPresets') || '{}');
        const container = document.getElementById('customPresets');
        
        if (!container) return;
        
        // Clear existing presets (except add button)
        const addBtn = container.querySelector('.add-preset-btn');
        container.innerHTML = '';
        if (addBtn) container.appendChild(addBtn);
        
        // Add custom presets
        Object.keys(presets).forEach(name => {
            const preset = presets[name];
            const presetBtn = document.createElement('button');
            presetBtn.className = 'custom-preset-btn';
            presetBtn.innerHTML = `
                <div class="preset-color" style="background: ${preset.color}"></div>
                <span>${name}</span>
                <button class="delete-preset" data-name="${name}">×</button>
            `;
            
            presetBtn.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-preset')) {
                    this.applyCustomPreset(preset);
                }
            });
            
            const deleteBtn = presetBtn.querySelector('.delete-preset');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCustomPreset(name);
            });
            
            container.appendChild(presetBtn);
        });
    }

    applyCustomPreset(preset) {
        Object.keys(preset).forEach(key => {
            if (this.state.hasOwnProperty(key)) {
                this.state[key] = preset[key];
            }
        });
        
        this.updateUIState();
        this.currentPreset = preset.name;
        
        const currentPresetEl = document.getElementById('currentPreset');
        if (currentPresetEl) {
            currentPresetEl.textContent = preset.name;
        }
        
        this.showNotification(`🎨 Applied "${preset.name}" preset`, 'success');
    }

    deleteCustomPreset(name) {
        if (confirm(`Delete preset "${name}"?`)) {
            const presets = JSON.parse(localStorage.getItem('customPresets') || '{}');
            delete presets[name];
            localStorage.setItem('customPresets', JSON.stringify(presets));
            this.loadCustomPresets();
            this.showNotification(`🗑️ Preset "${name}" deleted`, 'info');
        }
    }

    // Timer methods
    startTimer() {
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 30;
        const action = document.getElementById('timerAction').value;
        
        if (window.timerManager) {
            window.timerManager.start(minutes, action);
            this.state.timerActive = true;
            this.showNotification(`⏰ Timer started for ${minutes} minutes`, 'info');
        }
    }

    pauseTimer() {
        if (window.timerManager) {
            window.timerManager.pause();
            this.showNotification('⏸️ Timer paused', 'info');
        }
    }

    stopTimer() {
        if (window.timerManager) {
            window.timerManager.stop();
            this.state.timerActive = false;
            this.showNotification('⏹️ Timer stopped', 'info');
        }
    }

    // Settings methods
    setTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);
        
        // Update theme color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }
    }

    setAnimationSpeed(speed) {
        const speedMap = {
            slow: 0.5,
            normal: 1,
            fast: 2
        };
        
        const multiplier = speedMap[speed] || 1;
        document.documentElement.style.setProperty('--animation-speed', multiplier);
    }

    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
        
        if (enabled) {
            // Disable expensive effects
            if (window.particleSystem) {
                window.particleSystem.setEnabled(false);
            }
            
            document.body.classList.add('performance-mode');
            this.showNotification('⚡ Performance mode enabled', 'info');
        } else {
            // Re-enable effects
            if (window.particleSystem && localStorage.getItem('particleEffects') !== 'false') {
                window.particleSystem.setEnabled(true);
            }
            
            document.body.classList.remove('performance-mode');
            this.showNotification('🎨 Performance mode disabled', 'info');
        }
        
        localStorage.setItem('performanceMode', enabled);
    }

    async clearCache() {
        try {
            // Clear service worker caches
            if ('serviceWorker' in navigator && 'caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            // Clear API caches
            if (window.imageAPI) window.imageAPI.clearCache();
            if (window.soundAPI) window.soundAPI.clearCache();
            
            this.showNotification('🗑️ Cache cleared successfully', 'success');
        } catch (error) {
            this.showNotification('❌ Failed to clear cache', 'error');
        }
    }

    resetSettings() {
        if (confirm('Reset all settings to default? This cannot be undone.')) {
            // Clear all localStorage
            const keysToKeep = ['hasVisited'];
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            this.showNotification('🔄 Settings reset - Refreshing page...', 'info');
            setTimeout(() => location.reload(), 2000);
        }
    }

    exportSettings() {
        const settings = {
            state: this.state,
            customPresets: JSON.parse(localStorage.getItem('customPresets') || '{}'),
            userSettings: {
                theme: localStorage.getItem('theme'),
                autoSave: localStorage.getItem('autoSave'),
                smoothTransitions: localStorage.getItem('smoothTransitions'),
                // Add other settings as needed
            },
            exportDate: new Date().toISOString(),
            version: this.version
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `cozy-light-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showNotification('📁 Settings exported', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    
                    // Validate settings format
                    if (!settings.version || !settings.state) {
                        throw new Error('Invalid settings file format');
                    }
                    
                    // Apply settings
                    if (settings.state) {
                        this.state = { ...this.state, ...settings.state };
                    }
                    
                    if (settings.customPresets) {
                        localStorage.setItem('customPresets', JSON.stringify(settings.customPresets));
                    }
                    
                    if (settings.userSettings) {
                        Object.keys(settings.userSettings).forEach(key => {
                            if (settings.userSettings[key] !== null) {
                                localStorage.setItem(key, settings.userSettings[key]);
                            }
                        });
                    }
                    
                    this.showNotification('📁 Settings imported - Refreshing page...', 'success');
                    setTimeout(() => location.reload(), 2000);
                    
                } catch (error) {
                    this.showNotification('❌ Failed to import settings', 'error');
                    console.error('Import error:', error);
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }

    // Utility methods
    showKeyboardShortcuts() {
        const shortcuts = [
            'Space: Toggle Power',
            '1-6: Apply Presets',
            'F: Toggle Fullscreen',
            'W: Toggle Weather',
            'Ctrl+S: Save Preset',
            'Ctrl+R: Refresh Quote',
            'Esc: Close Modals',
            'Shift+?: Show This Help'
        ];
        
        this.showNotification(
            '⌨️ Keyboard Shortcuts:\n' + shortcuts.join('\n'),
            'info',
            8000
        );
    }

    showTooltip(element, text) {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        // Show tooltip
        setTimeout(() => tooltip.classList.add('visible'), 10);
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.classList.remove('visible');
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 200);
        }
    }

    showShareModal(shareData) {
        // Create and show a custom share modal
        const modal = document.createElement('div');
        modal.className = 'modal share-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Share Cozy Light</h3>
                    <button class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <p>Share this app with others:</p>
                    <input type="text" value="${shareData.url}" readonly>
                    <div class="share-buttons">
                        <button onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}')">Twitter</button>
                        <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}')">Facebook</button>
                        <button onclick="navigator.clipboard.writeText('${shareData.url}').then(() => alert('Link copied!'))">Copy Link</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Preset navigation
    nextPreset() {
        const presets = ['cozy', 'focus', 'relax', 'romantic', 'nature', 'sunset'];
        const currentIndex = presets.indexOf(this.currentPreset);
        const nextIndex = (currentIndex + 1) % presets.length;
        this.applyPreset(presets[nextIndex]);
    }

    previousPreset() {
        const presets = ['cozy', 'focus', 'relax', 'romantic', 'nature', 'sunset'];
        const currentIndex = presets.indexOf(this.currentPreset);
        const prevIndex = currentIndex === 0 ? presets.length - 1 : currentIndex - 1;
        this.applyPreset(presets[prevIndex]);
    }

    // Motion effects
    triggerMotionEffect() {
        if (this.state.breathe > 0 && window.lightController) {
            window.lightController.triggerMotionPulse();
        }
    }

    // App lifecycle methods
    onAppHidden() {
        // Pause animations and reduce activity when app is hidden
        if (window.particleSystem) {
            window.particleSystem.pause();
        }
        
        if (window.audioManager) {
            window.audioManager.setLowPowerMode(true);
        }
    }

    onAppVisible() {
        // Resume normal activity when app becomes visible
        if (window.particleSystem && localStorage.getItem('particleEffects') !== 'false') {
            window.particleSystem.resume();
        }
        
        if (window.audioManager) {
            window.audioManager.setLowPowerMode(false);
        }
        
        // Refresh APIs if it's been a while
        const lastRefresh = localStorage.getItem('lastAPIRefresh');
        const now = Date.now();
        
        if (!lastRefresh || now - parseInt(lastRefresh) > 30 * 60 * 1000) { // 30 minutes
            this.refreshAPIs();
            localStorage.setItem('lastAPIRefresh', now.toString());
        }
    }

    async refreshAPIs() {
        try {
            const refreshPromises = [];
            
            if (window.weatherAPI) {
                refreshPromises.push(window.weatherAPI.getCurrentWeather());
            }
            
            if (window.quoteAPI) {
                refreshPromises.push(window.quoteAPI.getRandomQuote());
            }
            
            await Promise.allSettled(refreshPromises);
            console.log('🔄 APIs refreshed');
        } catch (error) {
            console.warn('API refresh failed:', error);
        }
    }

    handleResize() {
        // Handle window resize events
        if (window.particleSystem) {
            window.particleSystem.handleResize();
        }
        
        // Update responsive breakpoints
        const width = window.innerWidth;
        document.body.classList.toggle('mobile', width < 768);
        document.body.classList.toggle('tablet', width >= 768 && width < 1024);
        document.body.classList.toggle('desktop', width >= 1024);
    }

    // Public API for external access
    getState() {
        return {
            ...this.state,
            isPoweredOn: this.isPoweredOn,
            currentPreset: this.currentPreset,
            isLoaded: this.isLoaded,
            apiStatus: this.apiStatus,
            capabilities: this.capabilities,
            version: this.version
        };
    }

    setState(newState) {
        Object.keys(newState).forEach(key => {
            if (this.state.hasOwnProperty(key)) {
                this.state[key] = newState[key];
            }
        });
        
        this.updateUIState();
    }

    // Debug methods
    enableDebugMode() {
        this.debugMode = true;
        localStorage.setItem('debugMode', 'true');
        
        // Add debug panel
        this.createDebugPanel();
        
        console.log('🐛 Debug mode enabled');
        console.log('App state:', this.getState());
    }

    createDebugPanel() {
        if (document.getElementById('debugPanel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'debugPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(panel);
        
        // Update debug info every second
        setInterval(() => {
            if (this.debugMode) {
                panel.innerHTML = `
                    <strong>Cozy Light Debug</strong><br>
                    FPS: ${this.performanceMetrics.fps || 'N/A'}<br>
                    Memory: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'} MB<br>
                    APIs: ${Object.values(this.apiStatus).filter(s => s === 'connected').length}/5<br>
                    Preset: ${this.currentPreset}<br>
                    Power: ${this.isPoweredOn ? 'ON' : 'OFF'}<br>
                    Brightness: ${this.state.brightness}%<br>
                    <button onclick="window.cozyLightApp.debugMode = false; this.parentNode.remove()">Close</button>
                `;
            }
        }, 1000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cozyLightApp = new CozyLightApp();
});

// Handle URL parameters for deep linking
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle preset parameter
    const preset = urlParams.get('preset');
    if (preset && window.cozyLightApp) {
        setTimeout(() => {
            window.cozyLightApp.applyPreset(preset);
        }, 1000);
    }
    
    // Handle action parameter
    const action = urlParams.get('action');
    if (action === 'timer' && window.cozyLightApp) {
        setTimeout(() => {
            window.cozyLightApp.startTimer();
        }, 1000);
    }
    
    // Handle share parameter
    const shareData = urlParams.get('share');
    if (shareData) {
        try {
            const data = JSON.parse(decodeURIComponent(shareData));
            console.log('Received shared data:', data);
            // Handle shared content
        } catch (error) {
            console.warn('Invalid share data:', error);
        }
    }
});

// Export for global access
window.CozyLightApp = CozyLightApp;

// Global error handler
window.addEventListener('error', (event) => {
    if (window.cozyLightApp) {
        window.cozyLightApp.errors.push({
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            timestamp: Date.now()
        });
        
        if (window.cozyLightApp.debugMode) {
            console.error('Global error:', event);
        }
    }
});

// Performance observer
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
                console.log(`📊 Page load time: ${entry.loadEventEnd - entry.loadEventStart}ms`);
            }
        }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
}

console.log('🕯️ Cozy Light main.js loaded');
