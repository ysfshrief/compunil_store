'use client'
// ============================================================
// COMPUNIL — Admin: Settings
// Manage admins (add/remove) + change your own password.
// ============================================================

import { useEffect, useState } from 'react'
import { FiShield, FiUserPlus, FiLock, FiTrash2, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getAdmins, setUserRoleByEmail } from '@/lib/firestore'
import { changePassword } from '@/lib/auth'
import type { User } from '@/types'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Add admin form
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)

  // Change password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const loadAdmins = async () => {
    setLoading(true)
    try {
      setAdmins(await getAdmins())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAdmins() }, [])

  async function handleAddAdmin() {
    const email = newEmail.trim().toLowerCase()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Enter a valid email address')
      return
    }
    setAdding(true)
    try {
      const ok = await setUserRoleByEmail(email, 'admin')
      if (ok) {
        toast.success(`${email} is now an admin`)
        setNewEmail('')
        loadAdmins()
      } else {
        toast.error('No user found with that email. They must register first.')
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add admin')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveAdmin(email: string) {
    if (email === user?.email) {
      toast.error("You can't remove yourself")
      return
    }
    try {
      await setUserRoleByEmail(email, 'user')
      toast.success(`${email} is no longer an admin`)
      loadAdmins()
    } catch {
      toast.error('Failed to remove admin')
    }
  }

  async function handleChangePassword() {
    if (newPw.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPw(true)
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
      setChangingPw(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage administrators and your account security.</p>
      </div>

      {/* Manage Admins */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiShield className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">Administrators</h2>
        </div>

        {/* Add admin */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="Enter user's email to make admin"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
          <button
            onClick={handleAddAdmin}
            disabled={adding}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50"
          >
            <FiUserPlus size={15} /> {adding ? 'Adding…' : 'Add Admin'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Note: the person must have already registered an account before they can be promoted to admin.
        </p>

        {/* Admin list */}
        {loading ? (
          <div className="py-6 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {admins.map(a => (
              <li key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-sm">
                    {a.name?.[0]?.toUpperCase() ?? a.email?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <div className="font-medium text-brand-navy text-sm">{a.name || 'Admin'}</div>
                    <div className="text-xs text-gray-400">{a.email}</div>
                  </div>
                </div>
                {a.email === user?.email ? (
                  <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">You</span>
                ) : (
                  <button
                    onClick={() => handleRemoveAdmin(a.email)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={13} /> Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Change Password */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiLock className="text-brand-teal" />
          <h2 className="font-bold text-brand-navy">Change Password</h2>
        </div>
        <div className="space-y-3 max-w-md">
          <input
            type="password"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            placeholder="Current password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="New password (min 6 characters)"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
          <input
            type="password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-teal transition-colors disabled:opacity-50"
          >
            <FiCheck size={15} /> {changingPw ? 'Updating…' : 'Update Password'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          For security, you'll need to enter your current password to set a new one.
        </p>
      </section>
    </div>
  )
}
