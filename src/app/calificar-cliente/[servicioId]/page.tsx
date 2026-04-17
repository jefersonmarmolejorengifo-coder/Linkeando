'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import FormCalificar3D from '@/components/FormCalificar3D'
import type { ServicioCompletado, Usuario } from '@/types'

export default function CalificarClientePage() {
  const { servicioId } = useParams()
  const router = useRouter()
  const [servicio, setServicio] = useState<ServicioCompletado | null>(null)
  const [cliente, setCliente] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('servicios_completados')
      .select('*, cliente:usuarios!servicios_completados_cliente_id_fkey(*)')
      .eq('id', servicioId)
      .single()
      .then(({ data }) => {
        if (data) {
          setServicio(data as ServicioCompletado)
          setCliente((data as any).cliente as Usuario)
        }
        setLoading(false)
      })
  }, [servicioId])

  async function handleSubmit(calData: Record<string, number | string | null>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !servicio) return

    await supabase.from('cal_cliente').insert({
      servicio_completado_id: servicio.id,
      profesional_id: user.id,
      cliente_id: servicio.cliente_id,
      pago_oportuno: calData.pago_oportuno as number,
      disponibilidad: calData.disponibilidad as number,
      atencion: calData.atencion as number,
      comentario: calData.comentario as string | null,
    })

  }

  if (loading) return (
    <div className="min-h-screen bg-fondo flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-pro-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-fondo flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen">
        <div className="bg-pro-500 px-6 pt-8 pb-6 text-center relative">
          <a href="/panel" className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </a>
          <div className="text-3xl mb-2">⭐</div>
          <h1 className="text-[18px] font-medium text-white">Califica al cliente</h1>
          {cliente && (
            <p className="text-[13px] text-verde-200 mt-1">{cliente.nombre}</p>
          )}
        </div>

        <div className="px-6 py-6">
          <FormCalificar3D tipo="cliente" onSubmit={handleSubmit} />
          <button
            onClick={() => router.push('/panel')}
            className="w-full mt-4 text-sm text-pro-500 hover:text-pro-600 font-medium py-2 transition-colors"
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  )
}
