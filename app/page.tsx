'use client'
// ============================================================
// COMPUNIL — Home Page
// ============================================================

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiRefreshCw } from 'react-icons/fi'
import ProductGrid  from '../components/ui/ProductGrid'
import SectionHeader from '../components/ui/SectionHeader'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mockData'
import { getFeaturedProducts, getProducts, getCategories, getHeroSlides } from '../lib/firestore'
import type { Product, Category, HeroSlide } from '../types'
import { useLangStore } from '../store/langStore'
import { driveImageUrl, localName } from '../lib/utils'

const HERO_SLIDES = [
  {
    titleKey: 'home.hero.title', subKey: 'home.hero.subtitle', ctaKey: 'home.hero.shopNow',
    ctaHref: '/shop', badgeKey: 'home.hero.upTo', badgeIcon: '🔥',
    bg: 'from-[#0A1F4E] via-[#1B3A7A] to-[#00B4D8]',
  },
  {
    titleKey: 'slide.cctv.title', subKey: 'slide.cctv.sub', ctaKey: 'slide.cctv.cta',
    ctaHref: '/shop?category=cctv', badgeKey: 'slide.cctv.badge', badgeIcon: '📷',
    bg: 'from-[#064663] via-[#04293A] to-[#00B4D8]',
  },
  {
    titleKey: 'slide.gaming.title', subKey: 'slide.gaming.sub', ctaKey: 'slide.gaming.cta',
    ctaHref: '/shop?category=gaming', badgeKey: 'slide.gaming.badge', badgeIcon: '🎮',
    bg: 'from-[#2D1B69] via-[#1B3A7A] to-[#4CAF50]',
  },
]

const PERKS = [
  { icon: FiTruck,      labelKey: 'home.perk.delivery', subKey: 'home.perk.deliverySub' },
  { icon: FiShield,     labelKey: 'home.perk.warranty', subKey: 'home.perk.warrantySub' },
  { icon: FiHeadphones, labelKey: 'home.perk.support',  subKey: 'home.perk.supportSub' },
  { icon: FiRefreshCw,  labelKey: 'home.perk.returns',  subKey: 'home.perk.returnsSub' },
]

export default function HomePage() {
  const { lang, t } = useLangStore()
  const [dbSlides, setDbSlides] = useState<HeroSlide[]>([])
  const [slide, setSlide]         = useState(0)
  const [featured, setFeatured]   = useState<Product[]>([])
  const [deals, setDeals]         = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    // Fetch from Firestore; fall back to mock data if the store is empty
    // (e.g. before the admin has added real products).
    async function loadData() {
      try {
        const [feat, saleRes, cats, slides] = await Promise.all([
          getFeaturedProducts(8),
          getProducts({ sortBy: 'newest' }, 20),
          getCategories(),
          getHeroSlides(true),
        ])
        setDbSlides(slides)
        const onSale = saleRes.products.filter(p => p.isOnSale).slice(0, 4)

        setFeatured(feat.length ? feat : MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 8))
        setDeals(onSale.length ? onSale : MOCK_PRODUCTS.filter(p => p.isOnSale).slice(0, 4))
        setCategories(cats.length ? cats : MOCK_CATEGORIES)
      } catch {
        // Firestore unavailable — use mock data
        setFeatured(MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 8))
        setDeals(MOCK_PRODUCTS.filter(p => p.isOnSale).slice(0, 4))
        setCategories(MOCK_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Auto-advance hero
  useEffect(() => {
    const iv = setInterval(() => setSlide(s => s + 1), 5000)
    return () => clearInterval(iv)
  }, [])

  // Use admin-created slides when available; otherwise the built-in defaults
  const effectiveSlides = dbSlides.length
    ? dbSlides.map(d => ({
        title:    lang === 'ar' ? d.titleAr : d.titleEn,
        subtitle: lang === 'ar' ? d.subAr   : d.subEn,
        cta:      lang === 'ar' ? d.ctaAr   : d.ctaEn,
        badge:    lang === 'ar' ? (d.badgeAr ?? '') : (d.badgeEn ?? ''),
        badgeIcon: '',
        ctaHref:  d.ctaHref || '/shop',
        bg:       d.bg || 'from-[#0A1F4E] via-[#1B3A7A] to-[#00B4D8]',
        imageUrl: d.imageUrl ? driveImageUrl(d.imageUrl) : '',
      }))
    : HERO_SLIDES.map(h => ({
        title: t(h.titleKey), subtitle: t(h.subKey), cta: t(h.ctaKey),
        badge: t(h.badgeKey), badgeIcon: h.badgeIcon, ctaHref: h.ctaHref, bg: h.bg, imageUrl: '',
      }))

  const s = effectiveSlides[slide % effectiveSlides.length]

  return (
    <div className="bg-gray-50">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={`relative bg-gradient-to-br ${s.bg} text-white overflow-hidden`}>
        {s.imageUrl && (
          <img src={s.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={e => (e.currentTarget.style.display = 'none')} />
        )}
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-24 relative z-10">
          <div className="max-w-xl">
            <motion.span
              key={`badge-${slide}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            >
              {s.badgeIcon} {s.badge}
            </motion.span>
            <motion.h1
              key={`title-${slide}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4"
            >
              {s.title}
            </motion.h1>
            <motion.p
              key={`sub-${slide}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-white/80 mb-8"
            >
              {s.subtitle}
            </motion.p>
            <motion.div
              key={`cta-${slide}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href={s.ctaHref}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-brand-navy font-bold rounded-xl hover:bg-brand-light transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                {s.cta} <FiArrowRight size={16} />
              </Link>
              <Link
                href="/shop?sale=true"
                className="px-5 sm:px-6 py-3 sm:py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm sm:text-base"
              > {t("home.hero.viewDeals")} </Link>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {effectiveSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-8 bottom-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-white/5 pointer-events-none" />
      </section>

      {/* ── Perks bar ─────────────────────────────────────── */}
      <section className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                  <perk.icon size={18} className="text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-brand-navy leading-tight">{t(perk.labelKey)}</p>
                  <p className="text-[11px] text-brand-muted hidden sm:block">{t(perk.subKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader title={t("home.shopByCategory")} href="/shop" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-brand-border hover:border-brand-navy hover:shadow-card-hover transition-all text-center"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-navy transition-colors leading-tight">
                {localName(cat, lang)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <SectionHeader
          title={t("home.featured")}
          subtitle="Hand-picked for quality and value"
          href="/shop?featured=true"
        />
        <ProductGrid products={featured} loading={loading} cols={4} />
      </section>

      {/* ── Deals Banner ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="bg-gradient-to-r from-brand-navy to-brand-teal rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">Limited time offer</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">Today's Hot Deals 🔥</h3>
            <p className="text-white/80">Up to 30% off on selected laptops and components</p>
          </div>
          <Link
            href="/shop?sale=true"
            className="flex-shrink-0 px-7 py-3.5 bg-white text-brand-navy font-bold rounded-xl hover:bg-brand-light transition-colors"
          >
            Shop Deals
          </Link>
        </div>
      </section>

      {/* ── On Sale ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <SectionHeader
          title="Best Deals"
          subtitle="Biggest savings this week"
          href="/shop?sale=true"
        />
        <ProductGrid products={deals} loading={loading} cols={4} />
      </section>

      {/* ── Why Compunil ──────────────────────────────────── */}
      <section className="bg-white border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-brand-navy text-center mb-8">{t("home.whyUs")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '🏆', title: '5+ Years in Business', body: 'Trusted by thousands of customers across Egypt for premium tech products.' },
              { emoji: '✅', title: '100% Authentic Products', body: 'Every product is sourced directly from authorized distributors with full warranty.' },
              { emoji: '⚡', title: 'Expert Installation', body: 'Professional installation services for CCTV, networking, and PC builds.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-brand-light">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h4 className="font-bold text-brand-navy mb-2">{item.title}</h4>
                <p className="text-sm text-brand-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
