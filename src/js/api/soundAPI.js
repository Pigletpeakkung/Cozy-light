class SoundAPI {
    constructor() {
        this.freesoundApiKey = localStorage.getItem('freesoundApiKey') || null;
        this.sounds = new Map();
        this.currentCategory = 'nature';
        this.audioContext = null;
        this.masterGain = null;
        this.equalizer = null;
        this.initializeAudioContext();
        this.loadDefaultSounds();
    }

    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.setupEqualizer();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    setupEqualizer() {
        this.equalizer = {
            bass: this.audioContext.createBiquadFilter(),
            mid: this.audioContext.createBiquadFilter(),
            high: this.audioContext.createBiquadFilter()
        };

        // Configure filters
        this.equalizer.bass.type = 'lowshelf';
        this.equalizer.bass.frequency.value = 320;
        
        this.equalizer.mid.type = 'peaking';
        this.equalizer.mid.frequency.value = 1000;
        this.equalizer.mid.Q.value = 0.5;
        
        this.equalizer.high.type = 'highshelf';
        this.equalizer.high.frequency.value = 3200;

        // Connect filters in series
        this.equalizer.bass.connect(this.equalizer.mid);
        this.equalizer.mid.connect(this.equalizer.high);
        this.equalizer.high.connect(this.masterGain);
    }

    loadDefaultSounds() {
        const defaultSounds = {
            nature: [
                {
                    name: 'Forest Rain',
                    url: 'https://www.soundjay.com/misc/sounds-767.mp3',
                    icon: 'cloud-rain',
                    description: 'Gentle rain in the forest'
                },
                {
                    name: 'Ocean Waves',
                    url: 'https://www.soundjay.com/misc/beep-07a.mp3', // Placeholder
                    icon: 'water',
                    description: 'Peaceful ocean waves'
                },
                {
                    name: 'Crackling Fire',
                    url: 'https://www.soundjay.com/misc/fire-crackling-01.mp3',
                    icon: 'fire',
                    description: 'Warm fireplace sounds'
                },
                {
                    name: 'Wind in Trees',
                    url: 'https://www.soundjay.com/misc/wind-chimes-01.mp3',
                    icon: 'wind',
                    description: 'Gentle breeze through leaves'
                }
            ],
            urban: [
                {
                    name: 'Coffee Shop',
                    url: 'https://mynoise.net/Data/Cafe/cafe.mp3',
                    icon: 'coffee',
                    description: 'Busy coffee shop ambiance'
                },
                {
                    name: 'City Rain',
                    url: 'https://mynoise.net/Data/Rain/rain.mp3',
                    icon: 'building',
                    description: 'Rain on city streets'
                }
            ],
            ambient: [
                {
                    name: 'Deep Space',
                    url: 'https://mynoise.net/Data/SpaceShip/spaceship.mp3',
                    icon: 'rocket',
                    description: 'Cosmic ambient sounds'
                },
                {
                    name: 'Underwater',
                    url: 'https://mynoise.net/Data/Underwater/underwater.mp3',
                    icon: 'fish',
                    description: 'Deep ocean ambiance'
                }
            ],
            meditation: [
                {
                    name: 'Singing Bowls',
                    url: 'https://mynoise.net/Data/TibetanBowls/bowls.mp3',
                    icon: 'om',
                    description: 'Tibetan singing bowls'
                },
                {
                    name: 'White Noise',
                    url: 'https://mynoise.net/Data/NoiseGenerator/noise.mp3',
                    icon: 'wave-square',
                    description: 'Pure white noise'
                }
            ]
        };

        this.sounds = new Map(Object.entries(defaultSounds));
        this.renderSoundControls();
    }

    async searchFreesound(query, category = 'ambient') {
        if (!this.freesoundApiKey) {
            console.warn('Freesound API key not provided');
            return [];
        }

        try {
            const response = await axios.get('https://freesound.org/apiv2/search/text/', {
                params: {
                    query: query,
                    token: this.freesoundApiKey,
                    fields: 'id,name,description,previews,duration',
                    page_size: 10,
                    filter: 'duration:[10.0 TO 300.0]' // 10 seconds to 5 minutes
                }
            });

            return response.data.results.map(sound => ({
                name: sound.name,
                url: sound.previews['preview-hq-mp3'],
                icon: this.getCategoryIcon(category),
                description: sound.description.substring(0, 100) + '...',
                duration: sound.duration,
                source: 'freesound'
            }));
        } catch (error) {
            console.error('Freesound API error:', error);
            return [];
        }
    }

    getCategoryIcon(category) {
        const icons = {
            nature: 'tree',
            urban: 'building',
            ambient: 'wave-sine',
            meditation: 'lotus'
        };
        return icons[category] || 'music';
    }

    renderSoundControls() {
        const container = document.getElementById('soundControls');
        const currentSounds = this.sounds.get(this.currentCategory) || [];

        container.innerHTML = currentSounds.map(sound => `
            <div class="sound-item" data-sound="${sound.url}">
                <button class="sound-btn" data-url="${sound.url}" data-name="${sound.name}">
                    <iconify-icon icon="material-symbols:${sound.icon}"></iconify-icon>
                    <div class="sound-info">
                        <span class="sound-name">${sound.name}</span>
                        <span class="sound-description">${sound.description}</span>
                    </div>
                    <div class="sound-controls">
                        <button class="play-btn" data-action="play">
                            <iconify-icon icon="material-symbols:play-arrow"></iconify-icon>
                        </button>
                        <input type="range" class="volume-slider" min="0" max="100" value="50">
                    </div>
                </button>
            </div>
        `).join('');

        this.attachSoundEvents();
    }

    attachSoundEvents() {
        const soundBtns = document.querySelectorAll('.sound-btn');
        const categoryBtns = document.querySelectorAll('.category-btn');

        soundBtns.forEach(btn => {
            const playBtn = btn.querySelector('.play-btn');
            const volumeSlider = btn.querySelector('.volume-slider');
            const url = btn.dataset.url;

            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSound(url, btn.dataset.name);
            });

            volumeSlider.addEventListener('input', (e) => {
                this.setSoundVolume(url, e.target.value / 100);
            });
        });

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchCategory(btn.dataset.category);
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Refresh sounds button
        const refreshBtn = document.getElementById('refreshSounds');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadNewSounds());
        }
    }

    async toggleSound(url, name) {
        const existingSound = this.getActiveSound(url);
        
        if (existingSound && !existingSound.paused) {
            existingSound.pause();
            this.updatePlayButton(url, 'play');
        } else {
            // Stop other sounds in the same category
            this.stopCategorySounds();
            
            try {
                const sound = await this.loadSound(url);
                sound.loop = true;
                sound.play();
                this.updatePlayButton(url, 'pause');
                
                // Show notification
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '🎵 Now Playing',
                        message: name,
                        type: 'success',
                        duration: 3000
                    });
                }
            } catch (error) {
                console.error('Error playing sound:', error);
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '❌ Audio Error',
                        message: 'Could not load sound file',
                        type: 'error',
                        duration: 3000
                    });
                }
            }
        }
    }

    async loadSound(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.crossOrigin = 'anonymous';
            
            audio.addEventListener('canplaythrough', () => {
                if (this.audioContext) {
                    const source = this.audioContext.createMediaElementSource(audio);
                    source.connect(this.equalizer.bass);
                }
                resolve(audio);
            });
            
            audio.addEventListener('error', reject);
            audio.load();
        });
    }

    getActiveSound(url) {
        return document.querySelector(`audio[src="${url}"]`);
    }

    updatePlayButton(url, action) {
        const btn = document.querySelector(`[data-url="${url}"] .play-btn iconify-icon`);
        if (btn) {
            btn.setAttribute('icon', 
                action === 'play' ? 'material-symbols:play-arrow' : 'material-symbols:pause'
            );
        }
    }

    stopCategorySounds() {
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            if (!audio.paused) {
                audio.pause();
                this.updatePlayButton(audio.src, 'play');
            }
        });
    }

    setSoundVolume(url, volume) {
        const sound = this.getActiveSound(url);
        if (sound) {
            sound.volume = volume;
        }
    }

    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
        
        // Also set HTML5 audio volume as fallback
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = volume;
        });
    }

    setEqualizer(band, gain) {
        if (!this.equalizer || !this.equalizer[band]) return;
        
        this.equalizer[band].gain.value = gain;
    }

    switchCategory(category) {
        this.currentCategory = category;
        this.stopCategorySounds();
        this.renderSoundControls();
    }

    async loadNewSounds() {
        const loadingEl = document.querySelector('.sound-loading');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }

        try {
            // Try to load new sounds from Freesound API
            const queries = {
                nature: 'forest rain birds',
                urban: 'city traffic cafe',
                ambient: 'drone atmosphere space',
                meditation: 'bowl chime meditation'
            };

            const newSounds = await this.searchFreesound(
                queries[this.currentCategory], 
                this.currentCategory
            );

            if (newSounds.length > 0) {
                const currentSounds = this.sounds.get(this.currentCategory) || [];
                this.sounds.set(this.currentCategory, [...currentSounds, ...newSounds]);
                this.renderSoundControls();
                
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '🎵 New Sounds Loaded',
                        message: `Added ${newSounds.length} new ${this.currentCategory} sounds`,
                        type: 'success',
                        duration: 3000
                    });
                }
            }
        } catch (error) {
            console.error('Error loading new sounds:', error);
        } finally {
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
        }
    }
}

// Initialize sound API
window.soundAPI = new SoundAPI();
