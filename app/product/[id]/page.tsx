'use client'
// ============================================================
// COMPUNIL — Product Detail Page
// ============================================================

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FiShoppingCart, FiHeart, FiShare2, FiStar,
  FiChevronRight, FiPlus, FiMinus, FiZap,
  FiTruck, FiShield, FiPackage,
} from 'react-icons/fi'
import { useCartStore }     from '../../../store/cartStore'
import { useWishlistStore } from '../../../store/wishlistStore'
import { useLangStore }     from '../../../store/langStore'
import ProductGrid from '../../../components/ui/ProductGrid'
import StarRating  from '../../../components/ui/StarRating'
import { MOCK_PRODUCTS }   from '../../../lib/mockData'
import { formatEGP, discountPct, formatDate, cn } from '../../../lib/utils'
import type { Product } from '../../../types'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const { lang, t } = useLangStore()

  const [product, setProduct]   = useState<Product | null>(null)
  const [related, setRelated]   = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty]           = useState(1)
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'desc'>('desc')

  const addItem  = useCartStore(s => s.addItem)
  const openCart = useCartStore(s => s.openCart)
  const { toggle: toggleWish, has } = useWishlistStore()

  useEffect(() => {
    setLoading(true)
    // In production: getProductById(id) from Firestore
    const found = MOCK_PRODUCTS.find(p => p.id === id)
    if (found) {
      setProduct(found)
      setRelated(MOCK_PRODUCTS.filter(p => p.categoryId === found.categoryId && p.id !== id).slice(0, 4))
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-6 bg-gray-100 rounded w-1/2" />
            <div className="h-10 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-5xl">😕</div>
        <h2 className="text-xl font-bold text-brand-navy">Product not found</h2>
        <Link href="/shop" className="px-6 py-3 bg-brand-navy text-white rounded-xl">
          Back to Shop
        </Link>
      </div>
    )
  }

  const isWished  = has(product.id)
  const inStock   = product.stock > 0
  const discount  = product.originalPrice ? discountPct(product.originalPrice, product.price) : 0

  function handleAddToCart() {
    if (!inStock || !product) return
    addItem(product, qty)
    openCart()
    toast.success(`${qty}× ${product.name} added to cart!`, {
      icon: '🛒',
      style: { background: '#1B3A7A', color: '#fff', borderRadius: '12px' },
    })
  }

  function handleBuyNow() {
    if (!inStock || !product) return
    addItem(product, qty)
    router.push('/checkout')
  }

  const mockReviews = [
    { id: '1', userName: 'Ahmed M.', rating: 5, comment: 'Excellent product! Very happy with the quality. Highly recommend.', createdAt: new Date('2024-03-15'), helpful: 12 },
    { id: '2', userName: 'Sarah K.', rating: 4, comment: 'Great value for money. Delivery was fast. Minor packaging issue but product is perfect.', createdAt: new Date('2024-03-01'), helpful: 8 },
    { id: '3', userName: 'Omar H.', rating: 5, comment: 'Best purchase I have made this year. Works exactly as described.', createdAt: new Date('2024-02-20'), helpful: 5 },
  ]

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-brand-muted mb-6">
          <Link href="/" className="hover:text-brand-navy">Home</Link>
          <FiChevronRight size={13} />
          <Link href="/shop" className="hover:text-brand-navy">Shop</Link>
          <FiChevronRight size={13} />
          <Link href={`/shop?category=${product.categoryId}`} className="hover:text-brand-navy">
            {product.category}
          </Link>
          <FiChevronRight size={13} />
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl p-6 border border-brand-border mb-8">

          {/* ── Image Gallery ──────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
              {product.images[activeImg] ? (
                <Image
                  src={product.images[activeImg]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                      activeImg === i ? 'border-brand-navy' : 'border-brand-border hover:border-brand-navy/40',
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ───────────────────────────────── */}
          <div className="space-y-5">
            {/* Brand */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-teal uppercase tracking-wider">
                {product.brand}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied!')
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-brand-muted"
                >
                  <FiShare2 size={16} />
                </button>
                <button
                  onClick={() => {
                    toggleWish(product.id)
                    toast(isWished ? 'Removed from wishlist' : 'Added to wishlist!', { icon: '❤️' })
                  }}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isWished ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-brand-muted',
                  )}
                >
                  <FiHeart size={16} fill={isWished ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} showCount count={product.reviewCount} />
              <span className="text-sm text-brand-muted">•</span>
              <span className={cn(
                'text-sm font-medium',
                inStock ? 'text-green-600' : 'text-red-500',
              )}>
                {inStock ? `✓ In Stock (${product.stock} units)` : '✗ Out of Stock'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-brand-navy">
                {formatEGP(product.price, lang)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-0.5">
                    {formatEGP(product.originalPrice, lang)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full mb-0.5">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Quantity:</span>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center hover:border-brand-navy transition-colors"
                  >
                    <FiMinus size={13} />
                  </button>
                  <span className="w-8 text-center font-bold text-brand-navy">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-brand-border flex items-center justify-center hover:border-brand-navy transition-colors"
                  >
                    <FiPlus size={13} />
                  </button>
                </div>
                <span className="text-xs text-brand-muted">{product.stock} available</span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-navydark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={18} />
                {t('product.addToCart')}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-teal text-white font-bold rounded-xl hover:bg-brand-tealdk transition-colors disabled:opacity-50"
              >
                <FiZap size={18} />
                {t('product.buyNow')}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-brand-border">
              {[
                { icon: FiTruck,  label: 'Free Delivery', sub: 'Orders 500+ EGP' },
                { icon: FiShield, label: 'Warranty',      sub: 'Official warranty' },
                { icon: FiPackage,label: 'Easy Returns',  sub: '14-day policy' },
              ].map((item, i) => (
                <div key={i} className="text-center p-2">
                  <item.icon size={18} className="mx-auto text-brand-teal mb-1" />
                  <p className="text-[10px] font-semibold text-brand-navy">{item.label}</p>
                  <p className="text-[9px] text-brand-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden mb-8">
          <div className="flex border-b border-brand-border">
            {(['desc', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-6 py-4 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'text-brand-navy border-brand-navy'
                    : 'text-brand-muted border-transparent hover:text-brand-navy',
                )}
              >
                {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Specifications' : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'desc' && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 font-semibold text-brand-navy w-1/3 rounded-l-lg">{spec.label}</td>
                        <td className="px-4 py-3 text-gray-600 rounded-r-lg">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating summary */}
                <div className="flex items-center gap-6 p-4 bg-brand-light rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-brand-navy">{product.rating}</div>
                    <StarRating rating={product.rating} size={16} />
                    <div className="text-xs text-brand-muted mt-1">{product.reviewCount} reviews</div>
                  </div>
                </div>

                {/* Review list */}
                {mockReviews.map(review => (
                  <div key={review.id} className="border-b border-brand-border pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm text-brand-navy">{review.userName}</span>
                        <StarRating rating={review.rating} size={12} className="mt-1" />
                      </div>
                      <span className="text-xs text-brand-muted">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-brand-muted mt-2">👍 {review.helpful} found this helpful</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ────────────────────────────── */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-brand-navy">Related Products</h2>
            </div>
            <ProductGrid products={related} cols={4} />
          </section>
        )}
      </div>
    </div>
  )
}
