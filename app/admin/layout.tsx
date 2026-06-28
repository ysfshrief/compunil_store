'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiLogOut, FiMenu, FiX, FiChevronRight, FiBell, FiActivity, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/auth';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/products', label: 'Products', icon: FiPackage },
  { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/categories', label: 'Categories', icon: FiTag },
  { href: '/admin/visitors', label: 'Visitors', icon: FiActivity },
  { href: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      toast.error('Please log in to access the admin panel');
      router.replace('/auth/login');
    } else if (!isAdmin()) {
      toast.error('Access denied — admin only');
      router.replace('/');
    }
  }, [user, initialized, isAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.replace('/');
  };

  if (!initialized || !user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-brand-navy text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center text-sm font-bold">C</div>
        <div>
          <div className="font-bold text-sm">Compunil</div>
          <div className="text-xs text-white/50">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <FiChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-brand-teal/30 rounded-full flex items-center justify-center text-xs font-bold uppercase">
            {user.name?.[0] || user.email?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate">{user.name || 'Admin'}</div>
            <div className="text-xs text-white/40 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-red-400 transition-colors w-full"
        >
          <FiLogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {NAV_ITEMS.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Admin'}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">Compunil Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-brand-teal hover:underline hidden sm:block"
            >
              View Store →
            </Link>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FiBell className="w-4 h-4 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
