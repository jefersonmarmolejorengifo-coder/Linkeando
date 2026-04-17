'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const LogoIcon = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="24" r="16" fill="#fff" opacity="0.95"/>
    <circle cx="32" cy="24" r="9" fill="#1D9E75"/>
    <rect x="25" y="20" width="10" height="6.5" rx="3.25" fill="none" stroke="#fff" strokeWidth="2.5"/>
    <rect x="30" y="22.5" width="10" height="6.5" rx="3.25" fill="none" stroke="#fff" strokeWidth="2.5"/>
    <path d="M32 40 L24 30 Q32 33 40 30 Z" fill="#fff" opacity="0.95"/>
    <circle cx="32" cy="54" r="2.5" fill="#9FE1CB" opacity="0.7"/>
    <circle cx="32" cy="54" r="5" fill="none" stroke="#9FE1CB" strokeWidth="1" opacity="0.4"/>
  </svg>
)

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

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [rol, setRol] = useState<'cliente' | 'profesional'>('cliente')
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-fondo py-8 px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-100">

        {/* ── Hero verde ── */}
        <div className="bg-verde-500 px-6 pt-10 pb-0 text-center">
          <div className="flex justify-center mb-3"><LogoIcon /></div>
          <p className="text-2xl font-medium text-white tracking-tight">Linkeando</p>
          <p className="text-xs text-verde-200 mt-1 mb-5">El oficio correcto, cerca de ti</p>

          {/* Tabs rol */}
          <div className="flex gap-0 bg-white/15 rounded-xl p-1 mx-2 mb-0">
            {(['cliente', 'profesional'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRol(r)}
                className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                  rol === r
                    ? 'bg-white text-verde-500 font-medium shadow-sm'
                    : 'text-verde-200 hover:text-white'
                }`}
              >
                {r === 'cliente' ? 'Soy cliente' : 'Soy profesional'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="bg-white px-6 py-6">
          <h1 className="text-lg font-medium text-gray-900 mb-1">
            {rol === 'cliente' ? 'Bienvenido de nuevo' : 'Hola, profesional'}
          </h1>
          <p className="text-sm text-gray-500 mb-5 leading-snug">
            {rol === 'cliente'
              ? 'Ingresa para encontrar profesionales cerca de ti'
              : 'Ingresa para ver solicitudes de trabajo cerca de ti'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={login} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tucorreo@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link
                  href="/auth/recuperar"
                  className="text-xs text-verde-500 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-verde-500 hover:bg-verde-600 active:scale-[0.99] text-white py-3 rounded-xl text-sm font-medium transition-all mt-1"
            >
              Ingresar
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">o continúa con</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            type="button"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              })
            }}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-fondo transition-colors"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-5">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/registro" className="text-verde-500 font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
