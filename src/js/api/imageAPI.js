class ImageAPI {
    constructor() {
        this.unsplashAccessKey = localStorage.getItem('unsplashApiKey') || null;
        this.currentImages = new Map();
        this.imageCache = new Map();
        this.categories = {
            cozy: ['fireplace', 'cozy', 'warm', 'candles', 'cabin'],
            focus: ['office', 'minimal', 'workspace', 'clean', 'modern'],
            relax: ['bedroom', 'peaceful', 'calm', 'spa', 'zen'],
            romantic: ['candles', 'romantic', 'dinner', 'roses', 'sunset'],
            nature: ['forest', 'nature', 'trees', 'mountains', 'landscape'],
            sunset: ['sunset', 'golden', 'evening', 'sky', 'horizon']
        };
    }

    async getImageForScene(scene, width = 1920, height = 1080) {
        try {
            // Check cache first
            const cacheKey = `${scene}_${width}x${height}`;
            if (this.imageCache.has(cacheKey)) {
                return this.imageCache.get(cacheKey);
            }

            const keywords = this.categories[scene] || ['ambient', 'mood'];
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            
            let imageUrl;
            
            if (this.unsplashAccessKey) {
                imageUrl = await this.getUnsplashImage(randomKeyword, width, height);
            } else {
                // Fallback to Unsplash Source (no API key required)
                imageUrl = `https://source.unsplash.com/${width}x${height}/?${randomKeyword}`;
            }

            // Cache the result
            this.imageCache.set(cacheKey, imageUrl);
            return imageUrl;

        } catch (error) {
            console.warn('Image API error, using fallback:', error);
            return this.getFallbackImage(scene, width, height);
        }
    }

    async getUnsplashImage(query, width = 1920, height = 1080) {
        try {
            const response = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    query: query,
                    orientation: 'landscape',
                    content_filter: 'high'
                },
                headers: {
                    'Authorization': `Client-ID ${this.unsplashAccessKey}`
                }
            });

            const photo = response.data;
            return `${photo.urls.raw}&w=${width}&h=${height}&fit=crop&crop=center`;

        } catch (error) {
            throw new Error('Unsplash API request failed');
        }
    }

    getFallbackImage(scene, width = 1920, height = 1080) {
        const fallbackImages = {
            cozy: `https://picsum.photos/${width}/${height}?random=1&blur=1`,
            focus: `https://picsum.photos/${width}/${height}?random=2&grayscale`,
            relax: `https://picsum.photos/${width}/${height}?random=3&blur=2`,
            romantic: `https://picsum.photos/${width}/${height}?random=4`,
            nature: `https://picsum.photos/${width}/${height}?random=5`,
            sunset: `https://picsum.photos/${width}/${height}?random=6`
        };

        return fallbackImages[scene] || `https://picsum.photos/${width}/${height}?random=7&blur=1`;
    }

    async preloadSceneImages() {
        const scenes = Object.keys(this.categories);
        const loadPromises = scenes.map(scene => this.getImageForScene(scene));
        
        try {
            await Promise.all(loadPromises);
            console.log('Scene images preloaded successfully');
        } catch (error) {
            console.warn('Some images failed to preload:', error);
        }
    }

    async getNASAImage() {
        try {
            const response = await axios.get('https://api.nasa.gov/planetary/apod', {
                params: {
                    api_key: 'DEMO_KEY'
                }
            });

            const apod = response.data;
            if (apod.media_type === 'image') {
                return {
                    url: apod.url,
                    title: apod.title,
                    explanation: apod.explanation,
                    date: apod.date
                };
            }
        } catch (error) {
            console.warn('NASA APOD API error:', error);
        }
        return null;
    }

    async getRandomArtwork() {
        try {
            // Using Metropolitan Museum of Art API (free)
            const response = await axios.get('https://collectionapi.metmuseum.org/public/collection/v1/objects');
            const objectIDs = response.data.objectIDs;
            const randomID = objectIDs[Math.floor(Math.random() * Math.min(1000, objectIDs.length))];
            
            const artworkResponse = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomID}`);
            const artwork = artworkResponse.data;
            
            if (artwork.primaryImage) {
                return {
                    url: artwork.primaryImage,
                    title: artwork.title,
                    artist: artwork.artistDisplayName,
                    date: artwork.objectDate,
                    culture: artwork.culture
                };
            }
        } catch (error) {
            console.warn('Met Museum API error:', error);
        }
        return null;
    }

    createImageElement(src, alt = '') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
            img.alt = alt;
        });
    }

    async applyImageFilter(imageUrl, filter = 'none') {
        try {
            const img = await this.createImageElement(imageUrl);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Apply CSS filter to canvas context
            ctx.filter = this.getCanvasFilter(filter);
            ctx.drawImage(img, 0, 0);
            
            return canvas.toDataURL();
        } catch (error) {
            console.warn('Image filter error:', error);
            return imageUrl; // Return original if filtering fails
        }
    }

    getCanvasFilter(filterType) {
        const filters = {
            blur: 'blur(2px)',
            sepia: 'sepia(0.8)',
            grayscale: 'grayscale(1)',
            vintage: 'sepia(0.5) contrast(1.2) brightness(0.9)',
            warm: 'sepia(0.3) saturate(1.2) brightness(1.1)',
            cool: 'hue-rotate(180deg) saturate(0.8)',
            dramatic: 'contrast(1.5) brightness(0.8) saturate(1.3)'
        };
        
        return filters[filterType] || 'none';
    }

    async downloadImage(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'ambient-background.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    }

    clearCache() {
        this.imageCache.clear();
        console.log('Image cache cleared');
    }

    getCacheSize() {
        return this.imageCache.size;
    }

    getCacheInfo() {
        const cacheEntries = Array.from(this.imageCache.entries());
        return cacheEntries.map(([key, url]) => ({
            key,
            url: url.substring(0, 50) + '...',
            size: new Blob([url]).size
        }));
    }
}

// Initialize image API
window.imageAPI = new ImageAPI();
