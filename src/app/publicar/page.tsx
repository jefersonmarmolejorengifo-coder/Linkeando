import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import FormPublicar from '@/components/FormPublicar'
import BotonVolver from '@/components/BotonVolver'

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
      <BotonVolver />
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
