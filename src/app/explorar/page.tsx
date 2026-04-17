'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS, BARRIOS_CALI, CATEGORIA_COLORS } from '@/lib/constants'
import type { Usuario } from '@/types'

function initials(nombre: string) {
  const parts = nombre.trim().split(' ').filter(Boolean)
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : nombre.slice(0, 2).toUpperCase()
}

function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % CATEGORIA_COLORS.length
  return CATEGORIA_COLORS[h]
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return <span className="text-premium-500 text-[11px]">{'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}</span>
}

export default function ExplorarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pros, setPros] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [catFiltro, setCatFiltro] = useState<string | null>(searchParams.get('cat'))
  const [barrioFiltro, setBarrioFiltro] = useState('')
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('usuarios')
      .select('*')
      .eq('tipo', 'profesional')
      .order('rating_promedio', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setPros(data as Usuario[])
        setLoading(false)
      })
  }, [])

  const filtrados = pros.filter((p) => {
    if (catFiltro && p.categoria !== catFiltro) return false
    if (barrioFiltro && p.barrio !== barrioFiltro) return false
    if (search) {
      const q = search.toLowerCase()
      return p.nombre.toLowerCase().includes(q) || (p.categoria ?? '').includes(q) || (p.barrio ?? '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-verde-500 px-4 pt-4 pb-5">
          <h1 className="text-[17px] font-medium text-white mb-3">Explorar profesionales</h1>
          <div className="bg-white/15 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, oficio o barrio..."
              className="flex-1 bg-transparent text-white text-[13px] placeholder:text-white/60 outline-none"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 pt-3 space-y-2">
          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setCatFiltro(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] border ${!catFiltro ? 'bg-verde-500 text-white border-verde-500' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              Todas
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCatFiltro(catFiltro === cat.key ? null : cat.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] border ${catFiltro === cat.key ? 'bg-verde-500 text-white border-verde-500' : 'bg-white text-gray-500 border-gray-200'}`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Barrio */}
          <select
            value={barrioFiltro}
            onChange={(e) => setBarrioFiltro(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-verde-500"
          >
            <option value="">Todos los barrios</option>
            {BARRIOS_CALI.map(({ zona, barrios }) => (
              <optgroup key={zona} label={`── ${zona}`}>
                {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Resultados */}
        <div className="flex-1 px-4 pt-3 pb-20">
          <p className="text-[11px] text-gray-400 mb-2">{filtrados.length} profesionales encontrados</p>

          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
          ) : filtrados.length === 0 ? (
            <div className="bg-white rounded-xl border border-borde p-6 text-center text-sm text-gray-400">
              No se encontraron profesionales con esos filtros.
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map((pro) => {
                const catInfo = CATEGORIAS.find(c => c.key === pro.categoria)
                return (
                  <button
                    key={pro.id}
                    onClick={() => router.push(`/perfil/${pro.id}`)}
                    className="w-full bg-white rounded-xl border border-borde px-3 py-3 flex gap-3 items-center text-left hover:border-verde-500 transition-colors"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-medium text-white flex-shrink-0"
                      style={{ background: avatarColor(pro.id) }}
                    >
                      {initials(pro.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{pro.nombre}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {catInfo ? `${catInfo.icon} ${catInfo.label}` : pro.categoria}
                        {pro.barrio ? ` · ${pro.barrio}` : ''}
                      </p>
                      {pro.rating_promedio > 0 && <Stars rating={pro.rating_promedio} />}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {pro.tarifa && <p className="text-[12px] font-medium text-verde-500">${(pro.tarifa / 1000).toFixed(0)}k/h</p>}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-verde-50 text-pro-500 border border-verde-200">
                        {pro.total_servicios} servicios
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-borde flex justify-around py-2 z-40">
          {[
            { label: 'Inicio', href: '/inicio', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M3 12L12 3l9 9M4 10v10h16V10"/></svg> },
            { label: 'Explorar', href: '/explorar', active: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
            { label: 'Mapa', href: '/mapa', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
            { label: 'Mensajes', href: '/solicitudes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            { label: 'Servicios', href: '/mis-solicitudes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
          ].map((item) => (
            <button key={item.label} onClick={() => router.push(item.href)} className={`flex flex-col items-center gap-0.5 text-[9px] px-2 border-none bg-transparent ${item.active ? 'text-verde-500' : 'text-gray-400 hover:text-gray-600'}`}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
