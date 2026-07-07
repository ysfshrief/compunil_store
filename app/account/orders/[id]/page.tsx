'use client'
// ============================================================
// COMPUNIL — Order Details + Tracking Timeline
// ============================================================

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiArrowRight, FiPackage, FiCheck, FiTruck, FiHome,
  FiClock, FiX, FiMapPin, FiPhone,
} from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useLangStore } from '@/store/langStore'
import { getOrderById } from '@/lib/firestore'
import { formatEGP, formatDate, statusColor } from '@/lib/utils'
import type { Order } from '@/types'

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const

const STATUS_LABELS: Record<string, { ar: string; en: string; icon: any }> = {
  pending:    { ar: 'قيد الانتظار', en: 'Pending',    icon: FiClock },
  confirmed:  { ar: 'تم التأكيد',   en: 'Confirmed',  icon: FiCheck },
  processing: { ar: 'قيد التجهيز',  en: 'Processing', icon: FiPackage },
  shipped:    { ar: 'تم الشحن',     en: 'Shipped',    icon: FiTruck },
  delivered:  { ar: 'تم التسليم',   en: 'Delivered',  icon: FiHome },
  cancelled:  { ar: 'ملغي',         en: 'Cancelled',  icon: FiX },
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, initialized } = useAuthStore()
  const { lang, t } = useLangStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!initialized) return
    if (!user) { router.replace('/auth/login?redirect=/account/orders'); return }
    getOrderById(id)
      .then(o => {
        // Only the owner (or an admin) may view the order
        if (o && (o.userId === user.id || user.role === 'admin')) setOrder(o)
      })
      .finally(() => setLoading(false))
  }, [id, user, initialized, router])

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FiPackage className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-brand-navy mb-2">
          {lang === 'ar' ? 'الطلب غير موجود' : 'Order not found'}
        </h1>
        <Link href="/account/orders" className="text-brand-teal hover:underline text-sm">
          {t('account.myOrders')} →
        </Link>
      </div>
    )
  }

  const isCancelled = order.status === 'cancelled'
  const currentIdx = STATUS_FLOW.indexOf(order.status as any)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/account/orders" className="text-sm text-brand-teal hover:underline">
            ← {t('account.myOrders')}
          </Link>
          <h1 className="text-xl font-bold text-brand-navy mt-1 font-mono">#{order.id.slice(0, 10)}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColor(order.status)}`}>
          {lang === 'ar' ? STATUS_LABELS[order.status]?.ar : STATUS_LABELS[order.status]?.en}
        </span>
      </div>

      {/* Tracking timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-brand-navy mb-5">
            {lang === 'ar' ? 'تتبع الطلب' : 'Order Tracking'}
          </h2>
          <div className="flex items-start justify-between relative">
            {STATUS_FLOW.map((s, i) => {
              const Icon = STATUS_LABELS[s].icon
              const done = i <= currentIdx
              return (
                <div key={s} className="flex flex-col items-center flex-1 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={17} />
                  </div>
                  <span className={`text-[11px] mt-2 text-center font-medium ${done ? 'text-green-600' : 'text-gray-400'}`}>
                    {lang === 'ar' ? STATUS_LABELS[s].ar : STATUS_LABELS[s].en}
                  </span>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`absolute top-5 ${lang === 'ar' ? 'left-[-50%]' : 'right-[-50%]'} w-full h-0.5 -z-10 ${
                      i < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-brand-navy mb-4">
          {lang === 'ar' ? 'المنتجات' : 'Items'} ({order.items.length})
        </h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                {item.productImage && (
                  <img src={item.productImage} alt="" className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`} className="font-medium text-sm text-brand-navy hover:text-brand-teal truncate block">
                  {item.productName}
                </Link>
                <p className="text-xs text-gray-400">{formatEGP(item.price)} × {item.quantity}</p>
              </div>
              <span className="font-semibold text-sm">{formatEGP(item.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Address + totals */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-brand-navy text-sm mb-3 flex items-center gap-2">
            <FiMapPin size={15} className="text-brand-teal" />
            {lang === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
          </h3>
          <p className="text-sm text-gray-600">{order.userName}</p>
          <p className="text-sm text-gray-600">{order.address?.street}</p>
          <p className="text-sm text-gray-600">{order.address?.city}، {order.address?.governorate}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1" dir="ltr">
            <FiPhone size={13} /> {order.phone}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-brand-navy text-sm mb-3">{t('checkout.orderSummary')}</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t('cart.subtotal')}</span><span>{formatEGP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('cart.shipping')}</span>
              <span>{order.shipping === 0 ? t('cart.free') : formatEGP(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-navy pt-2 border-t border-gray-100">
              <span>{t('cart.total')}</span><span>{formatEGP(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
