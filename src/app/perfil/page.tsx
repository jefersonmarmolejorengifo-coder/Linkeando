import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AvatarUpload from '@/components/AvatarUpload'
import FormPerfil from '@/components/FormPerfil'
import BotonVolver from '@/components/BotonVolver'

const TIPO_LABEL = { cliente: 'Cliente', profesional: 'Profesional' }

export default async function PerfilPage() {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!usuario) redirect('/auth/registro')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <BotonVolver />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <Link
          href={`/perfil/${usuario.id}`}
          className="text-sm text-verde-600 hover:underline"
        >
          Ver perfil público →
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Encabezado con avatar */}
        <div className="bg-verde-50 px-6 py-8 flex flex-col items-center gap-2 border-b border-gray-100">
          <AvatarUpload
            userId={usuario.id}
            currentUrl={usuario.avatar_url ?? null}
            nombre={usuario.nombre}
          />
          <p className="text-lg font-semibold text-gray-800 mt-1">{usuario.nombre}</p>
          <span className="text-xs font-medium bg-verde-100 text-verde-700 px-2.5 py-0.5 rounded-full">
            {TIPO_LABEL[usuario.tipo as 'cliente' | 'profesional']}
          </span>
          {usuario.tipo === 'profesional' && (
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>⭐ {Number(usuario.rating_promedio).toFixed(1)}</span>
              <span>·</span>
              <span>{usuario.total_servicios} servicios</span>
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="px-6 py-6">
          <FormPerfil usuario={usuario} email={user.email ?? ''} />
        </div>
      </div>
    </div>
  )
}
