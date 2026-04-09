'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Usuario } from '@/types'

/* ── Categorías ─────────────────────────────────────────────── */
const CATEGORIAS = [
  { key: 'cerrajeria',   icon: '🔑', label: 'Cerrajería' },
  { key: 'plomeria',     icon: '🔧', label: 'Plomería' },
  { key: 'electricidad', icon: '⚡', label: 'Electricidad' },
  { key: 'pintura',      icon: '🎨', label: 'Pintura' },
  { key: 'carpinteria',  icon: '🪚', label: 'Carpintería' },
  { key: 'limpieza',     icon: '🧹', label: 'Limpieza' },
  { key: 'jardineria',   icon: '🌿', label: 'Jardinería' },
  { key: 'otros',        icon: '🏠', label: 'Otros' },
]

const CAT_COLORS: Record<string, string> = {
  cerrajeria:   '#B45309',
  plomeria:     '#1D4ED8',
  electricidad: '#CA8A04',
  pintura:      '#7C3AED',
  carpinteria:  '#92400E',
  limpieza:     '#0F766E',
  jardineria:   '#15803D',
  otros:        '#475569',
}

/* ── Helpers ─────────────────────────────────────────────────── */
function initials(nombre: string) {
  const parts = nombre.trim().split(' ').filter(Boolean)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nombre.slice(0, 2).toUpperCase()
}

function avatarColor(id: string) {
  const palette = ['#1D9E75', '#185FA5', '#7C3AED', '#B45309', '#0F766E', '#CA8A04', '#D85A30']
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % palette.length
  return palette[h]
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-[#BA7517] text-[11px]">
      {'★'.repeat(full)}{'☆'.repeat(5 - full)} {rating.toFixed(1)}
    </span>
  )
}

/* ── Iconos SVG ──────────────────────────────────────────────── */
const LogoSVG = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="22" r="15" fill="#fff" opacity="0.95"/>
    <circle cx="32" cy="22" r="8.5" fill="#1D9E75"/>
    <rect x="25.5" y="18.5" width="9.5" height="6" rx="3" fill="none" stroke="#fff" strokeWidth="2.2"/>
    <rect x="29.5" y="20.5" width="9.5" height="6" rx="3" fill="none" stroke="#fff" strokeWidth="2.2"/>
    <path d="M32 37 L25 28 Q32 31 39 28 Z" fill="#fff" opacity="0.95"/>
    <circle cx="32" cy="50" r="2" fill="#9FE1CB" opacity="0.7"/>
    <circle cx="32" cy="50" r="4.5" fill="none" stroke="#9FE1CB" strokeWidth="0.8" opacity="0.4"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

/* ── Bottom Nav ──────────────────────────────────────────────── */
type NavTab = 'inicio' | 'explorar' | 'mapa' | 'mensajes' | 'perfil'

const NAV_ITEMS: { key: NavTab; label: string; href: string; icon: React.ReactNode }[] = [
  {
    key: 'inicio', label: 'Inicio', href: '/inicio',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M3 12L12 3l9 9M4 10v10h16V10"/></svg>,
  },
  {
    key: 'explorar', label: 'Explorar', href: '/servicios',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    key: 'mapa', label: 'Mapa', href: '/mapa',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  },
  {
    key: 'mensajes', label: 'Mensajes', href: '/solicitudes',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    key: 'perfil', label: 'Perfil', href: '/perfil',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
]

/* ── Componente principal ────────────────────────────────────── */
export default function InicioPage() {
  const router = useRouter()
  const [ubicacion, setUbicacion] = useState('Detectando tu ubicación…')
  const [pros, setPros] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catActiva, setCatActiva] = useState<string | null>(null)
  const [activeTab] = useState<NavTab>('inicio')
  const [mensajesNuevos, setMensajesNuevos] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  /* Geolocalización */
  useEffect(() => {
    if (!navigator.geolocation) { setUbicacion('Cali, Valle del Cauca'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district
            const city   = data.address?.city || data.address?.town || 'Cali'
            setUbicacion(suburb ? `${suburb}, ${city}` : city)
          })
          .catch(() => setUbicacion('Cali, Valle del Cauca'))
      },
      () => setUbicacion('Cali, Valle del Cauca')
    )
  }, [])

  /* Profesionales */
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('usuarios')
      .select('*')
      .eq('tipo', 'profesional')
      .order('rating_promedio', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setPros((data as Usuario[]) ?? [])
        setLoading(false)
      })
  }, [])

  /* Mensajes no leídos */
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('mensajes')
        .select('id', { count: 'exact', head: true })
        .eq('destinatario_id', data.user.id)
        .eq('leido', false)
        .then(({ count }) => setMensajesNuevos((count ?? 0) > 0))
    })
  }, [])

  /* Filtrado */
  const prosFiltrados = pros.filter((p) => {
    const matchCat = catActiva ? p.categoria === catActiva : true
    const q = search.toLowerCase()
    const matchSearch = q
      ? p.nombre.toLowerCase().includes(q) ||
        (p.categoria ?? '').toLowerCase().includes(q) ||
        (p.barrio ?? '').toLowerCase().includes(q)
      : true
    return matchCat && matchSearch
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    searchRef.current?.blur()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen relative">

        {/* ── Hero ── */}
        <div className="bg-[#1D9E75] px-7 pt-10 pb-9 text-center flex-shrink-0">
          <LogoSVG />
          <div className="text-[34px] font-medium text-white tracking-tight leading-none mt-[18px]">
            Linkeando
          </div>
          <div className="text-[13px] text-[#9FE1CB] mt-1.5 tracking-wide">
            El oficio correcto, cerca de ti
          </div>
          {/* Badge ubicación */}
          <button
            onClick={() => {
              setUbicacion('Detectando tu ubicación…')
              navigator.geolocation?.getCurrentPosition(
                (pos) => {
                  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
                    .then((r) => r.json())
                    .then((data) => {
                      const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district
                      const city   = data.address?.city || 'Cali'
                      setUbicacion(suburb ? `${suburb}, ${city}` : city)
                    })
                    .catch(() => setUbicacion('Cali, Valle del Cauca'))
                },
                () => setUbicacion('Cali, Valle del Cauca')
              )
            }}
            className="inline-flex items-center gap-1.5 bg-white/14 border border-white/20 rounded-full px-3 py-1.5 text-[11px] text-[#E1F5EE] mt-3.5 hover:bg-white/20 transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="#9FE1CB"><circle cx="5" cy="5" r="4"/></svg>
            {ubicacion}
          </button>
        </div>

        {/* ── Buscador flotante ── */}
        <div className="mx-5 -mt-[22px] relative z-10">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          >
            <SearchIcon />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Qué oficio necesitas hoy?"
              className="flex-1 border-none outline-none text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-[#1D9E75] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg whitespace-nowrap hover:bg-[#178a65] transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* ── Contenido ── */}
        <div className="flex-1 px-4 pt-5 pb-24 flex flex-col gap-[18px] overflow-y-auto">

          {/* Categorías */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-900">Categorías</h3>
              <button
                onClick={() => setCatActiva(null)}
                className="text-xs text-[#1D9E75]"
              >
                {catActiva ? 'Ver todas' : 'Ver todas'}
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCatActiva(catActiva === cat.key ? null : cat.key)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                >
                  <div
                    className={`w-13 h-13 rounded-full flex items-center justify-center text-[22px] border transition-all ${
                      catActiva === cat.key
                        ? 'border-[#1D9E75] bg-[#E1F5EE]'
                        : 'border-gray-100 bg-white hover:border-[#1D9E75] hover:bg-[#E1F5EE]'
                    }`}
                    style={{ width: 52, height: 52 }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[10px] text-gray-500 text-center max-w-[54px] leading-tight">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Banner patrocinado */}
          <div className="bg-[#E1F5EE] rounded-xl border border-[#9FE1CB] px-3.5 py-3 flex justify-between items-center cursor-pointer hover:bg-[#D1EFDF] transition-colors">
            <div>
              <strong className="block text-[13px] font-medium text-[#085041]">
                Ferretería El Constructor
              </strong>
              <span className="text-[11px] text-[#0F6E56]">
                Materiales con descuento para tus proyectos
              </span>
            </div>
            <span className="text-[9px] text-[#0F6E56] bg-[#9FE1CB] px-2 py-1 rounded font-medium whitespace-nowrap self-start">
              Patrocinado
            </span>
          </div>

          {/* Profesionales */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-sm font-medium text-gray-900">
                {catActiva
                  ? CATEGORIAS.find((c) => c.key === catActiva)?.label ?? 'Profesionales'
                  : 'Cerca de ti ahora'}
              </h3>
              <button
                onClick={() => router.push('/mapa')}
                className="text-xs text-[#1D9E75]"
              >
                Ver mapa
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {loading ? (
                /* Skeleton */
                [1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 items-center animate-pulse">
                    <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-2/3"/>
                      <div className="h-2.5 bg-gray-200 rounded w-1/2"/>
                    </div>
                  </div>
                ))
              ) : prosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  {search || catActiva ? 'No hay resultados para tu búsqueda.' : 'Aún no hay profesionales registrados.'}
                </div>
              ) : (
                prosFiltrados.map((pro) => {
                  const catInfo = CATEGORIAS.find((c) => c.key === pro.categoria)
                  const color   = avatarColor(pro.id)
                  return (
                    <button
                      key={pro.id}
                      onClick={() => router.push(`/perfil/${pro.id}`)}
                      className="bg-white rounded-xl border border-gray-100 px-3 py-3 flex gap-3 items-center text-left hover:border-[#1D9E75] transition-colors"
                    >
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0 border-2"
                        style={{
                          background: color,
                          borderColor: pro.rating_promedio >= 4.5 ? '#EF9F27' : 'transparent',
                        }}
                      >
                        {initials(pro.nombre)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-900 truncate">{pro.nombre}</p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {catInfo ? `${catInfo.icon} ${catInfo.label}` : pro.categoria}
                          {pro.barrio ? ` · ${pro.barrio}` : ''}
                        </p>
                        {pro.rating_promedio > 0 && (
                          <Stars rating={pro.rating_promedio} />
                        )}
                      </div>

                      {/* Derecha */}
                      <div className="text-right flex-shrink-0">
                        {pro.tarifa && (
                          <p className="text-[12px] font-medium text-[#1D9E75]">
                            Desde ${(pro.tarifa / 1000).toFixed(0)}k
                          </p>
                        )}
                        <div className="flex gap-1 mt-1 justify-end flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E1F5EE] text-[#085041] border border-[#9FE1CB]">
                            Disponible
                          </span>
                          {pro.rating_promedio >= 4.5 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAEEDA] text-[#633806] border border-[#FAC775]">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Botón urgente */}
          <button
            onClick={() => router.push('/publicar?urgente=1')}
            className="w-full bg-[#D85A30] hover:bg-[#C04E28] text-white py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <AlertIcon />
            Necesito ayuda URGENTE ahora
          </button>

          <div className="h-1" />
        </div>

        {/* ── Nav inferior ── */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 flex justify-around px-0 py-2 z-50">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[9px] border-none bg-none transition-colors ${
                activeTab === item.key ? 'text-[#1D9E75]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              {item.key === 'mensajes' ? (
                <span className="relative">
                  {item.label}
                  {mensajesNuevos && (
                    <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-[#D85A30]" />
                  )}
                </span>
              ) : (
                item.label
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
