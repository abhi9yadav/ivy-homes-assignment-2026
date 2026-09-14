# Ivy Homes Chennai - Frontend Application

A modern, responsive real estate web application for Chennai featuring property listings, rentals, projects, and interactive maps.

## 🌟 Live Demo

**Demo URL**: [Add your deployed URL here]

## 🎯 Features

- **3,759 Property Listings** - Browse properties for sale
- **1,421 Rental Properties** - Find rental homes
- **450+ Projects** - Explore residential projects
- **Interactive Maps** - Leaflet-based location maps
- **Advanced Filters** - Price, locality, BHK, furnishing, property type
- **3 View Modes** - Grid, List, and Map views
- **Image Carousel** - Auto-rotating images on hover
- **Favorites** - Save properties for later
- **Responsive Design** - Works on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Navigation
- **Leaflet** - Interactive maps
- **CSS Modules** - Scoped styling
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ivy-homes-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root:
```env
VITE_API_BASE_URL=https://solve.ivy.homes
VITE_API_KEY=your_api_key_here
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:5174 in your browser

### Demo Credentials
- **Email**: demo1@ivy.homes
- **Password**: 0c77c313b3

## 📦 Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

## 🌐 Deployment

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
1. Run `npm run build`
2. Drag the `dist/` folder to Netlify dashboard

**Important**: Set environment variables in your deployment platform:
- `VITE_API_BASE_URL`
- `VITE_API_KEY`

## 📱 Features Walkthrough

### Landing Page
- Hero section with CTA
- Live statistics
- Feature highlights
- Property showcase
- Testimonials
- Smooth animations

### Listings Page (Buy)
- Browse 3,759 properties
- Price slider: ₹25L - ₹5Cr
- Filter by locality, BHK, status, furnishing
- Switch between Grid/List/Map views
- Pagination (24 items per page)

### Rentals Page
- Browse 1,421 rental properties
- Monthly rent slider: ₹5k - ₹1.5L
- Preset price chips
- Same powerful filters as listings

### Projects Page
- 450+ residential projects
- Project details with amenities
- Location on interactive map
- View all listings in a project

### Detail Pages
- Full property information
- Image carousel with 4 images
- Location map (single marker)
- Seller contact information
- Similar listings section (when backend ready)

### Favorites
- Save properties while browsing
- Persistent across sessions
- Quick access from navbar

## 🎨 UI/UX Highlights

- **Smooth Animations** - Landing page animations using CSS transitions
- **Image Hover Effect** - 4 images rotate on card hover (900ms interval)
- **Loading States** - Skeleton screens while data loads
- **Error Handling** - User-friendly error messages
- **Responsive Grid** - Adapts from mobile to desktop
- **Filter Persistence** - Filters stay applied during navigation

## 📂 Project Structure

```
src/
├── components/          # Reusable components
│   ├── ListingCard.jsx
│   ├── ListingsMap.jsx
│   ├── Navbar.jsx
│   └── Pagination.jsx
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── ListingsPage.jsx
│   ├── RentalsPage.jsx
│   ├── ProjectsPage.jsx
│   ├── ListingDetailPage.jsx
│   ├── ProjectDetailPage.jsx
│   ├── FavoritesPage.jsx
│   └── LoginPage.jsx
├── App.jsx             # Root component with routes
├── api.js              # API service layer
├── AuthContext.jsx     # Authentication state
└── FavoritesContext.jsx # Favorites state
```

## 🔌 API Integration

### Base URL
```
https://solve.ivy.homes
```

### Available Endpoints
- `POST /auth/login` - Login
- `GET /v1/listings` - Property listings
- `GET /v1/rentals` - Rental properties
- `GET /v1/projects` - Real estate projects
- `GET /v1/localities` - Available localities

## 🐛 Known Issues

- Similar listings feature pending backend implementation
- Analytics dashboard pending backend endpoint
- Some project detail endpoints return 404

## 📄 License

This project was created as part of the Ivy Homes assignment.

## 👨‍💻 Author

**Abhinav Yadav**

---

Built with ❤️ using React + Vite
