'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Configuración de categorías ────────────────────────────────
const CAT: Record<string, { label: string; emoji: string; color: string }> = {
  plomeria:     { label: 'Plomería',     emoji: '🔧', color: '#3B82F6' },
  electricidad: { label: 'Electricidad', emoji: '⚡', color: '#F59E0B' },
  carpinteria:  { label: 'Carpintería',  emoji: '🪚', color: '#A16207' },
  pintura:      { label: 'Pintura',      emoji: '🎨', color: '#DB2777' },
  limpieza:     { label: 'Limpieza',     emoji: '🧹', color: '#059669' },
  jardineria:   { label: 'Jardinería',   emoji: '🌿', color: '#16A34A' },
  cerrajeria:   { label: 'Cerrajería',   emoji: '🔑', color: '#6B7280' },
  otros:        { label: 'Otros',        emoji: '🛠️', color: '#1D9E75' },
}

const CALI: [number, number] = [3.4516, -76.532]

// ── Caché de iconos (se crean una vez en el browser) ──────────
const _iconCache: Record<string, L.DivIcon> = {}

function getIcono(cat: string): L.DivIcon {
  const key = CAT[cat] ? cat : 'otros'
  if (!_iconCache[key]) {
    const { color, emoji } = CAT[key]
    _iconCache[key] = L.divIcon({
      html: `<div style="width:38px;height:38px;background:${color};border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:18px;line-height:1;display:block">${emoji}</span></div>`,
      className: '',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -44],
    })
  }
  return _iconCache[key]
}

let _iconYo: L.DivIcon | null = null
function getIconoYo(): L.DivIcon {
  if (!_iconYo) {
    _iconYo = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 0 0 6px rgba(37,99,235,.22),0 2px 6px rgba(0,0,0,.25)"></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -14],
    })
  }
  return _iconYo
}

// ── Sub-componente: vuela suavemente a la posición ────────────
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1.5 })
  }, [lat, lng])
  return null
}

// ── Tipos ─────────────────────────────────────────────────────
interface Prof {
  id: string
  nombre: string
  categoria?: string | null
  lat?: number | null
  lng?: number | null
  rating_promedio: number
  total_servicios: number
  telefono?: string | null
  barrio?: string | null
}

// ── Componente principal ──────────────────────────────────────
export default function MapCali({ profesionales }: { profesionales: Prof[] }) {
  const [filtro, setFiltro]     = useState<string | null>(null)
  const [userPos, setUserPos]   = useState<[number, number] | null>(null)
  const [geoState, setGeoState] = useState<'loading' | 'ok' | 'error'>('loading')

  // Geolocalización automática al montar
  useEffect(() => {
    if (!navigator?.geolocation) { setGeoState('error'); return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPos([coords.latitude, coords.longitude])
        setGeoState('ok')
      },
      () => setGeoState('error'),
      { timeout: 8000, maximumAge: 60_000 },
    )
  }, [])

  // Categorías presentes en los datos
  const cats = useMemo(
    () => Array.from(new Set(profesionales.map((p) => p.categoria).filter(Boolean))) as string[],
    [profesionales],
  )

  // Profesionales visibles según filtro activo
  const visibles = useMemo(
    () => filtro ? profesionales.filter((p) => p.categoria === filtro) : profesionales,
    [profesionales, filtro],
  )

  return (
    <div className="flex flex-col h-full">

      {/* ── Barra de filtros ── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex flex-wrap items-center gap-2 flex-shrink-0 relative z-10">

        {/* Chip "Todos" */}
        <button
          onClick={() => setFiltro(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            !filtro
              ? 'bg-verde-500 text-white border-verde-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-verde-400 hover:text-verde-600'
          }`}
        >
          Todos
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${!filtro ? 'bg-verde-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {profesionales.length}
          </span>
        </button>

        {/* Chips por categoría */}
        {cats.map((cat) => {
          const c = CAT[cat]
          if (!c) return null
          const n = profesionales.filter((p) => p.categoria === cat).length
          const activo = filtro === cat
          return (
            <button
              key={cat}
              onClick={() => setFiltro(activo ? null : cat)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activo
                  ? 'bg-verde-500 text-white border-verde-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-verde-400 hover:text-verde-600'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activo ? 'bg-verde-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {n}
              </span>
            </button>
          )
        })}

        {/* Estado de geolocalización */}
        <div className="ml-auto flex items-center gap-1.5 text-xs flex-shrink-0">
          {geoState === 'loading' && (
            <span className="text-gray-400 animate-pulse flex items-center gap-1">
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Detectando ubicación…
            </span>
          )}
          {geoState === 'ok' && (
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Tu ubicación activa
            </span>
          )}
          {geoState === 'error' && (
            <span className="text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Activa la ubicación para centrar el mapa
            </span>
          )}
        </div>
      </div>

      {/* ── Mapa ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={CALI}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Vuela a la ubicación del usuario cuando se obtiene */}
          {userPos && <FlyTo lat={userPos[0]} lng={userPos[1]} />}

          {/* Marcador del usuario (punto azul) */}
          {userPos && (
            <Marker position={userPos} icon={getIconoYo()}>
              <Popup>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#2563EB', margin: 0 }}>
                  📍 Tu ubicación
                </p>
              </Popup>
            </Marker>
          )}

          {/* Marcadores de profesionales */}
          {visibles.map((p) =>
            p.lat != null && p.lng != null ? (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={getIcono(p.categoria ?? 'otros')}>
                <Popup minWidth={185}>
                  <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2px 0' }}>
                    {/* Nombre */}
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: '0 0 3px' }}>
                      {p.nombre}
                    </p>

                    {/* Categoría + barrio */}
                    <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 5px' }}>
                      {CAT[p.categoria ?? 'otros']?.emoji}{' '}
                      {CAT[p.categoria ?? 'otros']?.label}
                      {p.barrio ? ` · ${p.barrio}` : ''}
                    </p>

                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                      <span style={{ color: '#FBBF24', fontSize: 12 }}>
                        {'★'.repeat(Math.min(Math.round(Number(p.rating_promedio)), 5))}
                        {'☆'.repeat(Math.max(5 - Math.min(Math.round(Number(p.rating_promedio)), 5), 0))}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                        {Number(p.rating_promedio).toFixed(1)} · {p.total_servicios} servicios
                      </span>
                    </div>

                    {/* CTA */}
                    <a
                      href={`/perfil/${p.id}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        background: '#1D9E75',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 12,
                        padding: '7px 0',
                        borderRadius: 8,
                        textDecoration: 'none',
                      }}
                    >
                      Ver perfil →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>

        {/* Estado vacío (cuando no hay profesionales o el filtro no tiene resultados) */}
        {visibles.length === 0 && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[400] pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3.5 shadow-lg text-center border border-gray-100">
              <p className="font-semibold text-gray-700 text-sm">
                {filtro
                  ? `Sin profesionales de ${CAT[filtro]?.label} en el mapa`
                  : 'No hay profesionales en el mapa aún'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Los profesionales aparecen al guardar su ubicación en su perfil
              </p>
            </div>
          </div>
        )}

        {/* Leyenda de colores */}
        {cats.length > 0 && (
          <div className="absolute bottom-8 right-3 z-[400] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-3 hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Leyenda</p>
            <div className="flex flex-col gap-1.5">
              {cats.map((cat) => {
                const c = CAT[cat]
                if (!c) return null
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs text-gray-600">{c.emoji} {c.label}</span>
                  </div>
                )
              })}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-0.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />
                <span className="text-xs text-gray-600">Tu ubicación</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
