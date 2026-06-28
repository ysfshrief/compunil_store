'use client'
// ============================================================
// COMPUNIL — useAuth hook  (v2)
// ============================================================

import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { onAuthChange, getUserRole, syncAdminCookie } from '../lib/auth'
import { getUserById } from '../lib/firestore'

let initialized = false

export function useAuthInit() {
  const { setUser, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    if (initialized) return
    initialized = true

    const unsub = onAuthChange(async fbUser => {
      if (fbUser) {
        const role    = await getUserRole(fbUser.uid)
        const profile = await getUserById(fbUser.uid)

        // Sync the admin cookie so middleware can verify server-side
        syncAdminCookie(role)

        setUser(
          profile ?? {
            id:        fbUser.uid,
            name:      fbUser.displayName ?? '',
            email:     fbUser.email ?? '',
            role,
            createdAt: new Date(),
          },
        )
      } else {
        syncAdminCookie('user' as any)
        setUser(null)
      }
      setLoading(false)
      setInitialized(true)
    })

    return () => unsub()
  }, [setUser, setLoading, setInitialized])
}

export function useAuth() {
  return useAuthStore()
}
