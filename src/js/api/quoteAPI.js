class QuoteAPI {
    constructor() {
        this.baseUrl = 'https://api.quotable.io';
        this.currentQuote = null;
        this.categories = ['motivational', 'inspirational', 'wisdom', 'happiness', 'success'];
        this.fallbackQuotes = [
            {
                content: "The light which puts out our eyes is darkness to us. Only that day dawns to which we are awake.",
                author: "Henry David Thoreau"
            },
            {
                content: "Darkness cannot drive out darkness; only light can do that.",
                author: "Martin Luther King Jr."
            },
            {
                content: "There are two ways of spreading light: to be the candle or the mirror that reflects it.",
                author: "Edith Wharton"
            }
        ];
    }

    async getRandomQuote(category = null) {
        try {
            let url = `${this.baseUrl}/random`;
            const params = new URLSearchParams();
            
            if (category) {
                params.append('tags', category);
            }
            
            // Add length constraints for better display
            params.append('minLength', '50');
            params.append('maxLength', '200');
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await axios.get(url, {
                timeout: 5000
            });

            this.currentQuote = response.data;
            this.displayQuote();
            return this.currentQuote;

        } catch (error) {
            console.warn('Quote API error, using fallback:', error);
            this.currentQuote = this.getFallbackQuote();
            this.displayQuote();
            return this.currentQuote;
        }
    }

    getFallbackQuote() {
        return this.fallbackQuotes[Math.floor(Math.random() * this.fallbackQuotes.length)];
    }

    displayQuote() {
        const quoteText = document.getElementById('quoteText');
        const quoteAuthor = document.getElementById('quoteAuthor');
        const quoteContainer = document.querySelector('.quote-container');

        if (!this.currentQuote || !quoteText || !quoteAuthor) return;

        // Animate out
        if (quoteContainer) {
            quoteContainer.style.opacity = '0';
            quoteContainer.style.transform = 'translateY(20px)';
        }

        setTimeout(() => {
            quoteText.textContent = `"${this.currentQuote.content}"`;
            quoteAuthor.textContent = `— ${this.currentQuote.author}`;

            // Animate in
            if (quoteContainer) {
                quoteContainer.style.opacity = '1';
                quoteContainer.style.transform = 'translateY(0)';
            }
        }, 300);
    }

    async getQuotesByAuthor(author) {
        try {
            const response = await axios.get(`${this.baseUrl}/quotes`, {
                params: {
                    author: author,
                    limit: 10
                }
            });

            return response.data.results;
        } catch (error) {
            console.error('Error fetching quotes by author:', error);
            return [];
        }
    }

    async getQuotesByTag(tag) {
        try {
            const response = await axios.get(`${this.baseUrl}/quotes`, {
                params: {
                    tags: tag,
                    limit: 10
                }
            });

            return response.data.results;
        } catch (error) {
            console.error('Error fetching quotes by tag:', error);
            return [];
        }
    }

    getQuoteForMood(mood) {
        const moodTags = {
            happy: 'happiness,joy,success',
            sad: 'wisdom,hope,inspirational',
            motivated: 'motivational,success,wisdom',
            peaceful: 'wisdom,peace,inspirational',
            energetic: 'motivational,success,happiness',
            contemplative: 'wisdom,philosophy,life'
        };

        const tag = moodTags[mood] || 'inspirational';
        return this.getRandomQuote(tag);
    }

    shareQuote() {
        if (!this.currentQuote) return;

        const text = `"${this.currentQuote.content}" — ${this.currentQuote.author}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Inspirational Quote',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text).then(() => {
                if (window.notificationManager) {
                    window.notificationManager.show({
                        title: '📋 Copied to Clipboard',
                        message: 'Quote copied successfully',
                        type: 'success',
                        duration: 2000
                    });
                }
            });
        }
    }

    saveQuote() {
        if (!this.currentQuote) return;

        const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
        
        // Check if already saved
        const exists = savedQuotes.some(q => 
            q.content === this.currentQuote.content && 
            q.author === this.currentQuote.author
        );

        if (!exists) {
            savedQuotes.push({
                ...this.currentQuote,
                savedAt: new Date().toISOString()
            });
            
            localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
            
            if (window.notificationManager) {
                window.notificationManager.show({
                    title: '💾 Quote Saved',
                    message: 'Added to your collection',
                    type: 'success',
                    duration: 2000
                });
            }
        } else {
            if (window.notificationManager) {
                window.notificationManager.show({
                    title: 'ℹ️ Already Saved',
                    message: 'This quote is already in your collection',
                    type: 'info',
                    duration: 2000
                });
            }
        }
    }

    getSavedQuotes() {
        return JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    }

    deleteSavedQuote(index) {
        const savedQuotes = this.getSavedQuotes();
        savedQuotes.splice(index, 1);
        localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    }

    // Auto-refresh quote based on time of day
    getTimeBasedQuote() {
        const hour = new Date().getHours();
        let category;

        if (hour >= 5 && hour < 12) {
            category = 'motivational'; // Morning motivation
        } else if (hour >= 12 && hour < 17) {
            category = 'success'; // Afternoon productivity
        } else if (hour >= 17 && hour < 21) {
            category = 'wisdom'; // Evening reflection
        } else {
            category = 'inspirational'; // Night inspiration
        }

        return this.getRandomQuote(category);
    }

    startAutoRefresh(intervalMinutes = 30) {
        // Initial quote
        this.getTimeBasedQuote();

        // Set up interval
        setInterval(() => {
            this.getTimeBasedQuote();
        }, intervalMinutes * 60 * 1000);
    }
}

// Initialize quote API
window.quoteAPI = new QuoteAPI();
