'use client'
// ============================================================
// COMPUNIL — Header Component (Arabic-only, admin-gated)
// ============================================================

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser,
  FiMenu, FiX, FiLogOut, FiSettings, FiPackage,
} from 'react-icons/fi'
import { useCartStore }  from '../../store/cartStore'
import { useAuthStore }  from '../../store/authStore'
import { useLangStore }  from '../../store/langStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getAllProducts } from '../../lib/firestore'
import { localName } from '../../lib/utils'
import type { Product } from '../../types'
import { signOut }       from '../../lib/auth'
import { cn }            from '../../lib/utils'
import toast             from 'react-hot-toast'

export default function Header() {
  const router = useRouter()
  const [query, setQuery]                   = useState('')
  const [suggestions, setSuggestions]       = useState<Product[]>([])
  const [allProducts, setAllProducts]       = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen]     = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const [mounted, setMounted]               = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef  = useRef<HTMLDivElement>(null)

  const itemCount = useCartStore(s => s.itemCount())
  const openCart  = useCartStore(s => s.openCart)
  const { user, isAdmin } = useAuthStore()
  const { lang, toggle: toggleLang, t } = useLangStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  // Load products once for instant search (<2000 products = fine)
  useEffect(() => {
    getAllProducts().then(setAllProducts).catch(() => {})
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return }
    const q = query.toLowerCase()
    setSuggestions(
      allProducts
        .filter(p =>
          p.name.toLowerCase().includes(q) ||
          (p.nameAr ?? '').includes(query) ||
          (p.brand ?? '').toLowerCase().includes(q)
        )
        .slice(0, 6)
    )
  }, [query, allProducts])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  async function handleSignOut() {
    await signOut()
    setUserMenuOpen(false)
    toast.success('تم تسجيل الخروج')
    router.push('/')
  }

  const categories = [
    { href: '/shop',                     label: 'جميع المنتجات' },
    { href: '/shop?category=laptops',    label: '💻 لابتوبات' },
    { href: '/shop?category=components', label: '🖥️ مكونات PC' },
    { href: '/shop?category=gaming',     label: '🎮 جيمنج' },
    { href: '/shop?category=networking', label: '📡 شبكات' },
    { href: '/shop?category=cctv',       label: '📷 كاميرات' },
    { href: '/shop?category=services',   label: '🔧 خدمات' },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white transition-shadow duration-200',
        scrolled ? 'shadow-nav' : 'border-b border-brand-border',
      )}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="bg-brand-navy text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2">
          <span className="truncate">
            🚚 {lang === 'ar' ? (settings.announcementAr || 'شحن مجاني للطلبات فوق 500 ج.م') : (settings.announcementEn || 'Free delivery on orders over 500 EGP')}
          </span>
          {/* Admin link — only visible to admins */}
          {mounted && isAdmin() && (
            <Link href="/admin" className="hover:text-brand-teal transition-colors font-medium flex-shrink-0">
              الإدارة
            </Link>
          )}
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Compunil" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl text-brand-navy hidden sm:block">
              Compu<span className="text-brand-green">nil</span>
            </span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="order-last md:order-none w-full md:flex-1 md:max-w-2xl md:mx-auto relative">
          <div className="flex items-center bg-gray-50 border-2 border-brand-border rounded-xl overflow-hidden focus-within:border-brand-navy focus-within:bg-white transition-all">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t('nav.search')}
              className="flex-1 px-4 py-2.5 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            <button type="submit" className="px-4 py-2.5 bg-brand-navy hover:bg-brand-navydark text-white transition-colors">
              <FiSearch size={18} />
            </button>
          </div>

          {/* Instant search suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-brand-border overflow-hidden z-50">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => { router.push(`/product/${p.id}`); setQuery(''); setShowSuggestions(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-start"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display='none')} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-navy truncate">{localName(p, lang)}</p>
                    <p className="text-xs text-brand-teal font-semibold">{p.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto md:ml-0">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="hidden sm:flex items-center gap-1 text-xs font-medium text-brand-muted hover:text-brand-navy px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {lang === 'en' ? '🇸🇦 عر' : '🇺🇸 EN'}
          </button>

          {/* Wishlist */}
          <Link href="/wishlist" className="p-2 rounded-lg hover:bg-gray-50 text-brand-muted hover:text-brand-navy transition-colors">
            <FiHeart size={20} />
          </Link>

          {/* Cart */}
          <button onClick={openCart} className="p-2 rounded-lg hover:bg-gray-50 text-brand-muted hover:text-brand-navy transition-colors relative">
            <FiShoppingCart size={20} />
            {mounted && itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </motion.span>
            )}
          </button>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 text-brand-muted hover:text-brand-navy transition-colors"
            >
              <FiUser size={20} />
              {user && (
                <span className="text-xs font-medium text-brand-navy hidden sm:block max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-brand-border overflow-hidden z-50"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-brand-border">
                        <p className="font-semibold text-brand-navy text-sm">{user.name}</p>
                        <p className="text-xs text-brand-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/account/orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                          <FiPackage size={15} /> طلباتي
                        </Link>
                        <Link href="/wishlist" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                          <FiHeart size={15} /> المحفوظات
                        </Link>
                        <Link href="/account/settings" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                          <FiSettings size={15} /> إعدادات الحساب
                        </Link>
                        {/* Admin panel — only for admins */}
                        {isAdmin() && (
                          <button
                            onClick={() => { setUserMenuOpen(false); router.push('/admin') }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 text-brand-navy font-semibold">
                            <FiSettings size={15} /> لوحة الإدارة
                          </button>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600"
                        >
                          <FiLogOut size={15} /> {t('auth.logout')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <Link href="/auth/login" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 font-medium text-brand-navy">
                        {t('auth.login')}
                      </Link>
                      <Link href="/auth/register" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700">
                        {t('auth.register')}
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="p-2 rounded-lg hover:bg-gray-50 text-brand-muted hover:text-brand-navy transition-colors md:hidden"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Category nav (desktop) ──────────────────────────── */}
      <nav className="hidden md:block border-t border-brand-border bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {categories.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-brand-navy hover:bg-brand-light transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-brand-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mr-auto">
              <Link href="/shop?sale=true" className="block px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 whitespace-nowrap">
                🔥 عروض
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-brand-border bg-white overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {[
                ...categories,
                { href: '/shop?sale=true', label: '🔥 عروض' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-light hover:text-brand-navy"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
