class BackgroundManager {
    constructor() {
        this.currentScene = null;
        this.isEnabled = true;
        this.transitionDuration = 1000;
        this.backgroundContainer = document.getElementById('backgroundImages');
        this.currentBackground = null;
        this.preloadedImages = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.preloadImages();
        
        // Check if background images are enabled
        this.isEnabled = localStorage.getItem('backgroundImages') !== 'false';
        this.updateVisibility();
    }

    setupEventListeners() {
        // Background toggle button
        const backgroundBtn = document.getElementById('backgroundBtn');
        if (backgroundBtn) {
            backgroundBtn.addEventListener('click', () => this.toggleBackgrounds());
        }

        // Listen for scene changes
        document.addEventListener('sceneChanged', (event) => {
            if (this.isEnabled) {
                this.changeBackground(event.detail.scene);
            }
        });

        // Listen for settings changes
        document.addEventListener('settingsChanged', (event) => {
            if (event.detail.setting === 'backgroundImages') {
                this.isEnabled = event.detail.value;
                this.updateVisibility();
            }
        });
    }

    async preloadImages() {
        if (!window.imageAPI) return;

        const scenes = ['cozy', 'focus', 'relax', 'romantic', 'nature', 'sunset'];
        
        for (const scene of scenes) {
            try {
                const imageUrl = await window.imageAPI.getImageForScene(scene);
                this.preloadedImages.set(scene, imageUrl);
                
                // Update the background element
                const bgElement = document.querySelector(`[data-scene="${scene}"]`);
                if (bgElement) {
                    bgElement.style.backgroundImage = `url('${imageUrl}')`;
                }
            } catch (error) {
                console.warn(`Failed to preload image for ${scene}:`, error);
            }
        }
    }

    async changeBackground(scene) {
        if (!this.isEnabled || !this.backgroundContainer) return;

        const targetBackground = this.backgroundContainer.querySelector(`[data-scene="${scene}"]`);
        if (!targetBackground) return;

        // If no image is loaded yet, try to load it
        if (!this.preloadedImages.has(scene)) {
            try {
                const imageUrl = await window.imageAPI.getImageForScene(scene);
                targetBackground.style.backgroundImage = `url('${imageUrl}')`;
                this.preloadedImages.set(scene, imageUrl);
            } catch (error) {
                console.warn(`Failed to load background for ${scene}:`, error);
                return;
            }
        }

        // Fade out current background
        if (this.currentBackground && this.currentBackground !== targetBackground) {
            gsap.to(this.currentBackground, {
                opacity: 0,
                duration: this.transitionDuration / 1000,
                ease: "power2.inOut"
            });
        }

        // Fade in new background
        gsap.to(targetBackground, {
            opacity: 0.3, // Subtle background opacity
            duration: this.transitionDuration / 1000,
            ease: "power2.inOut"
        });

        this.currentBackground = targetBackground;
        this.currentScene = scene;

        // Dispatch event
        document.dispatchEvent(new CustomEvent('backgroundChanged', {
            detail: { scene, imageUrl: this.preloadedImages.get(scene) }
        }));
    }

    toggleBackgrounds() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('backgroundImages', this.isEnabled);
        this.updateVisibility();

        // Update button state
        const backgroundBtn = document.getElementById('backgroundBtn');
        if (backgroundBtn) {
            backgroundBtn.classList.toggle('active', this.isEnabled);
        }

        // Show notification
        if (window.notificationManager) {
            window.notificationManager.show({
                title: this.isEnabled ? '🖼️ Backgrounds Enabled' : '🚫 Backgrounds Disabled',
                message: this.isEnabled ? 'Dynamic backgrounds are now active' : 'Backgrounds have been turned off',
                type: 'info',
                duration: 2000
            });
        }
    }

    updateVisibility() {
        if (!this.backgroundContainer) return;

        if (this.isEnabled) {
            this.backgroundContainer.style.display = 'block';
            if (this.currentScene) {
                this.changeBackground(this.currentScene);
            }
        } else {
            this.backgroundContainer.style.display = 'none';
        }
    }

    async refreshCurrentBackground() {
        if (!this.currentScene || !this.isEnabled) return;

        try {
            // Clear cache for current scene
            if (window.imageAPI) {
                window.imageAPI.imageCache.delete(`${this.currentScene}_1920x1080`);
            }

            // Load new image
            const imageUrl = await window.imageAPI.getImageForScene(this.currentScene);
            const bgElement = this.backgroundContainer.querySelector(`[data-scene="${this.currentScene}"]`);
            
            if (bgElement) {
                bgElement.style.backgroundImage = `url('${imageUrl}')`;
                this.preloadedImages.set(this.currentScene, imageUrl);
            }

            if (window.notificationManager) {
                window.notificationManager.show({
                    title: '🔄 Background Refreshed',
                    message: 'New background image loaded',
                    type: 'success',
                    duration: 2000
                });
            }
        } catch (error) {
            console.error('Failed to refresh background:', error);
        }
    }

    async setCustomBackground(imageFile) {
        try {
            const imageUrl = URL.createObjectURL(imageFile);
            
            // Create temporary background element
            const customBg = document.createElement('div');
            customBg.className = 'background-image custom-background';
            customBg.style.backgroundImage = `url('${imageUrl}')`;
            customBg.style.opacity = '0';
            
            this.backgroundContainer.appendChild(customBg);

            // Fade out current, fade in custom
            if (this.currentBackground) {
                gsap.to(this.currentBackground, {
                    opacity: 0,
                    duration: this.transitionDuration / 1000
                });
            }

            gsap.to(customBg, {
                opacity: 0.3,
                duration: this.transitionDuration / 1000
            });

            this.currentBackground = customBg;
            this.currentScene = 'custom';

        } catch (error) {
            console.error('Failed to set custom background:', error);
        }
    }

    async downloadCurrentBackground() {
        if (!this.currentScene || !this.preloadedImages.has(this.currentScene)) {
            if (window.notificationManager) {
                window.notificationManager.show({
                    title: '❌ No Background',
                    message: 'No background image to download',
                    type: 'error',
                    duration: 2000
                });
            }
            return;
        }

        const imageUrl = this.preloadedImages.get(this.currentScene);
        const filename = `cozy-light-${this.currentScene}-background.jpg`;
        
        if (window.imageAPI) {
            await window.imageAPI.downloadImage(imageUrl, filename);
        }
    }

    getBackgroundInfo() {
        return {
            enabled: this.isEnabled,
            currentScene: this.currentScene,
            preloadedCount: this.preloadedImages.size,
            currentImageUrl: this.currentScene ? this.preloadedImages.get(this.currentScene) : null
        };
    }

    // NASA Astronomy Picture of the Day feature
    async setNASABackground() {
        if (!window.imageAPI) return;

        try {
            const nasaImage = await window.imageAPI.getNASAImage();
            if (nasaImage) {
                const customBg = document.createElement('div');
                customBg.className = 'background-image nasa-background';
                customBg.style.backgroundImage = `url('${nasaImage.url}')`;
                customBg.style.opacity = '0';
                
                this.backgroundContainer.appendChild(customBg);

                if (this.currentBackground) {
                    gsap.to(this.currentBackground, { opacity: 0, duration: 1 });
                }

                gsap.to(customBg, { opacity: 0.2, duration: 1 });

                this.currentBackground = customBg;
                this.currentScene = 'nasa';

                // Show info about the image
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '🚀 NASA Image of the Day',
                        message: nasaImage.title,
                        type: 'info',
                        duration: 5000
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load NASA background:', error);
        }
    }

    // Art background from museum APIs
    async setArtBackground() {
        if (!window.imageAPI) return;

        try {
            const artwork = await window.imageAPI.getRandomArtwork();
            if (artwork) {
                const customBg = document.createElement('div');
                customBg.className = 'background-image art-background';
                customBg.style.backgroundImage = `url('${artwork.url}')`;
                customBg.style.opacity = '0';
                
                this.backgroundContainer.appendChild(customBg);

                if (this.currentBackground) {
                    gsap.to(this.currentBackground, { opacity: 0, duration: 1 });
                }

                gsap.to(customBg, { opacity: 0.15, duration: 1 });

                this.currentBackground = customBg;
                this.currentScene = 'art';

                // Show info about the artwork
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '🎨 Museum Artwork',
                        message: `${artwork.title} by ${artwork.artist}`,
                        type: 'info',
                        duration: 5000
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load art background:', error);
        }
    }
}

// Initialize background manager
window.backgroundManager = new BackgroundManager();
