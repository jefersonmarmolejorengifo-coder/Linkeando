'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function completarServicio(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const solicitud_id   = formData.get('solicitud_id')   as string
  const postulacion_id = formData.get('postulacion_id') as string
  const profesional_id = formData.get('profesional_id') as string

  // Verificar que el usuario es el cliente y el estado es correcto
  const { data: solicitud } = await supabase
    .from('solicitudes')
    .select('cliente_id, estado')
    .eq('id', solicitud_id)
    .single()

  if (!solicitud)                         return { error: 'Solicitud no encontrada.' }
  if (solicitud.cliente_id !== user.id)   return { error: 'Solo el cliente puede completar el servicio.' }
  if (solicitud.estado !== 'en_proceso')  return { error: 'El servicio no está en proceso.' }

  // Insertar servicio completado (unique por solicitud_id → no hay duplicados)
  const { data: servicio, error: errServicio } = await supabase
    .from('servicios_completados')
    .insert({ solicitud_id, postulacion_id, cliente_id: user.id, profesional_id })
    .select('id')
    .single()

  if (errServicio) return { error: errServicio.message }

  // Actualizar estado de la solicitud
  await supabase
    .from('solicitudes')
    .update({ estado: 'completada' })
    .eq('id', solicitud_id)

  redirect(`/calificar/${servicio.id}`)
}

export async function calificar(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const servicio_completado_id = formData.get('servicio_completado_id') as string
  const calificado_id          = formData.get('calificado_id')          as string
  const puntuacion             = Number(formData.get('puntuacion'))
  const comentario             = (formData.get('comentario') as string).trim() || null

  if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
    return { error: 'Selecciona una puntuación de 1 a 5 estrellas.' }
  }

  const { error } = await supabase.from('calificaciones').insert({
    servicio_completado_id,
    calificador_id: user.id,
    calificado_id,
    puntuacion,
    comentario,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ya calificaste este servicio.' }
    return { error: error.message }
  }

  return { success: true }
}
