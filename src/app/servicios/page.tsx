import { redirect } from 'next/navigation'

export default function ServiciosPage({
  searchParams,
}: {
  searchParams: { categoria?: string }
}) {
  const cat = searchParams.categoria
  redirect(cat ? `/explorar?cat=${cat}` : '/explorar')
}
