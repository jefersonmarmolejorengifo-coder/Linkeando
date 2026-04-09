'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getMPClient, Preference } from '@/lib/mercadopago'

export async function crearPreferenciaPago(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const servicio_id    = formData.get('servicio_id')    as string
  const monto_str      = formData.get('monto')          as string
  const titulo_item    = formData.get('titulo')         as string
  const profesional_id = formData.get('profesional_id') as string

  const monto = Number(monto_str)
  if (!monto || monto <= 0) return { error: 'El monto del servicio es requerido.' }

  // Verificar que el usuario es el cliente de este servicio
  const { data: servicio } = await supabase
    .from('servicios_completados')
    .select('cliente_id, profesional_id, solicitud_id')
    .eq('id', servicio_id)
    .single()

  if (!servicio)                       return { error: 'Servicio no encontrado.' }
  if (servicio.cliente_id !== user.id) return { error: 'Solo el cliente puede iniciar el pago.' }

  // Verificar que no existe un pago aprobado ya
  const { data: pagoExistente } = await supabase
    .from('pagos')
    .select('id, mp_status')
    .eq('servicio_completado_id', servicio_id)
    .maybeSingle()

  if (pagoExistente?.mp_status === 'approved') {
    return { error: 'Este servicio ya fue pagado.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Crear preferencia en Mercado Pago
  const preference = new Preference(getMPClient())

  const { id: preferenceId, init_point } = await preference.create({
    body: {
      items: [
        {
          id:          servicio_id,
          title:       titulo_item || 'Servicio Linkeando',
          quantity:    1,
          unit_price:  monto,
          currency_id: 'COP',
        },
      ],
      back_urls: {
        success: `${appUrl}/pago/resultado?servicio_id=${servicio_id}&status=approved`,
        failure: `${appUrl}/pago/resultado?servicio_id=${servicio_id}&status=rejected`,
        pending: `${appUrl}/pago/resultado?servicio_id=${servicio_id}&status=pending`,
      },
      auto_return: 'approved',
      external_reference: servicio_id,
      statement_descriptor: 'LINKEANDO',
    },
  })

  if (!preferenceId || !init_point) {
    return { error: 'No se pudo crear la preferencia de pago.' }
  }

  // Guardar la preferencia en Supabase (sin datos bancarios)
  const { error: dbError } = await supabase.from('pagos').upsert(
    {
      servicio_completado_id: servicio_id,
      cliente_id:             user.id,
      profesional_id:         servicio.profesional_id,
      mp_preference_id:       preferenceId,
      monto,
      mp_status:              'pending',
    },
    { onConflict: 'servicio_completado_id' },
  )

  if (dbError) return { error: dbError.message }

  // Redirigir al checkout de Mercado Pago
  redirect(init_point)
}

// Llamada desde la página de resultado (GET params de MP)
export async function registrarResultadoPago({
  servicio_id,
  mp_payment_id,
  mp_status,
}: {
  servicio_id:   string
  mp_payment_id: string
  mp_status:     string
}): Promise<{ error?: string }> {
  const supabase = createClient(cookies())

  const estadosValidos = ['approved', 'rejected', 'pending', 'in_process', 'cancelled']
  const estado = estadosValidos.includes(mp_status) ? mp_status : 'pending'

  const { error } = await supabase
    .from('pagos')
    .update({
      mp_payment_id,
      mp_status: estado,
    })
    .eq('servicio_completado_id', servicio_id)

  if (error) return { error: error.message }
  return {}
}
