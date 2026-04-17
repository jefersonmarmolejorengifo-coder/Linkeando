'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS } from '@/lib/constants'
import { formatSID } from '@/lib/sid'
import type { Solicitud } from '@/types'

const ESTADO_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  abierta: { label: 'Abierta', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  en_proceso: { label: 'En curso', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]', border: 'border-[#9FE1CB]' },
  completada: { label: 'Completada', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  cancelada: { label: 'Cancelada', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
}

export default function MisSolicitudesPage() {
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }
      const { data: sols } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('cliente_id', data.user.id)
        .order('created_at', { ascending: false })
      if (sols) setSolicitudes(sols as Solicitud[])
      setLoading(false)
    })
  }, [router])

  const filtradas = filtro ? solicitudes.filter(s => s.estado === filtro) : solicitudes

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        <div className="bg-[#1D9E75] px-4 pt-4 pb-4">
          <h1 className="text-[17px] font-medium text-white">Mis solicitudes</h1>
          <p className="text-[12px] text-[#9FE1CB] mt-0.5">{solicitudes.length} solicitudes en total</p>
        </div>

        {/* Filtros de estado */}
        <div className="px-4 pt-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { key: null, label: 'Todas' },
            { key: 'abierta', label: 'Abiertas' },
            { key: 'en_proceso', label: 'En curso' },
            { key: 'completada', label: 'Completadas' },
            { key: 'cancelada', label: 'Canceladas' },
          ].map((f) => (
            <button
              key={f.key ?? 'all'}
              onClick={() => setFiltro(f.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] border transition-colors ${filtro === f.key ? 'bg-[#1D9E75] text-white border-[#1D9E75]' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex-1 px-4 pt-3 pb-20">
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>
          ) : filtradas.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e8e8e6] p-6 text-center">
              <p className="text-sm text-gray-400 mb-3">
                {solicitudes.length === 0 ? 'Aún no tienes solicitudes.' : 'No hay solicitudes con este filtro.'}
              </p>
              {solicitudes.length === 0 && (
                <button
                  onClick={() => router.push('/publicar')}
                  className="bg-[#1D9E75] text-white px-4 py-2 rounded-xl text-[13px] font-medium"
                >
                  Publicar mi primera solicitud
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtradas.map((sol) => {
                const catInfo = CATEGORIAS.find(c => c.key === sol.categoria)
                const badge = ESTADO_BADGES[sol.estado]
                return (
                  <button
                    key={sol.id}
                    onClick={() => router.push(`/solicitudes/${sol.id}`)}
                    className="w-full bg-white rounded-xl border border-[#e8e8e6] p-3 text-left hover:border-[#1D9E75] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[13px] font-medium flex-1 mr-2">{sol.titulo}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${badge.bg} ${badge.text} border ${badge.border} flex-shrink-0`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 mb-1">
                      {formatSID(sol.sid)}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {catInfo ? `${catInfo.icon} ${catInfo.label}` : sol.categoria}
                      {sol.barrio ? ` · 📍 ${sol.barrio}` : ''}
                      {sol.presupuesto_max ? ` · 💰 $${(sol.presupuesto_max / 1000).toFixed(0)}k` : ''}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(sol.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {sol.urgente && <span className="ml-1 text-[#D85A30] font-medium">🚨 Urgente</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* FAB publicar */}
        <button
          onClick={() => router.push('/publicar')}
          className="fixed bottom-20 right-4 w-12 h-12 bg-[#1D9E75] hover:bg-[#178a65] text-white rounded-full shadow-lg flex items-center justify-center text-xl transition-colors z-30"
        >
          +
        </button>
      </div>
    </div>
  )
}
