// ============================================================
// COMPUNIL — Core TypeScript Types  (v2 — production-stable)
// ============================================================

export type Language = 'en' | 'ar'

// ── Users ──────────────────────────────────────────────────
export type UserRole = 'admin' | 'user'   // canonical — never 'customer'

export interface User {
  id:         string
  name:       string
  email:      string
  role:       UserRole
  phone?:     string
  addresses?: Address[]
  createdAt:  Date
  photoURL?:  string
}

// ── Address ────────────────────────────────────────────────
export interface Address {
  id:          string
  label:       string
  street:      string
  city:        string
  governorate: string
  postalCode?: string
  isDefault:   boolean
}

// ── Category ───────────────────────────────────────────────
export interface Category {
  id:            string
  name:          string
  nameAr?:       string
  slug:          string
  icon:          string
  imageUrl?:     string
  image?:        string
  description?:  string
  productCount?: number
  createdAt?:    Date
  updatedAt?:    Date
}

// ── Product ────────────────────────────────────────────────
export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  nameAr?:        string   // Arabic name (shown when lang=ar)
  descriptionAr?: string   // Arabic description
  id:              string
  name:            string
  nameAr?:         string
  description:     string
  descriptionAr?:  string
  price:           number
  originalPrice?:  number
  category:        string
  categoryId:      string
  brand:           string
  images:          string[]
  stock:           number
  rating:          number
  reviewCount:     number
  specifications:  ProductSpec[]
  tags:            string[]
  isService?:      boolean
  isFeatured?:     boolean
  isOnSale?:       boolean
  createdAt:       Date
  updatedAt?:      Date
}

// ── Review ─────────────────────────────────────────────────
export interface Review {
  id:        string
  productId: string
  userId:    string
  userName:  string
  rating:    number
  comment:   string
  createdAt: Date
  helpful:   number
}

// ── Cart ───────────────────────────────────────────────────
export interface CartItem {
  product:  Product
  quantity: number
}

// ── Order ──────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  productId:    string
  productName:  string
  productImage: string
  price:        number
  quantity:     number
  subtotal:     number
}

export interface Order {
  id:        string
  userId:    string
  userEmail: string
  userName:  string
  items:     OrderItem[]
  subtotal:  number
  shipping:  number
  total:     number
  status:    OrderStatus
  address:   Address
  phone:     string
  notes?:    string
  createdAt: Date
  updatedAt?: Date
}

// ── Filters ────────────────────────────────────────────────
export interface ProductFilters {
  category?:  string
  brand?:     string
  minPrice?:  number
  maxPrice?:  number
  minRating?: number
  inStock?:   boolean
  search?:    string
  sortBy?:    'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular'
}

// ── Wishlist ───────────────────────────────────────────────
export interface WishlistItem {
  productId: string
  addedAt:   Date
}

// ── Admin Stats ─────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue:    number
  totalOrders:     number
  totalProducts:   number
  totalUsers:      number
  revenueGrowth:   number
  ordersToday:     number
  pendingOrders:   number
  recentOrders:    Order[]
  lowStockProducts: Product[]
}

// ── Store Settings (admin-editable, stored in Firestore) ─────
export interface StoreSettings {
  shippingFee:        number   // EGP flat shipping fee
  freeShippingAbove:  number   // free shipping threshold (0 = never free)
  phone:              string
  whatsapp:           string   // international format e.g. 201001381010
  email:              string
  address:            string
  facebook?:          string
  instagram?:         string
  announcementAr?:    string   // top-bar announcement (Arabic)
  announcementEn?:    string   // top-bar announcement (English)
  updatedAt?:         any
}

// ── Hero Slide (admin-editable homepage banner) ──────────────
export interface HeroSlide {
  id:         string
  titleEn:    string
  titleAr:    string
  subEn:      string
  subAr:      string
  ctaEn:      string
  ctaAr:      string
  ctaHref:    string    // where the button goes e.g. /shop?category=cctv
  badgeEn?:   string
  badgeAr?:   string
  imageUrl?:  string    // optional background image (Drive links supported)
  bg?:        string    // tailwind gradient classes fallback
  order:      number
  active:     boolean
  createdAt?: any
  updatedAt?: any
}
