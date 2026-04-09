import type { Categoria } from '@/types'

const CATEGORY_LABELS: Record<Categoria, string> = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  carpinteria: 'Carpintería',
  pintura: 'Pintura',
  limpieza: 'Limpieza',
  jardineria: 'Jardinería',
  cerrajeria: 'Cerrajería',
  otros: 'Otros',
}

export default function ServiciosPage({
  searchParams,
}: {
  searchParams: { categoria?: string }
}) {
  const categoria = searchParams.categoria as Categoria | undefined

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {categoria ? CATEGORY_LABELS[categoria] ?? 'Servicios' : 'Todos los servicios'}
      </h1>
      <p className="text-gray-500 mb-8">Cali, Colombia</p>

      {/* Placeholder until Supabase is connected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
