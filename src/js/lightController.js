class LightController {
    constructor() {
        this.currentSettings = SettingsManager.loadSettings();
        this.flickerInterval = null;
        this.timerInterval = null;
        this.timerEndTime = null;
        this.sounds = {};
        this.currentSound = null;
        
        this.init();
    }
    
    init() {
        try {
            this.initializeElements();
            this.bindEvents();
            this.loadSounds();
            this.applySettings(this.currentSettings);
            this.showMessage('Cozy Light initialized successfully!', 'success');
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showMessage('Failed to initialize. Please refresh the page.', 'error');
        }
    }
    
    initializeElements() {
        // Light display elements
        this.lightBulb = document.getElementById('lightBulb');
        this.lightGlow = document.getElementById('lightGlow');
        
        // Control elements
        this.brightnessSlider = document.getElementById('brightness');
        this.colorPicker = document.getElementById('colorPicker');
        this.warmthSlider = document.getElementById('warmth');
        this.saturationSlider = document.getElementById('saturation');
        this.flickerSlider = document.getElementById('flicker');
        
        // Value displays
        this.brightnessValue = document.getElementById('brightnessValue');
        this.warmthValue = document.getElementById('warmthValue');
        this.saturationValue = document.getElementById('saturationValue');
        this.flickerValue = document.getElementById('flickerValue');
        
        // Advanced controls
        this.toggleAdvanced = document.getElementById('toggleAdvanced');
        this.advancedControls = document.getElementById('advancedControls');
        
        // Timer elements
        this.timerMinutes = document.getElementById('timerMinutes');
        this.timerAction = document.getElementById('timerAction');
        this.startTimer = document.getElementById('startTimer');
        this.stopTimer = document.getElementById('stopTimer');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timeRemaining = document.getElementById('timeRemaining');
        
        // Sound elements
        this.soundVolume = document.getElementById('soundVolume');
        
        // Message container
        this.messageContainer = document.getElementById('messageContainer');
    }
    
    bindEvents() {
        // Brightness control
        this.brightnessSlider.addEventListener('input', (e) => {
            this.setBrightness(parseInt(e.target.value));
        });
        
        // Color control
        this.colorPicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });
        
        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.setColor(color);
                this.colorPicker.value = color;
            });
        });
        
        // Warmth control
        this.warmthSlider.addEventListener('input', (e) => {
            this.setWarmth(parseInt(e.target.value));
        });
        
        // Saturation control
        this.saturationSlider.addEventListener('input', (e) => {
            this.setSaturation(parseInt(e.target.value));
        });
        
        // Flicker control
        this.flickerSlider.addEventListener('input', (e) => {
            this.setFlicker(parseInt(e.target.value));
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetName = e.target.dataset.preset;
                this.applyPreset(presetName);
            });
        });
        
        // Advanced controls toggle
        this.toggleAdvanced.addEventListener('click', () => {
            this.toggleAdvancedControls();
        });
        
        // Timer controls
        this.startTimer.addEventListener('click', () => {
            this.startLightTimer();
        });
        
        this.stopTimer.addEventListener('click', () => {
            this.stopLightTimer();
        });
        
        // Sound controls
        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sound = e.target.dataset.sound;
                this.toggleSound(sound);
            });
        });
        
        this.soundVolume.addEventListener('input', (e) => {
            this.setSoundVolume(parseInt(e.target.value));
        });
        
        // Auto-save settings on change
        this.setupAutoSave();
    }
    
    setBrightness(value) {
        this.currentSettings.brightness = value;
        this.brightnessValue.textContent = `${value}%`;
        this.updateLightDisplay();
        this.saveSettings();
    }
    
    setColor(color) {
        this.currentSettings.color = color;
        this.updateLightDisplay();
        this.saveSettings();
    }
    
    setWarmth(value) {
        this.currentSettings.warmth = value;
        this.warmthValue.textContent = `${value}%`;
        this.updateLightDisplay();
        this.saveSettings();
    }
    
    setSaturation(value) {
        this.currentSettings.saturation = value;
        this.saturationValue.textContent = `${value}%`;
        this.updateLightDisplay();
        this.saveSettings();
    }
    
    setFlicker(value) {
        this.currentSettings.flicker = value;
        this.flickerValue.textContent = `${value}%`;
        this.updateFlicker();
        this.saveSettings();
    }
    
    updateLightDisplay() {
        const { brightness, color, warmth, saturation } = this.currentSettings;
        
        // Convert hex color to HSL for manipulation
        const hsl = this.hexToHsl(color);
        
        // Apply warmth (adjust hue towards red/orange)
        let adjustedHue = hsl.h;
        if (warmth > 50) {
            const warmthFactor = (warmth - 50) / 50;
            adjustedHue = this.lerp(hsl.h, 30, warmthFactor * 0.3); // Move towards orange
        }
        
        // Apply saturation
        const adjustedSaturation = (saturation / 100) * hsl.s;
        
        // Create the final color
        const finalColor = this.hslToHex(adjustedHue, adjustedSaturation, hsl.l);
        
        // Apply to light bulb
        const opacity = brightness / 100;
        this.lightBulb.style.background = `radial-gradient(circle, ${finalColor} 0%, ${this.adjustBrightness(finalColor, -20)} 70%, ${this.adjustBrightness(finalColor, -40)} 100%)`;
        this.lightBulb.style.boxShadow = `0 0 ${20 + brightness}px ${finalColor}`;
        
        // Apply to glow
        this.lightGlow.style.background = `radial-gradient(circle, ${finalColor}${Math.round(opacity * 0.3 * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`;
        this.lightGlow.style.transform = `scale(${1 + (brightness / 100) * 0.5})`;
        
        // Update body background with subtle color influence
        document.body.style.background = `linear-gradient(135deg, #1a1a1a 0%, ${this.adjustBrightness(finalColor, -80)} 100%)`;
    }
    
    updateFlicker() {
        // Clear existing flicker
        if (this.flickerInterval) {
            clearInterval(this.flickerInterval);
            this.flickerInterval = null;
        }
        
        if (this.currentSettings.flicker > 0) {
            const flickerIntensity = this.currentSettings.flicker / 10;
            const flickerSpeed = 100 + (this.currentSettings.flicker * 50);
            
            this.flickerInterval = setInterval(() => {
                const randomFlicker = Math.random() * flickerIntensity;
                const currentOpacity = this.currentSettings.brightness / 100;
                const flickeredOpacity = Math.max(0.1, currentOpacity - randomFlicker);
                
                this.lightBulb.style.opacity = flickeredOpacity;
                this.lightGlow.style.opacity = flickeredOpacity;
                
                setTimeout(() => {
                    this.lightBulb.style.opacity = currentOpacity;
                    this.lightGlow.style.opacity = currentOpacity;
                }, 50);
            }, flickerSpeed);
        }
    }
    
    applyPreset(presetName) {
        const preset = LightPresets.getPreset(presetName);
        if (!preset) {
            this.showMessage(`Preset "${presetName}" not found`, 'error');
            return;
        }
        
        // Update active preset button
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-preset="${presetName}"]`).classList.add('active');
        
        // Apply preset settings
        this.applySettings(preset);
        this.currentSettings.lastPreset = presetName;
        this.saveSettings();
        
        this.showMessage(`Applied "${preset.name}" preset`, 'success');
    }
    
    applySettings(settings) {
        // Update sliders and inputs
        if (settings.brightness !== undefined) {
            this.brightnessSlider.value = settings.brightness;
            this.setBrightness(settings.brightness);
        }
        
        if (settings.color !== undefined) {
            this.colorPicker.value = settings.color;
            this.setColor(settings.color);
        }
        
        if (settings.warmth !== undefined) {
            this.warmthSlider.value = settings.warmth;
            this.setWarmth(settings.warmth);
        }
        
        if (settings.saturation !== undefined) {
            this.saturationSlider.value = settings.saturation;
            this.setSaturation(settings.saturation);
        }
        
        if (settings.flicker !== undefined) {
            this.flickerSlider.value = settings.flicker;
            this.setFlicker(settings.flicker);
        }
    }
    
    toggleAdvancedControls() {
        const isOpen = this.advancedControls.classList.contains('open');
        const toggleIcon = this.toggleAdvanced.querySelector('.toggle-icon');
        
        if (isOpen) {
            this.advancedControls.classList.remove('open');
            toggleIcon.classList.remove('rotated');
        } else {
            this.advancedControls.classList.add('open');
            toggleIcon.classList.add('rotated');
        }
    }
    
    // Timer functionality
    startLightTimer() {
        const minutes = parseInt(this.timerMinutes.value);
        const action = this.timerAction.value;
        
        if (minutes < 1 || minutes > 480) {
            this.showMessage('Timer must be between 1 and 480 minutes', 'error');
            return;
        }
        
        this.timerEndTime = Date.now() + (minutes * 60 * 1000);
        this.timerDisplay.style.display = 'block';
        this.startTimer.disabled = true;
        
        this.timerInterval = setInterval(() => {
            const remaining = this.timerEndTime - Date.now();
            
            if (remaining <= 0) {
                this.executeTimerAction(action);
                this.stopLightTimer();
                return;
            }
            
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            this.timeRemaining.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
        
        this.showMessage(`Timer started for ${minutes} minutes`, 'success');
    }
    
    stopLightTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.timerDisplay.style.display = 'none';
        this.startTimer.disabled = false;
        this.timerEndTime = null;
    }
    
    executeTimerAction(action) {
        switch (action) {
            case 'off':
                this.setBrightness(0);
                this.showMessage('Timer finished - Lights turned off', 'success');
                break;
            case 'dim':
                this.setBrightness(10);
                this.showMessage('Timer finished - Lights dimmed', 'success');
                break;
            case 'cozy':
                this.applyPreset('cozy');
                this.showMessage('Timer finished - Switched to cozy mode', 'success');
                break;
        }
    }
    
    // Sound functionality
    loadSounds() {
        // Note: You'll need to add actual sound files to your assets/sounds/ folder
        this.sounds = {
            rain: new Audio('src/assets/sounds/rain.mp3'),
            fire: new Audio('src/assets/sounds/fireplace.mp3'),
            nature: new Audio('src/assets/sounds/nature.mp3')
        };
        
        // Set up sound properties
        Object.values(this.sounds).forEach(sound => {
            sound.loop = true;
            sound.volume = this.currentSettings.soundVolume / 100;
        });
    }
    
    toggleSound(soundName) {
        // Stop current sound
        if (this.currentSound) {
            this.currentSound.pause();
            this.currentSound.currentTime = 0;
        }
        
        // Update button states
        document.querySelectorAll('.sound-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (soundName === 'off' || soundName === this.currentSettings.activeSound) {
            this.currentSound = null;
            this.currentSettings.activeSound = null;
            this.showMessage('Ambient sound stopped', 'success');
        } else {
            if (this.sounds[soundName]) {
                this.currentSound = this.sounds[soundName];
                this.currentSound.volume = this.currentSettings.soundVolume / 100;
                this.currentSound.play().catch(error => {
                    console.error('Failed to play sound:', error);
                    this.showMessage('Failed to play sound. Check if audio files exist.', 'error');
                    return;
                });
                
                this.currentSettings.activeSound = soundName;
                document.querySelector(`[data-sound="${soundName}"]`).classList.add('active');
                this.showMessage(`Playing ${soundName} sounds`, 'success');
            }
        }
        
        this.saveSettings();
    }
    
    setSoundVolume(volume) {
        this.currentSettings.soundVolume = volume;
        
        if (this.currentSound) {
            this.currentSound.volume = volume / 100;
        }
        
        this.saveSettings();
    }
    
    // Utility functions
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
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
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    hslToHex(h, s, l) {
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
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        const r = hue2rgb(p, q, h + 1/3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1/3);
        
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    setupAutoSave() {
        // Save settings every 2 seconds if there are changes
        setInterval(() => {
            this.saveSettings();
        }, 2000);
    }
    
    saveSettings() {
        SettingsManager.saveSettings(this.currentSettings);
    }
    
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        this.messageContainer.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }
}
