// ============================================================
// COMPUNIL — Global Loading State
// ============================================================

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading…</p>
    </div>
  )
}
