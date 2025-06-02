# 🕯️ Cozy Light - Perfect Ambient Lighting

Create the perfect ambient lighting atmosphere for any mood with customizable colors, brightness, warmth, and ambient sounds.

![Cozy Light Preview](src/assets/screenshots/preview.png)

## 👨‍💻 Developer

**Thanatsitt Santisamranwilai**  
🤖 AI Content Developer & Multilingual Specialist  
📍 Kamphaeng Phet, Thailand  


src/
├── css/
│   ├── main.css
│   ├── components.css
│   ├── responsive.css
│   ├── animations.css
│   └── api-enhancements.css
├── js/
│   ├── api/
│   │   ├── weatherAPI.js
│   │   ├── soundAPI.js
│   │   ├── colorAPI.js
│   │   ├── quoteAPI.js
│   │   └── imageAPI.js
│   ├── utils.js
│   ├── storage.js
│   ├── settings.js
│   ├── presets.js
│   ├── particles.js
│   ├── audioManager.js
│   ├── timerManager.js
│   ├── lightController.js
│   ├── gestureHandler.js
│   ├── notifications.js
│   ├── backgroundManager.js
│   └── main.js
├── manifest.json
└── sw.js

### Connect with me:
- 🌐 [Portfolio](https://pigletpeakkung.github.io/Thannxai/)
- 💼 [LinkedIn](https://linkedin.com/in/thanattsitts)
- 💻 [GitHub](https://github.com/Pigletpeakkung)
- 🔗 [Linktree](https://linktr.ee/ThanttEzekiel)
- ✉️ thanattsitt.info@yahoo.co.uk

---

## ✨ Features

### 🎨 **Lighting Controls**
- **Brightness Control** - Adjust from 0-100% with smooth transitions
- **Color Selection** - Full color picker + quick preset colors
- **Warmth Adjustment** - Cool to warm lighting temperature
- **Saturation Control** - Adjust color intensity
- **Flicker Effects** - Add realistic candle-like flickering

### 🌟 **Quick Presets**
- 🔥 **Cozy** - Warm, comfortable lighting for relaxation
- 💡 **Focus** - Bright, clear lighting for productivity
- 🌙 **Relax** - Calm, soothing lighting for unwinding
- 💕 **Romantic** - Soft, intimate lighting for special moments
- ⚡ **Energize** - Vibrant lighting to boost energy
## **Step 15: Updated README.md with Your Information (Continued)**

### ⏰ **Smart Timer**
- Set automatic lighting changes
- Multiple timer actions (off, dim, preset switch)
- Visual countdown display
- Background notifications

### 🎵 **Ambient Sounds**
- 🌧️ Rain sounds
- 🔥 Fireplace crackling
- 🌿 Nature sounds
- Volume control
- Loop playback

### 📱 **Progressive Web App**
- Install on any device
- Works offline
- Native app experience
- Push notifications
- Background sync

### ⌨️ **Keyboard Shortcuts**
- `↑/↓` - Adjust brightness
- `1-6` - Quick presets
- `A` - Toggle advanced controls
- `Esc` - Emergency off
- `?` - Show help

## 🚀 Quick Start

### Option 1: Direct Use
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start creating your perfect lighting atmosphere!

### Option 2: Local Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/Pigletpeakkung/Cozy-light.git
cd Cozy-light

# Serve with Python (if you have Python installed)
python -m http.server 8000

# Or with Node.js (if you have Node.js installed)
npx serve .

# Open http://localhost:8000 in your browser
```

### Option 3: Install as PWA
1. Open the app in a modern browser
2. Look for the "Install App" button or browser install prompt
3. Install for native app experience

## 🛠️ Development

### Project Structure
```
Cozy-light/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── LICENSE                 # MIT License
├── .gitignore             # Git ignore rules
├── src/
│   ├── css/
│   │   ├── main.css        # Core styles
│   │   ├── components.css  # Component styles
│   │   └── responsive.css  # Responsive design
│   ├── js/
│   │   ├── main.js         # App initialization
│   │   ├── lightController.js # Main controller
│   │   ├── presets.js      # Light presets
│   │   └── settings.js     # Settings management
│   └── assets/
│       ├── icons/          # App icons
│       ├── sounds/         # Ambient sound files
│       └── screenshots/    # App screenshots
└── README.md
```

### Adding Custom Presets
```javascript
// In src/js/presets.js
LightPresets.createCustomPreset('myPreset', {
    brightness: 60,
    color: '#ff9500',
    warmth: 70,
    saturation: 80,
    flicker: 1
});
```

### Adding Sound Files
1. Add `.mp3` files to `src/assets/sounds/`
2. Update the `loadSounds()` method in `lightController.js`
3. Add corresponding buttons in the HTML

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🎯 Usage Tips

### For Best Experience
- Use in a dimmed room for maximum effect
- Try different presets for different activities
- Combine lighting with ambient sounds
- Use timer feature for gradual lighting changes

### Accessibility
- High contrast mode support
- Keyboard navigation
- Screen reader friendly
- Reduced motion support

### Performance
- Lightweight (~50KB total)
- Smooth 60fps animations
- Efficient battery usage
- Offline functionality

## 🔧 Customization

### CSS Variables
```css
:root {
    --primary-bg: #1a1a1a;
    --secondary-bg: #2a2a2a;
    --accent-color: #ff8c42;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
}
```

### Adding New Features
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test across devices
5. Submit a pull request

## 📱 Mobile Features

### Touch Gestures
- Swipe on sliders for fine control
- Long press for quick access
- Pinch to zoom light display

### Mobile Optimizations
- Touch-friendly controls
- Optimized layouts
- Battery-efficient animations
- Haptic feedback support

## 🔒 Privacy & Data

- **No data collection** - Everything stays on your device
- **Local storage only** - Settings saved in browser
- **No tracking** - No analytics or third-party scripts
- **Offline capable** - Works without internet

## 🐛 Troubleshooting

### Common Issues

**App won't load:**
- Check browser compatibility
- Ensure JavaScript is enabled
- Try refreshing the page

**Sounds not playing:**
- Check if sound files exist in `src/assets/sounds/`
- Verify browser audio permissions
- Try different audio format

**PWA install not showing:**
- Use HTTPS or localhost
- Check manifest.json validity
- Ensure service worker is registered

**Performance issues:**
- Reduce flicker effects
- Close other browser tabs
- Update your browser

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Bug Reports
- Use GitHub Issues
- Include browser/device info
- Provide steps to reproduce

### Feature Requests
- Describe the use case
- Explain expected behavior
- Consider implementation complexity

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons from various open source collections
- Sound samples from freesound.org
- Inspiration from cozy lighting apps
- Community feedback and contributions

## 🌟 About the Developer

**Thanatsitt Santisamranwilai** is an AI Content Developer & Multilingual Specialist with 7+ years of experience combining creative storytelling, voice acting, and technology. Specializing in ethical AI training data and cross-cultural content for Southeast Asian markets.

### Expertise Areas:
- 🤖 AI Training Data & Content Development
- 🌏 Multilingual Content Creation (Thai/English)
- 🎭 Voice Acting & Audio Production
- 💻 Web Development & PWA Creation
- 🎨 UI/UX Design for Cultural Adaptation

## 📞 Support & Contact

- 📧 **Email:** thanattsitt.info@yahoo.co.uk
- 🐛 **Issues:** [GitHub Issues](https://github.com/Pigletpeakkung/Cozy-light/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Pigletpeakkung/Cozy-light/discussions)
- 🌐 **Portfolio:** [https://pigletpeakkung.github.io/Thannxai/](https://pigletpeakkung.github.io/Thannxai/)
- 💼 **LinkedIn:** [linkedin.com/in/thanattsitts](https://linkedin.com/in/thanattsitts)
- 🔗 **All Links:** [linktr.ee/ThanttEzekiel](https://linktr.ee/ThanttEzekiel)

---

## 🚀 Deployment Options

### GitHub Pages (Free)
```bash
# Enable GitHub Pages in repository settings
# Choose "Deploy from a branch" and select "main"
# Your app will be available at: https://username.github.io/repository-name
```

### Netlify (Free Tier Available)
```bash
# Connect your GitHub repository to Netlify
# Auto-deploy on every push to main branch
# Custom domain support available
```

### Vercel (Free Tier Available)
```bash
# Import your GitHub repository
# Automatic deployments and preview URLs
# Excellent performance optimization
```

### Firebase Hosting (Free Tier Available)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy
```

## 🔄 Version History

### v1.0.0 (Current)
- ✨ Initial release with core lighting controls
- 🎨 Six preset lighting modes
- ⏰ Timer functionality
- 🎵 Ambient sound integration
- 📱 PWA support
- 📱 Mobile responsive design
- ⌨️ Keyboard shortcuts
- 🌐 Offline functionality

### Planned Features (v1.1.0+)
- 🌅 Sunrise/sunset automation
- 🎨 Color gradient effects
- 🔄 Sync across multiple devices
- 📊 Usage analytics (privacy-friendly)
- 🎮 Game-like achievements
- 🔊 More ambient sound options
- 🎯 Location-based presets
- 🤝 Social sharing of custom presets

---

**Made with ❤️ in Thailand for creating perfect ambient lighting worldwide**

*Enjoy your cozy lighting experience!* 🕯️✨

_"Perfect lighting is not just about brightness - it's about creating the right atmosphere for every moment of your life."_ - Thanatsitt Santisamranwilai
```

## **Step 16: Package.json (Optional for Modern Development)**

Create `package.json` for better project management:

```json
{
  "name": "cozy-light",
  "version": "1.0.0",
  "description": "Perfect ambient lighting atmosphere web application with customizable colors, brightness, and ambient sounds",
  "main": "index.html",
  "scripts": {
    "start": "npx serve .",
    "dev": "python -m http.server 8000",
    "build": "echo 'No build step needed - pure HTML/CSS/JS'",
    "test": "echo 'No tests specified yet'",
    "deploy:netlify": "netlify deploy --dir=. --prod",
    "deploy:vercel": "vercel --prod",
    "validate": "html5validator --root . --also-check-css",
    "lighthouse": "lighthouse http://localhost:8000 --output=html --output-path=./lighthouse-report.html"
  },
  "keywords": [
    "lighting",
    "ambient",
    "cozy",
    "pwa",
    "web-app",
    "responsive",
    "thailand",
    "relaxation",
    "productivity",
    "mood-lighting"
  ],
  "author": {
    "name": "Thanatsitt Santisamranwilai",
    "email": "thanattsitt.info@yahoo.co.uk",
    "url": "https://pigletpeakkung.github.io/Thannxai/"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Pigletpeakkung/Cozy-light.git"
  },
  "bugs": {
    "url": "https://github.com/Pigletpeakkung/Cozy-light/issues"
  },
  "homepage": "https://pigletpeakkung.github.io/Cozy-light/",
  "devDependencies": {
    "serve": "^14.2.1",
    "lighthouse": "^11.4.0",
    "html5validator": "^0.4.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

## **🎉 Final Project Structure**

Your complete project should now look like this:

```
Cozy-light/
├── 📄 index.html              # Main HTML file
├── 📄 manifest.json           # PWA manifest
├── 📄 sw.js                   # Service worker
├── 📄 LICENSE                 # MIT License
├── 📄 .gitignore             # Git ignore rules
├── 📄 README.md              # Comprehensive documentation
├── 📄 package.json           # Project metadata (optional)
├── 📁 src/
│   ├── 📁 css/
│   │   ├── 🎨 main.css        # Core styles & variables
│   │   ├── 🎨 components.css  # Component-specific styles
│   │   └── 🎨 responsive.css  # Mobile & responsive design
│   ├── 📁 js/
│   │   ├── ⚡ main.js         # App initialization & PWA
│   │   ├── 💡 lightController.js # Core lighting logic
│   │   ├── 🌟 presets.js      # Lighting presets
│   │   └── ⚙️ settings.js     # Settings management
│   └── 📁 assets/
│       ├── 📁 icons/          # PWA icons (72px to 512px)
│       ├── 📁 sounds/         # Ambient audio files
│       └── 📁 screenshots/    # App preview images
```

## **🚀 Ready to Launch!**

Your **Cozy Light** web application is now complete and production-ready! Here's what you've built:

### ✅ **Features Implemented:**
- 🎨 Advanced lighting controls with smooth animations
- 🌟 Six beautiful preset modes
- ⏰ Smart timer functionality 
- 🎵 Ambient sound integration
- 📱 Full PWA support (installable, offline-capable)
- 📱 Mobile-responsive design
- ⌨️ Keyboard shortcuts for power users
- 💾 Local settings persistence
- 🔧 Error handling and user feedback
- 🌍 Cross-browser compatibility

### 🎯 **Ready for:**
- GitHub repository publishing
- GitHub Pages deployment
- Netlify/Vercel hosting
- PWA installation on any device
- Mobile app stores (with tools like Capacitor)

**Your app combines beautiful design with practical functionality - perfect for creating ambient lighting experiences! 🕯️✨**

