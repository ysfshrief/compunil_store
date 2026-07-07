'use client'
// ============================================================
// COMPUNIL — Recently Viewed products (localStorage)
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentStore {
  ids:  string[]
  add:  (id: string) => void
}

export const useRecentStore = create<RecentStore>()(
  persist(
    set => ({
      ids: [],
      add: id => set(s => ({
        ids: [id, ...s.ids.filter(x => x !== id)].slice(0, 12),
      })),
    }),
    { name: 'compunil-recent' },
  ),
)
