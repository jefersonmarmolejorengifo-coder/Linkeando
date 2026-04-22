'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function completarOnboarding(
  tipo: 'cliente' | 'profesional',
): Promise<{ error?: string } | null> {
  if (tipo !== 'cliente' && tipo !== 'profesional') {
    return { error: 'Tipo de cuenta inválido.' }
  }

  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { error } = await supabase
    .from('usuarios')
    .update({ onboarded: true, tipo })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return null
}
