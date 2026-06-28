'use client'
// ============================================================
// COMPUNIL — Providers (client boundary)
// ============================================================

import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header     from '../components/layout/Header'
import Footer     from '../components/layout/Footer'
import MobileNav  from '../components/layout/MobileNav'
import CartDrawer from '../components/layout/CartDrawer'
import { useAuthInit } from '../hooks/useAuth'
import { useLangStore } from '../store/langStore'
import { usePathname } from 'next/navigation'

function AuthInitializer() {
  useAuthInit()
  return null
}

// Clears old/corrupted cart data from localStorage on first load
function CartMigration() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('compunil-cart')
      if (!raw) return
      const parsed = JSON.parse(raw)
      const items: any[] = parsed?.state?.items ?? []
      const hasCorrupt = items.some((i: any) => !i?.product?.id)
      if (hasCorrupt) {
        localStorage.removeItem('compunil-cart')
        window.location.reload()
      }
    } catch {
      localStorage.removeItem('compunil-cart')
    }
  }, [])
  return null
}

function DirSetter() {
  const { lang } = useLangStore()
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin  = pathname?.startsWith('/admin')
  const isAuth   = pathname?.startsWith('/auth')

  return (
    <>
      <AuthInitializer />
      <CartMigration />
      <DirSetter />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px', borderRadius: '12px' },
        }}
      />

      {!isAdmin && !isAuth && <Header />}

      <main className={!isAdmin && !isAuth ? 'min-h-[calc(100vh-64px)] pb-16 md:pb-0' : undefined}>
        {children}
      </main>

      {!isAdmin && !isAuth && <Footer />}
      {!isAdmin && <MobileNav />}
      {!isAdmin && <CartDrawer />}
    </>
  )
}
