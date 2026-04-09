import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function Navbar() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  let tipo: string | null = null
  if (user) {
    const { data } = await supabase
      .from('usuarios')
      .select('tipo')
      .eq('id', user.id)
      .single()
    tipo = data?.tipo ?? null
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-verde-500">
          Linkeando
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/servicios" className="text-gray-600 hover:text-verde-500 transition-colors">
            Servicios
          </Link>
          <Link href="/mapa" className="text-gray-600 hover:text-verde-500 transition-colors">
            Mapa
          </Link>

          {user ? (
            <>
              {tipo === 'profesional' ? (
                <Link
                  href="/solicitudes"
                  className="text-gray-600 hover:text-verde-500 transition-colors"
                >
                  Solicitudes
                </Link>
              ) : (
                <Link
                  href="/publicar"
                  className="text-gray-600 hover:text-verde-500 transition-colors"
                >
                  Publicar
                </Link>
              )}
              <Link
                href="/perfil"
                className="text-gray-600 hover:text-verde-500 transition-colors"
              >
                Mi perfil
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-verde-500 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/auth/registro"
                className="bg-verde-500 text-white px-4 py-2 rounded-lg hover:bg-verde-600 transition-colors"
              >
                Regístrate
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
