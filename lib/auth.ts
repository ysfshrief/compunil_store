// ============================================================
// COMPUNIL — Firebase Auth Helpers  (v2 — production-stable)
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { UserRole } from '../types'

const googleProvider = new GoogleAuthProvider()

// ── Admin cookie (enables server-side middleware check) ──────
const ADMIN_COOKIE = '__compunil_admin'

function setAdminCookie(isAdmin: boolean) {
  if (typeof document === 'undefined') return
  if (isAdmin) {
    document.cookie = `${ADMIN_COOKIE}=granted; path=/; SameSite=Strict; max-age=86400`
  } else {
    document.cookie = `${ADMIN_COOKIE}=; path=/; max-age=0`
  }
}

// ── Register ─────────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<FirebaseUser> {
  if (!auth) throw new Error('[Compunil] Firebase Auth not initialized.')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })

  // Write the user profile to Firestore. If this fails (e.g. rules not
  // published yet), we still keep the auth account — the profile is
  // re-created on next login via getOrCreateUser.
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      id:        cred.user.uid,
      name,
      email:     email.toLowerCase().trim(),
      role:      'user' as UserRole,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[Compunil] Could not write user profile to Firestore:', err)
  }

  return cred.user
}

// ── Login ────────────────────────────────────────────────────
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<FirebaseUser> {
  if (!auth) throw new Error('[Compunil] Firebase Auth not initialized.')
  const cred = await signInWithEmailAndPassword(auth, email, password)
  // Ensure the Firestore profile exists (self-heal accounts missing a doc)
  await ensureUserDoc(cred.user)
  await recordLogin(cred.user, 'email')
  return cred.user
}

// ── Ensure a user document exists in Firestore ───────────────
async function ensureUserDoc(user: FirebaseUser): Promise<void> {
  try {
    const ref  = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        id:        user.uid,
        name:      user.displayName ?? 'User',
        email:     (user.email ?? '').toLowerCase().trim(),
        role:      'user' as UserRole,
        createdAt: serverTimestamp(),
      })
    }
  } catch (err) {
    console.warn('[Compunil] Could not ensure user doc:', err)
  }
}

// ── Google Login ─────────────────────────────────────────────
export async function loginWithGoogle(): Promise<FirebaseUser> {
  if (!auth) throw new Error('[Compunil] Firebase Auth not initialized.')
  const cred = await signInWithPopup(auth, googleProvider)
  const user  = cred.user

  const userRef  = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      id:        user.uid,
      name:      user.displayName ?? 'User',
      email:     (user.email ?? '').toLowerCase().trim(),
      role:      'user' as UserRole,
      photoURL:  user.photoURL,
      createdAt: serverTimestamp(),
    })
  }

  await recordLogin(user, 'google')
  return user
}

// ── Sign Out ─────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  setAdminCookie(false)
  if (!auth) return
  await firebaseSignOut(auth)
}

// ── Password Reset ───────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  if (!auth) throw new Error('[Compunil] Firebase Auth not initialized.')
  await sendPasswordResetEmail(auth, email)
}

// ── Get User Role ─────────────────────────────────────────────
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    const role = snap.data()?.role
    return role === 'admin' ? 'admin' : 'user'
  } catch {
    return 'user'
  }
}

// ── Sync admin cookie after role is known ────────────────────
export function syncAdminCookie(role: UserRole) {
  setAdminCookie(role === 'admin')
}

// ── Login Tracking ────────────────────────────────────────────
// Records each login (who + when) into the 'logins' collection
// and updates the user's lastLogin field. View these in the admin
// dashboard under "Visitors / Login Activity".
export async function recordLogin(
  user: FirebaseUser,
  method: 'email' | 'google',
): Promise<void> {
  try {
    // Update lastLogin on the user document
    await setDoc(
      doc(db, 'users', user.uid),
      { lastLogin: serverTimestamp(), lastLoginMethod: method },
      { merge: true },
    )
    // Append a login event to the logins collection
    const { addDoc, collection } = await import('firebase/firestore')
    await addDoc(collection(db, 'logins'), {
      userId:    user.uid,
      email:     user.email ?? '',
      name:      user.displayName ?? '',
      method,
      at:        serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    })
  } catch (err) {
    console.warn('[Compunil] Could not record login:', err)
  }
}

// ── Change Password ───────────────────────────────────────────
// Requires the user's current password to re-authenticate first.
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!auth || !auth.currentUser) throw new Error('Not signed in.')
  const user = auth.currentUser
  if (!user.email) throw new Error('No email associated with this account.')

  // Re-authenticate before changing the password (Firebase requirement)
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

// ── Auth State Observer ───────────────────────────────────────
export function onAuthChange(cb: (user: FirebaseUser | null) => void) {
  if (!auth) {
    console.warn('[Compunil] Firebase Auth undefined — check .env.local and restart server.')
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(auth, cb)
}
