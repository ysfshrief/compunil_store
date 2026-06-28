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

/** Generate placeholder product image */
export function productPlaceholder(name: string): string {
  return `https://via.placeholder.com/400x300/1B3A7A/FFFFFF?text=${encodeURIComponent(name)}`
}
