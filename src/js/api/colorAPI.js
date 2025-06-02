class ColorAPI {
    constructor() {
        this.currentPalette = [];
        this.paletteHistory = [];
        this.maxHistory = 10;
    }

    async generateRandomPalette(count = 5) {
        try {
            // Try Coolors API first
            const palette = await this.getCoolorsPalette(count);
            if (palette.length > 0) {
                return palette;
            }
        } catch (error) {
            console.warn('Coolors API failed, using fallback:', error);
        }

        // Fallback to algorithmic generation
        return this.generateAlgorithmicPalette(count);
    }

    async getCoolorsPalette(count = 5) {
        try {
            // Note: Coolors doesn't have a public API, so we'll use a different approach
            // Generate palette using color theory
            const baseHue = Math.random() * 360;
            const palette = [];

            for (let i = 0; i < count; i++) {
                const hue = (baseHue + (i * 360 / count)) % 360;
                const saturation = 60 + Math.random() * 40; // 60-100%
                const lightness = 40 + Math.random() * 40;  // 40-80%
                
                const color = chroma.hsl(hue, saturation / 100, lightness / 100).hex();
                palette.push({
                    hex: color,
                    name: this.getColorName(color),
                    hsl: chroma(color).hsl()
                });
            }

            return palette;
        } catch (error) {
            throw new Error('Failed to generate palette');
        }
    }

    generateAlgorithmicPalette(count = 5) {
        const schemes = ['monochromatic', 'analogous', 'complementary', 'triadic', 'tetradic'];
        const scheme = schemes[Math.floor(Math.random() * schemes.length)];
        const baseColor = chroma.random();

        let palette = [];

        switch (scheme) {
            case 'monochromatic':
                palette = this.generateMonochromatic(baseColor, count);
                break;
            case 'analogous':
                palette = this.generateAnalogous(baseColor, count);
                break;
            case 'complementary':
                palette = this.generateComplementary(baseColor, count);
                break;
            case 'triadic':
                palette = this.generateTriadic(baseColor, count);
                break;
            case 'tetradic':
                palette = this.generateTetradic(baseColor, count);
                break;
        }

        return palette.map(color => ({
            hex: color.hex(),
            name: this.getColorName(color.hex()),
            hsl: color.hsl(),
            scheme: scheme
        }));
    }

    generateMonochromatic(baseColor, count) {
        const palette = [];
        const baseHue = baseColor.get('hsl.h');
        const baseSat = baseColor.get('hsl.s');

        for (let i = 0; i < count; i++) {
            const lightness = 0.2 + (i / (count - 1)) * 0.6; // 20% to 80%
            palette.push(chroma.hsl(baseHue, baseSat, lightness));
        }

        return palette;
    }

    generateAnalogous(baseColor, count) {
        const palette = [];
        const baseHue = baseColor.get('hsl.h');
        const spread = 60; // degrees

        for (let i = 0; i < count; i++) {
            const hue = (baseHue + (i - Math.floor(count/2)) * (spread / count)) % 360;
            const saturation = 0.6 + Math.random() * 0.3;
            const lightness = 0.4 + Math.random() * 0.4;
            palette.push(chroma.hsl(hue, saturation, lightness));
        }

        return palette;
    }

    generateComplementary(baseColor, count) {
        const palette = [];
        const baseHue = baseColor.get('hsl.h');
        const complementHue = (baseHue + 180) % 360;

        for (let i = 0; i < count; i++) {
            const hue = i % 2 === 0 ? baseHue : complementHue;
            const saturation = 0.5 + Math.random() * 0.4;
            const lightness = 0.3 + Math.random() * 0.5;
            palette.push(chroma.hsl(hue, saturation, lightness));
        }

        return palette;
    }

    generateTriadic(baseColor, count) {
        const palette = [];
        const baseHue = baseColor.get('hsl.h');
        const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];

        for (let i = 0; i < count; i++) {
            const hue = hues[i % 3];
            const saturation = 0.6 + Math.random() * 0.3;
            const lightness = 0.4 + Math.random() * 0.4;
            palette.push(chroma.hsl(hue, saturation, lightness));
        }

        return palette;
    }

    generateTetradic(baseColor, count) {
        const palette = [];
        const baseHue = baseColor.get('hsl.h');
        const hues = [
            baseHue, 
            (baseHue + 90) % 360, 
            (baseHue + 180) % 360, 
            (baseHue + 270) % 360
        ];

        for (let i = 0; i < count; i++) {
            const hue = hues[i % 4];
            const saturation = 0.5 + Math.random() * 0.4;
            const lightness = 0.3 + Math.random() * 0.5;
            palette.push(chroma.hsl(hue, saturation, lightness));
        }

        return palette;
    }

    getColorName(hex) {
        // Simple color naming based on hue
        const color = chroma(hex);
        const hue = color.get('hsl.h') || 0;
        const saturation = color.get('hsl.s');
        const lightness = color.get('hsl.l');

        let name = '';

        // Determine base color name
        if (saturation < 0.1) {
            if (lightness > 0.9) name = 'White';
            else if (lightness < 0.1) name = 'Black';
            else name = 'Gray';
        } else {
            if (hue < 15 || hue >= 345) name = 'Red';
            else if (hue < 45) name = 'Orange';
            else if (hue < 75) name = 'Yellow';
            else if (hue < 105) name = 'Yellow Green';
            else if (hue < 135) name = 'Green';
            else if (hue < 165) name = 'Blue Green';
            else if (hue < 195) name = 'Cyan';
            else if (hue < 225) name = 'Blue';
            else if (hue < 255) name = 'Blue Violet';
            else if (hue < 285) name = 'Violet';
            else if (hue < 315) name = 'Magenta';
            else name = 'Red Violet';
        }

        // Add modifiers
        if (saturation > 0.1) {
            if (lightness > 0.8) name = 'Light ' + name;
            else if (lightness < 0.3) name = 'Dark ' + name;
            
            if (saturation < 0.3) name = 'Pale ' + name;
            else if (saturation > 0.8) name = 'Vivid ' + name;
        }

        return name;
    }

    async renderPalette(containerId = 'colorPalette') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.currentPalette.length === 0) {
            this.currentPalette = await this.generateRandomPalette();
        }

        container.innerHTML = this.currentPalette.map((color, index) => `
            <div class="color-preset" 
                 data-color="${color.hex}" 
                 style="background: ${color.hex};" 
                 title="${color.name} (${color.hex})"
                 data-index="${index}">
                <div class="color-info">
                    <span class="color-name">${color.name}</span>
                    <span class="color-hex">${color.hex}</span>
                </div>
            </div>
        `).join('');

        // Add click events
        container.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                this.selectColor(color);
                
                // Update active state
                container.querySelectorAll('.color-preset').forEach(p => 
                    p.classList.remove('active')
                );
                preset.classList.add('active');
            });
        });
    }

    selectColor(hex) {
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.value = hex;
            colorPicker.dispatchEvent(new Event('change'));
        }

        // Update light controller if available
        if (window.lightController) {
            window.lightController.setColor(hex);
        }
    }

    async generateNewPalette() {
        // Save current palette to history
        if (this.currentPalette.length > 0) {
            this.paletteHistory.unshift([...this.currentPalette]);
            if (this.paletteHistory.length > this.maxHistory) {
                this.paletteHistory.pop();
            }
        }

        // Generate new palette
        this.currentPalette = await this.generateRandomPalette();
        await this.renderPalette();

        // Show notification
        if (window.notificationManager) {
            window.notificationManager.show({
                title: '🎨 New Palette Generated',
                message: `${this.currentPalette[0].scheme || 'Random'} color scheme`,
                type: 'success',
                duration: 3000
            });
        }
    }

    getHarmoniousColors(baseColor, count = 3) {
        const base = chroma(baseColor);
        const baseHue = base.get('hsl.h');
        const colors = [];

        // Generate harmonious colors using golden ratio
        const goldenRatio = 137.508; // Golden angle in degrees

        for (let i = 0; i < count; i++) {
            const hue = (baseHue + i * goldenRatio) % 360;
            const saturation = Math.max(0.3, base.get('hsl.s') + (Math.random() - 0.5) * 0.3);
            const lightness = Math.max(0.2, Math.min(0.8, base.get('hsl.l') + (Math.random() - 0.5) * 0.4));
            
            colors.push(chroma.hsl(hue, saturation, lightness).hex());
        }

        return colors;
    }

    getColorTemperature(hex) {
        const color = chroma(hex);
        const [r, g, b] = color.rgb();
        
        // Simplified color temperature calculation
        if (r > g && r > b) return 'warm';
        if (b > r && b > g) return 'cool';
        return 'neutral';
    }

    adjustColorForAmbient(hex, ambientType) {
        const color = chroma(hex);
        
        switch (ambientType) {
            case 'cozy':
                return color.set('hsl.h', '+10').set('hsl.s', '+0.1').hex();
            case 'focus':
                return color.set('hsl.s', '-0.2').set('hsl.l', '+0.1').hex();
            case 'relax':
                return color.set('hsl.h', '-10').set('hsl.s', '-0.1').hex();
            case 'romantic':
                return color.set('hsl.h', '+20').set('hsl.s', '+0.2').hex();
            default:
                return hex;
        }
    }
}

// Initialize color API
window.colorAPI = new ColorAPI();
