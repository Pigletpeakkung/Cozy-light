class SettingsManager {
    static STORAGE_KEY = 'cozyLightSettings';
    
    static getDefaultSettings() {
        return {
            brightness: 50,
            color: '#ffffff',
            warmth: 50,
            saturation: 50,
            flicker: 0,
            lastPreset: null,
            soundVolume: 30,
            activeSound: null,
            timerSettings: {
                duration: 30,
                action: 'off'
            }
        };
    }
    
    static saveSettings(settings) {
        try {
            const currentSettings = this.loadSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }
    
    static loadSettings() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...this.getDefaultSettings(), ...parsed };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        return this.getDefaultSettings();
    }
    
    static resetSettings() {
        localStorage.removeItem(this.STORAGE_KEY);
        return this.getDefaultSettings();
    }
}
