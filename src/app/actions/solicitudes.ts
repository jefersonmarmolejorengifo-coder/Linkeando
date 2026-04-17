'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { CATEGORIA_LABELS } from '@/lib/constants'

export async function crearSolicitud(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const categoria = formData.get('categoria') as string
  const descripcion = formData.get('descripcion') as string
  const barrio = formData.get('barrio') as string
  const presupuesto = formData.get('presupuesto') as string
  const foto_url = formData.get('foto_url') as string

  if (!categoria || !descripcion || !barrio) {
    return { error: 'Categoría, descripción y barrio son obligatorios.' }
  }

  const titulo = `${CATEGORIA_LABELS[categoria] ?? categoria} en ${barrio}`

  const modalidad = (formData.get('modalidad') as string) || 'puntual'
  const cuando = (formData.get('cuando') as string) || null
  const urgente = formData.get('urgente') === 'true'

  const { data, error } = await supabase
    .from('solicitudes')
    .insert({
      cliente_id: user.id,
      categoria,
      titulo,
      descripcion,
      direccion: barrio,
      barrio,
      presupuesto_max: presupuesto ? Number(presupuesto) : null,
      foto_url: foto_url || null,
      estado: 'abierta',
      modalidad,
      cuando,
      urgente,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  redirect(`/solicitudes/${data.id}`)
}

export async function aceptarPostulacion(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const postulacion_id = formData.get('postulacion_id') as string
  const solicitud_id = formData.get('solicitud_id') as string

  // Aceptar postulación (el trigger cambia estado de solicitud y rechaza las demás)
  const { error } = await supabase
    .from('postulaciones')
    .update({ estado: 'aceptada' })
    .eq('id', postulacion_id)

  if (error) return { error: error.message }

  // Obtener datos para el mensaje de sistema
  const [{ data: postulacion }, { data: solicitud }, { data: cliente }] = await Promise.all([
    supabase.from('postulaciones').select('profesional_id').eq('id', postulacion_id).single(),
    supabase.from('solicitudes').select('titulo, sid, descripcion').eq('id', solicitud_id).single(),
    supabase.from('usuarios').select('nombre').eq('id', user.id).single(),
  ])

  if (postulacion && solicitud && cliente) {
    const { data: profesional } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('id', postulacion.profesional_id)
      .single()

    // Insertar mensaje de sistema automático
    const sid = (solicitud as any).sid ?? ''
    const contenido = `[SISTEMA] Chat abierto · ${(cliente as any).nombre} seleccionó a ${(profesional as any)?.nombre ?? 'profesional'} · Servicio: ${(solicitud as any).titulo} · ID: ${sid}`

    await supabase.from('mensajes').insert({
      solicitud_id,
      remitente_id: user.id,
      destinatario_id: postulacion.profesional_id,
      contenido,
    })
  }

  redirect(`/chat/${solicitud_id}`)
}

export async function crearPostulacion(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const solicitud_id = formData.get('solicitud_id') as string
  const mensaje = formData.get('mensaje') as string
  const precio_propuesto = formData.get('precio_propuesto') as string

  if (!mensaje?.trim()) return { error: 'El mensaje es obligatorio.' }

  const { error } = await supabase.from('postulaciones').insert({
    solicitud_id,
    profesional_id: user.id,
    mensaje: mensaje.trim(),
    precio_propuesto: precio_propuesto ? Number(precio_propuesto) : null,
    estado: 'pendiente',
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ya te postulaste a esta solicitud.' }
    return { error: error.message }
  }

  return { success: true }
}
