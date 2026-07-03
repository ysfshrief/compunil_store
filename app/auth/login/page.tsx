'use client'
// ============================================================
// COMPUNIL — Login Page
// ============================================================

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { loginWithEmail, loginWithGoogle } from '../../../lib/auth'
import Input  from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!email.trim()) errs.email = 'Email is required'
    if (!password)     errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await loginWithEmail(email, password)
      toast.success('Welcome back!')
      router.push(redirectTo)
    } catch (err: any) {
      const code = err?.code ?? ''
      let msg = 'Login failed. Please try again.'
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
        msg = 'Invalid email or password'
      else if (code === 'auth/invalid-email')
        msg = 'Please enter a valid email address'
      else if (code === 'auth/too-many-requests')
        msg = 'Too many attempts. Please wait a moment and try again.'
      else if (code === 'auth/network-request-failed')
        msg = 'Network error. Check your connection.'
      else if (code === 'auth/user-disabled')
        msg = 'This account has been disabled.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome!')
      router.push(redirectTo)
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed the popup — no error needed
      } else if (code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups and try again.')
      } else if (code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Google sign-in.')
      } else {
        toast.error('Google login failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-[#1B3A7A] to-brand-teal flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/logo-icon.png" alt="Compunil" className="w-12 h-12 object-contain bg-white rounded-xl p-1" />
            <span className="text-white font-bold text-2xl">
              Compu<span className="text-brand-green">nil</span>
            </span>
          </Link>
          <p className="text-white/60 mt-2 text-sm">Egypt's #1 Tech Store</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-brand-navy mb-1">Welcome back</h1>
          <p className="text-sm text-brand-muted mb-6">Sign in to your Compunil account</p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-brand-border rounded-xl hover:bg-gray-50 transition-colors mb-5 font-medium text-gray-700 disabled:opacity-60"
          >
            <FcGoogle size={20} />
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-xs text-brand-muted">or sign in with email</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              error={errors.email}
              icon={<FiMail size={15} />}
              placeholder="your@email.com"
              required
            />
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
              error={errors.password}
              icon={<FiLock size={15} />}
              iconRight={
                <button type="button" onClick={() => setShowPw(v => !v)} className="hover:text-brand-navy">
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              }
              placeholder="••••••••"
              required
            />

            <div className="flex justify-end">
              <Link href="/auth/reset" className="text-sm text-brand-teal hover:text-brand-navy transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-brand-teal font-semibold hover:text-brand-navy">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
