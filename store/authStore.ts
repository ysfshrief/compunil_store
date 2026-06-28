'use client'
// ============================================================
// COMPUNIL — Auth Store  (v2)
// ============================================================

import { create } from 'zustand'
import type { User } from '../types'

interface AuthStore {
  user:           User | null
  loading:        boolean
  initialized:    boolean
  setUser:        (user: User | null) => void
  setLoading:     (v: boolean) => void
  setInitialized: (v: boolean) => void
  isAdmin:        () => boolean
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user:        null,
  loading:     true,
  initialized: false,

  setUser:        user => set({ user }),
  setLoading:     v    => set({ loading: v }),
  setInitialized: v    => set({ initialized: v }),
  isAdmin:        ()   => get().user?.role === 'admin',
}))
