'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { mensajeTextoSchema, mensajeVozSchema, formatZodError } from '@/lib/validation'

const VOICE_BUCKET = 'voice-notes'
const SIGNED_URL_TTL = 3600

async function assertParticipante(
  supabase: ReturnType<typeof createClient>,
  solicitudId: string,
  userId: string,
): Promise<{ ok: true; destinatarioId: string } | { ok: false; error: string }> {
  const { data: solicitud, error } = await supabase
    .from('solicitudes')
    .select('cliente_id')
    .eq('id', solicitudId)
    .single()
  if (error || !solicitud) return { ok: false, error: 'Solicitud no encontrada.' }

  if (solicitud.cliente_id === userId) {
    const { data: acepted } = await supabase
      .from('postulaciones')
      .select('profesional_id')
      .eq('solicitud_id', solicitudId)
      .eq('estado', 'aceptada')
      .maybeSingle()
    if (!acepted) return { ok: false, error: 'No hay profesional asignado a esta solicitud.' }
    return { ok: true, destinatarioId: acepted.profesional_id }
  }

  const { data: postulacion } = await supabase
    .from('postulaciones')
    .select('id, estado')
    .eq('solicitud_id', solicitudId)
    .eq('profesional_id', userId)
    .maybeSingle()
  if (!postulacion) return { ok: false, error: 'No participas en esta conversación.' }

  return { ok: true, destinatarioId: solicitud.cliente_id }
}

export async function enviarMensajeTexto(
  input: { solicitud_id: string; texto: string },
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const parsed = mensajeTextoSchema.safeParse(input)
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const part = await assertParticipante(supabase, parsed.data.solicitud_id, user.id)
  if (!part.ok) return { error: part.error }

  const { error } = await supabase.from('mensajes').insert({
    solicitud_id: parsed.data.solicitud_id,
    remitente_id: user.id,
    destinatario_id: part.destinatarioId,
    contenido: parsed.data.texto,
    tipo: 'texto',
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function enviarMensajeVoz(
  input: { solicitud_id: string; voz_url: string; voz_duracion: number },
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const parsed = mensajeVozSchema.safeParse(input)
  if (!parsed.success) return { error: formatZodError(parsed.error) }

  const expectedPrefix = `${user.id}/`
  if (!parsed.data.voz_url.startsWith(expectedPrefix)) {
    return { error: 'Ruta de audio inválida.' }
  }

  const part = await assertParticipante(supabase, parsed.data.solicitud_id, user.id)
  if (!part.ok) return { error: part.error }

  const { error } = await supabase.from('mensajes').insert({
    solicitud_id: parsed.data.solicitud_id,
    remitente_id: user.id,
    destinatario_id: part.destinatarioId,
    contenido: '🎤 Nota de voz',
    tipo: 'voz',
    voz_url: parsed.data.voz_url,
    voz_duracion: parsed.data.voz_duracion,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function obtenerUrlFirmadaVoz(
  path: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { data, error } = await supabase.storage
    .from(VOICE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL)
  if (error || !data) return { error: error?.message ?? 'No se pudo generar URL.' }
  return { url: data.signedUrl }
}
