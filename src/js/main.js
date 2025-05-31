// Main application initialization and global functionality
class CozyLightApp {
    constructor() {
        this.lightController = null;
        this.isInitialized = false;
        this.serviceWorker = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startApp());
            } else {
                this.startApp();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showCriticalError();
        }
    }
    
    async startApp() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Initialize PWA features
            await this.initializePWA();
            
            // Initialize light controller
            this.lightController = new LightController();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Initialize keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Check for updates
            this.checkForUpdates();
            
            // Hide loading state
            this.hideLoadingState();
            
            this.isInitialized = true;
            console.log('🕯️ Cozy Light App initialized successfully!');
            
        } catch (error) {
            console.error('Failed to start app:', error);
            this.showCriticalError();
        }
    }
    
    showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>🕯️ Cozy Light</h2>
                <p>Setting up your perfect atmosphere...</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        document.body.appendChild(loadingOverlay);
    }
    
    hideLoadingState() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 500);
        }
    }
    
    async initializePWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.serviceWorker = registration;
                console.log('Service Worker registered successfully');
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });
                
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
        
        // Handle install prompt
        this.setupInstallPrompt();
        
        // Handle offline/online status
        this.setupOfflineHandling();
    }
    
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            this.showInstallButton(deferredPrompt);
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.lightController?.showMessage('App installed successfully!', 'success');
        });
    }
    
    showInstallButton(deferredPrompt) {
        const installBtn = document.createElement('button');
        installBtn.textContent = '📱 Install App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 140, 66, 0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        installBtn.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            
            deferredPrompt = null;
            installBtn.remove();
        });
        
        document.body.appendChild(installBtn);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installBtn.parentNode) {
                installBtn.style.opacity = '0';
                setTimeout(() => installBtn.remove(), 300);
            }
        }, 10000);
    }
    
    setupOfflineHandling() {
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                this.lightController?.showMessage('Back online!', 'success');
            } else {
                this.lightController?.showMessage('You are offline. Some features may be limited.', 'error');
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }
    
    setupGlobalEvents() {
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // App is hidden, maybe reduce animations
                this.pauseNonEssentialAnimations();
            } else {
                // App is visible again
                this.resumeAnimations();
            }
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Handle orientation change on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 500);
        });
        
        // Prevent context menu on long press (mobile)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.slider') || e.target.closest('.color-preset')) {
                e.preventDefault();
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }
            
            const { key, ctrlKey, altKey } = e;
            
            // Brightness controls
            if (key === 'ArrowUp' && !ctrlKey && !altKey) {
                e.preventDefault();
                this.adjustBrightness(5);
            } else if (key === 'ArrowDown' && !ctrlKey && !altKey) {
                e.preventDefault();
                this.adjustBrightness(-5);
            }
            
            // Preset shortcuts
            else if (key >= '1' && key <= '6' && !ctrlKey && !altKey) {
                e.preventDefault();
                const presets = ['cozy', 'focus', 'relax', 'romantic', 'energize', 'sunset'];
                const presetIndex = parseInt(key) - 1;
                if (presets[presetIndex]) {
                    this.lightController?.applyPreset(presets[presetIndex]);
                }
            }
            
            // Toggle advanced controls
            else if (key === 'a' && !ctrlKey && !altKey) {
                e.preventDefault();
                this.lightController?.toggleAdvancedControls();
            }
            
            // Emergency off (Escape)
            else if (key === 'Escape') {
                e.preventDefault();
                this.lightController?.setBrightness(0);
                this.lightController?.showMessage('Emergency off activated', 'success');
            }
            
            // Help
            else if (key === '?' || (key === '/' && e.shiftKey)) {
                e.preventDefault();
                this.showKeyboardHelp();
            }
        });
    }
    
    adjustBrightness(delta) {
        if (!this.lightController) return;
        
        const currentBrightness = this.lightController.currentSettings.brightness;
        const newBrightness = Math.max(0, Math.min(100, currentBrightness + delta));
        
        this.lightController.setBrightness(newBrightness);
        this.lightController.brightnessSlider.value = newBrightness;
    }
    
    showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <div class="help-shortcuts">
                    <div class="shortcut-item">
                        <kbd>↑</kbd> <kbd>↓</kbd>
                        <span>Adjust brightness</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>1</kbd> - <kbd>6</kbd>
                        <span>Quick presets</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>A</kbd>
                        <span>Toggle advanced controls</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Emergency off</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>?</kbd>
                        <span>Show this help</span>
                    </div>
                </div>
                <button class="close-help">Close</button>
            </div>
        `;
        
        helpModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(helpModal);
        
        // Close on click outside or close button
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal || e.target.classList.contains('close-help')) {
                helpModal.remove();
            }
        });
        
        // Close on Escape
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                helpModal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }
    
    pauseNonEssentialAnimations() {
        // Reduce flicker effects when tab is not visible
        if (this.lightController?.flickerInterval) {
            clearInterval(this.lightController.flickerInterval);
        }
    }
    
    resumeAnimations() {
        // Resume animations when tab becomes visible
        if (this.lightController) {
            this.lightController.updateFlicker();
        }
    }
    
    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
        
        // Adjust control sizes for mobile
        if (isMobile) {
            this.optimizeForMobile();
        } else {
            this.optimizeForDesktop();
        }
    }
    
    optimizeForMobile() {
        // Mobile-specific optimizations
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            slider.style.height = '8px';
        });
    }
    
    optimizeForDesktop() {
        // Desktop-specific optimizations
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            slider.style.height = '6px';
        });
    }
    
    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateAvailable();
            }
        });
    }
    
    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>🆕 New version available!</span>
                <button class="update-btn">Update Now</button>
                <button class="dismiss-btn">Later</button>
            </div>
        `;
        
        updateBanner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: var(--accent-color);
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(updateBanner);
        
        updateBanner.querySelector('.update-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        updateBanner.querySelector('.dismiss-btn').addEventListener('click', () => {
            updateBanner.remove();
        });
    }
    
    checkForUpdates() {
        // Check for app updates periodically
        setInterval(() => {
            if (this.serviceWorker) {
                this.serviceWorker.update();
            }
        }, 60000); // Check every minute
    }
    
    showCriticalError() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #1a1a1a;
                color: white;
                font-family: 'Segoe UI', sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1>😞 Oops!</h1>
                    <p>Something went wrong while loading Cozy Light.</p>
                    <button onclick="window.location.reload()" style="
                        background: #ff8c42;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-size: 1rem;
                        cursor: pointer;
                        margin-top: 20px;
                    ">Try Again</button>
                </div>
            </div>
        `;
    }
}

// Initialize the app
const app = new CozyLightApp();

// Export for potential external use
window.CozyLightApp = app;
