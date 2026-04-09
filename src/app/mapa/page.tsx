import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import MapaWrapper from '@/components/MapaWrapper'

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
      <MapaWrapper profesionales={profesionales ?? []} />
    </div>
  )
}
