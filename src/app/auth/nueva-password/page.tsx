'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { STRENGTH_COLORS, STRENGTH_LABELS } from '@/lib/constants'

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)


function calcStrength(v: string): number {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
}

type PageState = 'loading' | 'ready' | 'error' | 'success'

export default function NuevaPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [hashError, setHashError] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = calcStrength(password)

  useEffect(() => {
    // Leer el hash del URL
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const errorParam = params.get('error')
    const errorDesc = params.get('error_description')
    const errorCode = params.get('error_code')
    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (errorParam) {
      // Link con error en el hash
      const msg = errorCode === 'otp_expired'
        ? 'El enlace de recuperación expiró. Debes solicitar uno nuevo.'
        : errorDesc?.replace(/\+/g, ' ') ?? 'El enlace no es válido.'
      setHashError(msg)
      setPageState('error')
      return
    }

    if (accessToken && type === 'recovery') {
      // Flujo implícito: establecer sesión desde el hash
      const supabase = createClient()
      const refreshToken = params.get('refresh_token') ?? ''
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionError }) => {
          if (sessionError) {
            setHashError('No se pudo establecer la sesión. Solicita un nuevo enlace.')
            setPageState('error')
          } else {
            setPageState('ready')
            // Limpiar el hash de la URL sin recargar
            history.replaceState(null, '', window.location.pathname)
          }
        })
      return
    }

    // Sin hash — puede venir del callback PKCE que ya estableció la sesión
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setPageState('ready')
      } else {
        setHashError('Enlace inválido o sesión expirada. Solicita un nuevo enlace.')
        setPageState('error')
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setPageState('success')
    setTimeout(() => router.push('/inicio'), 2500)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-fondo py-8 px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-100">

        {/* Hero */}
        <div className="bg-verde-500 px-6 pt-8 pb-5 text-center">
          <div className="text-4xl mb-2">
            {pageState === 'error' ? '⚠️' : pageState === 'success' ? '✅' : '🔐'}
          </div>
          <p className="text-xl font-medium text-white">
            {pageState === 'error' ? 'Enlace no válido' : pageState === 'success' ? '¡Listo!' : 'Nueva contraseña'}
          </p>
          <p className="text-xs text-verde-200 mt-1">
            {pageState === 'error' ? 'Solicita un nuevo enlace' : pageState === 'success' ? 'Contraseña actualizada' : 'Elige una contraseña segura'}
          </p>
        </div>

        <div className="bg-white px-6 py-6">

          {/* Estado: cargando */}
          {pageState === 'loading' && (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-2 border-verde-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
              <p className="text-sm text-gray-400">Verificando enlace…</p>
            </div>
          )}

          {/* Estado: error */}
          {pageState === 'error' && (
            <div className="text-center py-2">
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-5 leading-relaxed">
                {hashError}
              </div>
              <Link
                href="/auth/recuperar"
                className="block w-full bg-verde-500 hover:bg-verde-600 text-white py-3 rounded-xl text-sm font-medium text-center transition-colors mb-3"
              >
                Solicitar nuevo enlace
              </Link>
              <Link
                href="/auth/login"
                className="block text-xs text-gray-400 hover:text-gray-600 text-center"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}

          {/* Estado: éxito */}
          {pageState === 'success' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-verde-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-verde-200">
                <svg className="w-8 h-8 text-verde-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-verde-500 mb-2">¡Contraseña actualizada!</h2>
              <p className="text-sm text-gray-500">Redirigiendo al inicio…</p>
            </div>
          )}

          {/* Estado: formulario */}
          {pageState === 'ready' && (
            <>
              <h1 className="text-base font-medium text-gray-900 mb-1">Crea tu nueva contraseña</h1>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Debe tener al menos 8 caracteres.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0,1,2,3].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all"
                            style={{ background: i < strength ? STRENGTH_COLORS[strength - 1] : '#E5E7EB' }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: strength > 0 ? STRENGTH_COLORS[strength - 1] : '#9CA3AF' }}>
                        {strength > 0 ? STRENGTH_LABELS[strength - 1] : 'Ingresa una contraseña'}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 8}
                  className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
                >
                  {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
