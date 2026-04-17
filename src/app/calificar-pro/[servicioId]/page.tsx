'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import FormCalificar3D from '@/components/FormCalificar3D'
import type { ServicioCompletado, Usuario } from '@/types'

export default function CalificarProPage() {
  const { servicioId } = useParams()
  const router = useRouter()
  const [servicio, setServicio] = useState<ServicioCompletado | null>(null)
  const [profesional, setProfesional] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('servicios_completados')
      .select('*, profesional:usuarios!servicios_completados_profesional_id_fkey(*)')
      .eq('id', servicioId)
      .single()
      .then(({ data }) => {
        if (data) {
          setServicio(data as ServicioCompletado)
          setProfesional((data as any).profesional as Usuario)
        }
        setLoading(false)
      })
  }, [servicioId])

  async function handleSubmit(calData: Record<string, number | string | null>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !servicio) return

    await supabase.from('cal_profesional').insert({
      servicio_completado_id: servicio.id,
      cliente_id: user.id,
      profesional_id: servicio.profesional_id,
      calidad: calData.calidad as number,
      precio: calData.precio as number,
      oportunidad: calData.oportunidad as number,
      monto_mano_obra: calData.monto_mano_obra as number | null,
      comentario: calData.comentario as string | null,
    })

  }

  if (loading) return (
    <div className="min-h-screen bg-fondo flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-verde-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen">
        <div className="bg-verde-500 px-6 pt-8 pb-6 text-center relative">
          <a href="/mis-solicitudes" className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </a>
          <div className="text-3xl mb-2">⭐</div>
          <h1 className="text-[18px] font-medium text-white">Califica al profesional</h1>
          {profesional && (
            <p className="text-[13px] text-verde-200 mt-1">{profesional.nombre}</p>
          )}
        </div>

        <div className="px-6 py-6">
          <FormCalificar3D tipo="profesional" onSubmit={handleSubmit} />
          <button
            onClick={() => router.push('/mis-solicitudes')}
            className="w-full mt-4 text-sm text-verde-500 hover:text-verde-600 font-medium py-2 transition-colors"
          >
            Volver a mis solicitudes
          </button>
        </div>
      </div>
    </div>
  )
}
