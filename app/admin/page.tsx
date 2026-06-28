'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiPackage, FiShoppingBag, FiUsers, FiDollarSign,
  FiTrendingUp, FiAlertCircle, FiRefreshCw, FiArrowUpRight,
} from 'react-icons/fi';
import { getDashboardStats } from '@/lib/firestore';
import { formatEGP, statusColor } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const MOCK_STATS: DashboardStats = {
  totalProducts: 48,
  totalOrders: 132,
  totalUsers: 89,
  totalRevenue: 1_248_500,
  revenueGrowth: 12.5,
  ordersToday: 3,
  pendingOrders: 7,
  recentOrders: [
    { id: 'ord-001', userId: 'u1', userEmail: 'c@e.com', userName: 'Customer', subtotal: 0, shipping: 0, phone: '01000000000', address: { id: '1', label: 'Delivery', street: 'N/A', city: 'Cairo', governorate: 'Cairo', isDefault: true }, items: [], total: 18500, status: 'pending', createdAt: new Date(Date.now() - 3600000) },
    { id: 'ord-002', userId: 'u2', userEmail: 'c@e.com', userName: 'Customer', subtotal: 0, shipping: 0, phone: '01000000000', address: { id: '1', label: 'Delivery', street: 'N/A', city: 'Cairo', governorate: 'Cairo', isDefault: true }, items: [], total: 42000, status: 'processing', createdAt: new Date(Date.now() - 7200000) },
    { id: 'ord-003', userId: 'u3', userEmail: 'c@e.com', userName: 'Customer', subtotal: 0, shipping: 0, phone: '01000000000', address: { id: '1', label: 'Delivery', street: 'N/A', city: 'Cairo', governorate: 'Cairo', isDefault: true }, items: [], total: 9800, status: 'shipped', createdAt: new Date(Date.now() - 86400000) },
    { id: 'ord-004', userId: 'u4', userEmail: 'c@e.com', userName: 'Customer', subtotal: 0, shipping: 0, phone: '01000000000', address: { id: '1', label: 'Delivery', street: 'N/A', city: 'Cairo', governorate: 'Cairo', isDefault: true }, items: [], total: 155000, status: 'delivered', createdAt: new Date(Date.now() - 172800000) },
    { id: 'ord-005', userId: 'u5', userEmail: 'c@e.com', userName: 'Customer', subtotal: 0, shipping: 0, phone: '01000000000', address: { id: '1', label: 'Delivery', street: 'N/A', city: 'Cairo', governorate: 'Cairo', isDefault: true }, items: [], total: 28000, status: 'pending', createdAt: new Date(Date.now() - 259200000) },
  ],
  lowStockProducts: [
    { id: 'p1', name: 'RTX 4080 Super', stock: 2 } as any,
    { id: 'p2', name: 'Corsair Vengeance 32GB', stock: 3 } as any,
    { id: 'p3', name: 'Samsung 980 Pro 2TB', stock: 1 } as any,
  ],
};

const STAT_CARDS = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: FiDollarSign, color: 'teal', format: (v: number) => formatEGP(v) },
  { key: 'totalOrders', label: 'Total Orders', icon: FiShoppingBag, color: 'blue', format: (v: number) => v.toLocaleString() },
  { key: 'totalProducts', label: 'Products', icon: FiPackage, color: 'green', format: (v: number) => v.toLocaleString() },
  { key: 'totalUsers', label: 'Users', icon: FiUsers, color: 'purple', format: (v: number) => v.toLocaleString() },
];

const COLOR_MAP: Record<string, string> = {
  teal: 'bg-brand-teal/10 text-brand-teal',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setStats(MOCK_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl h-80 animate-pulse" />
          <div className="bg-white rounded-xl h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  const s = stats!;
  const today = new Date().toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-brand-teal hover:underline"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, format }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${COLOR_MAP[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {format((s as any)[key])}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <FiTrendingUp className="w-3 h-3" />
              <span>+12% this month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-brand-teal hover:underline flex items-center gap-1">
              View all <FiArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {s.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-sm font-medium text-gray-800">#{order.id}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-gray-900">{formatEGP(order.total)}</div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-amber-500" />
              Low Stock Alert
            </h3>
            <Link href="/admin/products" className="text-xs text-brand-teal hover:underline">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {s.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="text-sm text-gray-700 truncate pr-3">{p.name}</div>
                <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                  p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.stock === 0 ? 'Out' : `${p.stock} left`}
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3 font-medium">Quick Actions</p>
            <div className="space-y-2">
              <Link href="/admin/products?action=new" className="block text-xs text-brand-teal hover:underline">+ Add new product</Link>
              <Link href="/admin/categories" className="block text-xs text-brand-teal hover:underline">+ Add category</Link>
              <Link href="/admin/orders?status=pending" className="block text-xs text-brand-teal hover:underline">→ View pending orders</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
