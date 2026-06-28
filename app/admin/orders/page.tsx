'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEye, FiX, FiChevronDown } from 'react-icons/fi';
import { getAllOrders, updateOrderStatus } from '@/lib/firestore';
import { formatEGP, statusColor, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import toast from 'react-hot-toast';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-2024-001', userId: 'u1', userEmail: 'customer@example.com', userName: 'Customer', subtotal: 42000, shipping: 0, phone: '01000000000', items: [{ productId: 'p1', productName: 'RTX 4080 Super', productImage: '', price: 42000, quantity: 1, subtotal: 42000 }], total: 42000, status: 'delivered', createdAt: new Date('2024-11-01'), address: { id: '1', label: 'Delivery', street: '15 Tahrir St', city: 'Cairo', governorate: 'Cairo', isDefault: true } },
  { id: 'ORD-2024-002', userId: 'u2', userEmail: 'customer@example.com', userName: 'Customer', subtotal: 28500, shipping: 0, phone: '01000000000', items: [{ productId: 'p2', productName: 'Laptop HP Elitebook', productImage: '', price: 28500, quantity: 1, subtotal: 28500 }], total: 28500, status: 'shipped', createdAt: new Date('2024-11-08'), address: { id: '1', label: 'Delivery', street: '7 Corniche Rd', city: 'Alexandria', governorate: 'Alexandria', isDefault: true } },
  { id: 'ORD-2024-003', userId: 'u3', userEmail: 'customer@example.com', userName: 'Customer', subtotal: 9600, shipping: 0, phone: '01000000000', items: [{ productId: 'p3', productName: 'Corsair RAM 32GB', productImage: '', price: 4800, quantity: 2, subtotal: 9600 }, { productId: 'p4', productName: 'Logitech G Pro X', productImage: '', price: 3200, quantity: 1, subtotal: 3200 }], total: 12800, status: 'processing', createdAt: new Date('2024-11-10'), address: { id: '1', label: 'Delivery', street: '22 Pyramids Ave', city: 'Giza', governorate: 'Giza', isDefault: true } },
  { id: 'ORD-2024-004', userId: 'u4', userEmail: 'customer@example.com', userName: 'Customer', subtotal: 18500, shipping: 0, phone: '01000000000', items: [{ productId: 'p5', productName: 'CCTV Kit 8-Camera', productImage: '', price: 18500, quantity: 1, subtotal: 18500 }], total: 18500, status: 'pending', createdAt: new Date('2024-11-12'), address: { id: '1', label: 'Delivery', street: '5 El Gomhoria St', city: 'Mansoura', governorate: 'Dakahlia', isDefault: true } },
  { id: 'ORD-2024-005', userId: 'u5', userEmail: 'customer@example.com', userName: 'Customer', subtotal: 8900, shipping: 0, phone: '01000000000', items: [{ productId: 'p6', productName: 'TP-Link AX6000 Router', productImage: '', price: 8900, quantity: 1, subtotal: 8900 }], total: 8900, status: 'pending', createdAt: new Date('2024-11-13'), address: { id: '1', label: 'Delivery', street: '88 Nasr City', city: 'Cairo', governorate: 'Cairo', isDefault: true } },
  { id: 'ORD-2024-006', userId: 'u6', userEmail: 'customer@example.com', userName: 'Customer', subtotal: 5200, shipping: 0, phone: '01000000000', items: [{ productId: 'p7', productName: 'Samsung 980 Pro 2TB', productImage: '', price: 5200, quantity: 1, subtotal: 5200 }], total: 5200, status: 'cancelled', createdAt: new Date('2024-11-05'), address: { id: '1', label: 'Delivery', street: '3 Heliopolis', city: 'Cairo', governorate: 'Cairo', isDefault: true } },
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data.length ? data : MOCK_ORDERS);
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Order ${orderId} marked as ${newStatus}`);
    } catch {
      // Demo fallback
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Order updated (demo)`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.userName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400">{orders.length} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${!statusFilter ? 'bg-brand-navy text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              statusFilter === s ? 'bg-brand-teal text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or customer…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">No orders found</td></tr>
                ) : filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-bold text-brand-navy">{order.id}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-sm text-gray-700">{order.userName || '—'}</div>
                      <div className="text-xs text-gray-400">{order.address?.city}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {formatEGP(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={updatingId === order.id}
                          className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-xs font-semibold cursor-pointer focus:outline-none ${statusColor(order.status)} disabled:opacity-50`}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
                        title="View details"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Order Details</h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedOrder.id, s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                          selectedOrder.status === s
                            ? statusColor(s) + ' ring-2 ring-offset-1 ring-current'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Customer</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
                    <div><span className="text-gray-400">Name: </span><span className="font-medium">{selectedOrder.userName}</span></div>
                    <div><span className="text-gray-400">Phone: </span><span className="font-medium">{selectedOrder.phone}</span></div>
                    <div><span className="text-gray-400">Address: </span><span className="font-medium">{selectedOrder.address?.street}</span></div>
                    <div><span className="text-gray-400">City: </span><span className="font-medium">{selectedOrder.address?.city}, {selectedOrder.address?.governorate}</span></div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{item.productName}</div>
                          <div className="text-xs text-gray-400">Qty: {item.quantity} × {formatEGP(item.price)}</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{formatEGP(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatEGP(selectedOrder.total)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Placed {formatDate(selectedOrder.createdAt)} · Payment: Cash on Delivery
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
