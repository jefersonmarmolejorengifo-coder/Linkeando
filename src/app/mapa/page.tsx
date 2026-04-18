import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import MapaWrapper from '@/components/MapaWrapper'
import BotonVolver from '@/components/BotonVolver'

export default async function MapaPage() {
  const supabase = createClient(cookies())

  const { data: profesionales } = await supabase
    .from('usuarios')
    .select('id, nombre, categoria, lat, lng, rating_promedio, total_servicios, telefono, barrio')
    .eq('tipo', 'profesional')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <div className="absolute top-2 left-2 z-[1000]">
        <BotonVolver className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg shadow-md border border-gray-200 cursor-pointer" />
      </div>
      <MapaWrapper profesionales={profesionales ?? []} />
    </div>
  )
}
