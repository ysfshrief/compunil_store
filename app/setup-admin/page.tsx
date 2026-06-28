'use client'
// ============================================================
// COMPUNIL — One-Time Admin Setup
// Visit /setup-admin once to create the first admin account.
// After an admin exists, this page locks itself automatically.
// ============================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiShield, FiCheck, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { registerWithEmail } from '@/lib/auth'
import { getAdmins, setUserRoleByEmail } from '@/lib/firestore'

export default function SetupAdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [locked, setLocked] = useState(false)

  const [name, setName] = useState('Shrief')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)

  // Lock the page if an admin already exists
  useEffect(() => {
    (async () => {
      try {
        const admins = await getAdmins()
        if (admins.length > 0) setLocked(true)
      } catch {
        // If we can't check (e.g. rules), allow attempt
      } finally {
        setChecking(false)
      }
    })()
  }, [])

  async function handleCreate() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { toast.error('Enter a valid email'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setCreating(true)
    try {
      // 1. Create the account
      await registerWithEmail(email.trim(), password, name.trim() || 'Admin')
      // 2. Promote to admin
      const ok = await setUserRoleByEmail(email.trim(), 'admin')
      if (ok) {
        toast.success('Admin account created! Redirecting…')
        setTimeout(() => router.push('/admin'), 1500)
      } else {
        toast.error('Account created but promotion failed. Try the admin settings.')
      }
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code.includes('email-already-in-use'))
        toast.error('This email is already registered. Use admin settings to promote it.')
      else
        toast.error(err?.message ?? 'Failed to create admin')
    } finally {
      setCreating(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <FiLock className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-xl font-bold text-brand-navy mb-2">Setup Already Complete</h1>
        <p className="text-gray-500 max-w-sm mb-6">
          An admin account already exists. For security, this setup page is now locked.
          To add more admins, sign in and go to Admin → Settings.
        </p>
        <button onClick={() => router.push('/auth/login')}
          className="px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-teal transition-colors">
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-navy flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Create First Admin</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is a one-time setup. Create your administrator account to manage the store.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@compunil.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" />
          </div>
          <button onClick={handleCreate} disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50 mt-2">
            <FiCheck size={16} /> {creating ? 'Creating…' : 'Create Admin Account'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          ⚠️ Delete or protect this page after creating your admin. It locks automatically once an admin exists.
        </p>
      </div>
    </div>
  )
}
