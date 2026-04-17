'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import type { Alerta } from '@/types'

export async function obtenerAlertas(): Promise<{
  alertas: Alerta[]
  error?: string
}> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { alertas: [], error: 'No autenticado.' }

  const { data, error } = await supabase
    .from('alertas')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { alertas: [], error: error.message }
  return { alertas: (data as Alerta[]) ?? [] }
}

export async function marcarAlertaLeida(
  alertaId: string,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('alertas')
    .update({ leida: true })
    .eq('id', alertaId)
    .eq('usuario_id', user.id)

  if (error) return { error: error.message }
  return {}
}

export async function marcarTodasLeidas(): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('alertas')
    .update({ leida: true })
    .eq('usuario_id', user.id)
    .eq('leida', false)

  if (error) return { error: error.message }
  return {}
}
