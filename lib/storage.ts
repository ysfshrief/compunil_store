// ============================================================
// COMPUNIL — Firebase Storage Helpers
// ============================================================

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage'
import { storage } from './firebase'

export type UploadProgress = {
  progress: number
  url?: string
  error?: string
}

// ── Upload single file with progress ────────────────────────
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (p: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path)
    const task       = uploadBytesResumable(storageRef, file)

    task.on(
      'state_changed',
      snapshot => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(Math.round(p))
      },
      error => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve(url)
      },
    )
  })
}

// ── Upload product images ────────────────────────────────────
export async function uploadProductImages(
  files: File[],
  productId: string,
  onProgress?: (p: number) => void,
): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = `products/${productId}/${Date.now()}_${file.name}`
    const url  = await uploadFile(file, path, p =>
      onProgress?.(Math.round((i / files.length) * 100 + p / files.length)),
    )
    urls.push(url)
  }
  return urls
}

// ── Upload category image ────────────────────────────────────
export async function uploadCategoryImage(
  file: File,
  categoryId: string,
): Promise<string> {
  return uploadFile(file, `categories/${categoryId}/${file.name}`)
}

// ── Delete file by URL ───────────────────────────────────────
export async function deleteFileByUrl(url: string): Promise<void> {
  const fileRef = ref(storage, url)
  await deleteObject(fileRef)
}
