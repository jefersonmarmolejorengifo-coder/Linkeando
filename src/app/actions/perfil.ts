'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { perfilSchema, formatZodError } from '@/lib/validation'

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
