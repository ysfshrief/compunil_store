'use client'
// ============================================================
// COMPUNIL — Cart Drawer
// ============================================================

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { useLangStore } from '../../store/langStore'
import { formatEGP } from '../../lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, total } = useCartStore()
  const { t, lang } = useLangStore()

  // Guard: filter out any corrupted items from old localStorage format
  const validItems = items.filter(item => item?.product?.id)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-brand-navy flex items-center gap-2">
                <FiShoppingBag size={20} />
                {t('cart.title')}
                {validItems.length > 0 && (
                  <span className="bg-brand-teal text-white text-xs rounded-full px-2 py-0.5">
                    {validItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-navy transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
              {validItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <FiShoppingBag size={32} className="text-brand-navy opacity-40" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy mb-1">{t('cart.empty')}</p>
                    <p className="text-sm text-gray-400">Start shopping to add items</p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-xl hover:bg-brand-teal transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                validItems.map(item => {
                  const product  = item.product
                  const imgSrc   = product.images?.[0] ?? ''

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-50 flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-brand-navy leading-tight line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-brand-teal font-bold text-sm mt-1">
                          {formatEGP(product.originalPrice ? product.price : product.price, lang)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-gray-200 hover:border-brand-navy flex items-center justify-center transition-colors"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(product.id, item.quantity + 1)}
                              disabled={item.quantity >= (product.stock ?? 99)}
                              className="w-6 h-6 rounded-md bg-white border border-gray-200 hover:border-brand-navy flex items-center justify-center transition-colors disabled:opacity-40"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(product.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {validItems.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-medium text-brand-navy">{formatEGP(subtotal(), lang)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-brand-navy pt-2 border-t border-gray-100">
                  <span>{t('cart.total')}</span>
                  <span>{formatEGP(total(), lang)}</span>
                </div>
                <div className="space-y-2 pt-1">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full py-3 bg-brand-navy text-white text-center font-semibold rounded-xl hover:bg-brand-teal transition-colors"
                  >
                    {t('cart.checkout')}
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full py-2.5 text-center text-sm text-brand-navy border border-gray-200 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
