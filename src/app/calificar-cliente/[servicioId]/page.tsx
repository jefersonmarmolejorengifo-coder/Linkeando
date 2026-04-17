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

    setTimeout(() => router.push('/panel'), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-pro-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen">
        <div className="bg-[#085041] px-6 pt-8 pb-6 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <h1 className="text-[18px] font-medium text-white">Califica al cliente</h1>
          {cliente && (
            <p className="text-[13px] text-[#9FE1CB] mt-1">{cliente.nombre}</p>
          )}
        </div>

        <div className="px-6 py-6">
          <FormCalificar3D tipo="cliente" onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
