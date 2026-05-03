# EdgeeTech-Website

Company Website of EdgeeTech Software Technologies

## 📋 Project Overview

A modern, optimized company website built with Vite and deployed to GitHub Pages. This site showcases EdgeeTech's software consultancy services.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
edgee.tech/
├── src/
│   ├── main.js              # Entry point - loads all CSS and JS
│   ├── assets/
│   │   ├── css/             # Stylesheets
│   │   ├── js/              # JavaScript files
│   │   ├── images/          # Images and icons
│   │   └── lib/             # Third-party libraries
│   └── pages/               # HTML pages
├── dist/                    # Production build output
├── index.html               # Main HTML template
├── package.json             # Project dependencies
├── vite.config.js           # Vite configuration
└── .github/workflows/       # CI/CD automation
```

## 🔧 Technologies Used

- **Build Tool:** Vite
- **CSS:** Bootstrap 4.4.1, Custom styles
- **JavaScript:** jQuery, Bootstrap plugins, Owl Carousel, Slick, Lightbox
- **Deployment:** GitHub Pages
- **CI/CD:** GitHub Actions

## 🌐 Deployment

The site automatically deploys to GitHub Pages on every push to the `main` branch.

### GitHub Pages Configuration

- **Production URL:** `https://edgee.tech/`
- **Automatic Deployment:** Enabled via GitHub Actions
- **Custom Domain:** Published via `public/CNAME`

## 📝 Configuration

### Update Site Title and Meta Tags

Edit `index.html` to customize:
- Page title
- Meta description
- Favicon paths

### Update Base URL (if needed)

In `vite.config.js`:
```javascript
export default defineConfig({
  base: './',  // Use '/' or './' for a custom domain at the root
  // ...
});
```

## 🔍 Features

- ✅ Fast development with Vite HMR
- ✅ Optimized production builds
- ✅ Automatic asset bundling and minification
- ✅ Mobile responsive design
- ✅ SEO optimized
- ✅ Automated GitHub Pages deployment

## 📜 License

All rights reserved - EdgeeTech Limited
