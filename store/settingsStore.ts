'use client'
// ============================================================
// COMPUNIL — Store Settings (admin-editable, Firestore-backed)
// Loaded once on app start; used by Header, Footer, Checkout.
// ============================================================

import { create } from 'zustand'
import type { StoreSettings } from '../types'
import { getStoreSettings, DEFAULT_STORE_SETTINGS } from '../lib/firestore'

interface SettingsStore {
  settings: StoreSettings
  loaded:   boolean
  load:     () => Promise<void>
  set:      (s: StoreSettings) => void
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  settings: DEFAULT_STORE_SETTINGS,
  loaded:   false,

  load: async () => {
    if (get().loaded) return
    try {
      const s = await getStoreSettings()
      set({ settings: s, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  set: s => set({ settings: s }),
}))
