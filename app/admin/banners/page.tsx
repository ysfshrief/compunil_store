'use client'
// ============================================================
// COMPUNIL — Admin: Hero Banners
// Full control over homepage slides: AR/EN text, Drive images,
// link, ordering, and active toggle.
// ============================================================

import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getHeroSlides, saveHeroSlide, deleteHeroSlide } from '@/lib/firestore'
import { driveImageUrl } from '@/lib/utils'
import type { HeroSlide } from '@/types'

const EMPTY: Omit<HeroSlide, 'id'> = {
  titleEn: '', titleAr: '', subEn: '', subAr: '',
  ctaEn: 'Shop Now', ctaAr: 'تسوق الآن', ctaHref: '/shop',
  badgeEn: '', badgeAr: '', imageUrl: '',
  bg: 'from-[#0A1F4E] via-[#1B3A7A] to-[#00B4D8]',
  order: 1, active: true,
}

const BG_OPTIONS = [
  { label: 'أزرق كحلي', value: 'from-[#0A1F4E] via-[#1B3A7A] to-[#00B4D8]' },
  { label: 'أزرق داكن', value: 'from-[#064663] via-[#04293A] to-[#00B4D8]' },
  { label: 'بنفسجي', value: 'from-[#2D1B69] via-[#1B3A7A] to-[#4CAF50]' },
  { label: 'أخضر', value: 'from-[#1B4332] via-[#2D6A4F] to-[#00B4D8]' },
  { label: 'أحمر داكن', value: 'from-[#641220] via-[#85182A] to-[#FF8C42]' },
]

export default function BannersPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Partial<HeroSlide> & { id?: string }) | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setSlides(await getHeroSlides(false))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function upd(key: string, value: any) {
    setEditing(prev => prev ? { ...prev, [key]: value } : prev)
  }

  async function handleSave() {
    if (!editing) return
    if (!editing.titleAr?.trim() || !editing.titleEn?.trim()) {
      toast.error('العنوان مطلوب بالعربي والإنجليزي')
      return
    }
    setSaving(true)
    try {
      // Normalize Drive links to direct URLs before saving
      const data = { ...editing, imageUrl: driveImageUrl(editing.imageUrl ?? '') }
      await saveHeroSlide(data)
      toast.success('تم حفظ البانر ✅')
      setEditing(null)
      load()
    } catch (err: any) {
      toast.error(err?.message ?? 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف هذا البانر نهائياً؟')) return
    try {
      await deleteHeroSlide(id)
      toast.success('تم الحذف')
      load()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  async function toggleActive(s: HeroSlide) {
    try {
      await saveHeroSlide({ id: s.id, active: !s.active })
      load()
    } catch {
      toast.error('فشل التحديث')
    }
  }

  const input = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
  const label = "block text-sm font-semibold text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">البانرات الرئيسية</h1>
          <p className="text-sm text-gray-500 mt-1">تحكم كامل في بانرات الصفحة الرئيسية — نص عربي وإنجليزي، صور، وروابط.</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY, order: slides.length + 1 })}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-teal transition-colors"
        >
          <FiPlus size={16} /> بانر جديد
        </button>
      </div>

      {/* Slides list */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <FiImage className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>لا توجد بانرات — سيعرض الموقع البانرات الافتراضية.</p>
          <p className="text-xs mt-1">أضف بانر ليحل محلها.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map(s => (
            <div key={s.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${s.active ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'}`}>
              {/* Preview */}
              <div className={`w-28 h-16 rounded-lg bg-gradient-to-br ${s.bg} flex-shrink-0 overflow-hidden relative`}>
                {s.imageUrl && (
                  <img src={s.imageUrl} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brand-navy truncate">{s.titleAr} <span className="text-gray-400 font-normal">| {s.titleEn}</span></p>
                <p className="text-xs text-gray-400 truncate">↗ {s.ctaHref} · ترتيب: {s.order}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleActive(s)} title={s.active ? 'إخفاء' : 'إظهار'}
                  className={`p-2 rounded-lg transition-colors ${s.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {s.active ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                </button>
                <button onClick={() => setEditing(s)} className="p-2 rounded-lg text-brand-navy hover:bg-blue-50 transition-colors">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-brand-navy text-lg">{editing.id ? 'تعديل البانر' : 'بانر جديد'}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>العنوان (عربي) *</label>
                  <input value={editing.titleAr ?? ''} onChange={e => upd('titleAr', e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>العنوان (إنجليزي) *</label>
                  <input value={editing.titleEn ?? ''} onChange={e => upd('titleEn', e.target.value)} className={input} dir="ltr" />
                </div>
                <div>
                  <label className={label}>الوصف (عربي)</label>
                  <input value={editing.subAr ?? ''} onChange={e => upd('subAr', e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>الوصف (إنجليزي)</label>
                  <input value={editing.subEn ?? ''} onChange={e => upd('subEn', e.target.value)} className={input} dir="ltr" />
                </div>
                <div>
                  <label className={label}>نص الزرار (عربي)</label>
                  <input value={editing.ctaAr ?? ''} onChange={e => upd('ctaAr', e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label}>نص الزرار (إنجليزي)</label>
                  <input value={editing.ctaEn ?? ''} onChange={e => upd('ctaEn', e.target.value)} className={input} dir="ltr" />
                </div>
                <div>
                  <label className={label}>شارة (عربي) — اختياري</label>
                  <input value={editing.badgeAr ?? ''} onChange={e => upd('badgeAr', e.target.value)} className={input} placeholder="🔥 خصم حتى 30%" />
                </div>
                <div>
                  <label className={label}>شارة (إنجليزي) — اختياري</label>
                  <input value={editing.badgeEn ?? ''} onChange={e => upd('badgeEn', e.target.value)} className={input} dir="ltr" placeholder="🔥 Up to 30% Off" />
                </div>
              </div>

              <div>
                <label className={label}>رابط الزرار (لما المستخدم يضغط)</label>
                <input value={editing.ctaHref ?? ''} onChange={e => upd('ctaHref', e.target.value)} className={input} dir="ltr" placeholder="/shop?category=cctv" />
                <p className="text-xs text-gray-400 mt-1">أمثلة: <code>/shop</code> · <code>/shop?category=gaming</code> · <code>/shop?sale=true</code> · <code>/product/رقم-المنتج</code></p>
              </div>

              <div>
                <label className={label}>رابط صورة الخلفية (اختياري — يدعم روابط Google Drive)</label>
                <input value={editing.imageUrl ?? ''} onChange={e => upd('imageUrl', e.target.value)} className={input} dir="ltr" placeholder="https://drive.google.com/file/d/..." />
                <p className="text-xs text-gray-400 mt-1">الصق رابط مشاركة من Drive وسيتحول تلقائياً — تأكد أن الملف "Anyone with the link"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={label}>لون الخلفية</label>
                  <select value={editing.bg ?? BG_OPTIONS[0].value} onChange={e => upd('bg', e.target.value)} className={input}>
                    {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>الترتيب</label>
                  <input type="number" min={1} value={editing.order ?? 1} onChange={e => upd('order', Number(e.target.value))} className={input} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={editing.active ?? true} onChange={e => upd('active', e.target.checked)}
                      className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal" />
                    ظاهر في الموقع
                  </label>
                </div>
              </div>

              {/* Live preview */}
              <div>
                <label className={label}>معاينة</label>
                <div className={`rounded-xl bg-gradient-to-br ${editing.bg} p-6 text-white relative overflow-hidden min-h-[120px]`}>
                  {editing.imageUrl && (
                    <img src={driveImageUrl(editing.imageUrl)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                  <div className="relative">
                    {editing.badgeAr && <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{editing.badgeAr}</span>}
                    <h3 className="font-bold text-xl mt-2">{editing.titleAr || 'العنوان هنا'}</h3>
                    <p className="text-sm text-white/80 mt-1">{editing.subAr || 'الوصف هنا'}</p>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-white text-brand-navy text-sm font-bold rounded-lg">{editing.ctaAr || 'الزرار'}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50">
                <FiSave size={16} /> {saving ? 'جاري الحفظ…' : 'حفظ البانر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
