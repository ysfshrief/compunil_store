'use client'
// ============================================================
// COMPUNIL — Account Settings (change password)
// ============================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiLock, FiCheck, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useLangStore } from '@/store/langStore'
import { changePassword } from '@/lib/auth'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, initialized } = useAuthStore()
  const { t } = useLangStore()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialized && !user) router.replace('/auth/login?redirect=/account/settings')
  }, [initialized, user, router])

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  async function handleChangePassword() {
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await changePassword(currentPw, newPw)
      toast.success('Password changed successfully')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code.includes('wrong-password') || code.includes('invalid-credential'))
        toast.error('Current password is incorrect')
      else
        toast.error(err?.message ?? 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy mb-6">{t('account.settings')}</h1>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiUser className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">{t('account.profile')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-navy text-white flex items-center justify-center text-xl font-bold">
            {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <div className="font-semibold text-brand-navy">{user.name || 'Customer'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiLock className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">{t('account.changePassword')}</h2>
        </div>
        <div className="space-y-3">
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
            placeholder={t("account.currentPassword")}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder={t("account.newPassword")}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder={t("account.confirmNew")}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          <button onClick={handleChangePassword} disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50">
            <FiCheck size={15} /> {saving ? t('common.loading') : t('account.updatePassword')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Note: password change is only available for email/password accounts, not Google sign-in.
        </p>
      </div>
    </div>
  )
}
