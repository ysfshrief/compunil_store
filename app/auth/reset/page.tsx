'use client'
// ============================================================
// COMPUNIL — Password Reset (forgot password)
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { resetPassword } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
      toast.success('Password reset email sent!')
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/user-not-found') {
        // For privacy, show success even if the email isn't registered
        setSent(true)
      } else if (code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address')
      } else {
        toast.error('Could not send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navydark to-brand-teal flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/logo-icon.png" alt="Compunil" className="w-12 h-12 object-contain bg-white rounded-xl p-1" />
            <span className="font-bold text-2xl text-white">
              Compu<span className="text-brand-green">nil</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-brand-navy mb-2">Check your email</h1>
              <p className="text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-teal transition-colors"
              >
                <FiArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-brand-navy mb-1">Reset Password</h1>
              <p className="text-gray-500 mb-6 text-sm">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 mt-5 text-sm text-brand-teal hover:text-brand-navy transition-colors"
              >
                <FiArrowLeft size={15} /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
