import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import FormCalificar from '@/components/FormCalificar'
import FormPagar from '@/components/FormPagar'

function Estrellas({ puntuacion }: { puntuacion: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= puntuacion ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

export default async function CalificarPage({
  params,
}: {
  params: { servicioId: string }
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Cargar servicio con participantes, solicitud y postulación aceptada
  const [{ data: servicio }, { data: pago }] = await Promise.all([
    supabase
      .from('servicios_completados')
      .select('*, cliente:cliente_id(id, nombre), profesional:profesional_id(id, nombre), solicitud:solicitud_id(id, titulo, categoria)')
      .eq('id', params.servicioId)
      .single(),
    supabase
      .from('pagos')
      .select('mp_status, monto')
      .eq('servicio_completado_id', params.servicioId)
      .maybeSingle(),
  ])

  if (!servicio) notFound()

  const esCliente     = user.id === servicio.cliente_id
  const esProfesional = user.id === servicio.profesional_id
  if (!esCliente && !esProfesional) redirect('/')

  const calificado = esCliente
    ? (servicio.profesional as any)
    : (servicio.cliente as any)

  // Cargar calificaciones en paralelo
  const [{ data: miCalificacion }, { data: calificacionRecibida }] = await Promise.all([
    supabase
      .from('calificaciones')
      .select('puntuacion, comentario')
      .eq('servicio_completado_id', params.servicioId)
      .eq('calificador_id', user.id)
      .maybeSingle(),
    supabase
      .from('calificaciones')
      .select('puntuacion, comentario, calificador:calificador_id(nombre)')
      .eq('servicio_completado_id', params.servicioId)
      .eq('calificado_id', user.id)
      .maybeSingle(),
  ])

  // Precio acordado (de la postulación aceptada)
  const { data: postulacion } = await supabase
    .from('postulaciones')
    .select('precio_propuesto')
    .eq('solicitud_id', servicio.solicitud_id)
    .eq('estado', 'aceptada')
    .maybeSingle()

  const solicitud = servicio.solicitud as any
  const titulo    = solicitud?.titulo ?? solicitud?.categoria ?? 'Servicio'
  const pagoAprobado = pago?.mp_status === 'approved'

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <Link
        href={`/chat/${servicio.solicitud_id}`}
        className="text-sm text-verde-600 hover:underline mb-6 inline-flex items-center gap-1"
      >
        ← Volver al chat
      </Link>

      {/* Encabezado */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-verde-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-verde-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Servicio completado</h1>
        <p className="text-sm text-gray-500 mt-1">{titulo}</p>

        <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-full bg-verde-100 flex items-center justify-center text-xs font-bold text-verde-700">
              {(servicio.cliente as any).nombre?.[0]?.toUpperCase()}
            </span>
            {(servicio.cliente as any).nombre}
          </span>
          <span className="text-gray-300">↔</span>
          <span className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-full bg-verde-100 flex items-center justify-center text-xs font-bold text-verde-700">
              {(servicio.profesional as any).nombre?.[0]?.toUpperCase()}
            </span>
            {(servicio.profesional as any).nombre}
          </span>
        </div>
      </div>

      {/* ── Bloque de Pago (solo cliente, antes de calificar o después) ── */}
      {esCliente && (
        <div className="mb-5">
          {pagoAprobado ? (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">Pago realizado</p>
                <p className="text-xs text-green-600">
                  ${Number(pago!.monto).toLocaleString('es-CO')} COP · Aprobado por Mercado Pago
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#009EE3] text-lg font-black">MP</span>
                <h2 className="text-base font-bold text-gray-900">Pagar el servicio</h2>
              </div>
              <FormPagar
                servicioId={params.servicioId}
                profesionalId={servicio.profesional_id}
                titulo={titulo}
                montoSugerido={postulacion?.precio_propuesto ?? undefined}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Sección informativa para profesional si el cliente aún no pagó ── */}
      {esProfesional && !pagoAprobado && pago === null && (
        <div className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 mb-5 text-sm text-yellow-800">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          El cliente aún no ha realizado el pago por este servicio.
        </div>
      )}

      {/* ── Calificación ── */}
      {!miCalificacion ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-5 text-center">
            {esCliente ? 'Califica al profesional' : 'Califica al cliente'}
          </h2>
          <FormCalificar
            servicioId={params.servicioId}
            calificadoId={calificado.id}
            calificadoNombre={calificado.nombre}
            esCalificandoProfesional={esCliente}
          />
        </div>
      ) : (
        <div className="bg-verde-50 border border-verde-200 rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-verde-600 uppercase tracking-wide mb-2">
            Tu calificación a {calificado.nombre}
          </p>
          <div className="flex items-center gap-2 mb-1">
            <Estrellas puntuacion={miCalificacion.puntuacion} />
            <span className="text-sm font-bold text-gray-700">
              {miCalificacion.puntuacion}/5
              <span className="font-normal text-gray-400 ml-1">— {LABELS[miCalificacion.puntuacion]}</span>
            </span>
          </div>
          {miCalificacion.comentario && (
            <p className="text-sm text-verde-700 italic mt-2">"{miCalificacion.comentario}"</p>
          )}
        </div>
      )}

      {/* ── Calificación recibida ── */}
      {calificacionRecibida ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {(calificacionRecibida.calificador as any)?.nombre} te calificó
          </p>
          <div className="flex items-center gap-2 mb-1">
            <Estrellas puntuacion={calificacionRecibida.puntuacion} />
            <span className="text-sm font-bold text-gray-700">
              {calificacionRecibida.puntuacion}/5
              <span className="font-normal text-gray-400 ml-1">— {LABELS[calificacionRecibida.puntuacion]}</span>
            </span>
          </div>
          {calificacionRecibida.comentario && (
            <p className="text-sm text-gray-500 italic mt-2">"{calificacionRecibida.comentario}"</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">
            {calificado.nombre} aún no ha enviado su calificación.
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <Link href={`/perfil/${calificado.id}`} className="text-sm text-verde-600 hover:underline">
          Ver perfil de {calificado.nombre}
        </Link>
        <span className="text-gray-300">·</span>
        <Link href="/solicitudes" className="text-sm text-gray-500 hover:underline">
          Mis solicitudes
        </Link>
      </div>
    </div>
  )
}
