'use client'
// ============================================================
// COMPUNIL — Language Store + Translations
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'en' | 'ar'

interface LangStore {
  lang:   Lang
  toggle: () => void
  setLang:(l: Lang) => void
  isRTL:  () => boolean
  t:      (key: string) => string
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home':       'Home',
    'nav.shop':       'Shop',
    'nav.categories': 'Categories',
    'nav.deals':      'Deals',
    'nav.cart':       'Cart',
    'nav.account':    'Account',
    'nav.search':     'Search products…',
    // Categories
    'cat.laptops':    'Laptops',
    'cat.components': 'PC Components',
    'cat.gaming':     'Gaming',
    'cat.networking': 'Networking',
    'cat.cctv':       'CCTV',
    'cat.services':   'Services',
    // Product
    'product.addToCart': 'Add to Cart',
    'product.buyNow':    'Buy Now',
    'product.inStock':   'In Stock',
    'product.outOfStock':'Out of Stock',
    'product.reviews':   'Reviews',
    'product.specs':     'Specifications',
    'product.related':   'Related Products',
    // Cart
    'cart.title':    'Shopping Cart',
    'cart.empty':    'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total':    'Total',
    'cart.checkout': 'Proceed to Checkout',
    // Auth
    'auth.login':    'Sign In',
    'auth.register': 'Create Account',
    'auth.logout':   'Sign Out',
    'auth.email':    'Email',
    'auth.password': 'Password',
    'auth.name':     'Full Name',
    // Common
    'common.egp':       'EGP',
    'common.loading':   'Loading…',
    'common.error':     'Something went wrong',
    'common.save':      'Save',
    'common.cancel':    'Cancel',
    'common.delete':    'Delete',
    'common.edit':      'Edit',
    'common.add':       'Add',
    'common.viewAll':   'View All',
    'common.sortBy':    'Sort by',
    'common.filter':    'Filter',
    'common.price':     'Price',
    'common.brand':     'Brand',
    'common.rating':    'Rating',
    // Home
    'home.hero.title':    'Egypt\'s #1 Tech Store',
    'home.hero.subtitle': 'Laptops, Components, Gaming & More — Best Prices Guaranteed',
    'home.featured':      'Featured Products',
    'home.bestsellers':   'Best Sellers',
    'home.deals':         'Today\'s Deals',
  },
  ar: {
    // Navigation
    'nav.home':       'الرئيسية',
    'nav.shop':       'المتجر',
    'nav.categories': 'الفئات',
    'nav.deals':      'العروض',
    'nav.cart':       'السلة',
    'nav.account':    'حسابي',
    'nav.search':     'ابحث عن منتجات…',
    // Categories
    'cat.laptops':    'لابتوبات',
    'cat.components': 'مكونات الكمبيوتر',
    'cat.gaming':     'الألعاب',
    'cat.networking': 'الشبكات',
    'cat.cctv':       'كاميرات المراقبة',
    'cat.services':   'الخدمات',
    // Product
    'product.addToCart': 'أضف للسلة',
    'product.buyNow':    'اشتري الآن',
    'product.inStock':   'متوفر',
    'product.outOfStock':'غير متوفر',
    'product.reviews':   'التقييمات',
    'product.specs':     'المواصفات',
    'product.related':   'منتجات مشابهة',
    // Cart
    'cart.title':    'سلة التسوق',
    'cart.empty':    'سلتك فارغة',
    'cart.subtotal': 'المجموع',
    'cart.shipping': 'الشحن',
    'cart.total':    'الإجمالي',
    'cart.checkout': 'إتمام الشراء',
    // Auth
    'auth.login':    'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'auth.logout':   'تسجيل الخروج',
    'auth.email':    'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.name':     'الاسم الكامل',
    // Common
    'common.egp':       'ج.م',
    'common.loading':   'جاري التحميل…',
    'common.error':     'حدث خطأ ما',
    'common.save':      'حفظ',
    'common.cancel':    'إلغاء',
    'common.delete':    'حذف',
    'common.edit':      'تعديل',
    'common.add':       'إضافة',
    'common.viewAll':   'عرض الكل',
    'common.sortBy':    'ترتيب حسب',
    'common.filter':    'تصفية',
    'common.price':     'السعر',
    'common.brand':     'الماركة',
    'common.rating':    'التقييم',
    // Home
    'home.hero.title':    'متجر التكنولوجيا الأول في مصر',
    'home.hero.subtitle': 'لابتوبات، مكونات، ألعاب والمزيد — أفضل الأسعار مضمونة',
    'home.featured':      'منتجات مميزة',
    'home.bestsellers':   'الأكثر مبيعاً',
    'home.deals':         'عروض اليوم',
  },
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: 'en',
      toggle:  () => set(s => ({ lang: s.lang === 'en' ? 'ar' : 'en' })),
      setLang: l => set({ lang: l }),
      isRTL:   () => get().lang === 'ar',
      t: key => translations[get().lang][key] ?? key,
    }),
    { name: 'compunil-lang' },
  ),
)
