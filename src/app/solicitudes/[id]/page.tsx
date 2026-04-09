import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import FormPostular from '@/components/FormPostular'
import FormAceptar from '@/components/FormAceptar'

const CATEGORIA_LABELS: Record<string, string> = {
  plomeria: 'Plomería', electricidad: 'Electricidad', carpinteria: 'Carpintería',
  pintura: 'Pintura', limpieza: 'Limpieza', jardineria: 'Jardinería',
  cerrajeria: 'Cerrajería', otros: 'Otros',
}
const CATEGORIA_ICONS: Record<string, string> = {
  plomeria: '🔧', electricidad: '⚡', carpinteria: '🪚', pintura: '🎨',
  limpieza: '🧹', jardineria: '🌿', cerrajeria: '🔑', otros: '🛠️',
}
const ESTADO_MAP: Record<string, { label: string; className: string }> = {
  abierta:    { label: 'Abierta',    className: 'bg-green-50 text-green-700 border-green-200' },
  en_proceso: { label: 'En proceso', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  completada: { label: 'Completada', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  cancelada:  { label: 'Cancelada',  className: 'bg-red-50 text-red-500 border-red-200' },
}

export default async function SolicitudDetallePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: solicitud }, { data: usuario }] = await Promise.all([
    supabase
      .from('solicitudes')
      .select('*, cliente:cliente_id(id, nombre, avatar_url)')
      .eq('id', params.id)
      .single(),
    supabase.from('usuarios').select('tipo').eq('id', user.id).single(),
  ])

  if (!solicitud) notFound()

  const esCliente = usuario?.tipo === 'cliente'
  const esPropietario = solicitud.cliente_id === user.id

  // Para el profesional: su postulación (si existe)
  let miPostulacion: { id: string; estado: string } | null = null
  // Para el cliente dueño: lista de postulaciones
  let postulaciones: any[] = []

  if (esPropietario) {
    const { data } = await supabase
      .from('postulaciones')
      .select('*, profesional:profesional_id(id, nombre, avatar_url, rating_promedio, total_servicios, telefono, barrio)')
      .eq('solicitud_id', params.id)
      .order('estado', { ascending: true }) // aceptada primero
      .order('created_at', { ascending: false })
    postulaciones = data ?? []
  } else if (!esCliente) {
    const { data } = await supabase
      .from('postulaciones')
      .select('id, estado')
      .eq('solicitud_id', params.id)
      .eq('profesional_id', user.id)
      .maybeSingle()
    miPostulacion = data
  }

  const postulacionAceptada = postulaciones.find((p) => p.estado === 'aceptada') ?? null
  const estadoInfo = ESTADO_MAP[solicitud.estado]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/solicitudes" className="text-sm text-verde-600 hover:underline mb-5 inline-flex items-center gap-1">
        ← Volver a solicitudes
      </Link>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {(solicitud as any).foto_url && (
          <img
            src={(solicitud as any).foto_url}
            alt="foto solicitud"
            className="w-full h-56 object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-medium bg-verde-50 text-verde-700 border border-verde-100 px-2.5 py-0.5 rounded-full">
              {CATEGORIA_ICONS[solicitud.categoria]} {CATEGORIA_LABELS[solicitud.categoria]}
            </span>
            {estadoInfo && (
              <span className={`text-xs font-medium border px-2.5 py-0.5 rounded-full ${estadoInfo.className}`}>
                {estadoInfo.label}
              </span>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed mb-5">{solicitud.descripcion}</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
            <span>📍 {(solicitud as any).barrio ?? solicitud.direccion}, Cali</span>
            {solicitud.presupuesto_max && (
              <span>
                💰 Hasta{' '}
                <strong className="text-gray-700">
                  ${Number(solicitud.presupuesto_max).toLocaleString('es-CO')}
                </strong>
              </span>
            )}
            <span>
              📅{' '}
              {new Date(solicitud.created_at).toLocaleDateString('es-CO', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>

          {/* Cliente visible para profesionales */}
          {!esPropietario && solicitud.cliente && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-verde-100 flex items-center justify-center text-sm font-bold text-verde-700">
                {(solicitud.cliente as any).nombre?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{(solicitud.cliente as any).nombre}</p>
                <p className="text-xs text-gray-400">Cliente</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECCIÓN PROFESIONAL ── */}
      {!esCliente && !esPropietario && (
        <div>
          {miPostulacion?.estado === 'aceptada' ? (
            // Propuesta aceptada → acceso al chat
            <div className="bg-verde-50 border border-verde-200 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-1">🎉</p>
              <p className="font-bold text-verde-800 text-lg">¡Tu propuesta fue aceptada!</p>
              <p className="text-sm text-verde-600 mt-1 mb-4">
                El cliente quiere trabajar contigo. Coordina los detalles por el chat.
              </p>
              <Link
                href={`/chat/${params.id}`}
                className="inline-flex items-center gap-2 bg-verde-500 hover:bg-verde-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Ir al chat
              </Link>
            </div>
          ) : miPostulacion?.estado === 'pendiente' ? (
            // Esperando respuesta
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
              <p className="text-yellow-700 font-semibold">Propuesta enviada</p>
              <p className="text-sm text-yellow-600 mt-1">
                El cliente está revisando las propuestas. Te avisaremos cuando haya una respuesta.
              </p>
            </div>
          ) : miPostulacion?.estado === 'rechazada' ? (
            // No seleccionado
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-500">
              El cliente seleccionó a otro profesional para este trabajo.
            </div>
          ) : solicitud.estado === 'abierta' ? (
            // No postulado aún → mostrar formulario
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Postularme</h2>
              <FormPostular solicitudId={params.id} />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-500">
              Esta solicitud ya no acepta postulaciones.
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN CLIENTE DUEÑO ── */}
      {esPropietario && (
        <div>
          {/* Si ya hay un profesional aceptado */}
          {postulacionAceptada ? (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Profesional seleccionado</h2>
              <div className="bg-white rounded-2xl border border-verde-200 shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/perfil/${postulacionAceptada.profesional.id}`}
                    className="flex items-center gap-3 hover:opacity-75 transition-opacity"
                  >
                    <div className="w-11 h-11 rounded-full bg-verde-100 flex items-center justify-center text-sm font-bold text-verde-700">
                      {postulacionAceptada.profesional?.nombre?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{postulacionAceptada.profesional?.nombre}</p>
                      <p className="text-xs text-gray-400">
                        ⭐ {Number(postulacionAceptada.profesional?.rating_promedio ?? 0).toFixed(1)}{' '}
                        · {postulacionAceptada.profesional?.total_servicios ?? 0} servicios
                      </p>
                    </div>
                  </Link>
                  {postulacionAceptada.precio_propuesto && (
                    <span className="text-verde-700 font-bold flex-shrink-0">
                      ${Number(postulacionAceptada.precio_propuesto).toLocaleString('es-CO')}
                    </span>
                  )}
                </div>

                {postulacionAceptada.mensaje && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-3">
                    {postulacionAceptada.mensaje}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href={`/chat/${params.id}`}
                    className="inline-flex items-center gap-2 bg-verde-500 hover:bg-verde-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Ir al chat
                  </Link>
                  {postulacionAceptada.profesional?.telefono && (
                    <a
                      href={`https://wa.me/57${postulacionAceptada.profesional.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Sin profesional aceptado → mostrar propuestas pendientes */
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Propuestas recibidas{' '}
                <span className="text-base font-normal text-gray-400">({postulaciones.length})</span>
              </h2>

              {postulaciones.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  Aún no hay profesionales postulados.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {postulaciones.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <Link
                          href={`/perfil/${p.profesional.id}`}
                          className="flex items-center gap-3 hover:opacity-75 transition-opacity"
                        >
                          <div className="w-10 h-10 rounded-full bg-verde-100 flex items-center justify-center text-sm font-bold text-verde-700 flex-shrink-0">
                            {p.profesional?.nombre?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{p.profesional?.nombre}</p>
                            <p className="text-xs text-gray-400">
                              ⭐ {Number(p.profesional?.rating_promedio ?? 0).toFixed(1)}{' '}
                              · {p.profesional?.total_servicios ?? 0} servicios
                              {p.profesional?.barrio ? ` · ${p.profesional.barrio}` : ''}
                            </p>
                          </div>
                        </Link>
                        {p.precio_propuesto && (
                          <span className="text-sm font-bold text-verde-700 flex-shrink-0">
                            ${Number(p.precio_propuesto).toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                        {p.mensaje}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {solicitud.estado === 'abierta' && (
                          <FormAceptar postulacionId={p.id} solicitudId={params.id} />
                        )}
                        {p.profesional?.telefono && (
                          <a
                            href={`https://wa.me/57${p.profesional.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-verde-300 hover:text-verde-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
