'use client'
// ============================================================
// COMPUNIL — Checkout Page  (v2 — requires auth)
// ============================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiChevronRight, FiLock, FiMapPin, FiUser, FiPhone, FiTag } from 'react-icons/fi'
import { useCartStore } from '@/store/cartStore'
import { useLangStore }  from '../../store/langStore'
import { useAuthStore } from '@/store/authStore'
import { createOrder, validateCoupon, incrementCouponUsage, saveUserAddress, getUserProfile } from '@/lib/firestore'
import { formatEGP } from '@/lib/utils'
import toast from 'react-hot-toast'

const EGYPT_GOVERNORATES = [
  'Cairo','Giza','Alexandria','Aswan','Asyut','Beheira','Beni Suef',
  'Dakahlia','Damietta','Faiyum','Gharbia','Ismailia','Kafr el-Sheikh',
  'Luxor','Matruh','Minya','Monufia','New Valley','North Sinai',
  'Port Said','Qalyubia','Qena','Red Sea','Sharqia','Sohag',
  'South Sinai','Suez',
]

type Step = 1 | 2 | 3

export default function CheckoutPage() {
  const { lang, t } = useLangStore()
  const router = useRouter()
  const { items, total, subtotal, shipping, clearCart } = useCartStore()
  const { user, initialized } = useAuthStore()

  // Prefill saved address from the user profile
  useEffect(() => {
    if (!user) return
    getUserProfile(user.id).then(p => {
      const a = p?.savedAddress
      if (!a) return
      setForm(f => ({
        ...f,
        phone:       f.phone       || a.phone       || '',
        street:      f.street      || a.street      || '',
        city:        f.city        || a.city        || '',
        governorate: f.governorate || a.governorate || '',
      }))
    }).catch(() => {})
  }, [user])
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const validItems = items.filter((i: any) => i?.product?.id)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', governorate: '', notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-fill form from logged-in user
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name:  f.name  || user.name  || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
      }))
    }
  }, [user])

  // Require login — redirect to login if not authenticated
  useEffect(() => {
    if (!initialized) return
    if (!user) {
      toast.error('Please sign in to checkout')
      router.push('/auth/login?redirect=/checkout')
    }
  }, [user, initialized, router])

  // Redirect to cart if empty
  useEffect(() => {
    if (initialized && validItems.length === 0 && !orderId) {
      router.push('/cart')
    }
  }, [validItems.length, initialized, orderId, router])

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function validateStep1() {
    const e: Record<string, string> = {}
    if (!form.name.trim())  e.name  = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(form.phone)) e.phone = 'Enter a valid Egyptian mobile number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e: Record<string, string> = {}
    if (!form.street.trim())      e.street      = 'Street address is required'
    if (!form.city.trim())        e.city        = 'City is required'
    if (!form.governorate.trim()) e.governorate = 'Governorate is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(subtotal() * appliedCoupon.value / 100)
      : Math.min(appliedCoupon.value, subtotal())
    : 0
  const finalTotal = Math.max(0, subtotal() + shipping() - discount)

  async function applyCoupon() {
    const code = couponCode.trim()
    if (!code) return
    setCouponLoading(true)
    try {
      const res = await validateCoupon(code, subtotal())
      if (res.coupon) {
        setAppliedCoupon(res.coupon)
        toast.success(lang === 'ar' ? 'تم تطبيق الكوبون 🎉' : 'Coupon applied 🎉')
      } else {
        const msgs: Record<string, [string, string]> = {
          notFound:     ['الكوبون غير موجود', 'Coupon not found'],
          inactive:     ['الكوبون موقوف', 'Coupon is inactive'],
          expired:      ['الكوبون منتهي', 'Coupon expired'],
          limitReached: ['وصل الكوبون لحد الاستخدام', 'Usage limit reached'],
          minOrder:     ['قيمة الطلب أقل من الحد الأدنى', 'Order below minimum'],
        }
        const [ar, en] = msgs[res.error ?? 'notFound'] ?? msgs.notFound
        toast.error(lang === 'ar' ? ar : en)
      }
    } finally {
      setCouponLoading(false)
    }
  }

  async function placeOrder() {
    if (!user) return
    setLoading(true)
    try {
      const orderItems = validItems.map((i: any) => ({
        productId:    String(i.product.id   ?? ''),
        productName:  String(i.product.name ?? ''),
        productImage: String(i.product?.images?.[0] ?? ''),
        price:        Number(i.product.price ?? 0),
        quantity:     Number(i.quantity ?? 1),
        subtotal:     Number((i.product.price ?? 0) * (i.quantity ?? 1)),
      }))

      const orderData = {
        userId:    user.id,
        userEmail: String(form.email),
        userName:  String(form.name),
        items:     orderItems,
        subtotal:  Number(subtotal()),
        shipping:  Number(shipping()),
        total:     Number(finalTotal),
        discount:  Number(discount),
        couponCode: appliedCoupon?.code ?? '',
        status:    'pending' as const,
        address: {
          id:          '1',
          label:       'Delivery',
          street:      String(form.street),
          city:        String(form.city),
          governorate: String(form.governorate),
          isDefault:   true,
        },
        phone: String(form.phone),
        notes: String(form.notes ?? ''),
      }

      const id = await createOrder(orderData)
      if (appliedCoupon) incrementCouponUsage(appliedCoupon.id)
      // Save the address for next time
      saveUserAddress(user.id, {
        phone: form.phone, street: form.street,
        city: form.city, governorate: form.governorate,
      })
      setOrderId(id)
      clearCart()
      toast.success(t('checkout.success'))
    } catch (err: any) {
      console.error('[Compunil] Order failed:', err?.code, err?.message, err)
      toast.error(`Order failed: ${err?.code ?? err?.message ?? 'Please try again'}`)
    } finally {
      setLoading(false)
    }
  }

  // ── Success Screen ────────────────────────────────────────
  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="w-10 h-10 text-green-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2">{t('checkout.orderConfirmed')}</h1>
        <p className="text-gray-500 mb-2">Thank you, <strong>{form.name}</strong></p>
        <p className="text-sm text-gray-400 mb-8 font-mono">Order ID: {orderId}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/account/orders"
            className="px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-teal transition-colors">
            {t('checkout.trackOrder')}
          </Link>
          <Link href="/shop"
            className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            {t('cart.continue')}
          </Link>
        </div>
      </div>
    )
  }

  // ── Step indicator ────────────────────────────────────────
  const steps = [
    { n: 1, label: t('checkout.info'),    icon: FiUser },
    { n: 2, label: t('checkout.address'), icon: FiMapPin },
    { n: 3, label: t('checkout.confirm'), icon: FiCheck },
  ] as const

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-navy mb-6">{t('checkout.title')}</h1>

        {/* Steps */}
        <div className="flex items-center mb-8">
          {steps.map(({ n, label, icon: Icon }, i) => (
            <div key={n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  step > n ? 'bg-green-500' : step === n ? 'bg-brand-navy' : 'bg-gray-200'
                }`}>
                  {step > n
                    ? <FiCheck className="w-4 h-4 text-white" />
                    : <Icon className={`w-4 h-4 ${step >= n ? 'text-white' : 'text-gray-400'}`} />
                  }
                </div>
                <span className={`text-xs mt-1 font-medium ${step >= n ? 'text-brand-navy' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > n ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1 — Personal Info */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-brand-navy text-lg">{t('checkout.personalInfo')}</h2>
                  {[
                    { id: 'name',  label: t('checkout.fullName') + ' *',    placeholder: 'Ahmed Mohamed',      type: 'text' },
                    { id: 'email', label: t('checkout.email') + ' *', placeholder: 'ahmed@example.com', type: 'email' },
                    { id: 'phone', label: 'Mobile Number *', placeholder: '01XXXXXXXXX',       type: 'tel' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                      <input type={type} value={(form as any)[id]}
                        onChange={e => set(id, e.target.value)} placeholder={placeholder}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${
                          errors[id] ? 'border-red-400' : 'border-gray-200'}`} />
                      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
                    </div>
                  ))}
                  <button onClick={() => validateStep1() && setStep(2)}
                    className="w-full py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors flex items-center justify-center gap-2">
                    {t('checkout.continueAddress')} <FiChevronRight />
                  </button>
                </motion.div>
              )}

              {/* Step 2 — Delivery Address */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-brand-navy text-lg">{t('checkout.deliveryAddress')}</h2>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('checkout.street')} *</label>
                    <input value={form.street} onChange={e => set('street', e.target.value)}
                      placeholder="15 Tahrir Square, Apartment 3"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${errors.street ? 'border-red-400' : 'border-gray-200'}`} />
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t('checkout.city')} *</label>
                      <input value={form.city} onChange={e => set('city', e.target.value)}
                        placeholder=""
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal ${errors.city ? 'border-red-400' : 'border-gray-200'}`} />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t('checkout.governorate')} *</label>
                      <select value={form.governorate} onChange={e => set('governorate', e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal bg-white ${errors.governorate ? 'border-red-400' : 'border-gray-200'}`}>
                        <option value="">{t('checkout.selectGov')}</option>
                        {EGYPT_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      {errors.governorate && <p className="text-xs text-red-500 mt-1">{errors.governorate}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('checkout.notes')}</label>
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                      rows={2} placeholder="Any special instructions for delivery…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                      {t('checkout.back')}
                    </button>
                    <button onClick={() => validateStep2() && setStep(3)}
                      className="flex-1 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors flex items-center justify-center gap-2">
                      {t('checkout.reviewOrder')} <FiChevronRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 — Review & Confirm */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                  <h2 className="font-bold text-brand-navy text-lg">Review Your Order</h2>

                  {/* Customer details */}
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span><strong>{form.name}</strong> • {form.email} • {form.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="w-4 h-4 text-gray-400" />
                      <span>{form.street}, {form.city}, {form.governorate}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {validItems.map((item: any) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product?.images?.[0]
                            ? <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-brand-navy truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">
                          {formatEGP(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Payment */}
                  <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
                    <FiPhone className="w-5 h-5 text-brand-teal flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">{t('checkout.payment')}</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                      {t('checkout.back')}
                    </button>
                    <button onClick={placeOrder} disabled={loading}
                      className="flex-1 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      <FiLock className="w-4 h-4" />
                      {loading ? t('checkout.placing') : t('checkout.placeOrder')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary sidebar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit sticky top-24">
            <h3 className="font-bold text-brand-navy mb-4">{t('checkout.orderSummary')}</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {validItems.map((item: any) => (
                <div key={item.product.id} className="flex justify-between">
                  <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="flex-shrink-0 font-medium">{formatEGP(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {/* Coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-mono font-bold text-green-700 flex items-center gap-1.5">
                    <FiTag size={14} /> {appliedCoupon.code}
                  </span>
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode('') }}
                    className="text-xs text-red-500 hover:underline">
                    {lang === 'ar' ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={lang === 'ar' ? 'كود الخصم' : 'Coupon code'}
                    dir="ltr"
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                  <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-40 flex-shrink-0">
                    {couponLoading ? '…' : (lang === 'ar' ? 'تطبيق' : 'Apply')}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span>{formatEGP(subtotal())}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                  <span>-{formatEGP(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.shipping')}</span>
                {shipping() === 0 ? (
                  <span className="text-green-600 font-medium">{t('cart.free')}</span>
                ) : (
                  <span>{formatEGP(shipping())}</span>
                )}
              </div>
              <div className="flex justify-between font-bold text-brand-navy text-base pt-1 border-t border-gray-100">
                <span>{t('cart.total')}</span>
                <span>{formatEGP(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
