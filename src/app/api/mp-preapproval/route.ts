import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[mp-preapproval] MP_WEBHOOK_SECRET no configurado; rechazando.')
    return false
  }

  const sigHeader = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''

  if (!sigHeader || !requestId) return false

  const parts = Object.fromEntries(
    sigHeader.split(',').map(p => {
      const [k, v] = p.trim().split('=')
      return [k ?? '', v ?? '']
    }),
  )

  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  let dataId = ''
  try {
    dataId = (JSON.parse(rawBody)?.data?.id ?? '').toString()
  } catch {
    return false
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(v1, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifySignature(req, rawBody)) {
    return new NextResponse('unauthorized', { status: 401 })
  }

  let body: { type?: string; data?: { id?: string } }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!

    const { type, data } = body

    if (type !== 'preapproval' || !data?.id) {
      return NextResponse.json({ received: true })
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/preapproval/${data.id}`,
      { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } },
    )

    if (!mpRes.ok) {
      console.error('Error al consultar preapproval en MP:', mpRes.status)
      return NextResponse.json({ error: 'MP API error' }, { status: 502 })
    }

    const preapproval = await mpRes.json()

    const {
      id: mp_preapproval_id,
      payer_email,
      status,
      preapproval_plan_id,
      date_created,
      next_payment_date,
    } = preapproval

    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', payer_email)
      .single()

    if (!usuario) {
      console.error('Usuario no encontrado para email:', payer_email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profesionalId = usuario.id

    const PLAN_MAP: Record<string, string> = {
      '3b6309405ef64d858a0fa21d654e0e99': 'mensual',
      '594000f26a0747289ec8e531b9806e4e': 'trimestral',
      'eabaa9e35783400aa668b3908a52031d': 'semestral',
      'ee5d500b780a410eb019343bdc2e1027': 'anual',
    }
    const plan = PLAN_MAP[preapproval_plan_id] ?? 'mensual'

    const fechaInicio = new Date(date_created)
    const mesesMap: Record<string, number> = {
      mensual: 1,
      trimestral: 3,
      semestral: 6,
      anual: 12,
    }
    const fechaFin = new Date(fechaInicio)
    fechaFin.setMonth(fechaFin.getMonth() + (mesesMap[plan] ?? 1))

    const estadoMap: Record<string, string> = {
      authorized: 'activa',
      paused: 'pausada',
      cancelled: 'cancelada',
      pending: 'pendiente',
    }
    const estadoInterno = estadoMap[status] ?? 'pendiente'
    const esPremiumActivo = status === 'authorized'

    await supabaseAdmin.from('suscripciones').upsert(
      {
        profesional_id: profesionalId,
        plan,
        mp_preapproval_id,
        estado: estadoInterno,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: next_payment_date || fechaFin.toISOString(),
      },
      { onConflict: 'mp_preapproval_id' },
    )

    await supabaseAdmin.from('profesionales').upsert(
      {
        usuario_id: profesionalId,
        es_premium: esPremiumActivo,
        premium_hasta: esPremiumActivo
          ? (next_payment_date || fechaFin.toISOString())
          : null,
      },
      { onConflict: 'usuario_id' },
    )

    const alertaTitulo = esPremiumActivo
      ? 'Suscripción Premium activada'
      : `Suscripción ${estadoInterno}`
    const alertaMensaje = esPremiumActivo
      ? `Tu plan ${plan} está activo. Disfruta de los beneficios Premium.`
      : `Tu suscripción cambió a estado: ${estadoInterno}.`

    await supabaseAdmin.from('alertas').insert({
      usuario_id: profesionalId,
      tipo: 'premium',
      titulo: alertaTitulo,
      mensaje: alertaMensaje,
      leida: false,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook MP error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
