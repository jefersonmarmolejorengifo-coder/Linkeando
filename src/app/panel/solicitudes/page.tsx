'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS } from '@/lib/constants'
import type { Solicitud, ProEspecialidad } from '@/types'

type Tab = 'nuevas' | 'en_curso' | 'finalizadas'

export default function PanelSolicitudes() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('nuevas')
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [misEsp, setMisEsp] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [catFiltro, setCatFiltro] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return

      const [{ data: esp }, { data: sols }] = await Promise.all([
        supabase.from('pro_especialidades').select('categoria').eq('profesional_id', data.user.id),
        supabase.from('solicitudes').select('*').order('created_at', { ascending: false }).limit(100),
      ])

      if (esp) setMisEsp((esp as ProEspecialidad[]).map(e => e.categoria))
      if (sols) setSolicitudes(sols as Solicitud[])
      setLoading(false)
    })
  }, [])

  const estadoMap: Record<Tab, string[]> = {
    nuevas: ['abierta'],
    en_curso: ['en_proceso'],
    finalizadas: ['completada', 'cancelada'],
  }

  const filtradas = solicitudes.filter((s) => {
    if (!estadoMap[tab].includes(s.estado)) return false
    if (catFiltro && s.categoria !== catFiltro) return false
    return true
  })

  // Calcular coincidencia con especialidades
  function matchPct(sol: Solicitud): number {
    if (misEsp.length === 0) return 0
    return misEsp.includes(sol.categoria) ? 100 : 0
  }

  return (
    <div className="px-4 pt-4">
      <div className="bg-pro-500 rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Solicitudes</h1>
        <p className="text-[12px] text-verde-200">Encuentra trabajos que coincidan con tu perfil</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
        {([['nuevas', 'Nuevas'], ['en_curso', 'En curso'], ['finalizadas', 'Finalizadas']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-[12px] rounded-md font-medium transition-colors ${tab === key ? 'bg-pro-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtro categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setCatFiltro(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] border transition-colors ${!catFiltro ? 'bg-pro-500 text-white border-pro-500' : 'bg-white text-gray-500 border-gray-200'}`}
        >
          Todas
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCatFiltro(catFiltro === cat.key ? null : cat.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] border transition-colors ${catFiltro === cat.key ? 'bg-pro-500 text-white border-pro-500' : misEsp.includes(cat.key) ? 'bg-verde-50 text-pro-500 border-verde-200' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}</div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-borde p-6 text-center text-sm text-gray-400">
          No hay solicitudes {tab === 'nuevas' ? 'disponibles' : tab === 'en_curso' ? 'en curso' : 'finalizadas'}.
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((sol) => {
            const catInfo = CATEGORIAS.find(c => c.key === sol.categoria)
            const pct = matchPct(sol)
            return (
              <button
                key={sol.id}
                onClick={() => router.push(`/solicitudes/${sol.id}`)}
                className="w-full bg-white rounded-xl border border-borde p-3 text-left hover:border-pro-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[13px] font-medium flex-1 mr-2">{sol.titulo}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    {pct === 100 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-verde-50 text-pro-500 border border-verde-200">100% match</span>}
                    {sol.urgente && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-urgente-500 border border-red-200">🚨 Urgente</span>}
                  </div>
                </div>
                {sol.sid && <div className="text-[10px] font-mono text-gray-400 mb-1">ID: {sol.sid}</div>}
                <div className="text-[11px] text-gray-500">
                  {catInfo ? `${catInfo.icon} ${catInfo.label}` : sol.categoria}
                  {sol.barrio ? ` · 📍 ${sol.barrio}` : ''}
                  {sol.presupuesto_max ? ` · 💰 $${(sol.presupuesto_max / 1000).toFixed(0)}k` : ''}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {new Date(sol.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  {sol.modalidad && sol.modalidad !== 'puntual' ? ` · ${sol.modalidad}` : ''}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
