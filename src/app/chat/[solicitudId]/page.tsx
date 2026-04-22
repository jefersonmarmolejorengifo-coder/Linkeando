import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ChatWindow from '@/components/ChatWindow'
import FormCompletar from '@/components/FormCompletar'

export default async function ChatPage({
  params,
}: {
  params: { solicitudId: string }
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Cargar solicitud, postulación aceptada y servicio completado en paralelo
  const [{ data: solicitud }, { data: postulacion }, { data: servicioCompletado }] =
    await Promise.all([
      supabase
        .from('solicitudes')
        .select('*, cliente:cliente_id(id, nombre, avatar_url)')
        .eq('id', params.solicitudId)
        .single(),
      supabase
        .from('postulaciones')
        .select('*, profesional:profesional_id(id, nombre, avatar_url)')
        .eq('solicitud_id', params.solicitudId)
        .eq('estado', 'aceptada')
        .maybeSingle(),
      supabase
        .from('servicios_completados')
        .select('id')
        .eq('solicitud_id', params.solicitudId)
        .maybeSingle(),
    ])

  if (!solicitud) notFound()

  const esCliente             = user.id === solicitud.cliente_id
  const esProfesionalAceptado = postulacion && user.id === (postulacion.profesional as any)?.id

  if (!esCliente && !esProfesionalAceptado) redirect(`/solicitudes/${params.solicitudId}`)

  // Sin postulación aceptada → chat no disponible aún
  if (!postulacion) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-4xl mb-3">💬</p>
        <p className="font-semibold text-gray-700">El chat aún no está disponible</p>
        <p className="text-sm text-gray-500 mt-1">
          Acepta una propuesta primero para abrir el canal de comunicación.
        </p>
        <Link
          href={`/solicitudes/${params.solicitudId}`}
          className="mt-4 inline-block text-sm text-verde-600 hover:underline"
        >
          ← Ver propuestas
        </Link>
      </div>
    )
  }

  const otro          = esCliente ? (postulacion.profesional as any) : (solicitud.cliente as any)
  const destinatarioId: string = otro?.id
  const profesionalId: string  = (postulacion.profesional as any)?.id
  const titulo = solicitud.titulo ?? solicitud.categoria

  // Historial de mensajes
  const { data: mensajesIniciales } = await supabase
    .from('mensajes')
    .select('id, remitente_id, contenido, created_at, tipo, voz_url, voz_duracion')
    .eq('solicitud_id', params.solicitudId)
    .order('created_at', { ascending: true })
    .limit(200)

  return (
    <div
      className="max-w-2xl mx-auto px-4 flex flex-col"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 py-4 border-b border-gray-100 flex-shrink-0">
        <Link
          href={`/solicitudes/${params.solicitudId}`}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Volver"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="w-9 h-9 rounded-full bg-verde-100 flex items-center justify-center text-sm font-bold text-verde-700 flex-shrink-0">
          {otro?.nombre?.[0]?.toUpperCase() ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{otro?.nombre}</p>
          <p className="text-xs text-gray-400 truncate">
            {esCliente ? 'Profesional' : 'Cliente'} · {titulo}
          </p>
        </div>

        <Link
          href={`/perfil/${otro?.id}`}
          className="text-xs text-verde-600 hover:underline flex-shrink-0"
        >
          Ver perfil
        </Link>
      </div>

      {/* ── Banner de estado del servicio ── */}

      {/* Servicio YA completado → mostrar enlace a calificar */}
      {servicioCompletado && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-verde-50 border-b border-verde-100 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm text-verde-700 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Servicio completado
          </div>
          <Link
            href={`/calificar/${servicioCompletado.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-verde-700 hover:text-verde-800 bg-white border border-verde-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-verde-50"
          >
            ⭐ Calificar
          </Link>
        </div>
      )}

      {/* Servicio EN PROCESO → cliente puede completar */}
      {!servicioCompletado && solicitud.estado === 'en_proceso' && esCliente && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex-shrink-0">
          <p className="text-sm text-blue-700">¿El trabajo está listo?</p>
          <FormCompletar
            solicitudId={params.solicitudId}
            postulacionId={postulacion.id}
            profesionalId={profesionalId}
          />
        </div>
      )}

      {/* ── Ventana de chat ── */}
      <ChatWindow
        solicitudId={params.solicitudId}
        userId={user.id}
        destinatarioId={destinatarioId}
        mensajesIniciales={mensajesIniciales ?? []}
      />
    </div>
  )
}
