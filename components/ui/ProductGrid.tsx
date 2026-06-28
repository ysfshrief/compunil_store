'use client'

import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import type { Product } from '../../types'

interface Props {
  products:  Product[]
  loading?:  boolean
  cols?:     2 | 3 | 4
  emptyText?: string
}

export default function ProductGrid({
  products,
  loading = false,
  cols = 4,
  emptyText = 'No products found',
}: Props) {
  const colClass = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[cols]

  if (loading) {
    return (
      <div className={`grid ${colClass} gap-4`}>
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-brand-border overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-5 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-3xl mb-4">
          🔍
        </div>
        <p className="text-brand-navy font-semibold mb-1">{emptyText}</p>
        <p className="text-sm text-brand-muted">Try different filters or search terms</p>
      </div>
    )
  }

  return (
    <motion.div
      layout
      className={`grid ${colClass} gap-4`}
    >
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}
