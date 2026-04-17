'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function crearIncidencia(_: unknown, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesion.' }

  const servicio_id = formData.get('servicio_id') as string
  const tipo = formData.get('tipo') as string
  const descripcion = formData.get('descripcion') as string

  if (!servicio_id || !tipo) return { error: 'Faltan datos obligatorios.' }

  // Verificar que el servicio existe y pertenece al usuario
  const { data: servicio } = await supabase
    .from('servicios_completados')
    .select('id, cliente_id, profesional_id')
    .eq('id', servicio_id)
    .single()

  if (!servicio) return { error: 'Servicio no encontrado.' }
  if (servicio.cliente_id !== user.id && servicio.profesional_id !== user.id) {
    return { error: 'No tienes permiso para reportar este servicio.' }
  }

  // Determinar contra quién va la incidencia
  const reportado_id = servicio.cliente_id === user.id
    ? servicio.profesional_id
    : servicio.cliente_id

  const { error } = await supabase.from('incidencias').insert({
    servicio_completado_id: servicio_id,
    reportante_id: user.id,
    reportado_id,
    tipo,
    descripcion: descripcion || null,
  })

  if (error) return { error: 'No se pudo registrar la incidencia. Intenta de nuevo.' }
  return { success: true }
}
