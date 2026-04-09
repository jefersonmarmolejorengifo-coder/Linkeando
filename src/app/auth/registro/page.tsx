'use client'

import { useState } from 'react'
import Link from 'next/link'
import { registro } from '@/app/actions/auth'
import { useSearchParams } from 'next/navigation'

const BARRIOS_CALI = [
  { zona: 'Norte', barrios: ['Granada', 'Chipichape', 'Versalles', 'Normandía', 'Los Álamos', 'El Bosque', 'Centenario', 'El Refugio'] },
  { zona: 'Centro', barrios: ['El Centro', 'San Nicolás', 'Alameda', 'La Flora', 'Galerías', 'Santa Rosa', 'El Calvario', 'San Pedro'] },
  { zona: 'Sur', barrios: ['Ciudad Jardín', 'El Peñón', 'San Fernando', 'Tequendama', 'El Ingenio', 'Meléndez', 'Pance', 'Lili', 'Caney', 'La Hacienda', 'Capri'] },
  { zona: 'Oriente', barrios: ['Aguablanca', 'Marroquín', 'El Diamante', 'Villanueva', 'Alfonso López', 'Floralia', 'El Poblado', 'Comuneros'] },
  { zona: 'Oeste / Ladera', barrios: ['Siloé', 'Terrón Colorado', 'Univalle', 'Manzanares', 'El Cortijo', 'Alto Menga', 'La Sultana'] },
]

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
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none">
    <polyline points="6 9 12 15 18 9"/>
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

export default function RegistroPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [rol, setRol] = useState<'cliente' | 'profesional'>('cliente')
  const [showPass, setShowPass] = useState(false)
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)

  const strength = calcStrength(password)

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-100">

        {/* ── Hero ── */}
        <div className="bg-[#1D9E75] px-6 pt-8 pb-5 text-center">
          <svg className="mx-auto mb-2.5" width="44" height="44" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="24" r="16" fill="#fff" opacity="0.95"/>
            <circle cx="32" cy="24" r="9" fill="#1D9E75"/>
            <rect x="25" y="20" width="10" height="6.5" rx="3.25" fill="none" stroke="#fff" strokeWidth="2.5"/>
            <rect x="30" y="22.5" width="10" height="6.5" rx="3.25" fill="none" stroke="#fff" strokeWidth="2.5"/>
            <path d="M32 40 L24 30 Q32 33 40 30 Z" fill="#fff" opacity="0.95"/>
          </svg>
          <p className="text-xl font-medium text-white">Crear cuenta</p>
          <p className="text-xs text-[#9FE1CB] mt-1">Únete a Linkeando en Cali</p>
        </div>

        {/* ── Formulario ── */}
        <div className="bg-white px-6 py-6 overflow-y-auto max-h-[calc(100vh-220px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={registro} className="flex flex-col gap-4">
            {/* Hidden campo nombre completo combinado */}
            <input type="hidden" name="tipo" value={rol} />

            {/* Selector de rol */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">¿Cómo vas a usar Linkeando?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'cliente',      icon: '🔍', label: 'Cliente',      desc: 'Busco profesionales para mi hogar' },
                  { value: 'profesional',  icon: '🧰', label: 'Profesional',  desc: 'Ofrezco servicios del hogar' },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRol(r.value as 'cliente' | 'profesional')}
                    className={`rounded-xl border-2 p-3.5 text-center transition-all ${
                      rol === r.value
                        ? 'border-[#1D9E75] bg-[#E1F5EE]'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{r.icon}</div>
                    <p className={`text-xs font-semibold ${rol === r.value ? 'text-[#085041]' : 'text-gray-700'}`}>
                      {r.label}
                    </p>
                    <p className={`text-[11px] mt-0.5 leading-tight ${rol === r.value ? 'text-[#0F6E56]' : 'text-gray-400'}`}>
                      {r.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nombre</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Apellido</label>
                <input
                  name="apellido"
                  type="text"
                  required
                  placeholder="Tu apellido"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Correo electrónico</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tucorreo@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Número de celular</label>
              <input
                name="telefono"
                type="tel"
                placeholder="300 000 0000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
              />
            </div>

            {/* Campos profesional */}
            {rol === 'profesional' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Especialidad principal</label>
                  <div className="relative">
                    <select
                      name="categoria"
                      defaultValue=""
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors bg-white"
                    >
                      <option value="" disabled>Selecciona tu oficio…</option>
                      <option value="cerrajeria">Cerrajería</option>
                      <option value="plomeria">Plomería</option>
                      <option value="electricidad">Electricidad</option>
                      <option value="pintura">Pintura</option>
                      <option value="carpinteria">Carpintería</option>
                      <option value="limpieza">Limpieza</option>
                      <option value="jardineria">Jardinería</option>
                      <option value="otros">Otro</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <ChevronIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Barrio / Zona de trabajo en Cali</label>
                  <div className="relative">
                    <select
                      name="barrio"
                      defaultValue=""
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors bg-white"
                    >
                      <option value="" disabled>Selecciona tu zona…</option>
                      {BARRIOS_CALI.map(({ zona, barrios }) => (
                        <optgroup key={zona} label={`── ${zona}`}>
                          {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <ChevronIcon />
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Contraseña + strength */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Barras de fortaleza */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
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

            {/* Términos */}
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#1D9E75] flex-shrink-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                Acepto los{' '}
                <span className="text-[#1D9E75]">Términos de uso</span> y la{' '}
                <span className="text-[#1D9E75]">Política de privacidad</span> de Linkeando,
                incluyendo el tratamiento de mis datos según la Ley 1581 de 2012.
              </label>
            </div>

            <button
              type="submit"
              disabled={!terms}
              className="w-full bg-[#1D9E75] hover:bg-[#178a65] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              Crear mi cuenta
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-[#1D9E75] font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
