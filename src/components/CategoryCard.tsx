import Link from 'next/link'
import { CATEGORIAS, CATEGORIA_LABELS } from '@/lib/constants'

const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.key, c.icon]),
)

interface CategoriaCardProps {
  category: string
}

export default function CategoriaCard({ category }: CategoriaCardProps) {
  return (
    <Link
      href={`/servicios?categoria=${category}`}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-verde-200 transition-all group"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">
        {CATEGORY_ICONS[category] ?? '🛠️'}
      </span>
      <span className="text-sm font-medium text-gray-700 text-center">
        {CATEGORIA_LABELS[category] ?? category}
      </span>
    </Link>
  )
}
