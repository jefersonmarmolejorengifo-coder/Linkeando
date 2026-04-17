'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS, CATEGORIA_COLORS } from '@/lib/constants'
import type { Usuario, Solicitud } from '@/types'

type Mode = 'cliente' | 'profesional'

/* ── Helpers ─────────────────────────────────────────────────── */
function initials(nombre: string) {
  const parts = nombre.trim().split(' ').filter(Boolean)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nombre.slice(0, 2).toUpperCase()
}

function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % CATEGORIA_COLORS.length
  return CATEGORIA_COLORS[h]
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-[#BA7517] text-[11px]">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}
    </span>
  )
}

/* ── SVG ─────────────────────────────────────────────────────── */
const LogoSVG = () => (
  <svg width="54" height="54" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="22" r="15" fill="#fff" opacity=".95"/>
    <circle cx="32" cy="22" r="8.5" fill="#1D9E75"/>
    <rect x="25.5" y="18.5" width="9.5" height="6" rx="3" fill="none" stroke="#fff" strokeWidth="2.2"/>
    <rect x="29.5" y="20.5" width="9.5" height="6" rx="3" fill="none" stroke="#fff" strokeWidth="2.2"/>
    <path d="M32 37 L25 28 Q32 31 39 28 Z" fill="#fff" opacity=".95"/>
    <circle cx="32" cy="50" r="2" fill="#9FE1CB" opacity=".7"/>
    <circle cx="32" cy="50" r="4.5" fill="none" stroke="#9FE1CB" strokeWidth=".8" opacity=".4"/>
  </svg>
)

/* ── Barra de navegación inferior ────────────────────────────── */
function BottomNavCliente({ router, msgDot, alertDot }: { router: ReturnType<typeof useRouter>; msgDot: boolean; alertDot: boolean }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-borde flex justify-around py-2 z-40">
      {[
        { label: 'Inicio',   href: '/inicio',      active: true,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M3 12L12 3l9 9M4 10v10h16V10"/></svg> },
        { label: 'Explorar', href: '/explorar',   active: false,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
        { label: 'Mapa',     href: '/mapa',        active: false,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
        { label: 'Mensajes', href: '/solicitudes', active: false, dot: msgDot,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        { label: 'Alertas',  href: '/notificaciones', active: false, dot: alertDot,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
        { label: 'Servicios',href: '/mis-solicitudes', active: false,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => router.push(item.href)}
          className={`flex flex-col items-center gap-0.5 text-[9px] px-2 border-none bg-transparent ${item.active ? 'text-verde-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {item.icon}
          <span className="relative">
            {item.label}
            {item.dot && <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-[#D85A30]" />}
          </span>
        </button>
      ))}
    </div>
  )
}

function BottomNavPro({ router, chatDot }: { router: ReturnType<typeof useRouter>; chatDot: boolean }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-borde flex justify-around py-2 z-40">
      {[
        { label: 'Dashboard',   href: '/panel',              active: true,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
        { label: 'Solicitudes', href: '/panel/solicitudes', active: false,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg> },
        { label: 'Chat',        href: '/panel/mensajes',    active: false, dot: chatDot,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        { label: 'Mi perfil',   href: '/panel/perfil',      active: false,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
        { label: 'Premium',     href: '/panel/premium',     active: false,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => router.push(item.href)}
          className={`flex flex-col items-center gap-0.5 text-[9px] px-2 border-none bg-transparent ${item.active ? 'text-pro-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {item.icon}
          <span className="relative">
            {item.label}
            {item.dot && <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-[#D85A30]" />}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ── Vista Cliente ───────────────────────────────────────────── */
function ViewCliente({
  router, ubicacion, onUbiClick, pros, loading, search, setSearch, catActiva, setCatActiva, msgDot,
}: {
  router: ReturnType<typeof useRouter>
  ubicacion: string
  onUbiClick: () => void
  pros: Usuario[]
  loading: boolean
  search: string
  setSearch: (v: string) => void
  catActiva: string | null
  setCatActiva: (v: string | null) => void
  msgDot: boolean
}) {
  const filtrados = pros.filter((p) => {
    const matchCat = catActiva ? p.categoria === catActiva : true
    const q = search.toLowerCase()
    return q
      ? p.nombre.toLowerCase().includes(q) || (p.categoria ?? '').includes(q) || (p.barrio ?? '').includes(q)
      : matchCat
  })

  return (
    <>
      {/* Hero */}
      <div className="bg-verde-500 px-7 pt-8 pb-9 text-center flex-shrink-0">
        <LogoSVG />
        <div className="text-[32px] font-medium text-white tracking-tight leading-none mt-3">Linkeando</div>
        <div className="text-[13px] text-verde-200 mt-1">El profesional correcto para tu necesidad</div>
        <button
          onClick={onUbiClick}
          className="inline-flex items-center gap-1.5 bg-white/14 border border-white/20 rounded-full px-3 py-1.5 text-[11px] text-verde-50 mt-3 hover:bg-white/20 transition-colors"
        >
          <svg width="8" height="8" viewBox="0 0 10 10" fill="#9FE1CB"><circle cx="5" cy="5" r="4"/></svg>
          {ubicacion}
        </button>
      </div>

      {/* Buscador flotante */}
      <div className="mx-4 -mt-5 relative z-10">
        <div className="bg-white rounded-xl border border-borde px-3.5 py-3 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="¿Qué oficio necesitas hoy?"
            className="flex-1 border-none outline-none text-[13px] bg-transparent text-gray-800 placeholder:text-gray-400"
          />
          <button
            onClick={() => router.push(search.trim() ? `/explorar?q=${encodeURIComponent(search.trim())}` : '/explorar')}
            className="bg-verde-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-verde-600 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 pt-4 pb-24 flex flex-col gap-3.5 overflow-y-auto">

        {/* Categorías */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-sm font-medium">Categorías</h3>
            <button onClick={() => setCatActiva(null)} className="text-xs text-verde-500">Ver todas</button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCatActiva(catActiva === cat.key ? null : cat.key)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div
                  className={`w-[50px] h-[50px] rounded-full flex items-center justify-center text-[21px] border transition-all ${catActiva === cat.key ? 'border-verde-500 bg-verde-50' : 'border-borde bg-white hover:border-verde-500'}`}
                >
                  {cat.icon}
                </div>
                <span className="text-[10px] text-gray-500 text-center max-w-[54px] leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Banner */}
        <div className="bg-verde-50 rounded-xl border border-verde-200 px-3.5 py-2.5 flex justify-between items-center">
          <div>
            <strong className="block text-[13px] font-medium text-pro-500">Ferretería El Constructor</strong>
            <span className="text-[11px] text-[#0F6E56]">Materiales con descuento</span>
          </div>
          <span className="text-[9px] text-[#0F6E56] bg-verde-200 px-2 py-1 rounded font-medium self-start">Patrocinado</span>
        </div>

        {/* Profesionales */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-sm font-medium">{catActiva ? CATEGORIAS.find(c => c.key === catActiva)?.label : 'Cerca de ti ahora'}</h3>
            <button onClick={() => router.push('/mapa')} className="text-xs text-verde-500">Ver mapa</button>
          </div>
          <div className="flex flex-col gap-2">
            {loading ? [1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-borde p-3 flex gap-3 items-center animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 rounded w-2/3"/><div className="h-2 bg-gray-200 rounded w-1/2"/></div>
              </div>
            )) : filtrados.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                {search || catActiva ? 'Sin resultados.' : 'Aún no hay profesionales.'}
              </div>
            ) : filtrados.map((pro) => {
              const catInfo = CATEGORIAS.find(c => c.key === pro.categoria)
              const color = avatarColor(pro.id)
              const isPremium = pro.rating_promedio >= 4.5
              return (
                <button
                  key={pro.id}
                  onClick={() => router.push(`/perfil/${pro.id}`)}
                  className="bg-white rounded-xl border border-borde px-3 py-3 flex gap-3 items-center text-left hover:border-verde-500 transition-colors"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-medium text-white flex-shrink-0 border-2"
                    style={{ background: color, borderColor: isPremium ? '#EF9F27' : 'transparent' }}
                  >
                    {initials(pro.nombre)}
                    {isPremium && (
                      <span className="absolute -top-0.5 -right-0.5 bg-premium-500 text-[7px] rounded-full w-3.5 h-3.5 flex items-center justify-center">★</span>
                    )}
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
                    {pro.tarifa && <p className="text-[12px] font-medium text-verde-500">Desde ${(pro.tarifa/1000).toFixed(0)}k</p>}
                    <div className="flex gap-1 mt-1 justify-end flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-verde-50 text-pro-500 border border-verde-200">Disponible</span>
                      {isPremium && <span className="text-[10px] px-1.5 py-0.5 rounded bg-premium-100 text-[#633806] border border-premium-300">Premium</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Urgente */}
        <button
          onClick={() => router.push('/publicar?urgente=1')}
          className="w-full bg-[#D85A30] hover:bg-[#C04E28] text-white py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Necesito ayuda URGENTE ahora
        </button>
        <div className="h-1"/>
      </div>

      <BottomNavCliente router={router} msgDot={msgDot} alertDot={false} />
    </>
  )
}

/* ── Vista Profesional ───────────────────────────────────────── */
const MESES = ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar']
const INGRESOS = [420, 510, 380, 620, 590, 640, 780]
const MAX_ING = Math.max(...INGRESOS)

function ViewProfesional({
  router, usuario, solicitudes, loadingPro, disponible, setDisponible, chatDot,
}: {
  router: ReturnType<typeof useRouter>
  usuario: Usuario | null
  solicitudes: Solicitud[]
  loadingPro: boolean
  disponible: boolean
  setDisponible: (v: boolean) => void
  chatDot: boolean
}) {
  const catInfo = CATEGORIAS.find(c => c.key === usuario?.categoria)

  return (
    <>
      {/* Header oscuro */}
      <div className="bg-pro-500 flex-shrink-0">
        {/* Topbar */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-white">Panel profesional</h2>
          <button className="text-[11px] text-white/80 bg-premium-500 px-2.5 py-1 rounded-lg font-medium">★ Premium</button>
        </div>

        {/* Perfil */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium text-white border-2 border-premium-500"
                style={{ background: usuario ? avatarColor(usuario.id) : '#1D9E75' }}
              >
                {usuario ? initials(usuario.nombre) : '…'}
                <span className="absolute -top-1 -right-1 bg-premium-500 text-[7px] rounded-full w-4 h-4 flex items-center justify-center">★</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[16px] font-medium text-white">{usuario?.nombre ?? '…'}</div>
              <div className="text-[12px] text-verde-300 mt-0.5">
                {catInfo ? `${catInfo.icon} ${catInfo.label}` : usuario?.categoria ?? ''}
                {usuario?.barrio ? ` · ${usuario.barrio}` : ''}
              </div>
              {/* Toggle disponible */}
              <button
                onClick={() => setDisponible(!disponible)}
                className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-verde-50"
              >
                <span className={`w-2 h-2 rounded-full ${disponible ? 'bg-verde-200' : 'bg-urgente-200'}`}/>
                {disponible ? 'Disponible' : 'No disponible'}
              </button>
            </div>
          </div>
          {/* Toggle barra */}
          <div className="bg-pro-700 rounded-xl px-3.5 py-2.5 flex items-center justify-between mt-3">
            <span className="text-[13px] text-verde-50">Disponible para trabajos</span>
            <button
              onClick={() => setDisponible(!disponible)}
              className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${disponible ? 'bg-verde-200' : 'bg-gray-500'}`}
            >
              <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-all ${disponible ? 'left-[20px]' : 'left-[2px]'}`}/>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 pt-4 pb-24 flex flex-col gap-3 overflow-y-auto">

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { n: `${usuario?.total_servicios ?? 0}`, l: 'Servicios realizados', d: '↑ este mes', dc: 'text-verde-500' },
            { n: usuario?.rating_promedio ? usuario.rating_promedio.toFixed(1) : '–', l: 'Calificación', d: '↑ Excelente', dc: 'text-verde-500' },
            { n: '$780k', l: 'Ingresos brutos', d: '↑ +18% vs mes ant.', dc: 'text-verde-500' },
            { n: '~28m', l: 'Tiempo llegada', d: 'Meta: 25 min', dc: 'text-urgente-500' },
          ].map((m) => (
            <div key={m.l} className="bg-white rounded-xl border border-borde p-3">
              <div className="text-[20px] font-medium text-pro-500">{m.n}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{m.l}</div>
              <div className={`text-[10px] mt-0.5 ${m.dc}`}>{m.d}</div>
            </div>
          ))}
        </div>

        {/* Gráfica de ingresos */}
        <div className="bg-white rounded-xl border border-borde p-3">
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">Ingresos · últimos 7 meses</div>
          <div className="flex items-end gap-1.5 h-14">
            {INGRESOS.map((val, i) => (
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
            <div className="text-[11px] text-gray-400 mb-0.5">Proyección fin de año</div>
            <div className="text-[20px] font-medium text-pro-500">$8.611.200</div>
            <div className="text-[11px] text-gray-400">Sin comisiones · tus ingresos son tuyos</div>
          </div>
        </div>

        {/* Solicitud reciente */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-sm font-medium">{solicitudes.length > 0 ? 'Solicitud reciente' : 'Solicitudes disponibles'}</h3>
            <button onClick={() => router.push('/solicitudes')} className="text-xs text-pro-500">Ver todas →</button>
          </div>
          {loadingPro ? (
            <div className="bg-white rounded-xl border border-borde p-3 animate-pulse h-24"/>
          ) : solicitudes.length === 0 ? (
            <div className="bg-white rounded-xl border border-borde p-4 text-center text-sm text-gray-400">
              No hay solicitudes en tu zona por ahora.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-borde p-3">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-[14px] font-medium flex-1 mr-2">{solicitudes[0].titulo}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-verde-50 text-pro-500 border border-verde-200 flex-shrink-0">Nueva</span>
              </div>
              <div className="text-[10px] font-mono bg-fondo text-gray-400 px-2 py-1 rounded border border-borde inline-block mb-2">
                ID: LNK-{solicitudes[0].id.slice(0, 8).toUpperCase()}
              </div>
              <div className="text-[12px] text-gray-500 mb-2.5">
                {solicitudes[0].barrio ? `📍 ${solicitudes[0].barrio}` : '📍 Cali'}
                {solicitudes[0].presupuesto_max ? ` · 💰 Hasta $${(solicitudes[0].presupuesto_max/1000).toFixed(0)}k` : ''}
              </div>
              <button
                onClick={() => router.push('/solicitudes')}
                className="w-full bg-pro-500 hover:bg-pro-700 text-white py-2 rounded-lg text-[12px] font-medium transition-colors"
              >
                Ver y postular
              </button>
            </div>
          )}
        </div>

        {/* Mis especialidades */}
        <div className="bg-white rounded-xl border border-borde p-3">
          <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2.5">Mis especialidades</div>
          <div className="flex gap-2 flex-wrap">
            {catInfo ? (
              <span className="text-[12px] px-3 py-1.5 rounded-full bg-verde-50 text-pro-500 border border-verde-200">
                {catInfo.icon} {catInfo.label}
              </span>
            ) : (
              <span className="text-[12px] text-gray-400">Sin especialidad configurada</span>
            )}
          </div>
          <button onClick={() => router.push('/perfil')} className="mt-3 w-full py-2 text-[12px] text-pro-500 border border-pro-500 rounded-lg hover:bg-verde-50 transition-colors">
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

        <div className="h-1"/>
      </div>

      <BottomNavPro router={router} chatDot={chatDot} />
    </>
  )
}

/* ── Página principal ────────────────────────────────────────── */
export default function InicioPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('cliente')
  const [ubicacion, setUbicacion] = useState('Detectando ubicación...')
  const [pros, setPros] = useState<Usuario[]>([])
  const [loadingPros, setLoadingPros] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loadingPro, setLoadingPro] = useState(true)
  const [search, setSearch] = useState('')
  const [catActiva, setCatActiva] = useState<string | null>(null)
  const [disponible, setDisponible] = useState(true)
  const [msgDot, setMsgDot] = useState(false)

  /* Detectar ubicación */
  function detectarUbi() {
    setUbicacion('Detectando ubicación...')
    if (!navigator.geolocation) { setUbicacion('Cali, Valle del Cauca'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          .then(r => r.json())
          .then(d => {
            const suburb = d.address?.suburb || d.address?.neighbourhood || d.address?.city_district
            const city = d.address?.city || 'Cali'
            setUbicacion(suburb ? `${suburb}, ${city}` : city)
          })
          .catch(() => setUbicacion('Cali, Valle del Cauca'))
      },
      () => setUbicacion('Cali, Valle del Cauca')
    )
  }

  /* Datos iniciales */
  useEffect(() => {
    detectarUbi()
    const supabase = createClient()

    // Profesionales para vista cliente
    supabase.from('usuarios').select('*').eq('tipo', 'profesional').order('rating_promedio', { ascending: false }).limit(20)
      .then(({ data }) => { setPros((data as Usuario[]) ?? []); setLoadingPros(false) })

    // Usuario logueado
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('usuarios').select('*').eq('id', data.user.id).single()
        .then(({ data: u }) => {
          if (!u) return
          setUsuario(u as Usuario)
          if ((u as Usuario).tipo === 'profesional') {
            setMode('profesional')
            router.push('/panel')
            return
          }
        })

      // Mensajes no leídos
      supabase.from('mensajes').select('id', { count: 'exact', head: true })
        .eq('destinatario_id', data.user.id).eq('leido', false)
        .then(({ count }) => setMsgDot((count ?? 0) > 0))

      // Solicitudes abiertas (para profesional)
      supabase.from('solicitudes').select('*').eq('estado', 'abierta').order('created_at', { ascending: false }).limit(5)
        .then(({ data: sols }) => { setSolicitudes((sols as Solicitud[]) ?? []); setLoadingPro(false) })
    })
  }, [])

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen relative">

        {/* ── Mode bar ── */}
        <div
          className="sticky top-0 z-50 border-b border-borde px-4 py-2 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)' }}
        >
          <span className="text-[15px] font-medium tracking-tight" style={{ color: mode === 'cliente' ? '#1D9E75' : '#085041' }}>
            Linkeando
          </span>
          <div className="flex bg-fondo rounded-full p-0.5 border border-borde">
            <button
              onClick={() => setMode('cliente')}
              className={`px-3 py-1.5 rounded-full text-[11px] transition-all ${mode === 'cliente' ? 'bg-verde-500 text-white font-medium' : 'text-gray-400 hover:text-gray-600'}`}
            >
              🏠 Cliente
            </button>
            <button
              onClick={() => setMode('profesional')}
              className={`px-3 py-1.5 rounded-full text-[11px] transition-all ${mode === 'profesional' ? 'bg-pro-500 text-white font-medium' : 'text-gray-400 hover:text-gray-600'}`}
            >
              🧰 Profesional
            </button>
          </div>
        </div>

        {/* ── Vistas ── */}
        {mode === 'cliente' ? (
          <ViewCliente
            router={router}
            ubicacion={ubicacion}
            onUbiClick={detectarUbi}
            pros={pros}
            loading={loadingPros}
            search={search}
            setSearch={setSearch}
            catActiva={catActiva}
            setCatActiva={setCatActiva}
            msgDot={msgDot}
          />
        ) : (
          <ViewProfesional
            router={router}
            usuario={usuario}
            solicitudes={solicitudes}
            loadingPro={loadingPro}
            disponible={disponible}
            setDisponible={setDisponible}
            chatDot={msgDot}
          />
        )}

      </div>
    </div>
  )
}
