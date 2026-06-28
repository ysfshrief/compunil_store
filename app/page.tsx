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
import type { Product } from '../types'

const HERO_SLIDES = [
  {
    title:    "Egypt's #1 Tech Store",
    subtitle: 'Latest laptops, components & gaming gear at unbeatable prices',
    cta:      'Shop Now',
    ctaHref:  '/shop',
    badge:    '🔥 Up to 30% Off',
    bg:       'from-[#0A1F4E] via-[#1B3A7A] to-[#00B4D8]',
  },
  {
    title:    'CCTV & Security Systems',
    subtitle: 'Protect what matters — professional installation available',
    cta:      'View CCTV',
    ctaHref:  '/shop?category=cctv',
    badge:    '📷 Free Installation',
    bg:       'from-[#064663] via-[#04293A] to-[#00B4D8]',
  },
  {
    title:    'Gaming Accessories',
    subtitle: 'Level up your setup — keyboards, mice, headsets & more',
    cta:      'Shop Gaming',
    ctaHref:  '/shop?category=gaming',
    badge:    '🎮 New Arrivals',
    bg:       'from-[#2D1B69] via-[#1B3A7A] to-[#4CAF50]',
  },
]

const PERKS = [
  { icon: FiTruck,       label: 'Free Delivery',    sub: 'On orders over 500 EGP' },
  { icon: FiShield,      label: 'Official Warranty', sub: 'Guaranteed authentic products' },
  { icon: FiHeadphones,  label: 'Expert Support',    sub: 'Mon–Sat 9AM–8PM' },
  { icon: FiRefreshCw,   label: 'Easy Returns',      sub: '14-day return policy' },
]

export default function HomePage() {
  const [slide, setSlide]         = useState(0)
  const [featured, setFeatured]   = useState<Product[]>([])
  const [deals, setDeals]         = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    // In production, fetch from Firestore; use mock data for demo
    setFeatured(MOCK_PRODUCTS.filter(p => p.isFeatured).slice(0, 8))
    setDeals(MOCK_PRODUCTS.filter(p => p.isOnSale).slice(0, 4))
    setLoading(false)
  }, [])

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const s = HERO_SLIDES[slide]

  return (
    <div className="bg-gray-50">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={`relative bg-gradient-to-br ${s.bg} text-white overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-24 relative z-10">
          <div className="max-w-xl">
            <motion.span
              key={`badge-${slide}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            >
              {s.badge}
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
              >
                View Deals
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
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
                  <p className="text-xs sm:text-sm font-semibold text-brand-navy leading-tight">{perk.label}</p>
                  <p className="text-[11px] text-brand-muted hidden sm:block">{perk.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader title="Shop by Category" href="/shop" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {MOCK_CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-brand-border hover:border-brand-navy hover:shadow-card-hover transition-all text-center"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-navy transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <SectionHeader
          title="Featured Products"
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
          <h2 className="text-2xl font-bold text-brand-navy text-center mb-8">Why Compunil?</h2>
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
