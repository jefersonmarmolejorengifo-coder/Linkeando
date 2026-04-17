'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Usuario } from '@/types'

const NAV_ITEMS = [
  {
    label: 'Dashboard', href: '/panel',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    label: 'Solicitudes', href: '/panel/solicitudes',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>,
  },
  {
    label: 'Chat', href: '/panel/mensajes',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    label: 'Mi perfil', href: '/panel/perfil',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
  {
    label: 'Premium', href: '/panel/premium',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
]

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      supabase.from('usuarios').select('tipo').eq('id', data.user.id).single()
        .then(({ data: u }) => {
          if (!u || (u as Usuario).tipo !== 'profesional') { router.replace('/inicio'); return }
          setLoading(false)
        })
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pro-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen relative">
        <div className="flex-1 pb-20">{children}</div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-borde flex justify-around py-2 z-40">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/panel' && pathname.startsWith(item.href))
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-0.5 text-[9px] px-2 border-none bg-transparent ${isActive ? 'text-pro-500' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
