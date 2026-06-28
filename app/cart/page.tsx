'use client'
// ============================================================
// COMPUNIL — Cart Page
// ============================================================

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi'
import { useCartStore }  from '../../store/cartStore'
import { useLangStore }  from '../../store/langStore'
import { formatEGP } from '../../lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, subtotal, total } = useCartStore()
  const { lang, t } = useLangStore()

  // Guard: filter out corrupted items from old localStorage format
  const validItems = items.filter(item => item?.product?.id)

  if (validItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 text-4xl">
          🛒
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2">{t('cart.empty')}</h1>
        <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors"
        >
          <FiShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-navy">
            {t('cart.title')}
            <span className="ml-2 text-base font-normal text-gray-400">
              ({validItems.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5"
          >
            <FiTrash2 size={14} /> Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {validItems.map(item => {
                const p      = item.product
                const imgSrc = p.images?.[0] ?? ''

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
                  >
                    {/* Image */}
                    <Link href={`/product/${p.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={p.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl bg-blue-50">📦</div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 font-medium uppercase">{p.brand}</p>
                          <Link href={`/product/${p.id}`}>
                            <h3 className="font-semibold text-sm text-brand-navy line-clamp-2 hover:underline">
                              {p.name}
                            </h3>
                          </Link>
                        </div>
                        <button
                          onClick={() => removeItem(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(p.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:border-brand-navy flex items-center justify-center transition-colors"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(p.id, item.quantity + 1)}
                            disabled={item.quantity >= (p.stock ?? 99)}
                            className="w-7 h-7 rounded-lg border border-gray-200 hover:border-brand-navy flex items-center justify-center transition-colors disabled:opacity-40"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        {/* Line subtotal */}
                        <div className="text-right">
                          <p className="font-bold text-brand-navy">
                            {formatEGP(p.price * item.quantity, lang)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">
                              {formatEGP(p.price, lang)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <Link
              href="/shop"
              className="flex items-center gap-2 text-sm text-brand-teal hover:text-brand-navy transition-colors mt-2"
            >
              ← Continue shopping
            </Link>
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            {/* Promo code */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
                <FiTag size={15} /> Promo Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-navy outline-none"
                />
                <button className="px-4 py-2 bg-brand-navy text-white text-sm font-medium rounded-lg hover:bg-brand-teal transition-colors">
                  Apply
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-bold text-brand-navy mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm">
                {validItems.map(item => (
                  <div key={item.product.id} className="flex justify-between text-gray-600">
                    <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0 font-medium">
                      {formatEGP(item.product.price * item.quantity, lang)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-semibold text-brand-navy">{formatEGP(subtotal(), lang)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-brand-navy text-base pt-2 border-t border-gray-100">
                  <span>{t('cart.total')}</span>
                  <span>{formatEGP(total(), lang)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-5 flex items-center justify-center gap-2 w-full py-4 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors"
              >
                {t('cart.checkout')} <FiArrowRight size={16} />
              </Link>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Secure checkout · Cash on delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
