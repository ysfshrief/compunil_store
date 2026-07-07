'use client'
// ============================================================
// COMPUNIL — Admin: Coupons
// ============================================================

import { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiX, FiSave, FiTag, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { getCoupons, saveCoupon, deleteCoupon } from '@/lib/firestore'
import { formatEGP } from '@/lib/utils'
import type { Coupon } from '@/types'

const EMPTY = { code: '', type: 'percent' as const, value: 10, minOrder: 0, usageLimit: 0, active: true, expiresAt: '' }

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setCoupons(await getCoupons()) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!editing.code?.trim()) { toast.error('كود الكوبون مطلوب'); return }
    if (editing.value <= 0) { toast.error('القيمة يجب أن تكون أكبر من صفر'); return }
    if (editing.type === 'percent' && editing.value > 100) { toast.error('النسبة لا تتجاوز 100%'); return }
    setSaving(true)
    try {
      const payload: any = {
        ...editing,
        code: editing.code.toUpperCase().trim(),
        expiresAt: editing.expiresAt ? new Date(editing.expiresAt) : null,
      }
      await saveCoupon(payload)
      toast.success('تم حفظ الكوبون ✅')
      setEditing(null)
      load()
    } catch (err: any) { toast.error(err?.message ?? 'فشل الحفظ') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف الكوبون نهائياً؟')) return
    try { await deleteCoupon(id); toast.success('تم الحذف'); load() }
    catch { toast.error('فشل الحذف') }
  }

  const input = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
  const label = "block text-sm font-semibold text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">كوبونات الخصم</h1>
          <p className="text-sm text-gray-500 mt-1">أنشئ أكواد خصم للعملاء — نسبة مئوية أو مبلغ ثابت.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-teal transition-colors">
          <FiPlus size={16} /> كوبون جديد
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <FiTag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>لا توجد كوبونات بعد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-start px-5 py-3">الكود</th>
                <th className="text-start px-5 py-3">الخصم</th>
                <th className="text-start px-5 py-3 hidden sm:table-cell">الحد الأدنى</th>
                <th className="text-start px-5 py-3 hidden md:table-cell">الاستخدام</th>
                <th className="text-start px-5 py-3">الحالة</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map(cp => (
                <tr key={cp.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-bold text-brand-navy">{cp.code}</td>
                  <td className="px-5 py-3">{cp.type === 'percent' ? `${cp.value}%` : formatEGP(cp.value)}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">{cp.minOrder ? formatEGP(cp.minOrder) : '—'}</td>
                  <td className="px-5 py-3 hidden md:table-cell">{cp.usedCount ?? 0}{cp.usageLimit ? ` / ${cp.usageLimit}` : ''}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cp.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {cp.active ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setEditing({ ...cp, expiresAt: cp.expiresAt?.toDate?.()?.toISOString?.()?.slice(0, 10) ?? '' })}
                        className="p-2 rounded-lg text-brand-navy hover:bg-blue-50"><FiEdit2 size={15} /></button>
                      <button onClick={() => handleDelete(cp.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-brand-navy">{editing.id ? 'تعديل الكوبون' : 'كوبون جديد'}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><FiX size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={label}>الكود</label>
                <input value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  className={input + ' font-mono'} dir="ltr" placeholder="SAVE10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>النوع</label>
                  <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })} className={input}>
                    <option value="percent">نسبة %</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className={label}>القيمة</label>
                  <input type="number" min={1} value={editing.value} onChange={e => setEditing({ ...editing, value: Number(e.target.value) })} className={input} />
                </div>
                <div>
                  <label className={label}>حد أدنى للطلب (ج.م)</label>
                  <input type="number" min={0} value={editing.minOrder ?? 0} onChange={e => setEditing({ ...editing, minOrder: Number(e.target.value) })} className={input} />
                </div>
                <div>
                  <label className={label}>حد الاستخدام (0 = بلا حد)</label>
                  <input type="number" min={0} value={editing.usageLimit ?? 0} onChange={e => setEditing({ ...editing, usageLimit: Number(e.target.value) })} className={input} />
                </div>
              </div>
              <div>
                <label className={label}>تاريخ الانتهاء (اختياري)</label>
                <input type="date" value={editing.expiresAt ?? ''} onChange={e => setEditing({ ...editing, expiresAt: e.target.value })} className={input} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })}
                  className="w-4 h-4 rounded" />
                نشط
              </label>
              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50">
                <FiSave size={16} /> {saving ? 'جاري الحفظ…' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
