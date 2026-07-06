'use client'
// ============================================================
// COMPUNIL — Admin: Store Settings
// Admin controls shipping, contact info, and announcement bar.
// ============================================================

import { useEffect, useState } from 'react'
import { FiTruck, FiPhone, FiSave, FiGlobe } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getStoreSettings, saveStoreSettings } from '@/lib/firestore'
import { useSettingsStore } from '@/store/settingsStore'
import type { StoreSettings } from '@/types'

export default function StoreSettingsPage() {
  const [s, setS] = useState<StoreSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const syncStore = useSettingsStore(st => st.set)

  useEffect(() => {
    getStoreSettings().then(setS)
  }, [])

  function upd<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setS(prev => prev ? { ...prev, [key]: value } : prev)
  }

  async function handleSave() {
    if (!s) return
    if (s.shippingFee < 0 || s.freeShippingAbove < 0) {
      toast.error('القيم لا يمكن أن تكون سالبة')
      return
    }
    setSaving(true)
    try {
      await saveStoreSettings(s)
      syncStore(s)
      toast.success('تم حفظ الإعدادات ✅')
    } catch (err: any) {
      toast.error(err?.message ?? 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (!s) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const input = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
  const label = "block text-sm font-semibold text-gray-700 mb-1"

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">إعدادات المتجر</h1>
        <p className="text-sm text-gray-500 mt-1">تحكم في الشحن وبيانات التواصل وشريط الإعلانات — التغييرات تظهر فوراً في الموقع.</p>
      </div>

      {/* Shipping */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTruck className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">الشحن</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>رسوم الشحن (ج.م)</label>
            <input type="number" min={0} value={s.shippingFee}
              onChange={e => upd('shippingFee', Number(e.target.value))} className={input} />
          </div>
          <div>
            <label className={label}>شحن مجاني فوق (ج.م)</label>
            <input type="number" min={0} value={s.freeShippingAbove}
              onChange={e => upd('freeShippingAbove', Number(e.target.value))} className={input} />
            <p className="text-xs text-gray-400 mt-1">اكتب 0 لإلغاء الشحن المجاني نهائياً</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiPhone className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">بيانات التواصل</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>رقم التليفون</label>
            <input value={s.phone} onChange={e => upd('phone', e.target.value)} className={input} dir="ltr" />
          </div>
          <div>
            <label className={label}>واتساب (بصيغة دولية)</label>
            <input value={s.whatsapp} onChange={e => upd('whatsapp', e.target.value)} className={input} dir="ltr" placeholder="201001381010" />
          </div>
          <div>
            <label className={label}>البريد الإلكتروني</label>
            <input type="email" value={s.email} onChange={e => upd('email', e.target.value)} className={input} dir="ltr" />
          </div>
          <div>
            <label className={label}>العنوان</label>
            <input value={s.address} onChange={e => upd('address', e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>رابط فيسبوك (اختياري)</label>
            <input value={s.facebook ?? ''} onChange={e => upd('facebook', e.target.value)} className={input} dir="ltr" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className={label}>رابط انستجرام (اختياري)</label>
            <input value={s.instagram ?? ''} onChange={e => upd('instagram', e.target.value)} className={input} dir="ltr" placeholder="https://instagram.com/..." />
          </div>
        </div>
      </section>

      {/* Announcement bar */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiGlobe className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">شريط الإعلان (أعلى الموقع)</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className={label}>النص بالعربية</label>
            <input value={s.announcementAr ?? ''} onChange={e => upd('announcementAr', e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>النص بالإنجليزية</label>
            <input value={s.announcementEn ?? ''} onChange={e => upd('announcementEn', e.target.value)} className={input} dir="ltr" />
          </div>
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50"
      >
        <FiSave size={16} /> {saving ? 'جاري الحفظ…' : 'حفظ الإعدادات'}
      </button>
    </div>
  )
}
