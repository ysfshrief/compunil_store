// ============================================================
// COMPUNIL — Firebase Configuration
// ============================================================

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore }   from 'firebase/firestore'
import { getAuth, Auth }             from 'firebase/auth'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
}

// Warn (don't throw) so the module always exports — avoids cascade failures
const missing = Object.entries(firebaseConfig)
  .filter(([k, v]) => k !== 'measurementId' && !v)
  .map(([k]) => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`)

if (missing.length > 0) {
  console.warn(
    '[Compunil] Missing Firebase env vars — add them to .env.local and restart:\n' +
    missing.map(k => `  • ${k}`).join('\n')
  )
}

// Always initialise — Firebase will throw its own error later if config is wrong
let app: FirebaseApp
let db: Firestore
let auth: Auth
let storage: FirebaseStorage

try {
  app     = getApps().length ? getApp() : initializeApp(firebaseConfig as any)
  db      = getFirestore(app)
  auth    = getAuth(app)
  storage = getStorage(app)
} catch (e) {
  console.error('[Compunil] Firebase init failed:', e)
  // @ts-ignore — intentionally undefined until env vars are fixed
  app = db = auth = storage = undefined
}

export { db, auth, storage }
export default app!
