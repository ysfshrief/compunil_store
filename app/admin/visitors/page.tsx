'use client'
// ============================================================
// COMPUNIL — Admin: Visitors / Login Activity
// Shows who logged in, when, and how (email / Google).
// ============================================================

import { useEffect, useState } from 'react'
import { FiActivity, FiMail, FiRefreshCw } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { getRecentLogins, type LoginRecord } from '@/lib/firestore'

function timeAgo(ts: any): string {
  try {
    const d = ts?.toDate?.() ?? new Date(ts)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return d.toLocaleDateString()
  } catch {
    return '—'
  }
}

function fullDate(ts: any): string {
  try {
    const d = ts?.toDate?.() ?? new Date(ts)
    return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

export default function VisitorsPage() {
  const [logins, setLogins] = useState<LoginRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getRecentLogins(150)
      setLogins(data)
    } catch (err) {
      console.error('[Compunil] Failed to load logins:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const uniqueVisitors = new Set(logins.map(l => l.userId)).size
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayCount = logins.filter(l => {
    const d = (l.at as any)?.toDate?.() ?? new Date(l.at)
    return d >= today
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Login Activity</h1>
          <p className="text-sm text-gray-500 mt-1">See who accessed the site and when.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-xl text-sm font-medium hover:bg-brand-teal transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Logins</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{logins.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Unique Visitors</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{uniqueVisitors}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Logins Today</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{todayCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : logins.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FiActivity className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No login activity recorded yet.</p>
            <p className="text-xs mt-1">Logins will appear here once users sign in.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Method</th>
                  <th className="text-left px-5 py-3 font-semibold">When</th>
                  <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logins.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-brand-navy">{l.name || '—'}</div>
                      <div className="text-xs text-gray-400">{l.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      {l.method === 'google' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 px-2.5 py-1 rounded-full">
                          <FcGoogle size={14} /> Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-brand-navy px-2.5 py-1 rounded-full">
                          <FiMail size={12} /> Email
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{timeAgo(l.at)}</td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{fullDate(l.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
