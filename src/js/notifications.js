/**
 * Cozy Light - Advanced Notification System
 * Push notifications, in-app alerts, and smart reminders
 * Version 2.0.0
 */

class NotificationManager {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = 'default';
        this.serviceWorkerRegistration = null;
        this.activeNotifications = new Map();
        this.notificationQueue = [];
        this.isProcessingQueue = false;
        this.subscriptionEndpoint = null;
        
        // Configuration
        this.config = {
            enabled: true,
            types: {
                timer: true,
                reminder: true,
                weather: true,
                quote: true,
                system: true,
                achievement: true
            },
            sound: {
                enabled: true,
                volume: 0.5,
                customSounds: true
            },
            vibration: {
                enabled: true,
                patterns: {
                    gentle: [200, 100, 200],
                    urgent: [500, 200, 500, 200, 500],
                    success: [100, 50, 100],
                    warning: [300, 100, 300]
                }
            },
            display: {
                duration: 5000,
                position: 'top-right',
                maxVisible: 3,
                groupSimilar: true
            },
            scheduling: {
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00'
                },
                doNotDisturb: false,
                smartTiming: true
            }
        };

        // Notification templates
        this.templates = new Map();
        
        // Statistics
        this.stats = {
            sent: 0,
            clicked: 0,
            dismissed: 0,
            byType: {}
        };

        this.init();
    }

    /**
     * Initialize notification system
     */
    async init() {
        this.loadSettings();
        this.setupTemplates();
        this.checkSupport();
        await this.requestPermission();
        await this.setupServiceWorker();
        this.setupEventListeners();
        this.startBackgroundSync();
        
        console.log('🔔 Notification manager initialized');
    }

    /**
     * Check browser support
     */
    checkSupport() {
        this.support = {
            notifications: 'Notification' in window,
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            vibration: 'vibrate' in navigator,
            badgeAPI: 'setAppBadge' in navigator
        };

        if (!this.support.notifications) {
            console.warn('🔔 Notifications not supported in this browser');
        }

        return this.support;
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isSupported) return false;

        try {
            if (this.permission === 'default') {
                this.permission = await Notification.requestPermission();
            } else {
                this.permission = Notification.permission;
            }

            if (this.permission === 'granted') {
                console.log('🔔 Notification permission granted');
                return true;
            } else {
                console.warn('🔔 Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('🔔 Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Setup service worker for push notifications
     */
    async setupServiceWorker() {
        if (!this.support.serviceWorker) return;

        try {
            this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
            
            // Setup push subscription if supported
            if (this.support.pushManager) {
                await this.setupPushSubscription();
            }

            console.log('🔔 Service worker ready for notifications');
        } catch (error) {
            console.error('🔔 Error setting up service worker:', error);
        }
    }

    /**
     * Setup push subscription
     */
    async setupPushSubscription() {
        try {
            const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
            
            if (!subscription) {
                // Create new subscription
                const newSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.getVapidKey()
                });
                
                this.subscriptionEndpoint = newSubscription.endpoint;
                await this.sendSubscriptionToServer(newSubscription);
            } else {
                this.subscriptionEndpoint = subscription.endpoint;
            }
        } catch (error) {
            console.error('🔔 Error setting up push subscription:', error);
        }
    }

    /**
     * Get VAPID key for push notifications
     */
    getVapidKey() {
        // In a real app, this would be your VAPID public key
        return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmLWjMpS_7VnYkYdYWjAlBQ7VlGCJUjuOiMjwId2kOdA';
    }

    /**
     * Send subscription to server
     */
    async sendSubscriptionToServer(subscription) {
        // In a real app, send this to your push notification server
        console.log('🔔 Push subscription:', subscription);
        
        // Store locally for demo purposes
        localStorage.setItem('cozylight_push_subscription', JSON.stringify(subscription));
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Timer events
        document.addEventListener('timerComplete', (e) => {
            this.showTimerNotification(e.detail);
        });

        // Weather updates
        document.addEventListener('weatherUpdate', (e) => {
            this.showWeatherNotification(e.detail);
        });

        // Quote of the day
        document.addEventListener('newQuote', (e) => {
            this.showQuoteNotification(e.detail);
        });

        // System events
        document.addEventListener('systemAlert', (e) => {
            this.showSystemNotification(e.detail);
        });

        // Achievement unlocked
        document.addEventListener('achievementUnlocked', (e) => {
            this.showAchievementNotification(e.detail);
        });

        // App state changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onAppHidden();
            } else {
                this.onAppVisible();
            }
        });

        // Service worker messages
        if (this.support.serviceWorker) {
            navigator.serviceWorker.addEventListener('message', (e) => {
                this.handleServiceWorkerMessage(e.data);
            });
        }

        // Notification click handling
        document.addEventListener('notificationclick', (e) => {
            this.handleNotificationClick(e.detail);
        });
    }

    /**
     * Setup notification templates
     */
    setupTemplates() {
        this.templates.set('timer', {
            icon: '⏰',
            badge: 'assets/icons/timer-badge.png',
            sound: 'assets/sounds/timer-complete.mp3',
            vibration: this.config.vibration.patterns.gentle,
            actions: [
                { action: 'snooze', title: 'Snooze 5min', icon: 'assets/icons/snooze.png' },
                { action: 'dismiss', title: 'Dismiss', icon: 'assets/icons/dismiss.png' }
            ]
        });

        this.templates.set('reminder', {
            icon: '💡',
            badge: 'assets/icons/reminder-badge.png',
            sound: 'assets/sounds/gentle-chime.mp3',
            vibration: this.config.vibration.patterns.gentle,
            actions: [
                { action: 'done', title: 'Mark Done', icon: 'assets/icons/check.png' },
                { action: 'later', title: 'Remind Later', icon: 'assets/icons/clock.png' }
            ]
        });

        this.templates.set('weather', {
            icon: '🌤️',
            badge: 'assets/icons/weather-badge.png',
            sound: 'assets/sounds/nature-chime.mp3',
            vibration: this.config.vibration.patterns.success,
            actions: [
                { action: 'view', title: 'View Details', icon: 'assets/icons/eye.png' },
                { action: 'adjust', title: 'Adjust Lighting', icon: 'assets/icons/bulb.png' }
            ]
        });

        this.templates.set('quote', {
            icon: '✨',
            badge: 'assets/icons/quote-badge.png',
            sound: 'assets/sounds/inspiration.mp3',
            vibration: this.config.vibration.patterns.success,
            actions: [
                { action: 'save', title: 'Save Quote', icon: 'assets/icons/heart.png' },
                { action: 'share', title: 'Share', icon: 'assets/icons/share.png' }
            ]
        });

        this.templates.set('system', {
            icon: '🔧',
            badge: 'assets/icons/system-badge.png',
            sound: 'assets/sounds/notification.mp3',
            vibration: this.config.vibration.patterns.warning,
            actions: [
                { action: 'view', title: 'View', icon: 'assets/icons/eye.png' },
                { action: 'dismiss', title: 'Dismiss', icon: 'assets/icons/x.png' }
            ]
        });

        this.templates.set('achievement', {
            icon: '🏆',
            badge: 'assets/icons/achievement-badge.png',
            sound: 'assets/sounds/achievement.mp3',
            vibration: this.config.vibration.patterns.success,
            actions: [
                { action: 'view', title: 'View Achievement', icon: 'assets/icons/trophy.png' },
                { action: 'share', title: 'Share', icon: 'assets/icons/share.png' }
            ]
        });
    }

    /**
     * Show notification
     */
    async show(type, title, message, options = {}) {
        if (!this.canShowNotification(type)) {
            return null;
        }

        const template = this.templates.get(type) || {};
        const notificationOptions = {
            body: message,
            icon: options.icon || template.icon || 'assets/icons/icon-192x192.png',
            badge: options.badge || template.badge || 'assets/icons/badge-72x72.png',
            tag: options.tag || `cozylight-${type}-${Date.now()}`,
            data: {
                type: type,
                timestamp: Date.now(),
                ...options.data
            },
            requireInteraction: options.persistent || false,
            silent: options.silent || false,
            ...options
        };

        // Add actions if supported
        if (template.actions && this.support.serviceWorker) {
            notificationOptions.actions = template.actions;
        }

        try {
            let notification;

            if (this.serviceWorkerRegistration && options.persistent) {
                // Use service worker for persistent notifications
                notification = await this.serviceWorkerRegistration.showNotification(title, notificationOptions);
            } else {
                // Use regular notification API
                notification = new Notification(title, notificationOptions);
                
                // Setup event handlers
                notification.onclick = (e) => this.handleNotificationClick(e, notificationOptions.data);
                notification.onclose = (e) => this.handleNotificationClose(e, notificationOptions.data);
                notification.onerror = (e) => this.handleNotificationError(e, notificationOptions.data);
            }

            // Store active notification
            this.activeNotifications.set(notificationOptions.tag, {
                notification: notification,
                type: type,
                timestamp: Date.now(),
                data: notificationOptions.data
            });

            // Play sound
            if (!options.silent) {
                this.playNotificationSound(type, template.sound);
            }

            // Vibrate
            this.vibrate(template.vibration);

            // Show in-app notification if app is visible
            if (!document.hidden) {
                this.showInAppNotification(type, title, message, options);
            }

            // Auto-dismiss after duration
            if (options.duration || this.config.display.duration) {
                setTimeout(() => {
                    this.dismiss(notificationOptions.tag);
                }, options.duration || this.config.display.duration);
            }

            // Update statistics
            this.updateStats('sent', type);

            // Update app badge
            this.updateAppBadge();

            console.log('🔔 Notification shown:', title);
            return notification;

        } catch (error) {
            console.error('🔔 Error showing notification:', error);
            return null;
        }
    }

    /**
     * Show timer notification
     */
    showTimerNotification(timerData) {
        const { name, duration, action } = timerData;
        
        this.show('timer', 
            `Timer Complete: ${name}`,
            `Your ${this.formatDuration(duration)} timer has finished.`,
            {
                tag: `timer-${name}`,
                persistent: true,
                data: { timerName: name, action: action }
            }
        );
    }

    /**
     * Show weather notification
     */
    showWeatherNotification(weatherData) {
        if (!this.config.types.weather) return;

        const { condition, temperature, suggestion } = weatherData;
        
        this.show('weather',
            `Weather Update: ${condition}`,
            `${temperature}°C - ${suggestion}`,
            {
                tag: 'weather-update',
                data: { weather: weatherData }
            }
        );
    }

    /**
     * Show quote notification
     */
    showQuoteNotification(quoteData) {
        if (!this.config.types.quote) return;

        const { text, author } = quoteData;
        
        this.show('quote',
            'Daily Inspiration',
            `"${text}" - ${author}`,
            {
                tag: 'daily-quote',
                data: { quote: quoteData }
            }
        );
    }

    /**
     * Show system notification
     */
    showSystemNotification(systemData) {
        if (!this.config.types.system) return;

        const { level, message, action } = systemData;
        
        this.show('system',
            `System ${level.toUpperCase()}`,
            message,
            {
                tag: `system-${level}`,
                persistent: level === 'error',
                data: { level: level, action: action }
            }
        );
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievementData) {
        if (!this.config.types.achievement) return;

        const { title, description, icon } = achievementData;
        
        this.show('achievement',
            `Achievement Unlocked: ${title}`,
            description,
            {
                tag: `achievement-${title}`,
                icon: icon,
                data: { achievement: achievementData }
            }
        );
    }

    /**
     * Show in-app notification
     */
    showInAppNotification(type, title, message, options = {}) {
        const container = this.getInAppContainer();
        const template = this.templates.get(type) || {};
        
        const notification = document.createElement('div');
        notification.className = `in-app-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${template.icon || '🔔'}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-actions">
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to container
        container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, options.duration || this.config.display.duration);

        // Limit visible notifications
        this.limitVisibleNotifications(container);
    }

    /**
     * Get or create in-app notification container
     */
    getInAppContainer() {
        let container = document.getElementById('in-app-notifications');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'in-app-notifications';
            container.className = `notifications-container ${this.config.display.position}`;
            document.body.appendChild(container);
        }

        return container;
    }

    /**
     * Limit visible in-app notifications
     */
    limitVisibleNotifications(container) {
        const notifications = container.querySelectorAll('.in-app-notification');
        
        if (notifications.length > this.config.display.maxVisible) {
            const excess = notifications.length - this.config.display.maxVisible;
            for (let i = 0; i < excess; i++) {
                notifications[i].remove();
            }
        }
    }

    /**
     * Schedule notification
     */
    schedule(type, title, message, scheduledTime, options = {}) {
        const now = Date.now();
        const delay = scheduledTime - now;

        if (delay <= 0) {
            return this.show(type, title, message, options);
        }

        const timeoutId = setTimeout(() => {
            this.show(type, title, message, options);
        }, delay);

        // Store scheduled notification
        const scheduledNotification = {
            id: `scheduled-${Date.now()}`,
            type: type,
            title: title,
            message: message,
            scheduledTime: scheduledTime,
            options: options,
            timeoutId: timeoutId
        };

        this.saveScheduledNotification(scheduledNotification);
        return scheduledNotification.id;
    }

    /**
     * Cancel scheduled notification
     */
    cancelScheduled(id) {
        const scheduled = this.getScheduledNotifications();
        const notification = scheduled.find(n => n.id === id);
        
        if (notification) {
            clearTimeout(notification.timeoutId);
            this.removeScheduledNotification(id);
            return true;
        }
        
        return false;
    }

    /**
     * Dismiss notification
     */
    dismiss(tag) {
        const activeNotification = this.activeNotifications.get(tag);
        
        if (activeNotification) {
            if (activeNotification.notification.close) {
                activeNotification.notification.close();
            }
            this.activeNotifications.delete(tag);
            this.updateAppBadge();
        }

        // Remove in-app notification
        const inAppNotification = document.querySelector(`[data-tag="${tag}"]`);
        if (inAppNotification) {
            inAppNotification.remove();
        }
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        this.activeNotifications.forEach((_, tag) => {
            this.dismiss(tag);
        });

        // Clear in-app notifications
        const container = document.getElementById('in-app-notifications');
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Check if notification can be shown
     */
    canShowNotification(type) {
        if (!this.config.enabled || !this.config.types[type]) {
            return false;
        }

        if (this.permission !== 'granted') {
            return false;
        }

        if (this.config.scheduling.doNotDisturb) {
            return false;
        }

        if (this.config.scheduling.quietHours.enabled && this.isQuietHours()) {
            return false;
        }

        return true;
    }

    /**
     * Check if current time is in quiet hours
     */
    isQuietHours() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHour, startMin] = this.config.scheduling.quietHours.start.split(':').map(Number);
        const [endHour, endMin] = this.config.scheduling.quietHours.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (startTime < endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        } else {
            // Quiet hours span midnight
            return currentTime >= startTime || currentTime <= endTime;
        }
    }

    /**
     * Play notification sound
     */
    playNotificationSound(type, soundFile) {
        if (!this.config.sound.enabled) return;

        try {
            const audio = new Audio(soundFile || 'assets/sounds/notification.mp3');
            audio.volume = this.config.sound.volume;
            audio.play().catch(error => {
                console.warn('🔔 Could not play notification sound:', error);
            });
        } catch (error) {
            console.warn('🔔 Error playing notification sound:', error);
        }
    }

    /**
     * Vibrate device
     */
    vibrate(pattern) {
        if (!this.config.vibration.enabled || !this.support.vibration) return;

        try {
            navigator.vibrate(pattern || this.config.vibration.patterns.gentle);
        } catch (error) {
            console.warn('🔔 Vibration not supported:', error);
        }
    }

    /**
     * Update app badge
     */
    updateAppBadge() {
        if (!this.support.badgeAPI) return;

        const count = this.activeNotifications.size;
        
        try {
            if (count > 0) {
                navigator.setAppBadge(count);
            } else {
                navigator.clearAppBadge();
            }
        } catch (error) {
            console.warn('🔔 Badge API error:', error);
        }
    }

    /**
     * Handle notification click
     */
    handleNotificationClick(event, data) {
        console.log('🔔 Notification clicked:', data);

        // Focus the app window
        if (window.focus) {
            window.focus();
        }

        // Handle specific actions based on notification type
        if (data && data.type) {
            this.handleNotificationAction(data.type, 'click', data);
        }

        // Update statistics
        this.updateStats('clicked', data?.type);

        // Close notification
        if (event.notification) {
            event.notification.close();
        }
    }

    /**
     * Handle notification close
     */
    handleNotificationClose(event, data) {
        console.log('🔔 Notification closed:', data);
        
        // Update statistics
        this.updateStats('dismissed', data?.type);
    }

    /**
     * Handle notification error
     */
    handleNotificationError(event, data) {
        console.error('🔔 Notification error:', event, data);
    }

    /**
     * Handle notification actions
     */
    handleNotificationAction(type, action, data) {
        const actions = {
            timer: {
                snooze: () => this.snoozeTimer(data.timerName),
                dismiss: () => this.dismissTimer(data.timerName)
            },
            reminder: {
                done: () => this.markReminderDone(data.reminderId),
                later: () => this.snoozeReminder(data.reminderId)
            },
            weather: {
                view: () => this.showWeatherDetails(data.weather),
                adjust: () => this.adjustLightingForWeather(data.weather)
            },
            quote: {
                save: () => this.saveQuote(data.quote),
                share: () => this.shareQuote(data.quote)
            },
            achievement: {
                view: () => this.showAchievementDetails(data.achievement),
                share: () => this.shareAchievement(data.achievement)
            }
        };

        if (actions[type] && actions[type][action]) {
            actions[type][action]();
        }
    }

    /**
     * Handle service worker messages
     */
    handleServiceWorkerMessage(data) {
        if (data.type === 'notificationClick') {
            this.handleNotificationClick(data.event, data.data);
        }
    }

    /**
     * App visibility handlers
     */
    onAppHidden() {
        // App went to background - enable push notifications
        console.log('🔔 App hidden - enabling background notifications');
    }

    onAppVisible() {
        // App came to foreground - clear notifications
        console.log('🔔 App visible - clearing notifications');
        this.dismissAll();
        this.updateAppBadge();
    }

    /**
     * Background sync for scheduled notifications
     */
    startBackgroundSync() {
        // Check for scheduled notifications every minute
        setInterval(() => {
            this.processScheduledNotifications();
        }, 60000);
    }

    /**
     * Process scheduled notifications
     */
    processScheduledNotifications() {
        const scheduled = this.getScheduledNotifications();
        const now = Date.now();

        scheduled.forEach(notification => {
            if (notification.scheduledTime <= now) {
                this.show(
                    notification.type,
                    notification.title,
                    notification.message,
                    notification.options
                );
                this.removeScheduledNotification(notification.id);
            }
        });
    }

    /**
     * Utility functions
     */
    formatDuration(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Statistics
     */
    updateStats(action, type) {
        this.stats[action]++;
        
        if (type) {
            if (!this.stats.byType[type]) {
                this.stats.byType[type] = { sent: 0, clicked: 0, dismissed: 0 };
            }
            this.stats.byType[type][action]++;
        }

        this.saveStats();
    }

    getStats() {
        return { ...this.stats };
    }

    resetStats() {
        this.stats = {
            sent: 0,
            clicked: 0,
            dismissed: 0,
            byType: {}
        };
        this.saveStats();
    }

    /**
     * Settings management
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.saveSettings();
    }

    getConfig() {
        return { ...this.config };
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('cozylight_notifications');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings };
            }
        } catch (error) {
            console.warn('Failed to load notification settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('cozylight_notifications', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save notification settings:', error);
        }
    }

    saveStats() {
        try {
            localStorage.setItem('cozylight_notification_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Failed to save notification stats:', error);
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('cozylight_notification_stats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load notification stats:', error);
        }
    }

    /**
     * Scheduled notifications storage
     */
    saveScheduledNotification(notification) {
        const scheduled = this.getScheduledNotifications();
        scheduled.push(notification);
        localStorage.setItem('cozylight_scheduled_notifications', JSON.stringify(scheduled));
    }

    getScheduledNotifications() {
        try {
            const saved = localStorage.getItem('cozylight_scheduled_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    removeScheduledNotification(id) {
        const scheduled = this.getScheduledNotifications();
        const filtered = scheduled.filter(n => n.id !== id);
        localStorage.setItem('cozylight_scheduled_notifications', JSON.stringify(filtered));
    }

    /**
     * Action handlers
     */
    snoozeTimer(timerName) {
        // Snooze timer for 5 minutes
        const snoozeTime = Date.now() + (5 * 60 * 1000);
        this.schedule('timer', `Timer Snoozed: ${timerName}`, 'Your timer is ready!', snoozeTime);
    }

    dismissTimer(timerName) {
        console.log('Timer dismissed:', timerName);
    }

    markReminderDone(reminderId) {
        console.log('Reminder marked done:', reminderId);
    }

    snoozeReminder(reminderId) {
        const snoozeTime = Date.now() + (30 * 60 * 1000); // 30 minutes
        this.schedule('reminder', 'Reminder', 'Don\'t forget!', snoozeTime);
    }

    showWeatherDetails(weather) {
        // Trigger weather widget display
        document.dispatchEvent(new CustomEvent('showWeatherDetails', { detail: weather }));
    }

    adjustLightingForWeather(weather) {
        // Trigger automatic lighting adjustment
        document.dispatchEvent(new CustomEvent('adjustForWeather', { detail: weather }));
    }

    saveQuote(quote) {
        // Save quote to favorites
        document.dispatchEvent(new CustomEvent('saveQuote', { detail: quote }));
    }

    shareQuote(quote) {
        // Share quote
        if (navigator.share) {
            navigator.share({
                title: 'Inspiring Quote',
                text: `"${quote.text}" - ${quote.author}`,
                url: window.location.href
            });
        }
    }

    showAchievementDetails(achievement) {
        // Show achievement modal
        document.dispatchEvent(new CustomEvent('showAchievement', { detail: achievement }));
    }

    shareAchievement(achievement) {
        // Share achievement
        if (navigator.share) {
            navigator.share({
                title: 'Achievement Unlocked!',
                text: `I just unlocked "${achievement.title}" in Cozy Light!`,
                url: window.location.href
            });
        }
    }

    /**
     * Public API
     */
    enable() {
        this.config.enabled = true;
        this.saveSettings();
    }

    disable() {
        this.config.enabled = false;
        this.dismissAll();
        this.saveSettings();
    }

    enableType(type) {
        if (this.config.types.hasOwnProperty(type)) {
            this.config.types[type] = true;
            this.saveSettings();
        }
    }

    disableType(type) {
        if (this.config.types.hasOwnProperty(type)) {
            this.config.types[type] = false;
            this.saveSettings();
        }
    }

    setQuietHours(start, end) {
        this.config.scheduling.quietHours.start = start;
        this.config.scheduling.quietHours.end = end;
        this.config.scheduling.quietHours.enabled = true;
        this.saveSettings();
    }

    disableQuietHours() {
        this.config.scheduling.quietHours.enabled = false;
        this.saveSettings();
    }

    setDoNotDisturb(enabled) {
        this.config.scheduling.doNotDisturb = enabled;
        this.saveSettings();
    }

    test() {
        this.show('system', 'Test Notification', 'This is a test notification from Cozy Light!', {
            tag: 'test-notification'
        });
    }
}

// Initialize notification manager
if (typeof window !== 'undefined') {
    window.NotificationManager = NotificationManager;
    
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.notificationManager) {
            window.notificationManager = new NotificationManager();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}

console.log('🔔 Notification manager module loaded');
