import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-verde-500">
            Linkeando
          </Link>
          <p className="mt-2 text-gray-500 text-sm">
            Ingresa a tu cuenta
          </p>
        </div>

        {/* Error */}
        {searchParams.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {decodeURIComponent(searchParams.error)}
          </div>
        )}

        {/* Formulario */}
        <form action={login} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-verde-500 hover:bg-verde-600 text-white py-2.5 rounded-xl font-semibold transition-colors mt-2"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/registro" className="text-verde-500 font-medium hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
