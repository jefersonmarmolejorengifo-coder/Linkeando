'use client'

import { useState } from 'react'
import Link from 'next/link'
import { recuperarPassword } from '@/app/actions/auth'

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
)

export default function RecuperarPage() {
  const [enviado, setEnviado] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) { setError('Ingresa un correo válido.'); return }
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.set('email', email)
    const result = await recuperarPassword(null, fd)
    if (result?.error) { setError(result.error); setLoading(false); return }
    setEnviado(true)
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-100">

        {/* Hero */}
        <div className="bg-[#1D9E75] px-6 pt-8 pb-5 text-center">
          <div className="text-4xl mb-2">🔑</div>
          <p className="text-xl font-medium text-white">Recuperar acceso</p>
          <p className="text-xs text-[#9FE1CB] mt-1">Te enviamos un enlace a tu correo</p>
        </div>

        <div className="bg-white px-6 py-6">
          {!enviado ? (
            <>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-5"
              >
                <BackIcon />
                Volver al inicio de sesión
              </Link>

              <h1 className="text-base font-medium text-gray-900 mb-1">¿Olvidaste tu contraseña?</h1>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Ingresa tu correo y te enviamos un enlace para crear una nueva contraseña.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tucorreo@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1D9E75] hover:bg-[#178a65] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                ¿Lo recordaste?{' '}
                <Link href="/auth/login" className="text-[#1D9E75] font-medium hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </>
          ) : (
            /* Estado enviado */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9FE1CB]">
                <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1D9E75] mb-2">¡Enlace enviado!</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Revisa tu bandeja de entrada en{' '}
                <strong className="text-gray-700">{email}</strong>.
                El enlace expira en 1 hora.
              </p>
              <Link
                href="/auth/login"
                className="inline-block w-full bg-[#1D9E75] hover:bg-[#178a65] text-white py-3 rounded-xl text-sm font-medium transition-colors text-center"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
