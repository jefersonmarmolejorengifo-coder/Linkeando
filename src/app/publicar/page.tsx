import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import FormPublicar from '@/components/FormPublicar'

export default async function PublicarPage() {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tipo')
    .eq('id', user.id)
    .single()

  // Los profesionales no publican solicitudes — van a ver las existentes
  if (usuario?.tipo === 'profesional') redirect('/solicitudes')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <a href="/inicio" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-4 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        Volver
      </a>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar solicitud</h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe lo que necesitas y los profesionales se pondrán en contacto contigo.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <FormPublicar userId={user.id} />
      </div>
    </div>
  )
}
