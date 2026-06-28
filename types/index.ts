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
