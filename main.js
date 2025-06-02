class CozyLightApp {
    constructor() {
        this.isLoaded = false;
        this.loadingProgress = 0;
        this.totalLoadingSteps = 8;
        
        this.init();
    }

    async init() {
        try {
            await this.showLoadingScreen();
            await this.loadAPIs();
            await this.initializeComponents();
            await this.setupEventListeners();
            await this.loadUserSettings();
            await this.hideLoadingScreen();
            
            this.isLoaded = true;
            console.log('🕯️ Cozy Light App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorMessage('Failed to load the application');
        }
    }

    async showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (appContainer) appContainer.style.display = 'none';
        
        this.updateLoadingProgress(0, 'Initializing...');
    }

    async loadAPIs() {
        const apis = [
            { name: 'Weather API', init: () => window.weatherAPI?.getCurrentWeather() },
            { name: 'Sound API', init: () => window.soundAPI?.loadDefaultSounds() },
            { name: 'Color API', init: () => window.colorAPI?.renderPalette() },
            { name: 'Quote API', init: () => window.quoteAPI?.getRandomQuote() },
            { name: 'Image API', init: () => window.imageAPI?.preloadSceneImages() }
        ];

        for (let i = 0; i < apis.length; i++) {
            const api = apis[i];
            this.updateLoadingProgress((i + 1) / this.totalLoadingSteps * 50, `Loading ${api.name}...`);
            
            try {
                await api.init();
                await this.delay(200); // Small delay for visual feedback
            } catch (error) {
                console.warn(`${api.name} failed to load:`, error);
            }
        }
    }

    async initializeComponents() {
        const components = [
            'Light Controller',
            'Background Manager',
            'Audio Manager'
        ];

        for (let i = 0; i < components.length; i++) {
            this.updateLoadingProgress(50 + (i + 1) / components.length * 30, `Initializing ${components[i]}...`);
            await this.delay(150);
        }
    }

    async setupEventListeners() {
        this.updateLoadingProgress(80, 'Setting up controls...');

        // API refresh buttons
        this.setupAPIControls();
        
        // Enhanced preset buttons
        this.setupPresetButtons();
        
        // Settings modal
        this.setupSettingsModal();
        
        // Share functionality
        this.setupShareFeatures();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        await this.delay(200);
    }

    setupAPIControls() {
        // Weather button
        const weatherBtn = document.getElementById('weatherBtn');
        if (weatherBtn) {
            weatherBtn.addEventListener('click', async () => {
                const widget = document.getElementById('weatherWidget');
                if (widget.style.display === 'none') {
                    await window.weatherAPI?.getCurrentWeather();
                    widget.style.display = 'block';
                } else {
                    widget.style.display = 'none';
                }
            });
        }

        // Refresh quote button
        const refreshQuoteBtn = document.getElementById('refreshQuote');
        if (refreshQuoteBtn) {
            refreshQuoteBtn.addEventListener('click', () => {
                window.quoteAPI?.getRandomQuote();
            });
        }

        // Generate new color palette
        const generatePaletteBtn = document.getElementById('generatePalette');
        if (generatePaletteBtn) {
            generatePaletteBtn.addEventListener('click', () => {
                window.colorAPI?.generateNewPalette();
            });
        }

        // Refresh sounds
        const refreshSoundsBtn = document.getElementById('refreshSounds');
        if (refreshSoundsBtn) {
            refreshSoundsBtn.addEventListener('click', () => {
                window.soundAPI?.loadNewSounds();
            });
        }
    }

    setupPresetButtons() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const preset = btn.dataset.preset;
                
                // Apply preset
                if (window.presetManager) {
                    window.presetManager.applyPreset(preset);
                }

                // Change background
                if (window.backgroundManager) {
                    await window.backgroundManager.changeBackground(preset);
                }

                // Update active state
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Dispatch scene change event
                document.dispatchEvent(new CustomEvent('sceneChanged', {
                    detail: { scene: preset }
                }));
            });
        });
    }

    setupSettingsModal() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                settingsModal.style.display = 'flex';
                settingsModal.classList.add('animate__animated', 'animate__fadeIn');
            });
        }

        if (closeSettings && settingsModal) {
            closeSettings.addEventListener('click', () => {
                settingsModal.classList.add('animate__animated', 'animate__fadeOut');
                setTimeout(() => {
                    settingsModal.style.display = 'none';
                    settingsModal.classList.remove('animate__animated', 'animate__fadeOut');
                }, 300);
            });
        }

        // Settings tabs
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

        // API key inputs
        this.setupAPIKeyInputs();
    }

    setupAPIKeyInputs() {
        const weatherKeyInput = document.getElementById('weatherApiKey');
        const freesoundKeyInput = document.getElementById('freesoundApiKey');

        if (weatherKeyInput) {
            weatherKeyInput.value = localStorage.getItem('weatherApiKey') || '';
            weatherKeyInput.addEventListener('change', (e) => {
                localStorage.setItem('weatherApiKey', e.target.value);
                if (window.weatherAPI) {
                    window.weatherAPI.apiKey = e.target.value;
                }
            });
        }

        if (freesoundKeyInput) {
            freesoundKeyInput.value = localStorage.getItem('freesoundApiKey') || '';
            freesoundKeyInput.addEventListener('change', (e) => {
                localStorage.setItem('freesoundApiKey', e.target.value);
                if (window.soundAPI) {
                    window.soundAPI.freesoundApiKey = e.target.value;
                }
            });
        }
    }

    setupShareFeatures() {
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareApp());
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ': // Spacebar - toggle power
                    e.preventDefault();
                    document.getElementById('powerBtn')?.click();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    e.preventDefault();
                    const presetIndex = parseInt(e.key) - 1;
                    const presetBtns = document.querySelectorAll('.preset-btn');
                    if (presetBtns[presetIndex]) {
                        presetBtns[presetIndex].click();
                    }
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('fullscreenBtn')?.click();
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        document.getElementById('addPresetBtn')?.click();
                    }
                    break;
                case 'r':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        window.quoteAPI?.getRandomQuote();
                    }
                    break;
            }
        });
    }

    async shareApp() {
        const shareData = {
            title: 'Cozy Light - Ambient Lighting App',
            text: 'Create the perfect atmosphere with customizable lighting and sounds',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareData.url);
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '📋 Link Copied',
                        message: 'App link copied to clipboard',
                        type: 'success',
                        duration: 2000
                    });
                }
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    }

    async loadUserSettings() {
        this.updateLoadingProgress(90, 'Loading your settings...');
        
        // Load saved settings
        const settings = JSON.parse(localStorage.getItem('cozyLightSettings') || '{}');
        
        // Apply settings to various components
        if (settings.theme) {
            document.body.className = `theme-${settings.theme}`;
        }
        
        if (settings.autoSave !== undefined) {
            document.getElementById('autoSave').checked = settings.autoSave;
        }
        
        await this.delay(200);
    }

    async hideLoadingScreen() {
        this.updateLoadingProgress(100, 'Ready!');
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

        // Start auto-refresh for time-based content
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        // Auto-refresh quote every 30 minutes
        if (window.quoteAPI) {
            window.quoteAPI.startAutoRefresh(30);
        }

        // Auto-refresh weather every 30 minutes
        if (window.weatherAPI) {
            window.weatherAPI.startAutoUpdate();
        }
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
    }

    showErrorMessage(message) {
        if (window.notificationManager) {
            window.notificationManager.show({
                title: '❌ Error',
                message: message,
                type: 'error',
                duration: 5000
            });
        } else {
            alert(message);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    getCurrentState() {
        return {
            isLoaded: this.isLoaded,
            currentScene: window.backgroundManager?.currentScene,
            weather: window.weatherAPI?.currentWeather,
            quote: window.quoteAPI?.currentQuote
        };
    }

    async refreshAllAPIs() {
        try {
            await Promise.all([
                window.weatherAPI?.getCurrentWeather(),
                window.quoteAPI?.getRandomQuote(),
                window.colorAPI?.generateNewPalette(),
                window.soundAPI?.loadNewSounds()
            ]);

            if (window.notificationManager) {
                window.notificationManager.show({
                    title: '🔄 APIs Refreshed',
                    message: 'All content has been updated',
                    type: 'success',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Failed to refresh APIs:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cozyLightApp = new CozyLightApp();
});

// Export for global access
window.CozyLightApp = CozyLightApp;
