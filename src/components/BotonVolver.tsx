'use client'

import { useRouter } from 'next/navigation'

export default function BotonVolver({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className={className ?? 'inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-4 transition-colors bg-transparent border-none cursor-pointer'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      Volver
    </button>
  )
}
