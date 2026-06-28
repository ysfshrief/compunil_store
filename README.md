# Compunil — Electronics Supply Solutions
### Full-Stack E-Commerce Platform

A production-ready e-commerce platform for **Compunil**, an Egypt-based tech store. Built with Next.js 14, Firebase, Tailwind CSS, and Framer Motion. Deployable to Netlify in minutes.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| State | Zustand (with localStorage persistence) |
| Hosting | Netlify |
| Language | TypeScript |

---

## 🗂 Project Structure

```
compunil/
├── app/                     # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── shop/                # Product listing
│   ├── product/[id]/        # Product detail
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout flow
│   ├── wishlist/            # Saved items
│   ├── account/orders/      # Order history
│   ├── auth/
│   │   ├── login/           # Sign in page
│   │   └── register/        # Sign up page
│   └── admin/               # Admin dashboard (protected)
│       ├── page.tsx         # Dashboard overview
│       ├── products/        # Product CRUD
│       ├── orders/          # Order management
│       ├── users/           # User management
│       └── categories/      # Category CRUD
├── components/
│   ├── layout/              # Header, Footer, CartDrawer, MobileNav
│   └── ui/                  # Button, Input, ProductCard, StarRating, etc.
├── lib/
│   ├── firebase.ts          # Firebase init
│   ├── firestore.ts         # Firestore data layer
│   ├── auth.ts              # Authentication helpers
│   ├── storage.ts           # Firebase Storage helpers
│   ├── utils.ts             # Shared utilities
│   └── mockData.ts          # Demo data (used when Firebase is unavailable)
├── store/                   # Zustand state stores
│   ├── cartStore.ts         # Cart state
│   ├── authStore.ts         # Auth state
│   ├── wishlistStore.ts     # Wishlist state
│   └── langStore.ts         # Language (EN/AR) state
├── types/index.ts           # TypeScript types
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── netlify.toml             # Netlify config
└── .env.local.example       # Environment variable template
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- A Firebase project (free Spark plan is enough)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use an existing one)
3. Enable the following services:
   - **Authentication** → Sign-in method → Enable Email/Password and Google
   - **Firestore Database** → Create database → Start in test mode (then apply rules below)
   - **Storage** → Get started → Start in test mode (then apply rules below)
4. Go to **Project Settings → General → Your apps → Add app → Web**
5. Copy the config values

### Step 3 — Set environment variables
```bash
cp .env.local.example .env.local
```
Then edit `.env.local` and fill in your Firebase config values.

### Step 4 — Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Setting Up Your First Admin User

After registering an account via `/auth/register`:

1. Go to [Firebase Console → Firestore](https://console.firebase.google.com)
2. Open the `users` collection
3. Find your user document (it uses your Firebase Auth UID as the document ID)
4. Edit the `role` field and change it from `"user"` to `"admin"`
5. Visit `/admin` — you should now have full access

---

## 🛡 Apply Security Rules

### Firestore Rules
1. Firebase Console → Firestore → Rules tab
2. Copy the contents of `firestore.rules` and paste them
3. Click **Publish**

### Storage Rules
1. Firebase Console → Storage → Rules tab
2. Copy the contents of `storage.rules` and paste them
3. Click **Publish**

---

## 🌍 Deploy to Netlify

### Option A — Netlify CLI (recommended)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login
netlify login

# Init and deploy
netlify init
netlify deploy --prod
```

### Option B — Netlify Dashboard (Git)

1. Push your project to GitHub/GitLab
2. Go to [app.netlify.com](https://app.netlify.com) → New site → Import from Git
3. Select your repository
4. Build settings are auto-detected from `netlify.toml`
5. Go to **Site settings → Environment variables** and add all variables from `.env.local.example`
6. Click **Deploy site**

### Required Netlify Plugin
The `netlify.toml` file already includes the `@netlify/plugin-nextjs` plugin. Netlify installs it automatically. If it doesn't:
```bash
npm install @netlify/plugin-nextjs
```

### Environment Variables to add in Netlify
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_APP_URL  (set to your Netlify URL)
```

---

## 📱 Features Overview

### Customer Store
- **Home** — Hero banner, categories grid, featured products, deals section, trust badges
- **Shop** — Paginated product grid, price/category/brand/rating filters, sort options, URL-synced state
- **Product Detail** — Image gallery, specs table, reviews with star ratings, related products, add to cart / buy now
- **Cart** — Editable cart with quantity controls, promo code field, order summary
- **Checkout** — 3-step wizard: personal info → delivery address → review & confirm; COD payment
- **Wishlist** — Saved products with add-all-to-cart, stored in localStorage
- **My Orders** — Full order history with status tracker
- **Auth** — Email/password + Google OAuth, protected routes

### Admin Dashboard (`/admin`)
- **Overview** — Revenue, orders, products, users at a glance; recent orders table; low stock alerts
- **Products** — Create, edit, delete products; multi-image upload to Firebase Storage; spec rows; featured/sale toggles
- **Orders** — Status management (pending → processing → shipped → delivered); order detail drawer
- **Users** — View all users; toggle admin role
- **Categories** — Create/edit/delete with image upload and emoji icon picker

### Other Features
- **Bilingual (EN/AR)** — Language toggle in header; RTL layout support
- **Responsive** — Mobile-first; bottom navigation bar on mobile; optimized grids
- **Cart persistence** — Survives page refresh via localStorage (Zustand persist)
- **Demo mode** — App works with mock data even without Firebase credentials

---

## 🎨 Design System

| Token | Value |
|---|---|
| `brand-navy` | `#1B3A7A` |
| `brand-dark` | `#0A1F4E` |
| `brand-teal` | `#00B4D8` |
| `brand-green` | `#4CAF50` |
| `brand-light` | `#EEF2FF` |
| Currency | Egyptian Pound (EGP) |

---

## 🗄 Firestore Data Model

```
products/{id}
  name, price, salePrice, category, brand, description
  images[], stock, rating, reviewCount, featured, onSale
  specs[{key, value}], createdAt, updatedAt

orders/{id}
  userId, items[{productId, name, price, quantity, image}]
  total, status, address{name, phone, city, address, governorate}
  createdAt, updatedAt

users/{uid}
  name, email, role (admin|user), photoURL, createdAt

categories/{id}
  name, slug, icon, description, image, createdAt

reviews/{id}
  productId, userId, userName, rating, comment, createdAt
```

---

## 🔧 Scripts

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Build for production
npm run start      # Start production server locally
npm run lint       # Run ESLint
```

---

## 🚫 Constraints & Notes

- No custom backend server — Firebase only
- No paid third-party services required
- All prices in EGP (Egyptian Pound)
- Payment method: Cash on Delivery (COD)
- Images are served via Firebase Storage CDN
- The app falls back to mock data if Firebase is misconfigured (helpful for demos)

---

## 📄 License

Private — Compunil Electronics Supply Solutions © 2024. All rights reserved.
