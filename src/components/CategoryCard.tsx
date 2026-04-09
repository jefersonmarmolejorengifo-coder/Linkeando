import Link from 'next/link'
import type { Categoria } from '@/types'

const CATEGORY_ICONS: Record<Categoria, string> = {
  plomeria: '🔧',
  electricidad: '⚡',
  carpinteria: '🪚',
  pintura: '🎨',
  limpieza: '🧹',
  jardineria: '🌿',
  cerrajeria: '🔑',
  otros: '🛠️',
}

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

interface CategoriaCardProps {
  category: Categoria
}

export default function CategoriaCard({ category }: CategoriaCardProps) {
  return (
    <Link
      href={`/servicios?categoria=${category}`}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">
        {CATEGORY_ICONS[category]}
      </span>
      <span className="text-sm font-medium text-gray-700 text-center">
        {CATEGORY_LABELS[category]}
      </span>
    </Link>
  )
}
