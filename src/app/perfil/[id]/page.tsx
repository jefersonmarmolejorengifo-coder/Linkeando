import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const CATEGORIA_LABELS: Record<string, string> = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  carpinteria: 'Carpintería',
  pintura: 'Pintura',
  limpieza: 'Limpieza',
  jardineria: 'Jardinería',
  cerrajeria: 'Cerrajería',
  otros: 'Otros',
}

const CATEGORIA_ICONS: Record<string, string> = {
  plomeria: '🔧', electricidad: '⚡', carpinteria: '🪚',
  pintura: '🎨', limpieza: '🧹', jardineria: '🌿',
  cerrajeria: '🔑', otros: '🛠️',
}

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

  // Cargar perfil + últimas calificaciones recibidas
  const [{ data: usuario }, { data: calificaciones }] = await Promise.all([
    supabase.from('usuarios').select('*').eq('id', params.id).single(),
    supabase
      .from('calificaciones')
      .select('*, calificador:calificador_id(nombre, avatar_url)')
      .eq('calificado_id', params.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (!usuario) notFound()

  const esProfesional = usuario.tipo === 'profesional'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Banner superior */}
        <div className="h-28 bg-gradient-to-br from-verde-400 to-verde-600" />

        <div className="px-6 pb-6">
          {/* Avatar superpuesto */}
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <AvatarPlaceholder nombre={usuario.nombre} url={usuario.avatar_url} size={24} />
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

          {/* Nombre y badge */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{usuario.nombre}</h1>
            {esProfesional && usuario.categoria && (
              <span className="text-sm bg-verde-50 text-verde-700 border border-verde-200 px-2.5 py-0.5 rounded-full font-medium">
                {CATEGORIA_ICONS[usuario.categoria]} {CATEGORIA_LABELS[usuario.categoria]}
              </span>
            )}
          </div>

          {/* Zona */}
          {usuario.barrio && (
            <p className="text-sm text-gray-500 mb-3">
              📍 {usuario.barrio}, Cali
            </p>
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
                  ({calificaciones?.length ?? 0} reseñas)
                </span>
              </div>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{usuario.total_servicios}</span> servicios completados
              </span>
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

          {/* Descripción */}
          {esProfesional && usuario.descripcion && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-1">Sobre mí</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{usuario.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reseñas */}
      {esProfesional && calificaciones && calificaciones.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reseñas</h2>
          <div className="flex flex-col gap-3">
            {calificaciones.map((c: any) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
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

      {esProfesional && (!calificaciones || calificaciones.length === 0) && (
        <p className="text-sm text-gray-400 text-center py-6">
          Este profesional aún no tiene reseñas.
        </p>
      )}
    </div>
  )
}
