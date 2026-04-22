'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Alerta } from '@/types'

type Theme = { icon: string; bg: string; text: string; dot: string }

const THEMES: Record<string, Theme> = {
  propuesta:    { icon: '📩', bg: 'bg-verde-100',   text: 'text-verde-600',   dot: 'bg-verde-500' },
  aceptada:     { icon: '✅', bg: 'bg-verde-100',   text: 'text-verde-600',   dot: 'bg-verde-500' },
  pago:         { icon: '💰', bg: 'bg-premium-100', text: 'text-premium-600', dot: 'bg-premium-500' },
  calificacion: { icon: '⭐', bg: 'bg-premium-100', text: 'text-premium-600', dot: 'bg-premium-500' },
  servicio:     { icon: '🔧', bg: 'bg-pro-100',     text: 'text-pro-500',     dot: 'bg-pro-500' },
  sistema:      { icon: '🔔', bg: 'bg-gray-100',    text: 'text-gray-500',    dot: 'bg-gray-400' },
}
const fallback: Theme = THEMES.sistema

function routeFor(a: Alerta): string | null {
  if (!a.referencia_tipo || !a.referencia_id) return null
  switch (a.referencia_tipo) {
    case 'solicitud':  return `/solicitudes/${a.referencia_id}`
    case 'servicio':   return `/estado/${a.referencia_id}`
    case 'postulacion':return `/solicitudes/${a.referencia_id}`
    default: return null
  }
}

export default function NotificacionesPage() {
  const router = useRouter()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: a } = await supabase
        .from('alertas')
        .select('*')
        .eq('usuario_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (a) setAlertas(a as Alerta[])
      setLoading(false)
    })
  }, [router])

  async function marcarLeidas() {
    setMarking(true)
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await supabase.from('alertas').update({ leida: true }).eq('usuario_id', data.user.id).eq('leida', false)
      setAlertas(prev => prev.map(a => ({ ...a, leida: true })))
    }
    setMarking(false)
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `Hace ${hrs}h`
    const days = Math.floor(hrs / 24)
    return `Hace ${days}d`
  }

  const unreadCount = alertas.filter(a => !a.leida).length

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-5 bg-transparent border-none cursor-pointer transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">Tienes {unreadCount} sin leer</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={marcarLeidas}
              disabled={marking}
              className="text-sm font-medium text-verde-600 hover:text-verde-700 disabled:opacity-50 disabled:cursor-wait"
            >
              {marking ? 'Marcando…' : 'Marcar leídas'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : alertas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-3xl mb-3">🔔</div>
            <p className="text-sm text-gray-500">No tienes notificaciones por ahora.</p>
            <p className="text-xs text-gray-400 mt-1">Aquí verás alertas de propuestas, pagos y calificaciones.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alertas.map((alerta) => {
              const theme = THEMES[alerta.tipo] ?? fallback
              const href = routeFor(alerta)
              const body = (
                <div className={`bg-white rounded-xl border p-4 transition-colors ${alerta.leida ? 'border-gray-100' : 'border-verde-200 bg-verde-50/30'} ${href ? 'hover:border-verde-300 cursor-pointer' : ''}`}>
                  <div className="flex gap-3 items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${theme.bg} ${theme.text}`}>
                      <span className="text-lg leading-none">{theme.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-gray-900 ${alerta.leida ? 'font-normal' : 'font-semibold'}`}>{alerta.titulo}</p>
                      {alerta.mensaje && (
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{alerta.mensaje}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">{timeAgo(alerta.created_at)}</p>
                    </div>
                    {!alerta.leida && (
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${theme.dot}`} />
                    )}
                  </div>
                </div>
              )
              return href ? (
                <button
                  key={alerta.id}
                  onClick={() => router.push(href)}
                  className="w-full text-left"
                >
                  {body}
                </button>
              ) : (
                <div key={alerta.id}>{body}</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
