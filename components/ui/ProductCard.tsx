'use client'
// ============================================================
// COMPUNIL — Product Card Component
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar, FiZap } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useLangStore } from '../../store/langStore'
import { formatEGP, discountPct, cn } from '../../lib/utils'
import type { Product } from '../../types'
import toast from 'react-hot-toast'

interface Props {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: Props) {
  const [imgError, setImgError]   = useState(false)
  const [adding, setAdding]       = useState(false)
  const addItem   = useCartStore(s => s.addItem)
  const openCart  = useCartStore(s => s.openCart)
  const { toggle: toggleWish, has } = useWishlistStore()
  const isWished  = has(product.id)
  const { lang, t } = useLangStore()

  const inStock   = product.stock > 0
  const discount  = product.originalPrice ? discountPct(product.originalPrice, product.price) : 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!inStock || adding) return
    setAdding(true)
    addItem(product)
    openCart()
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1B3A7A', color: '#fff' },
    })
    await new Promise(r => setTimeout(r, 600))
    setAdding(false)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    toggleWish(product.id)
    toast(isWished ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: isWished ? '💔' : '❤️',
      style: { borderRadius: '12px' },
    })
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('group relative', className)}
    >
      <Link
        href={`/product/${product.id}`}
        className="block bg-white rounded-xl border border-brand-border hover:shadow-card-hover hover:border-brand-navy/20 transition-all duration-200 overflow-hidden"
      >
        {/* Image wrapper */}
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
          {!imgError && product.images?.[0] ? (
            <Image
              src={product.images?.[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-brand-light">
              {product.isService ? '🔧' : '📦'}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-brand-teal text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <FiZap size={9} /> Featured
              </span>
            )}
            {!inStock && (
              <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              'opacity-0 group-hover:opacity-100',
              isWished
                ? 'bg-red-500 text-white opacity-100'
                : 'bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500',
            )}
          >
            <FiHeart size={14} fill={isWished ? 'currentColor' : 'none'} />
          </button>

          {/* Quick add (hover) */}
          {inStock && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full py-2.5 bg-brand-navy/95 hover:bg-brand-navydark text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {adding ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <FiShoppingCart size={13} />
                    {t('product.addToCart')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Brand */}
          <p className="text-[10px] text-brand-muted uppercase tracking-wider font-medium mb-1">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-2 group-hover:text-brand-navy transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <FiStar
                  key={i}
                  size={11}
                  className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-[10px] text-brand-muted">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-brand-navy text-base">
              {formatEGP(product.price, lang)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatEGP(product.originalPrice, lang)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {inStock && product.stock <= 5 && (
            <p className="text-[10px] text-orange-500 font-medium mt-1.5">
              Only {product.stock} left!
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
