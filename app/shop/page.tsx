'use client'
// ============================================================
// COMPUNIL — Shop Page
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import ProductGrid  from '../../components/ui/ProductGrid'
import SectionHeader from '../../components/ui/SectionHeader'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../lib/mockData'
import { useLangStore } from '../../store/langStore'
import { formatEGP, cn } from '../../lib/utils'
import type { Product, ProductFilters } from '../../types'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
]

const BRANDS = ['ASUS', 'Lenovo', 'Logitech', 'Corsair', 'TP-Link', 'Hikvision', 'Keychron']

export default function ShopPage() {
  const params = useSearchParams()
  const { lang } = useLangStore()

  const [products, setProducts]       = useState<Product[]>([])
  const [filtered, setFiltered]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    category: true, price: true, brand: true, rating: true,
  })

  const [filters, setFilters] = useState<ProductFilters>({
    category: params.get('category') ?? undefined,
    search:   params.get('search')   ?? undefined,
    sortBy:   'newest',
  })
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [minRating, setMinRating]   = useState(0)

  // Load products
  useEffect(() => {
    setLoading(true)
    // In production, use getProducts() from firestore
    setTimeout(() => {
      setProducts(MOCK_PRODUCTS)
      setLoading(false)
    }, 400)
  }, [])

  // Update filters from URL params
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: params.get('category') ?? undefined,
      search:   params.get('search')   ?? undefined,
    }))
  }, [params])

  // Apply filters
  useEffect(() => {
    let result = [...products]

    if (filters.category) {
      result = result.filter(p =>
        p.categoryId === filters.category || p.category.toLowerCase() === filters.category,
      )
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result  = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
      )
    }
    if (params.get('sale') === 'true') {
      result = result.filter(p => p.isOnSale)
    }
    if (params.get('featured') === 'true') {
      result = result.filter(p => p.isFeatured)
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand))
    }

    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating)
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break
      case 'popular':    result.sort((a, b) => b.reviewCount - a.reviewCount); break
      default:           result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    setFiltered(result)
  }, [products, filters, priceRange, selectedBrands, minRating, params])

  function toggleBrand(brand: string) {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand],
    )
  }

  function toggleSection(key: keyof typeof expandedSections) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function clearFilters() {
    setFilters({ sortBy: 'newest' })
    setPriceRange([0, 100000])
    setSelectedBrands([])
    setMinRating(0)
  }

  const hasActiveFilters = filters.category || filters.search || selectedBrands.length > 0 || minRating > 0

  const pageTitle = filters.category
    ? MOCK_CATEGORIES.find(c => c.id === filters.category)?.name ?? 'Products'
    : filters.search
    ? `Results for "${filters.search}"`
    : 'All Products'

  // ── Filter Sidebar ─────────────────────────────────────────
  const FilterPanel = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brand-navy">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-brand-teal hover:text-brand-navy transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          Category
          {expandedSections.category ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {expandedSections.category && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => setFilters(p => ({ ...p, category: undefined }))}
                className="accent-brand-navy"
              />
              <span className="text-sm text-gray-600">All Categories</span>
            </label>
            {MOCK_CATEGORIES.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.id}
                  onChange={() => setFilters(p => ({ ...p, category: cat.id }))}
                  className="accent-brand-navy"
                />
                <span className="text-sm text-gray-600">{cat.icon} {cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          Price Range
          {expandedSections.price ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <span>{formatEGP(priceRange[0], lang)}</span>
              <span className="flex-1 text-center">—</span>
              <span>{formatEGP(priceRange[1], lang)}</span>
            </div>
            <input
              type="range"
              min={0} max={100000} step={1000}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              className="w-full accent-brand-navy"
            />
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-b border-brand-border pb-4">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          Brand
          {expandedSections.brand ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {expandedSections.brand && (
          <div className="space-y-2">
            {BRANDS.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="accent-brand-navy rounded"
                />
                <span className="text-sm text-gray-600">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div>
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3"
        >
          Min. Rating
          {expandedSections.rating ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 0].map(r => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === r}
                  onChange={() => setMinRating(r)}
                  className="accent-brand-navy"
                />
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  {r === 0 ? 'All ratings' : (
                    <>
                      {'★'.repeat(r)} <span className="text-brand-muted">& up</span>
                    </>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-brand-navy">{pageTitle}</h1>
            <p className="text-sm text-brand-muted mt-0.5">
              {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value as any }))}
              className="text-sm border border-brand-border rounded-xl px-3 py-2 bg-white outline-none focus:border-brand-navy"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-brand-border rounded-xl text-sm font-medium"
            >
              <FiFilter size={14} /> Filter
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand-teal rounded-full" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-brand-border p-4 sticky top-24">
              {FilterPanel}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <ProductGrid products={filtered} loading={loading} cols={3} />

            {!loading && filtered.length > 0 && (
              <p className="text-center text-sm text-brand-muted mt-8">
                Showing all {filtered.length} products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-brand-navy">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <FiX size={18} />
                </button>
              </div>
              {FilterPanel}
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full mt-6 py-3 bg-brand-navy text-white font-semibold rounded-xl"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
