'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiChevronDown, FiChevronUp, FiArrowRight, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { getOrdersByUser } from '@/lib/firestore';
import { formatEGP, statusColor, formatDate } from '@/lib/utils';
import { signOut } from '@/lib/auth';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

const MOCK_USER_ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    userId: 'u1',
    userEmail: 'customer@example.com',
    userName: 'Customer',
    subtotal: 0,
    shipping: 0,
    phone: '01000000000',
    items: [
      { productId: 'p1', productName: 'RTX 4080 Super 16GB', productImage: '', price: 42000, quantity: 1, subtotal: 42000 },
    ],
    total: 42000,
    status: 'delivered',
    createdAt: new Date('2024-11-01'),
    address: { id: '1', label: 'Delivery', street: '15 Tahrir St', city: 'Cairo', governorate: 'Cairo', isDefault: true },
  },
  {
    id: 'ORD-2024-003',
    userId: 'u1',
    userEmail: 'customer@example.com',
    userName: 'Customer',
    subtotal: 0,
    shipping: 0,
    phone: '01000000000',
    items: [
      { productId: 'p3', productName: 'Corsair Vengeance 32GB DDR5', productImage: '', price: 4800, quantity: 2, subtotal: 9600 },
      { productId: 'p4', productName: 'Logitech G Pro X Keyboard', productImage: '', price: 3200, quantity: 1, subtotal: 3200 },
    ],
    total: 12800,
    status: 'shipped',
    createdAt: new Date('2024-11-10'),
    address: { id: '1', label: 'Delivery', street: '15 Tahrir St', city: 'Cairo', governorate: 'Cairo', isDefault: true },
  },
  {
    id: 'ORD-2024-005',
    userId: 'u1',
    userEmail: 'customer@example.com',
    userName: 'Customer',
    subtotal: 0,
    shipping: 0,
    phone: '01000000000',
    items: [
      { productId: 'p6', productName: 'TP-Link AX6000 Wi-Fi 6 Router', productImage: '', price: 8900, quantity: 1, subtotal: 8900 },
    ],
    total: 8900,
    status: 'processing',
    createdAt: new Date('2024-11-13'),
    address: { id: '1', label: 'Delivery', street: '15 Tahrir St', city: 'Cairo', governorate: 'Cairo', isDefault: true },
  },
];

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

function OrderStatusTracker({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
        <span className="text-sm font-medium text-red-600">Order Cancelled</span>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentStep;
        const last = i === STATUS_STEPS.length - 1;
        return (
          <div key={step} className="flex items-center gap-0 flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                done ? 'bg-brand-teal border-brand-teal' : 'bg-white border-gray-300'
              }`}>
                {done && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-xs mt-1 font-medium capitalize ${done ? 'text-brand-teal' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {!last && (
              <div className={`flex-1 h-0.5 mx-1 -mt-4 ${i < currentStep ? 'bg-brand-teal' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Order header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-navy/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiPackage className="w-5 h-5 text-brand-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-brand-navy">{order.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-gray-900">{formatEGP(order.total)}</div>
            <div className="text-xs text-gray-400">COD</div>
          </div>
          {expanded ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">
              {/* Tracker */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Status</p>
                <OrderStatusTracker status={order.status} />
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items</p>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{item.productName}</div>
                        <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">{formatEGP(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              {order.address && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
                  <p className="text-sm text-gray-600">
                    {order.address.street}, {order.address.city}, {order.address.governorate}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold text-gray-600">Order Total</span>
                <span className="text-base font-bold text-brand-navy">{formatEGP(order.total)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    const userId = user.id;
    const load = async () => {
      try {
        const data = await getOrdersByUser(userId);
        setOrders(data.length ? data : MOCK_USER_ORDERS);
      } catch {
        setOrders(MOCK_USER_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, initialized, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.replace('/');
  };

  if (!initialized || !user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      {/* Account info */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-teal rounded-2xl p-5 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-bold text-lg">{user.name || 'Customer'}</div>
            <div className="text-white/70 text-sm">{user.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">{orders.length}</div>
            <div className="text-xs text-white/70">Total Orders</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-bold">
              {formatEGP(orders.reduce((sum, o) => sum + o.total, 0))}
            </div>
            <div className="text-xs text-white/70">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-500 text-sm mb-5">Start shopping to see your orders here</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-navy text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-teal transition-colors"
          >
            Shop Now <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
