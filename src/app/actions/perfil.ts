'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

type PerfilState = { error?: string; success?: boolean } | null

export async function actualizarPerfil(
  _: PerfilState,
  formData: FormData,
): Promise<PerfilState> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const nombre      = (formData.get('nombre') as string | null)?.trim() ?? ''
  const telefono    = (formData.get('telefono') as string | null)?.trim() || null
  const barrio      = (formData.get('barrio') as string | null) || null
  const descripcion = (formData.get('descripcion') as string | null)?.trim() || null
  const tarifaRaw   = formData.get('tarifa') as string | null
  const tarifa      = tarifaRaw ? parseFloat(tarifaRaw) : null
  const latRaw      = formData.get('lat') as string | null
  const lngRaw      = formData.get('lng') as string | null

  if (!nombre) return { error: 'El nombre es obligatorio.' }

  const updates: Record<string, unknown> = { nombre, telefono, barrio, descripcion, tarifa }
  if (latRaw && lngRaw) {
    updates.lat = parseFloat(latRaw)
    updates.lng = parseFloat(lngRaw)
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
