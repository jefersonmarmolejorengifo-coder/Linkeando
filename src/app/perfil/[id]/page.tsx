import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { CATEGORIA_LABELS, CATEGORIAS } from '@/lib/constants'
import BotonVolver from '@/components/BotonVolver'

const CATEGORIA_ICONS: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.key, c.icon]),
)

function Estrellas({ rating }: { rating: number }) {
  const llenas = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= llenas ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function BarraProgreso({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-verde-500 rounded-full transition-all"
          style={{ width: `${(valor / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">
        {valor.toFixed(1)}
      </span>
    </div>
  )
}

function AvatarPlaceholder({ nombre, url, size = 24 }: { nombre: string; url?: string | null; size?: number }) {
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const px = size * 4
  if (url) {
    return (
      <img
        src={url}
        alt={nombre}
        style={{ width: px, height: px }}
        className="rounded-full object-cover ring-4 ring-white shadow-lg"
      />
    )
  }
  return (
    <div
      style={{ width: px, height: px }}
      className="rounded-full bg-verde-100 flex items-center justify-center ring-4 ring-white shadow-lg"
    >
      <span className="text-3xl font-bold text-verde-600">{initials}</span>
    </div>
  )
}

export default async function PerfilPublicoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient(cookies())

  // Cargar perfil + calificaciones antiguas + nuevas 3D + especialidades + zonas + incidencias + profesional extendido
  const [
    { data: usuario },
    { data: calificaciones },
    { data: cal3d },
    { data: especialidades },
    { data: zonas },
    { data: incidencias },
    { data: profesional },
  ] = await Promise.all([
    supabase.from('usuarios').select('*').eq('id', params.id).single(),
    supabase
      .from('calificaciones')
      .select('*, calificador:calificador_id(nombre, avatar_url)')
      .eq('calificado_id', params.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('cal_profesional')
      .select('calidad, precio, oportunidad, comentario, monto_mano_obra, created_at, cliente_id')
      .eq('profesional_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('pro_especialidades')
      .select('categoria, es_principal')
      .eq('profesional_id', params.id),
    supabase
      .from('pro_zonas')
      .select('barrio, ciudad')
      .eq('profesional_id', params.id),
    supabase
      .from('incidencias')
      .select('tipo, created_at')
      .eq('profesional_id', params.id),
    supabase
      .from('profesionales')
      .select('bio, anos_experiencia, disponible, es_premium, radio_km')
      .eq('usuario_id', params.id)
      .single(),
  ])

  if (!usuario) notFound()

  const esProfesional = usuario.tipo === 'profesional'
  const esPremium = profesional?.es_premium === true

  // Calcular promedios 3D
  const cal3dList = cal3d ?? []
  const tiene3D = cal3dList.length > 0
  const prom3d = tiene3D
    ? {
        calidad: cal3dList.reduce((s: number, c: any) => s + c.calidad, 0) / cal3dList.length,
        precio: cal3dList.reduce((s: number, c: any) => s + c.precio, 0) / cal3dList.length,
        oportunidad: cal3dList.reduce((s: number, c: any) => s + c.oportunidad, 0) / cal3dList.length,
      }
    : null

  const totalIncidencias = incidencias?.length ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <BotonVolver />
      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Banner superior */}
        <div className={`h-28 bg-gradient-to-br ${esPremium ? 'from-premium-400 to-premium-600' : 'from-verde-400 to-verde-600'}`} />

        <div className="px-6 pb-6">
          {/* Avatar superpuesto */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="relative">
              <AvatarPlaceholder nombre={usuario.nombre} url={usuario.avatar_url} size={24} />
              {esPremium && (
                <div className="absolute -bottom-1 -right-1 bg-premium-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  PREMIUM
                </div>
              )}
            </div>
            {esProfesional && usuario.telefono && (
              <a
                href={`https://wa.me/57${usuario.telefono.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contactar
              </a>
            )}
          </div>

          {/* Nombre y badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{usuario.nombre}</h1>
            {esPremium && (
              <span className="text-xs bg-premium-50 text-premium-700 border border-premium-200 px-2 py-0.5 rounded-full font-semibold">
                Premium
              </span>
            )}
            {esProfesional && profesional?.disponible && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                Disponible
              </span>
            )}
          </div>

          {/* Especialidades (multi) */}
          {esProfesional && especialidades && especialidades.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {especialidades.map((e: any) => (
                <span
                  key={e.categoria}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    e.es_principal
                      ? 'bg-verde-100 text-verde-700 border border-verde-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {CATEGORIA_ICONS[e.categoria] ?? ''} {CATEGORIA_LABELS[e.categoria] ?? e.categoria}
                  {e.es_principal && ' (Principal)'}
                </span>
              ))}
            </div>
          ) : esProfesional && usuario.categoria ? (
            <div className="mb-3">
              <span className="text-sm bg-verde-50 text-verde-700 border border-verde-200 px-2.5 py-0.5 rounded-full font-medium">
                {CATEGORIA_ICONS[usuario.categoria]} {CATEGORIA_LABELS[usuario.categoria]}
              </span>
            </div>
          ) : null}

          {/* Zona */}
          {usuario.barrio && (
            <p className="text-sm text-gray-500 mb-1">
              📍 {usuario.barrio}, Cali
            </p>
          )}

          {/* Zonas de cobertura */}
          {esProfesional && zonas && zonas.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-xs text-gray-400">Cubre:</span>
              {zonas.map((z: any) => (
                <span key={z.barrio} className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full">
                  {z.barrio}
                </span>
              ))}
              {profesional?.radio_km && (
                <span className="text-xs text-gray-400">· Radio {profesional.radio_km} km</span>
              )}
            </div>
          )}

          {/* Stats para profesional */}
          {esProfesional && (
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Estrellas rating={Number(usuario.rating_promedio)} />
                <span className="text-sm font-semibold text-gray-800">
                  {Number(usuario.rating_promedio).toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({(calificaciones?.length ?? 0) + cal3dList.length} reseñas)
                </span>
              </div>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{usuario.total_servicios}</span> servicios
              </span>
              {profesional?.anos_experiencia ? (
                <>
                  <span className="text-gray-200">|</span>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{profesional.anos_experiencia}</span> años exp.
                  </span>
                </>
              ) : null}
            </div>
          )}

          {/* Tarifa */}
          {esProfesional && usuario.tarifa && (
            <div className="inline-flex items-center gap-1.5 bg-verde-50 border border-verde-100 rounded-lg px-3 py-1.5 mb-4">
              <span className="text-xs text-verde-600 font-medium">Tarifa desde</span>
              <span className="text-verde-700 font-bold">
                ${Number(usuario.tarifa).toLocaleString('es-CO')} / hora
              </span>
            </div>
          )}

          {/* Bio / Descripción */}
          {esProfesional && (profesional?.bio || usuario.descripcion) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Sobre mí</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {profesional?.bio || usuario.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calificaciones 3D */}
      {esProfesional && tiene3D && prom3d && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Calificaciones detalladas</h2>
          <div className="flex flex-col gap-3 mb-5">
            <BarraProgreso label="Calidad" valor={prom3d.calidad} />
            <BarraProgreso label="Precio justo" valor={prom3d.precio} />
            <BarraProgreso label="Puntualidad" valor={prom3d.oportunidad} />
          </div>
          <p className="text-xs text-gray-400">{cal3dList.length} calificaciones detalladas</p>
        </div>
      )}

      {/* Incidencias */}
      {esProfesional && totalIncidencias > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            Historial de incidencias
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
              {totalIncidencias}
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {incidencias!.map((inc: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-red-400">
                  {inc.tipo === 'no_show' ? '🚫' : '❌'}
                </span>
                <span className="text-gray-600">
                  {inc.tipo === 'no_show' ? 'No se presentó' : 'Cancelación del profesional'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(inc.created_at).toLocaleDateString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reseñas (antiguas + 3D) */}
      {esProfesional && (
        <>
          {cal3dList.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reseñas recientes</h2>
              <div className="flex flex-col gap-3">
                {cal3dList.filter((c: any) => c.comentario).map((c: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Estrellas rating={Math.round((c.calidad + c.precio + c.oportunidad) / 3)} />
                      </div>
                      {c.monto_mano_obra && (
                        <span className="text-xs text-gray-400 ml-auto">
                          Mano de obra: ${Number(c.monto_mano_obra).toLocaleString('es-CO')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{c.comentario}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(c.created_at).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {calificaciones && calificaciones.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {cal3dList.length > 0 ? 'Reseñas anteriores' : 'Reseñas'}
              </h2>
              <div className="flex flex-col gap-3">
                {calificaciones.map((c: any) => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-verde-100 flex items-center justify-center text-xs font-bold text-verde-700">
                        {c.calificador?.nombre?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {c.calificador?.nombre ?? 'Cliente'}
                        </p>
                        <Estrellas rating={c.puntuacion} />
                      </div>
                    </div>
                    {c.comentario && (
                      <p className="text-sm text-gray-600">{c.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!calificaciones || calificaciones.length === 0) && cal3dList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              Este profesional aún no tiene reseñas.
            </p>
          )}
        </>
      )}
    </div>
  )
}
