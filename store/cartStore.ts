'use client'
// ============================================================
// COMPUNIL — Cart Store (Zustand + localStorage persistence)
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'

interface CartStore {
  items:     CartItem[]
  isOpen:    boolean

  // Actions
  addItem:      (product: Product, qty?: number) => void
  removeItem:   (productId: string) => void
  updateQty:    (productId: string, qty: number) => void
  clearCart:    () => void
  openCart:     () => void
  closeCart:    () => void
  toggleCart:   () => void

  // Computed (getters)
  itemCount:  () => number
  subtotal:   () => number
  total:      () => number
}

const SHIPPING = 0 // Free shipping placeholder

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      isOpen: false,

      addItem: (product, qty = 1) =>
        set(state => {
          const existing = state.items.find(i => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { product, quantity: qty }] }
        }),

      removeItem: productId =>
        set(state => ({
          items: state.items.filter(i => i.product.id !== productId),
        })),

      updateQty: (productId, qty) =>
        set(state => {
          if (qty <= 0) {
            return { items: state.items.filter(i => i.product.id !== productId) }
          }
          return {
            items: state.items.map(i =>
              i.product.id === productId
                ? { ...i, quantity: Math.min(qty, i.product.stock) }
                : i,
            ),
          }
        }),

      clearCart:  () => set({ items: [] }),
      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal:  () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      total:     () => get().subtotal() + SHIPPING,
    }),
    {
      name: 'compunil-cart',
      partialize: state => ({ items: state.items }),
    },
  ),
)

// ── Patch persisted state on rehydration ─────────────────────
// Removes any items that don't have the expected { product: { id } } shape
// (can happen when old flat-object cart data is in localStorage)
if (typeof window !== 'undefined') {
  try {
    const key = 'compunil-cart'
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      const items: any[] = parsed?.state?.items ?? []
      if (items.some((i: any) => !i?.product?.id)) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    localStorage.removeItem('compunil-cart')
  }
}
