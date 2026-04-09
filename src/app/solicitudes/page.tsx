import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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
  abierta:    { label: 'Abierta',     className: 'bg-green-50 text-green-700 border-green-200' },
  en_proceso: { label: 'En proceso',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  completada: { label: 'Completada',  className: 'bg-gray-100 text-gray-500 border-gray-200' },
  cancelada:  { label: 'Cancelada',   className: 'bg-red-50 text-red-500 border-red-200' },
}

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: { categoria?: string }
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tipo, categoria')
    .eq('id', user.id)
    .single()

  const esCliente = usuario?.tipo === 'cliente'

  // Clientes: sus propias solicitudes. Profesionales: solicitudes abiertas
  let query = supabase
    .from('solicitudes')
    .select('id, categoria, titulo, descripcion, direccion, barrio, presupuesto_max, foto_url, estado, created_at')
    .order('created_at', { ascending: false })

  if (esCliente) {
    query = query.eq('cliente_id', user.id)
  } else {
    query = query.eq('estado', 'abierta')
    const cat = searchParams.categoria ?? usuario?.categoria
    if (cat) query = query.eq('categoria', cat)
  }

  const { data: solicitudes } = await query.limit(40)

  const categoriaActiva = searchParams.categoria ?? (esCliente ? null : usuario?.categoria)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {esCliente ? 'Mis solicitudes' : 'Solicitudes abiertas'}
        </h1>
        {esCliente && (
          <Link
            href="/publicar"
            className="bg-verde-500 hover:bg-verde-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva solicitud
          </Link>
        )}
      </div>

      {/* Filtros de categoría (solo para profesionales) */}
      {!esCliente && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/solicitudes"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !searchParams.categoria
                ? 'bg-verde-500 text-white border-verde-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-verde-400'
            }`}
          >
            Todas
          </Link>
          {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
            <Link
              key={value}
              href={`/solicitudes?categoria=${value}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                searchParams.categoria === value
                  ? 'bg-verde-500 text-white border-verde-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-verde-400'
              }`}
            >
              {CATEGORIA_ICONS[value]} {label}
            </Link>
          ))}
        </div>
      )}

      {/* Lista */}
      {!solicitudes?.length ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-gray-500">
            {esCliente
              ? 'Aún no tienes solicitudes publicadas.'
              : 'No hay solicitudes abiertas en esta categoría.'}
          </p>
          {esCliente && (
            <Link
              href="/publicar"
              className="mt-4 inline-block bg-verde-500 hover:bg-verde-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Publicar mi primera solicitud
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {solicitudes.map((s: any) => (
            <Link
              key={s.id}
              href={`/solicitudes/${s.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-verde-200 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {s.foto_url ? (
                  <img
                    src={s.foto_url}
                    alt="foto"
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-verde-50 flex items-center justify-center flex-shrink-0 text-2xl">
                    {CATEGORIA_ICONS[s.categoria] ?? '🛠️'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium bg-verde-50 text-verde-700 border border-verde-100 px-2 py-0.5 rounded-full">
                      {CATEGORIA_ICONS[s.categoria]} {CATEGORIA_LABELS[s.categoria]}
                    </span>
                    {(() => {
                      const e = ESTADO_MAP[s.estado]
                      return e ? (
                        <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${e.className}`}>
                          {e.label}
                        </span>
                      ) : null
                    })()}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">{s.descripcion}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>📍 {s.barrio ?? s.direccion}</span>
                    {s.presupuesto_max && (
                      <span>💰 hasta ${Number(s.presupuesto_max).toLocaleString('es-CO')}</span>
                    )}
                    <span>
                      {new Date(s.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
