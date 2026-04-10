'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

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

const STRENGTH_COLORS = ['#F09595', '#EF9F27', '#97C459', '#1D9E75']
const STRENGTH_LABELS = ['Muy débil', 'Débil', 'Buena', 'Fuerte']

function calcStrength(v: string): number {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v)) s++
  if (/[0-9]/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
}

export default function NuevaPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  const strength = calcStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    setListo(true)
    setTimeout(() => router.push('/inicio'), 2500)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-100">

        {/* Hero */}
        <div className="bg-[#1D9E75] px-6 pt-8 pb-5 text-center">
          <div className="text-4xl mb-2">🔐</div>
          <p className="text-xl font-medium text-white">Nueva contraseña</p>
          <p className="text-xs text-[#9FE1CB] mt-1">Elige una contraseña segura</p>
        </div>

        <div className="bg-white px-6 py-6">
          {listo ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#9FE1CB]">
                <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1D9E75] mb-2">¡Contraseña actualizada!</h2>
              <p className="text-sm text-gray-500">Redirigiendo al inicio…</p>
            </div>
          ) : (
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
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
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
                  className="w-full bg-[#1D9E75] hover:bg-[#178a65] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium transition-colors"
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
