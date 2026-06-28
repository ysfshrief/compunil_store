'use client'
// ============================================================
// COMPUNIL — Mobile Bottom Navigation Bar
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi'
import { useCartStore } from '../../store/cartStore'
import { cn } from '../../lib/utils'

const items = [
  { href: '/',         icon: FiHome,         label: 'Home' },
  { href: '/shop',     icon: FiGrid,         label: 'Shop' },
  { href: '/cart',     icon: FiShoppingCart, label: 'Cart', showBadge: true },
  { href: '/wishlist', icon: FiHeart,        label: 'Saved' },
  { href: '/account/orders', icon: FiUser,   label: 'Account' },
]

export default function MobileNav() {
  const pathname  = usePathname()
  const itemCount = useCartStore(s => s.itemCount())
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch — cart count from localStorage differs server vs client
  useEffect(() => { setMounted(true) }, [])

  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center">
        {items.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center py-2.5 gap-1 relative transition-colors',
                active ? 'text-brand-navy' : 'text-gray-400',
              )}
            >
              <div className="relative">
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />

                {/* Only render badge after mount to avoid hydration mismatch */}
                {mounted && item.showBadge && itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-brand-teal text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>

              <span className={cn('text-[10px] font-medium', active && 'text-brand-navy')}>
                {item.label}
              </span>

              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-navy rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
