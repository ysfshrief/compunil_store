'use client'
// ============================================================
// COMPUNIL — Cart & Wishlist cloud sync
// Loads the user's cart/wishlist from Firestore on login and
// debounce-saves any changes, so they persist across devices.
// ============================================================

import { useEffect, useRef } from 'react'
import { useAuthStore }     from '../store/authStore'
import { useCartStore }     from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { saveUserCart, loadUserCart, getProductById } from '../lib/firestore'

export function useCloudSync() {
  const { user, initialized } = useAuthStore()
  const loadedFor = useRef<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load once per login ─────────────────────────────────────
  useEffect(() => {
    if (!initialized || !user || loadedFor.current === user.id) return
    loadedFor.current = user.id

    ;(async () => {
      const cloud = await loadUserCart(user.id)
      if (!cloud) return
      const cart = useCartStore.getState()
      const wish = useWishlistStore.getState()

      // Merge wishlist (union of local + cloud)
      const mergedWish = Array.from(new Set([...wish.ids, ...cloud.wishlist]))
      useWishlistStore.setState({ ids: mergedWish })

      // Merge cart: cloud items not already in local get fetched & added
      const localIds = new Set(cart.items.map(i => i.product.id))
      for (const c of cloud.cart) {
        if (localIds.has(c.productId)) continue
        const product = await getProductById(c.productId).catch(() => null)
        if (product) {
          useCartStore.setState(s => ({
            items: [...s.items, { product, quantity: c.quantity }],
          }))
        }
      }
    })()
  }, [initialized, user])

  // ── Debounce-save on any change ──────────────────────────────
  useEffect(() => {
    const unsubCart = useCartStore.subscribe(scheduleSave)
    const unsubWish = useWishlistStore.subscribe(scheduleSave)

    function scheduleSave() {
      const u = useAuthStore.getState().user
      if (!u) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        saveUserCart(
          u.id,
          useCartStore.getState().items,
          useWishlistStore.getState().ids,
        )
      }, 1500)
    }

    return () => { unsubCart(); unsubWish() }
  }, [])
}
