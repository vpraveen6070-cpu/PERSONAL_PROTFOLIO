# Portfolio Website — VERESHWARAPU PRAVEEN KUMAR

> Ultra-modern personal portfolio for a B.Tech AI & ML student

## 🚀 Live Preview
Open `index.html` in your browser to view the portfolio.

## 🎨 Features
- ✅ **Cloud Storage (Firebase)**: Integrated Firestore for real-time, global data persistence (replacing LocalStorage).
- ✅ **Contact Messages Management**: Capture and manage form submissions directly in the Admin Panel.
- ✅ **Mobile/Desktop View Simulation**: Toggle between responsive mobile and full desktop layouts on the fly.
- ✅ **Three.js Particle Background** with mouse interaction
- ✅ **Custom Cursor** with smooth follower
- ✅ **Typing Text Effect** cycling through roles
- ✅ **Scroll Progress Bar**
- ✅ **3D Tilt Cards** for Projects section
- ✅ **Spring-Scale & Glow Entrance**: Advanced scroll reveal animations for certificates.
- ✅ **Lightbox** for certificates & gallery
- ✅ **Certificate Filter** by category
- ✅ **Admin Dashboard** with password auth
- ✅ **Drag & Drop Upload** for certificates, images, videos
- ✅ **Fully Responsive** (mobile, tablet, desktop)
- ✅ **SEO Optimized** (meta tags, semantic HTML)
- ✅ **Animated Section Dividers**

## 📁 Folder Structure
```
portfolio-website/
├── index.html          # Main portfolio page
├── README.md
├── css/
│   ├── style.css       # Base styles (includes Mobile Simulation)
│   ├── themes.css      # Theme definitions
│   └── animations.css  # Keyframes & utilities
├── js/
│   ├── main.js         # Core interactions
│   ├── animations.js   # Three.js & particles
│   ├── theme-switcher.js # Refactored to View Toggle
│   └── upload.js       # File uploads
├── assets/
│   ├── images/         # Add your photos here
│   ├── certificates/   # Add certificates here
│   ├── videos/         # Add videos here
│   └── icons/
├── admin/
│   ├── admin.html      # Admin dashboard
│   ├── admin.css
│   └── admin.js
├── resume/
│   └── resume.pdf      # ← Add your resume here
└── components/
    ├── navbar.html
    ├── footer.html
    └── project-card.html
```

## ⚙️ Admin Panel
1. Open `admin/admin.html`
2. Default password: **`praveen123`**
3. Features: 
   - **View Simulation Control**: Test responsiveness directly from the login screen and dashboard.
    - **Content Management**: Upload certificates, images, and projects.
    - **Messages Module**: View, manage, and delete contact form inquiries.
    - **Live Stats**: Real-time count of projects, certificates, and messages.
    - **Data Management**: Export all cloud data to JSON for portability.

## 🎯 Customization
- **Personal Info**: Edit `index.html` — update name, bio, email, GitHub/LinkedIn URLs
- **Resume**: Replace `resume/resume.pdf` with your actual resume
- **Profile Photo**: Add your photo to `assets/images/profile.jpg` and update the `about` section img tag
- **Projects**: Edit the projects grid in `index.html` or add via Admin Panel
- **View Toggle**: Click the "📱 Mobile View" link in the navbar or admin header to test responsiveness.

## 🌐 GitHub Deployment
```bash
# Push to GitHub
git init && git add . && git commit -m "Portfolio Enhancements"
git remote add origin https://github.com/vpraveen6070-cpu/PERSONAL_PROTFOLIO.git
git push -u origin main
```
Enable **GitHub Pages** → Settings → Pages → Deploy from `main` branch.

## 🛠️ Built With
- HTML5, CSS3, Vanilla JavaScript
- Firebase & Firestore (Cloud Database)
- Three.js (3D particles)
- Google Fonts (Outfit, Inter, Fira Code)
- LocalStorage (Fallback / View preferences)

---
*Made with ❤️ by VERESHWARAPU PRAVEEN KUMAR | B.Tech AI & ML | India 🇮🇳*
