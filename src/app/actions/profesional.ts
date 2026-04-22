'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function actualizarPerfilPro(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const bio = (formData.get('bio') as string)?.trim() || null
  const anos_experiencia = Number(formData.get('anos_experiencia')) || 0
  const radio_km = Number(formData.get('radio_km')) || 10
  const lat_base = formData.get('lat_base') ? Number(formData.get('lat_base')) : null
  const lng_base = formData.get('lng_base') ? Number(formData.get('lng_base')) : null

  const { error } = await supabase
    .from('profesionales')
    .upsert({
      usuario_id: user.id,
      bio,
      anos_experiencia,
      radio_km,
      lat_base,
      lng_base,
    }, { onConflict: 'usuario_id' })

  if (error) return { error: error.message }
  return { success: true }
}

export async function actualizarRadioKm(radioKm: number): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }
  const rk = Math.max(1, Math.min(30, Math.round(radioKm)))
  const { error } = await supabase
    .from('profesionales')
    .upsert({ usuario_id: user.id, radio_km: rk }, { onConflict: 'usuario_id' })
  if (error) return { error: error.message }
  return {}
}

export async function actualizarNegocio(input: {
  negocio_fijo: boolean
  negocio_direccion?: string | null
  negocio_descripcion?: string | null
}): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }
  const dir = (input.negocio_direccion ?? '').trim()
  const desc = (input.negocio_descripcion ?? '').trim()
  if (dir.length > 160) return { error: 'Dirección demasiado larga.' }
  if (desc.length > 500) return { error: 'Descripción demasiado larga.' }
  const { error } = await supabase
    .from('profesionales')
    .upsert({
      usuario_id: user.id,
      negocio_fijo: input.negocio_fijo,
      negocio_direccion: dir.length ? dir : null,
      negocio_descripcion: desc.length ? desc : null,
    }, { onConflict: 'usuario_id' })
  if (error) return { error: error.message }
  return {}
}

export async function toggleDisponible(
  disponible: boolean,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('profesionales')
    .update({ disponible })
    .eq('usuario_id', user.id)

  if (error) return { error: error.message }
  return {}
}

export async function agregarEspecialidad(
  categoria: string,
  esPrincipal: boolean = false,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  // Si es principal, quitar principal de las demás
  if (esPrincipal) {
    await supabase
      .from('pro_especialidades')
      .update({ es_principal: false })
      .eq('profesional_id', user.id)
  }

  const { error } = await supabase
    .from('pro_especialidades')
    .upsert({
      profesional_id: user.id,
      categoria,
      es_principal: esPrincipal,
    }, { onConflict: 'profesional_id,categoria' })

  if (error) return { error: error.message }
  return {}
}

export async function eliminarEspecialidad(
  categoria: string,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('pro_especialidades')
    .delete()
    .eq('profesional_id', user.id)
    .eq('categoria', categoria)

  if (error) return { error: error.message }
  return {}
}

export async function agregarZona(
  barrio: string,
  departamento: string = 'Valle del Cauca',
  ciudad: string = 'Cali',
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('pro_zonas')
    .insert({ profesional_id: user.id, departamento, ciudad, barrio })

  if (error) {
    if (error.code === '23505') return { error: 'Ya tienes esta zona agregada.' }
    return { error: error.message }
  }
  return {}
}

export async function eliminarZona(
  zonaId: string,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('pro_zonas')
    .delete()
    .eq('id', zonaId)
    .eq('profesional_id', user.id)

  if (error) return { error: error.message }
  return {}
}
