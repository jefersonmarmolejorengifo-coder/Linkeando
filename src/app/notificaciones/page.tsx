'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import type { Alerta } from '@/types'

const ICON_MAP: Record<string, string> = {
  propuesta: '📩',
  aceptada: '✅',
  pago: '💰',
  calificacion: '⭐',
  servicio: '🔧',
  sistema: '🔔',
}

export default function NotificacionesPage() {
  const router = useRouter()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

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

      // Marcar como leídas
      await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('usuario_id', data.user.id)
        .eq('leida', false)
    })
  }, [])

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

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-lg mx-auto px-4 py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-6 bg-transparent border-none cursor-pointer transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notificaciones</h1>

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
            <p className="text-xs text-gray-400 mt-1">Aqui veras alertas de propuestas, pagos y calificaciones.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${alerta.leida ? 'border-gray-100' : 'border-verde-200 bg-verde-50/30'}`}
              >
                <div className="flex gap-3">
                  <span className="text-xl flex-shrink-0">
                    {ICON_MAP[alerta.tipo] ?? '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{alerta.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(alerta.created_at)}</p>
                  </div>
                  {!alerta.leida && (
                    <span className="w-2 h-2 rounded-full bg-verde-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
