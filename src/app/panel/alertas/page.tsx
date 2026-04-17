'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Alerta } from '@/types'

const TIPO_ICONS: Record<string, string> = {
  nueva_solicitud: '📋',
  postulacion_aceptada: '✅',
  servicio_finalizado: '🏁',
  calificacion: '⭐',
}

export default function PanelAlertas() {
  const router = useRouter()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: als } = await supabase
        .from('alertas')
        .select('*')
        .eq('usuario_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (als) setAlertas(als as Alerta[])
      setLoading(false)
    })
  }, [])

  async function marcarLeida(id: string) {
    const supabase = createClient()
    await supabase.from('alertas').update({ leida: true }).eq('id', id)
    setAlertas(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a))
  }

  async function marcarTodas() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('alertas').update({ leida: true }).eq('usuario_id', user.id).eq('leida', false)
    setAlertas(prev => prev.map(a => ({ ...a, leida: true })))
  }

  const noLeidas = alertas.filter(a => !a.leida).length

  return (
    <div className="px-4 pt-4">
      <div className="bg-[#085041] rounded-xl px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[16px] font-medium text-white">Alertas</h1>
            <p className="text-[12px] text-[#9FE1CB]">{noLeidas > 0 ? `${noLeidas} sin leer` : 'Todas al día'}</p>
          </div>
          {noLeidas > 0 && (
            <button onClick={marcarTodas} className="text-[11px] text-[#9FE1CB] underline">
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>
      ) : alertas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e8e8e6] p-6 text-center text-sm text-gray-400">
          No tienes alertas por el momento.
        </div>
      ) : (
        <div className="space-y-2">
          {alertas.map((alerta) => (
            <button
              key={alerta.id}
              onClick={() => {
                if (!alerta.leida) marcarLeida(alerta.id)
                if (alerta.referencia_id && alerta.referencia_tipo === 'solicitud') {
                  router.push(`/solicitudes/${alerta.referencia_id}`)
                }
              }}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                alerta.leida
                  ? 'bg-white border-[#e8e8e6]'
                  : 'bg-[#E1F5EE] border-[#9FE1CB]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg flex-shrink-0">{TIPO_ICONS[alerta.tipo] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] ${alerta.leida ? 'text-gray-600' : 'font-medium text-[#085041]'}`}>
                    {alerta.titulo}
                  </p>
                  {alerta.mensaje && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{alerta.mensaje}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(alerta.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!alerta.leida && <span className="w-2 h-2 rounded-full bg-[#085041] flex-shrink-0 mt-1.5" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
