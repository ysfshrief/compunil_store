// ============================================================
// COMPUNIL — Firestore Data Access Layer  (v2 — production)
// ============================================================

import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, setDoc,
  deleteDoc, query, where, orderBy, limit, startAfter,
  onSnapshot, serverTimestamp, increment,
  QueryConstraint, DocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  Product, Order, User, Category, Review,
  ProductFilters, OrderStatus, DashboardStats, UserRole, StoreSettings, HeroSlide, Coupon } from '../types'

// ── Collection helpers ───────────────────────────────────────
const COL = {
  products:   () => collection(db, 'products'),
  orders:     () => collection(db, 'orders'),
  users:      () => collection(db, 'users'),
  categories: () => collection(db, 'categories'),
  reviews:    () => collection(db, 'reviews'),
}

// ── Products ────────────────────────────────────────────────

/**
 * Paginated, filtered product fetch.
 * Returns { products, lastDoc } for cursor-based pagination.
 */
export async function getProducts(
  filters:  ProductFilters = {},
  pageSize  = 20,
  lastDoc?: DocumentSnapshot,
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = []

  if (filters.category)         constraints.push(where('categoryId', '==', filters.category))
  if (filters.brand)            constraints.push(where('brand', '==', filters.brand))
  if (filters.minRating)        constraints.push(where('rating', '>=', filters.minRating))
  if (filters.inStock)          constraints.push(where('stock', '>', 0))
  if (filters.minPrice != null) constraints.push(where('price', '>=', filters.minPrice))
  if (filters.maxPrice != null) constraints.push(where('price', '<=', filters.maxPrice))

  const sort = filters.sortBy
  if (sort === 'price-asc')       constraints.push(orderBy('price', 'asc'))
  else if (sort === 'price-desc') constraints.push(orderBy('price', 'desc'))
  else if (sort === 'rating')     constraints.push(orderBy('rating', 'desc'))
  else                            constraints.push(orderBy('createdAt', 'desc'))

  if (lastDoc) constraints.push(startAfter(lastDoc))
  constraints.push(limit(pageSize))

  const snap = await getDocs(query(COL.products(), ...constraints))
  return {
    products: snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)),
    lastDoc:  snap.docs[snap.docs.length - 1] ?? null,
  }
}

/**
 * Fetch ALL products as a plain array — used by admin pages.
 */
export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(query(COL.products(), orderBy('createdAt', 'desc'), limit(200)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null
}

export async function getFeaturedProducts(n = 8): Promise<Product[]> {
  const snap = await getDocs(
    query(COL.products(), where('isFeatured', '==', true), limit(n))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

export async function getProductsByCategory(category: string, n = 12): Promise<Product[]> {
  const snap = await getDocs(
    query(COL.products(), where('categoryId', '==', category), limit(n))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
}

/**
 * Search products.
 * Firestore doesn't support full-text search — we use a prefix query then
 * filter client-side for partial matches within the returned set.
 */
export async function searchProducts(term: string): Promise<Product[]> {
  if (!term.trim()) return []
  const lower = term.toLowerCase()

  // Fetch a broad set and filter client-side for partial matching
  const snap = await getDocs(query(COL.products(), limit(100)))
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))

  return all.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.brand?.toLowerCase().includes(lower) ||
    p.category?.toLowerCase().includes(lower) ||
    p.tags?.some(t => t.toLowerCase().includes(lower))
  )
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(COL.products(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id))
}

// ── Categories ──────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(COL.categories())
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category))
}

export async function createCategory(data: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(COL.categories(), data)
  return ref.id
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'categories', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id))
}

// ── Orders ──────────────────────────────────────────────────

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>,
): Promise<string> {
  // JSON round-trip strips undefined values that Firestore rejects
  const clean = JSON.parse(JSON.stringify(data))
  const ref = await addDoc(COL.orders(), {
    ...clean,
    status:    'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(COL.orders(), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export async function getAllOrders(n = 100): Promise<Order[]> {
  const snap = await getDocs(
    query(COL.orders(), orderBy('createdAt', 'desc'), limit(n))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() })
}

export function subscribeToOrder(id: string, cb: (order: Order) => void) {
  return onSnapshot(doc(db, 'orders', id), snap => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() } as Order)
  })
}

// ── Users ────────────────────────────────────────────────────

export async function getOrCreateUser(
  uid: string,
  data: Pick<User, 'name' | 'email'>,
): Promise<User> {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const newUser = { ...data, id: uid, role: 'user' as UserRole, addresses: [], createdAt: new Date() }
    await updateDoc(ref, newUser).catch(() => addDoc(collection(db, 'users'), newUser))
    return newUser
  }
  return { id: snap.id, ...snap.data() } as User
}

export async function getUserById(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null
  } catch {
    return null
  }
}

export async function getAllUsers(n = 200): Promise<User[]> {
  const snap = await getDocs(
    query(COL.users(), orderBy('createdAt', 'desc'), limit(n))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User))
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() })
}

// ── Reviews ──────────────────────────────────────────────────

export async function getProductReviews(productId: string): Promise<Review[]> {
  const snap = await getDocs(
    query(COL.reviews(), where('productId', '==', productId), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review))
}

export async function addReview(
  data: Omit<Review, 'id' | 'createdAt' | 'helpful'>,
): Promise<string> {
  const ref = await addDoc(COL.reviews(), {
    ...data, helpful: 0, createdAt: serverTimestamp(),
  })
  const reviews = await getProductReviews(data.productId)
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) + data.rating) / (reviews.length + 1)
  await updateDoc(doc(db, 'products', data.productId), {
    rating: Math.round(avg * 10) / 10,
    reviewCount: increment(1),
  })
  return ref.id
}

// ── Login Activity (who logged in & when) ────────────────────

export interface LoginRecord {
  id:        string
  userId:    string
  email:     string
  name:      string
  method:    'email' | 'google'
  at:        any
  userAgent: string
}

export async function getRecentLogins(n = 100): Promise<LoginRecord[]> {
  const snap = await getDocs(
    query(collection(db, 'logins'), orderBy('at', 'desc'), limit(n))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LoginRecord))
}

// ── Admin management ─────────────────────────────────────────

/** Promote a user to admin (or demote) by their email address. */
export async function setUserRoleByEmail(email: string, role: UserRole): Promise<boolean> {
  const snap = await getDocs(
    query(COL.users(), where('email', '==', email.toLowerCase().trim()), limit(1))
  )
  if (snap.empty) return false
  await updateDoc(snap.docs[0].ref, { role, updatedAt: serverTimestamp() })
  return true
}

export async function getAdmins(): Promise<User[]> {
  const snap = await getDocs(query(COL.users(), where('role', '==', 'admin')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as User))
}


// ── Store Settings ────────────────────────────────────────────
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  shippingFee:       50,
  freeShippingAbove: 500,
  phone:             '01001381010',
  whatsapp:          '201001381010',
  email:             'shriefarands2015@gmail.com',
  address:           'Damnhour, El Beheira, Egypt',
  facebook:          '',
  instagram:         '',
  announcementAr:    'شحن مجاني للطلبات فوق 500 ج.م',
  announcementEn:    'Free delivery on orders over 500 EGP',
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'store'))
    if (snap.exists()) return { ...DEFAULT_STORE_SETTINGS, ...snap.data() } as StoreSettings
  } catch (err) {
    console.warn('[Compunil] Could not load store settings:', err)
  }
  return DEFAULT_STORE_SETTINGS
}

export async function saveStoreSettings(s: Partial<StoreSettings>): Promise<void> {
  await setDoc(doc(db, 'settings', 'store'), { ...s, updatedAt: serverTimestamp() }, { merge: true })
}


// ── Hero Slides (homepage banners, admin-editable) ───────────
export async function getHeroSlides(activeOnly = true): Promise<HeroSlide[]> {
  try {
    const snap = await getDocs(query(collection(db, 'heroSlides'), orderBy('order', 'asc')))
    const slides = snap.docs.map(d => ({ id: d.id, ...d.data() } as HeroSlide))
    return activeOnly ? slides.filter(s => s.active) : slides
  } catch (err) {
    console.warn('[Compunil] Could not load hero slides:', err)
    return []
  }
}

export async function saveHeroSlide(slide: Partial<HeroSlide> & { id?: string }): Promise<string> {
  if (slide.id) {
    const { id, ...data } = slide
    await updateDoc(doc(db, 'heroSlides', id), { ...data, updatedAt: serverTimestamp() })
    return id
  }
  const ref = await addDoc(collection(db, 'heroSlides'), {
    ...slide, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await deleteDoc(doc(db, 'heroSlides', id))
}


// ── Single Order (for the customer order-details page) ───────
export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null
}

// ── User profile (saved address prefill) ─────────────────────
export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null
}

export async function saveUserAddress(uid: string, data: {
  phone?: string; street?: string; city?: string; governorate?: string
}): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { savedAddress: data }, { merge: true })
  } catch (err) { console.warn('[Compunil] saveUserAddress:', err) }
}

// ── Cart / Wishlist cloud sync ────────────────────────────────
export async function saveUserCart(uid: string, items: any[], wishlistIds: string[]): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), {
      cloudCart: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      cloudWishlist: wishlistIds,
      cartUpdatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (err) { console.warn('[Compunil] saveUserCart:', err) }
}

export async function loadUserCart(uid: string): Promise<{ cart: { productId: string; quantity: number }[]; wishlist: string[] } | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    const d = snap.data() as any
    return { cart: d.cloudCart ?? [], wishlist: d.cloudWishlist ?? [] }
  } catch { return null }
}

// ── Coupons ───────────────────────────────────────────────────
export async function getCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon))
}

export async function saveCoupon(coupon: Partial<Coupon> & { id?: string }): Promise<string> {
  if (coupon.id) {
    const { id, ...data } = coupon
    await updateDoc(doc(db, 'coupons', id), { ...data, updatedAt: serverTimestamp() })
    return id
  }
  const ref = await addDoc(collection(db, 'coupons'), { ...coupon, usedCount: 0, createdAt: serverTimestamp() })
  return ref.id
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteDoc(doc(db, 'coupons', id))
}

/** Validate a coupon code. Returns the coupon or an error key. */
export async function validateCoupon(code: string, subtotal: number): Promise<{ coupon?: Coupon; error?: string }> {
  const snap = await getDocs(query(collection(db, 'coupons'), where('code', '==', code.toUpperCase().trim()), limit(1)))
  if (snap.empty) return { error: 'notFound' }
  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon
  if (!coupon.active) return { error: 'inactive' }
  if (coupon.expiresAt && (coupon.expiresAt.toDate?.() ?? new Date(coupon.expiresAt)) < new Date()) return { error: 'expired' }
  if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) return { error: 'limitReached' }
  if (coupon.minOrder && subtotal < coupon.minOrder) return { error: 'minOrder' }
  return { coupon }
}

export async function incrementCouponUsage(id: string): Promise<void> {
  try { await updateDoc(doc(db, 'coupons', id), { usedCount: increment(1) }) } catch {}
}

// ── Dashboard Stats ──────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
    getDocs(query(COL.orders(),   orderBy('createdAt', 'desc'), limit(200))),
    getDocs(COL.products()),
    getDocs(COL.users()),
  ])

  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order))
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product))

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total || 0), 0)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const ordersToday = orders.filter(o => {
    const d = (o.createdAt as any)?.toDate?.() ?? new Date(o.createdAt)
    return d >= today
  }).length

  const recentOrders    = orders.slice(0, 5)
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).slice(0, 5)

  return {
    totalRevenue,
    totalOrders:    ordersSnap.size,
    totalProducts:  productsSnap.size,
    totalUsers:     usersSnap.size,
    revenueGrowth:  12.5,
    ordersToday,
    pendingOrders:  orders.filter(o => o.status === 'pending').length,
    recentOrders,
    lowStockProducts,
  }
}
