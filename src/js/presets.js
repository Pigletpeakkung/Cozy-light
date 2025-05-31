class LightPresets {
    static presets = {
        cozy: {
            name: 'Cozy',
            icon: '🔥',
            brightness: 35,
            color: '#ff8c42',
            warmth: 85,
            saturation: 70,
            flicker: 2,
            description: 'Warm and comfortable'
        },
        focus: {
            name: 'Focus',
            icon: '💡',
            brightness: 85,
            color: '#ffffff',
            warmth: 20,
            saturation: 30,
            flicker: 0,
            description: 'Bright and clear for productivity'
        },
        relax: {
            name: 'Relax',
            icon: '🌙',
            brightness: 25,
            color: '#6b73ff',
            warmth: 90,
            saturation: 60,
            flicker: 1,
            description: 'Calm and soothing'
        },
        romantic: {
            name: 'Romantic',
            icon: '💕',
            brightness: 20,
            color: '#ff6b9d',
            warmth: 95,
            saturation: 80,
            flicker: 3,
            description: 'Soft and intimate'
        },
        energize: {
            name: 'Energize',
            icon: '⚡',
            brightness: 90,
            color: '#4ecdc4',
            warmth: 10,
            saturation: 90,
            flicker: 0,
            description: 'Vibrant and energizing'
        },
        sunset: {
            name: 'Sunset',
            icon: '🌅',
            brightness: 40,
            color: '#ff6b6b',
            warmth: 80,
            saturation: 75,
            flicker: 1,
            description: 'Golden hour vibes'
        }
    };
    
    static getPreset(name) {
        return this.presets[name] || null;
    }
    
    static getAllPresets() {
        return this.presets;
    }
    
    static createCustomPreset(name, settings) {
        this.presets[name] = {
            name: name,
            icon: '⭐',
            ...settings,
            custom: true
        };
    }
}
