class WeatherAPI {
    constructor() {
        this.apiKey = localStorage.getItem('weatherApiKey') || 'demo_key';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentWeather = null;
        this.lastUpdate = null;
        this.updateInterval = 30 * 60 * 1000; // 30 minutes
    }

    async getCurrentWeather(lat = null, lon = null) {
        try {
            // Get user location if not provided
            if (!lat || !lon) {
                const position = await this.getUserLocation();
                lat = position.coords.latitude;
                lon = position.coords.longitude;
            }

            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            this.currentWeather = response.data;
            this.lastUpdate = Date.now();
            this.updateWeatherDisplay();
            this.suggestWeatherBasedLighting();
            
            return this.currentWeather;
        } catch (error) {
            console.warn('Weather API error:', error);
            // Fallback to demo weather data
            this.currentWeather = this.getDemoWeather();
            this.updateWeatherDisplay();
            return this.currentWeather;
        }
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: false
            });
        });
    }

    getDemoWeather() {
        return {
            weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
            main: { temp: 22, feels_like: 24 },
            name: 'Demo City'
        };
    }

    updateWeatherDisplay() {
        const widget = document.getElementById('weatherWidget');
        const icon = document.getElementById('weatherIcon');
        const temp = document.getElementById('temperature');
        const desc = document.getElementById('weatherDescription');
        const location = document.getElementById('weatherLocation');

        if (!this.currentWeather) return;

        const weather = this.currentWeather.weather[0];
        const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        
        icon.innerHTML = `<img src="${iconUrl}" alt="${weather.description}">`;
        temp.textContent = `${Math.round(this.currentWeather.main.temp)}°C`;
        desc.textContent = weather.description;
        location.textContent = this.currentWeather.name;

        widget.style.display = 'block';
        widget.classList.add('animate__animated', 'animate__fadeIn');
    }

    suggestWeatherBasedLighting() {
        if (!this.currentWeather) return;

        const weather = this.currentWeather.weather[0].main.toLowerCase();
        const temp = this.currentWeather.main.temp;
        const isNight = this.currentWeather.weather[0].icon.includes('n');

        let suggestedPreset = null;
        let suggestedColors = [];

        // Weather-based lighting suggestions
        switch (weather) {
            case 'rain':
            case 'drizzle':
                suggestedPreset = 'relax';
                suggestedColors = ['#4a90e2', '#7bb3f0', '#a8d0f0'];
                break;
            case 'snow':
                suggestedPreset = 'focus';
                suggestedColors = ['#ffffff', '#f0f8ff', '#e6f3ff'];
                break;
            case 'clear':
                suggestedPreset = isNight ? 'romantic' : 'nature';
                suggestedColors = isNight ? ['#ff6b6b', '#ffa500'] : ['#96ceb4', '#feca57'];
                break;
            case 'clouds':
                suggestedPreset = 'cozy';
                suggestedColors = ['#8e8e93', '#c7c7cc', '#f2f2f7'];
                break;
            case 'thunderstorm':
                suggestedPreset = 'focus';
                suggestedColors = ['#5856d6', '#af52de', '#ff2d92'];
                break;
        }

        // Temperature-based adjustments
        if (temp < 10) {
            suggestedColors = suggestedColors.map(color => 
                chroma(color).set('hsl.h', '+30').hex() // Warmer hues
            );
        } else if (temp > 25) {
            suggestedColors = suggestedColors.map(color => 
                chroma(color).set('hsl.h', '-30').hex() // Cooler hues
            );
        }

        this.showWeatherSuggestion(suggestedPreset, suggestedColors);
    }

    showWeatherSuggestion(preset, colors) {
        const notification = {
            title: '🌤️ Weather-Based Lighting',
            message: `Based on current weather, try "${preset}" preset`,
            type: 'info',
            duration: 8000,
            actions: [
                {
                    text: 'Apply',
                    callback: () => {
                        if (window.presetManager) {
                            window.presetManager.applyPreset(preset);
                        }
                    }
                },
                {
                    text: 'Dismiss',
                    callback: () => {}
                }
            ]
        };

        if (window.notificationManager) {
            window.notificationManager.show(notification);
        }
    }

    startAutoUpdate() {
        setInterval(() => {
            if (Date.now() - this.lastUpdate > this.updateInterval) {
                this.getCurrentWeather();
            }
        }, this.updateInterval);
    }
}

// Initialize weather API
window.weatherAPI = new WeatherAPI();
