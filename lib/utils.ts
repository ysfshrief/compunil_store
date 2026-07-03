// ============================================================
// COMPUNIL — Shared Utilities
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format EGP price */
export function formatEGP(amount: number, lang: 'en' | 'ar' = 'en'): string {
  const formatted = new Intl.NumberFormat('en-EG', {
    style:                'currency',
    currency:             'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return lang === 'ar' ? `${amount.toLocaleString('ar-EG')} ج.م` : formatted
}

/** Discount percentage */
export function discountPct(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100)
}

/** Truncate text */
export function truncate(text: string, maxLen = 60): string {
  return text.length <= maxLen ? text : text.slice(0, maxLen).trim() + '…'
}

/** Star rating array */
export function starsArray(rating: number): ('full' | 'half' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= Math.floor(rating))  return 'full'
    if (i < rating && rating % 1 >= 0.5) return 'half'
    return 'empty'
  })
}

/** Slugify */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Format date */
export function formatDate(date: Date | any, locale: string = 'en-EG'): string {
  const d = date?.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Order status color */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    confirmed:  'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped:    'bg-teal-100 text-teal-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

/** Generate placeholder product image — uses an inline SVG so it
 *  never triggers a network request and cannot cause retry loops. */
export function productPlaceholder(name: string): string {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#EEF2FF"/>
    <rect x="160" y="90" width="80" height="60" rx="8" fill="#CBD5E1"/>
    <rect x="150" y="155" width="100" height="8" rx="4" fill="#CBD5E1"/>
    <rect x="170" y="170" width="60" height="6" rx="3" fill="#E2E8F0"/>
    <text x="200" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="700" fill="#94A3B8">${initials}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
