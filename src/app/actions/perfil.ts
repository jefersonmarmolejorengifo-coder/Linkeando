'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { perfilSchema, cedulaSchema, formatZodError } from '@/lib/validation'

type PerfilState = { error?: string; success?: boolean } | null

export async function actualizarPerfil(
  _: PerfilState,
  formData: FormData,
): Promise<PerfilState> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const parsed = perfilSchema.safeParse({
    nombre: formData.get('nombre'),
    telefono: formData.get('telefono'),
    barrio: formData.get('barrio'),
    departamento: formData.get('departamento'),
    ciudad: formData.get('ciudad'),
    descripcion: formData.get('descripcion'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  })

  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const { nombre, telefono, barrio, departamento, ciudad, descripcion, lat, lng } = parsed.data

  const updates: Record<string, unknown> = { nombre, telefono, barrio, departamento, ciudad, descripcion }
  if (lat !== undefined && lng !== undefined) {
    updates.lat = lat
    updates.lng = lng
  }

  const { error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/perfil')
  revalidatePath(`/perfil/${user.id}`)
  return { success: true }
}

const CAMPO_TEXTO_MAX: Record<string, number> = {
  nombre: 80, telefono: 20, barrio: 60, departamento: 60, ciudad: 60, descripcion: 500, direccion: 160,
}

export async function actualizarCampoPerfil(
  campo: string,
  valor: string,
): Promise<PerfilState> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }
  const max = CAMPO_TEXTO_MAX[campo]
  if (!max) return { error: 'Campo no permitido.' }
  const trimmed = valor.trim()
  if (trimmed.length > max) return { error: `Demasiado largo (máx ${max}).` }
  const { error } = await supabase
    .from('usuarios')
    .update({ [campo]: trimmed.length === 0 ? null : trimmed })
    .eq('id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/perfil')
  revalidatePath('/configuracion')
  return { success: true }
}

export async function actualizarCedula(valor: string): Promise<PerfilState> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }
  const trimmed = valor.trim()
  if (trimmed.length === 0) {
    const { error } = await supabase.from('usuarios').update({ cedula: null }).eq('id', user.id)
    if (error) return { error: error.message }
    return { success: true }
  }
  const parsed = cedulaSchema.safeParse(trimmed)
  if (!parsed.success) return { error: 'Cédula inválida.' }
  const { error } = await supabase.from('usuarios').update({ cedula: parsed.data }).eq('id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/configuracion')
  return { success: true }
}

export async function actualizarAvatar(avatarUrl: string): Promise<PerfilState> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('usuarios')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/perfil')
  revalidatePath(`/perfil/${user.id}`)
  return { success: true }
}
