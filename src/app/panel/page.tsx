'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS, CATEGORIA_COLORS } from '@/lib/constants'
import type { Usuario, Profesional, Solicitud, ProEspecialidad } from '@/types'

const MESES = ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar']
const INGRESOS_DEMO = [420, 510, 380, 620, 590, 640, 780]
const MAX_ING = Math.max(...INGRESOS_DEMO)

function initials(nombre: string) {
  const parts = nombre.trim().split(' ').filter(Boolean)
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : nombre.slice(0, 2).toUpperCase()
}

function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % CATEGORIA_COLORS.length
  return CATEGORIA_COLORS[h]
}

export default function PanelDashboard() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [perfil, setPerfil] = useState<Profesional | null>(null)
  const [especialidades, setEspecialidades] = useState<ProEspecialidad[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [disponible, setDisponible] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return

      const [{ data: u }, { data: p }, { data: esp }, { data: sols }] = await Promise.all([
        supabase.from('usuarios').select('*').eq('id', data.user.id).single(),
        supabase.from('profesionales').select('*').eq('usuario_id', data.user.id).single(),
        supabase.from('pro_especialidades').select('*').eq('profesional_id', data.user.id),
        supabase.from('solicitudes').select('*').eq('estado', 'abierta').order('created_at', { ascending: false }).limit(5),
      ])

      const usr = u as (Usuario & { onboarded?: boolean }) | null
      if (usr?.onboarded === false) { router.push('/onboarding'); return }
      if (usr) setUsuario(usr)
      if (p) { setPerfil(p as Profesional); setDisponible((p as Profesional).disponible) }
      if (esp) setEspecialidades(esp as ProEspecialidad[])
      if (sols) setSolicitudes(sols as Solicitud[])
      setLoading(false)
    })
  }, [])

  async function handleToggleDisponible() {
    const newVal = !disponible
    setDisponible(newVal)
    const supabase = createClient()
    await supabase.from('profesionales').update({ disponible: newVal }).eq('usuario_id', usuario?.id)
  }

  if (loading) {
    return <div className="p-6 space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>
  }

  const espLabels = especialidades.map(e => {
    const cat = CATEGORIAS.find(c => c.key === e.categoria)
    return cat ? `${cat.icon} ${cat.label}` : e.categoria
  })

  return (
    <>
      {/* Header oscuro con gradiente */}
      <div
        className="rounded-b-3xl"
        style={{ background: 'linear-gradient(160deg, #085041 0%, #063829 100%)' }}
      >
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">Panel profesional</h2>
          <div className="flex items-center gap-2">
            {perfil?.es_premium && (
              <span className="text-[11px] text-white/90 bg-premium-500 px-2.5 py-1 rounded-lg font-medium">★ Premium</span>
            )}
            <button
              onClick={() => router.push('/panel/alertas')}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              aria-label="Alertas"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium text-white border-2"
                style={{
                  background: usuario ? avatarColor(usuario.id) : '#1D9E75',
                  borderColor: perfil?.es_premium ? '#EF9F27' : 'transparent',
                }}
              >
                {usuario ? initials(usuario.nombre) : '…'}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-medium text-white">{usuario?.nombre ?? '…'}</div>
              <div className="text-[12px] text-verde-300 mt-0.5">
                {espLabels.length > 0 ? espLabels.join(' · ') : usuario?.categoria ?? ''}
                {usuario?.barrio ? ` · ${usuario.barrio}` : ''}
              </div>
              <button onClick={handleToggleDisponible} className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-verde-50">
                <span className={`w-2 h-2 rounded-full ${disponible ? 'bg-verde-200' : 'bg-urgente-200'}`} />
                {disponible ? 'Disponible' : 'No disponible'}
              </button>
            </div>
          </div>

          {/* Toggle barra */}
          <div className="bg-pro-700 rounded-xl px-3.5 py-2.5 flex items-center justify-between mt-3">
            <span className="text-[13px] text-verde-50">Disponible para trabajos</span>
            <button
              onClick={handleToggleDisponible}
              className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${disponible ? 'bg-verde-200' : 'bg-gray-500'}`}
            >
              <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-all ${disponible ? 'left-[20px]' : 'left-[2px]'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* Onboarding checklist */}
        {usuario && (usuario.total_servicios === 0 || !perfil?.bio) && (
          <div className="bg-verde-50 rounded-xl border border-verde-200 p-4">
            <h3 className="text-sm font-semibold text-pro-500 mb-2">Completa tu perfil para recibir mas solicitudes</h3>
            <div className="space-y-2">
              {[
                { done: !!usuario.nombre, label: 'Nombre completo', href: '/panel/perfil' },
                { done: !!perfil?.bio, label: 'Descripcion y experiencia', href: '/panel/perfil' },
                { done: !!usuario.lat, label: 'Ubicacion en el mapa', href: '/panel/perfil' },
                { done: especialidades.length > 0, label: 'Al menos una especialidad', href: '/panel/especialidades' },
                { done: perfil?.disponible ?? false, label: 'Disponibilidad activa', href: undefined },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step.done ? 'bg-verde-500 text-white' : 'border-2 border-gray-300'}`}>
                    {step.done ? '✓' : ''}
                  </span>
                  {step.href && !step.done ? (
                    <button onClick={() => router.push(step.href!)} className="text-[12px] text-pro-500 hover:underline">
                      {step.label}
                    </button>
                  ) : (
                    <span className={`text-[12px] ${step.done ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{step.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { n: `${usuario?.total_servicios ?? 0}`, l: 'Servicios realizados', d: '↑ este mes', dc: 'text-verde-500' },
            { n: usuario?.rating_promedio ? usuario.rating_promedio.toFixed(1) : '–', l: 'Calificación', d: usuario?.rating_promedio && usuario.rating_promedio >= 4 ? '↑ Excelente' : '', dc: 'text-verde-500' },
            { n: `${perfil?.total_incidencias ?? 0}`, l: 'Incidencias', d: perfil?.total_incidencias === 0 ? '✓ Sin incidencias' : '', dc: perfil?.total_incidencias === 0 ? 'text-verde-500' : 'text-urgente-500' },
            { n: `${perfil?.radio_km ?? 10} km`, l: 'Radio cobertura', d: `${especialidades.length} especialidad${especialidades.length !== 1 ? 'es' : ''}`, dc: 'text-pro-500' },
          ].map((m) => (
            <div key={m.l} className="bg-white rounded-xl border border-borde p-3">
              <div className="text-[20px] font-medium text-pro-500">{m.n}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{m.l}</div>
              {m.d && <div className={`text-[10px] mt-0.5 ${m.dc}`}>{m.d}</div>}
            </div>
          ))}
        </div>

        {/* Gráfica de ingresos */}
        <div className="bg-white rounded-xl border border-borde p-3">
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">Ingresos · últimos 7 meses</div>
          <div className="flex items-end gap-1.5 h-14">
            {INGRESOS_DEMO.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                <div
                  className={`w-full rounded-t-[3px] ${i === 6 ? 'bg-pro-500' : 'bg-verde-50'}`}
                  style={{ height: Math.round(val / MAX_ING * 52) }}
                />
                <span className="text-[8px] text-gray-400">{MESES[i]}</span>
              </div>
            ))}
          </div>
          <div className="bg-fondo rounded-lg px-3 py-2.5 mt-3">
            <div className="text-[11px] text-gray-400">Sin comisiones · tus ingresos son tuyos</div>
          </div>
        </div>

        {/* Solicitudes recientes */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-sm font-medium">{solicitudes.length > 0 ? 'Solicitudes recientes' : 'Solicitudes disponibles'}</h3>
            <button onClick={() => router.push('/panel/solicitudes')} className="text-xs text-pro-500">Ver todas →</button>
          </div>
          {solicitudes.length === 0 ? (
            <div className="bg-white rounded-xl border border-borde p-4 text-center text-sm text-gray-400">
              No hay solicitudes en tu zona por ahora.
            </div>
          ) : solicitudes.slice(0, 2).map((sol) => {
            const catInfo = CATEGORIAS.find(c => c.key === sol.categoria)
            return (
              <div key={sol.id} className="bg-white rounded-xl border border-borde p-3 mb-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[14px] font-medium flex-1 mr-2">{sol.titulo}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-verde-50 text-pro-500 border border-verde-200 flex-shrink-0">
                    {catInfo ? catInfo.icon : ''} {catInfo?.label ?? sol.categoria}
                  </span>
                </div>
                {sol.sid && (
                  <div className="text-[10px] font-mono bg-fondo text-gray-400 px-2 py-1 rounded border border-borde inline-block mb-2">
                    ID: {sol.sid}
                  </div>
                )}
                <div className="text-[12px] text-gray-500 mb-2.5">
                  {sol.barrio ? `📍 ${sol.barrio}` : '📍 Cali'}
                  {sol.presupuesto_max ? ` · 💰 Hasta $${(sol.presupuesto_max / 1000).toFixed(0)}k` : ''}
                  {sol.urgente && <span className="ml-1 text-urgente-500 font-medium">🚨 Urgente</span>}
                </div>
                <button
                  onClick={() => router.push(`/solicitudes/${sol.id}`)}
                  className="w-full bg-pro-500 hover:bg-pro-700 text-white py-2 rounded-lg text-[12px] font-medium transition-colors"
                >
                  Ver y postular
                </button>
              </div>
            )
          })}
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => router.push('/panel/resultados')} className="bg-white rounded-xl border border-borde p-3 text-left hover:border-pro-500 transition-colors">
            <div className="text-lg mb-1">⭐</div>
            <p className="text-[12px] font-medium text-pro-500">Mis calificaciones</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Ver historial y promedios</p>
          </button>
          <button onClick={() => router.push('/panel/alertas')} className="bg-white rounded-xl border border-borde p-3 text-left hover:border-pro-500 transition-colors">
            <div className="text-lg mb-1">🔔</div>
            <p className="text-[12px] font-medium text-pro-500">Alertas</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Notificaciones de trabajo</p>
          </button>
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-xl border border-borde p-3">
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2.5">Mis especialidades</div>
          <div className="flex gap-2 flex-wrap">
            {espLabels.length > 0 ? espLabels.map((label, i) => (
              <span key={i} className="text-[12px] px-3 py-1.5 rounded-full bg-verde-50 text-pro-500 border border-verde-200">
                {label}
              </span>
            )) : (
              <span className="text-[12px] text-gray-400">Sin especialidad configurada</span>
            )}
          </div>
          <button onClick={() => router.push('/panel/especialidades')} className="mt-3 w-full py-2 text-[12px] text-pro-500 border border-pro-500 rounded-lg hover:bg-verde-50 transition-colors">
            Editar especialidades
          </button>
        </div>

        {/* Banner */}
        <div className="bg-premium-100 rounded-xl border border-premium-300 px-3.5 py-2.5 flex justify-between items-center">
          <div>
            <strong className="block text-[13px] font-medium text-[#412402]">Bancamía · Microcrédito</strong>
            <span className="text-[11px] text-[#854F0B]">Financia materiales y capital de trabajo</span>
          </div>
          <span className="text-[9px] text-[#412402] bg-premium-300 px-2 py-1 rounded font-medium self-start">Patrocinado</span>
        </div>

        <div className="h-4" />
      </div>
    </>
  )
}
