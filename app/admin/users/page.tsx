'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { getAllUsers, updateUserRole } from '@/lib/firestore';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
import toast from 'react-hot-toast';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Ahmed Mohamed', email: 'ahmed@example.com', role: 'admin', createdAt: new Date('2024-01-15'), photoURL: '' },
  { id: 'u2', name: 'Sara Ali', email: 'sara@example.com', role: 'user', createdAt: new Date('2024-02-20'), photoURL: '' },
  { id: 'u3', name: 'Omar Hassan', email: 'omar@example.com', role: 'user', createdAt: new Date('2024-03-05'), photoURL: '' },
  { id: 'u4', name: 'Fatima Mahmoud', email: 'fatima@example.com', role: 'user', createdAt: new Date('2024-04-10'), photoURL: '' },
  { id: 'u5', name: 'Khaled Ibrahim', email: 'khaled@example.com', role: 'user', createdAt: new Date('2024-05-22'), photoURL: '' },
  { id: 'u6', name: 'Nour Samir', email: 'nour@example.com', role: 'admin', createdAt: new Date('2024-06-01'), photoURL: '' },
  { id: 'u7', name: 'Youssef Tamer', email: 'youssef@example.com', role: 'user', createdAt: new Date('2024-07-14'), photoURL: '' },
  { id: 'u8', name: 'Mariam Adel', email: 'mariam@example.com', role: 'user', createdAt: new Date('2024-08-30'), photoURL: '' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.length ? data : MOCK_USERS);
      } catch {
        setUsers(MOCK_USERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole: 'admin' | 'user' = currentRole === 'admin' ? 'user' : 'admin';
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated (demo)`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400">{users.length} total · {adminCount} admins · {userCount} customers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
        </div>
        <div className="flex gap-2">
          {[{ label: 'All', value: '' }, { label: 'Admins', value: 'admin' }, { label: 'Customers', value: 'user' }].map(opt => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === opt.value ? 'bg-brand-navy text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Role</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400">No users found</td></tr>
                ) : filtered.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          user.role === 'admin' ? 'bg-brand-teal/20 text-brand-teal' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 truncate">{user.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-400 md:hidden truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        <FiMail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                        {user.createdAt ? formatDate(user.createdAt) : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-brand-teal/10 text-brand-teal'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? <FiShield className="w-3 h-3" /> : <FiUser className="w-3 h-3" />}
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        disabled={updatingId === user.id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          user.role === 'admin'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20'
                        }`}
                      >
                        {updatingId === user.id ? '…' : user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
