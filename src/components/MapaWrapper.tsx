'use client'

import dynamic from 'next/dynamic'

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

const MapCali = dynamic(() => import('@/components/MapCali'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 gap-3">
      <svg className="animate-spin w-7 h-7 text-verde-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-sm text-gray-400">Cargando mapa…</p>
    </div>
  ),
})

export default function MapaWrapper({ profesionales }: { profesionales: Prof[] }) {
  return <MapCali profesionales={profesionales} />
}
