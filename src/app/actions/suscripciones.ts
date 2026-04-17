'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function verificarSuscripcion(): Promise<{
  activa: boolean
  plan?: string
  fecha_fin?: string
  error?: string
}> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { activa: false, error: 'No autenticado.' }

  const { data } = await supabase
    .from('suscripciones')
    .select('*')
    .eq('profesional_id', user.id)
    .eq('estado', 'activa')
    .gte('fecha_fin', new Date().toISOString())
    .order('fecha_fin', { ascending: false })
    .limit(1)
    .single()

  if (!data) return { activa: false }

  return {
    activa: true,
    plan: data.plan,
    fecha_fin: data.fecha_fin,
  }
}

export async function registrarSuscripcion(
  plan: string,
  mpPreapprovalId: string,
  monto: number,
  meses: number,
): Promise<{ error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const fechaFin = new Date()
  fechaFin.setMonth(fechaFin.getMonth() + meses)

  const { error: errSub } = await supabase
    .from('suscripciones')
    .insert({
      profesional_id: user.id,
      plan,
      mp_preapproval_id: mpPreapprovalId,
      estado: 'activa',
      monto,
      fecha_fin: fechaFin.toISOString(),
    })

  if (errSub) return { error: errSub.message }

  // Actualizar perfil como premium
  await supabase
    .from('profesionales')
    .update({
      es_premium: true,
      premium_hasta: fechaFin.toISOString(),
    })
    .eq('usuario_id', user.id)

  return {}
}
