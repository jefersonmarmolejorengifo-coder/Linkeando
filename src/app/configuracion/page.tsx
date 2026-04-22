'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import EditField from '@/components/EditField'
import { actualizarCampoPerfil, actualizarCedula } from '@/app/actions/perfil'
import { actualizarRadioKm, actualizarNegocio, toggleDisponible } from '@/app/actions/profesional'
import type { Usuario, Profesional, TipoUsuario } from '@/types'

type UserRow = Partial<Usuario> & { id: string; tipo: TipoUsuario; email?: string }
type ProRow = Partial<Profesional>

const ICONS = {
  user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.13 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.71 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.71A2 2 0 0 1 22 16.92z"/></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7 12 13 2 7"/></svg>,
  id: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 10h4M6 14h8"/></svg>,
  location: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  building: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 20V10h6v10M9 8h.01M15 8h.01"/></svg>,
  key: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="15" r="4"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></svg>,
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserRow | null>(null)
  const [pro, setPro] = useState<ProRow | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const [pwdOpen, setPwdOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  const [radioKm, setRadioKm] = useState(10)
  const [negocioFijo, setNegocioFijo] = useState(false)
  const [negocioDireccion, setNegocioDireccion] = useState('')
  const [negocioDescripcion, setNegocioDescripcion] = useState('')
  const [savingNeg, setSavingNeg] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const [{ data: u }, { data: p }] = await Promise.all([
        supabase.from('usuarios').select('*').eq('id', data.user.id).single(),
        supabase.from('profesionales').select('*').eq('usuario_id', data.user.id).maybeSingle(),
      ])
      if (u) setUser({ ...(u as UserRow), email: data.user.email ?? '' })
      if (p) {
        setPro(p as ProRow)
        setRadioKm((p as ProRow).radio_km ?? 10)
        setNegocioFijo(!!(p as ProRow).negocio_fijo)
        setNegocioDireccion((p as ProRow).negocio_direccion ?? '')
        setNegocioDescripcion((p as ProRow).negocio_descripcion ?? '')
      }
      setLoading(false)
    })
  }, [router])

  function flash(type: 'ok' | 'error', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  async function saveCampo(campo: string, valor: string) {
    const r = await actualizarCampoPerfil(campo, valor)
    if (r?.error) flash('error', r.error)
    else {
      setUser((u) => u ? { ...u, [campo]: valor.trim().length ? valor.trim() : null } : u)
      flash('ok', 'Guardado.')
    }
  }

  async function saveCedula(valor: string) {
    const r = await actualizarCedula(valor)
    if (r?.error) flash('error', r.error)
    else {
      setUser((u) => u ? { ...u, cedula: valor.trim() || null } : u)
      flash('ok', 'Guardado.')
    }
  }

  async function saveRadio() {
    const r = await actualizarRadioKm(radioKm)
    if (r.error) flash('error', r.error)
    else flash('ok', 'Radio actualizado.')
  }

  async function saveNegocio() {
    setSavingNeg(true)
    const r = await actualizarNegocio({
      negocio_fijo: negocioFijo,
      negocio_direccion: negocioDireccion,
      negocio_descripcion: negocioDescripcion,
    })
    setSavingNeg(false)
    if (r.error) flash('error', r.error)
    else flash('ok', 'Negocio actualizado.')
  }

  async function changePwd(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) return flash('error', 'Mínimo 8 caracteres.')
    setSavingPwd(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPwd(false)
    if (error) flash('error', error.message)
    else {
      setNewPassword('')
      setPwdOpen(false)
      flash('ok', 'Contraseña actualizada.')
    }
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function deleteAccount() {
    setDeleting(true)
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      await supabase.from('usuarios')
        .update({ nombre: '[Cuenta eliminada]', telefono: null, barrio: null })
        .eq('id', u.id)
      await supabase.auth.signOut()
    }
    setDeleting(false)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-fondo">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-3">
          <div className="h-32 bg-white rounded-2xl animate-pulse" />
          <div className="h-48 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const esPro = user.tipo === 'profesional' || !!pro

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-4 bg-transparent border-none cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuración</h1>
        <p className="text-sm text-gray-500 mb-5">Gestiona tu cuenta y preferencias.</p>

        {msg && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm ${
              msg.type === 'ok'
                ? 'bg-verde-50 border border-verde-200 text-verde-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-borde p-5 mb-4">
          <SectionHeader title="Mi perfil" subtitle="Información que ven los demás usuarios." />
          <EditField label="Nombre" icon={ICONS.user} value={user.nombre} placeholder="Tu nombre"
            onSave={(v) => saveCampo('nombre', v)} />
          <EditField label="Teléfono" icon={ICONS.phone} value={user.telefono} type="tel"
            placeholder="+57 300 000 0000" onSave={(v) => saveCampo('telefono', v)} />
          <EditField label="Correo" icon={ICONS.mail} value={user.email ?? ''} disabled />
          <EditField label="Cédula" icon={ICONS.id} value={user.cedula ?? null}
            placeholder="Solo números, 5-15 dígitos" onSave={saveCedula} />
          <EditField label="Departamento" icon={ICONS.location} value={user.departamento}
            placeholder="Ej: Valle del Cauca" onSave={(v) => saveCampo('departamento', v)} />
          <EditField label="Ciudad" icon={ICONS.location} value={user.ciudad}
            placeholder="Ej: Cali" onSave={(v) => saveCampo('ciudad', v)} />
          <EditField label="Barrio" icon={ICONS.location} value={user.barrio}
            placeholder="Ej: El Peñón" onSave={(v) => saveCampo('barrio', v)} />
        </div>

        {esPro && (
          <div className="bg-white rounded-2xl border border-borde p-5 mb-4">
            <SectionHeader title="Mi negocio" subtitle="Configura cómo se muestra tu negocio en la plataforma." />

            <div className="py-3 border-b border-borde">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Radio de cobertura</p>
                  <p className="text-xs text-gray-500">Distancia máxima a la que aceptas trabajos.</p>
                </div>
                <span className="text-lg font-bold text-verde-500">{radioKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={radioKm}
                onChange={(e) => setRadioKm(Number(e.target.value))}
                onPointerUp={saveRadio}
                onKeyUp={saveRadio}
                className="w-full accent-verde-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1 km</span>
                <span>15 km</span>
                <span>30 km</span>
              </div>
            </div>

            <div className="py-3 border-b border-borde">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-verde-50 text-verde-500 flex items-center justify-center flex-shrink-0">
                    {ICONS.building}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Negocio con dirección fija</p>
                    <p className="text-xs text-gray-500">Tu taller o local físico aparecerá en el mapa.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNegocioFijo(!negocioFijo)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    negocioFijo ? 'bg-verde-500' : 'bg-gray-300'
                  }`}
                  aria-pressed={negocioFijo}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      negocioFijo ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {negocioFijo && (
                <div className="mt-3 pl-11 space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dirección del negocio</label>
                    <input
                      type="text"
                      value={negocioDireccion}
                      onChange={(e) => setNegocioDireccion(e.target.value)}
                      placeholder="Ej: Calle 5 # 10-20, barrio X"
                      className="w-full border border-borde rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-verde-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                    <textarea
                      value={negocioDescripcion}
                      onChange={(e) => setNegocioDescripcion(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Horario, servicios que ofreces en el local, etc."
                      className="w-full border border-borde rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-verde-500 resize-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={saveNegocio}
                disabled={savingNeg}
                className="mt-3 w-full py-2 rounded-lg text-sm font-medium text-white bg-verde-500 hover:bg-verde-600 disabled:opacity-50"
              >
                {savingNeg ? 'Guardando…' : 'Guardar negocio'}
              </button>
            </div>

            {pro && (
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Disponibilidad</p>
                  <p className="text-xs text-gray-500">Activa para recibir nuevas solicitudes.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const nuevo = !(pro.disponible ?? true)
                    setPro({ ...pro, disponible: nuevo })
                    const r = await toggleDisponible(nuevo)
                    if (r.error) flash('error', r.error)
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    pro.disponible ? 'bg-verde-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      pro.disponible ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-borde p-5 mb-4">
          <SectionHeader title="Seguridad" />
          <button
            type="button"
            onClick={() => setPwdOpen(!pwdOpen)}
            className="w-full flex items-center justify-between py-3 border-b border-borde bg-transparent border-x-0 border-t-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-verde-50 text-verde-500 flex items-center justify-center">
                {ICONS.key}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Cambiar contraseña</p>
                <p className="text-xs text-gray-500">Actualiza tu contraseña regularmente.</p>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-gray-400 transition-transform ${pwdOpen ? 'rotate-90' : ''}`}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          {pwdOpen && (
            <form onSubmit={changePwd} className="mt-3 pl-11 space-y-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña (mínimo 8)"
                minLength={8}
                required
                className="w-full border border-borde rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-verde-500"
              />
              <button
                type="submit"
                disabled={savingPwd}
                className="w-full py-2 rounded-lg text-sm text-white bg-verde-500 hover:bg-verde-600 disabled:opacity-50"
              >
                {savingPwd ? 'Guardando…' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-borde p-5 mb-4">
          <SectionHeader title="Legal y ayuda" />
          <div className="space-y-1">
            <Link href="/terminos" className="flex items-center justify-between p-3 rounded-xl hover:bg-fondo transition-colors">
              <span className="text-sm text-gray-700">Términos y condiciones</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/privacidad" className="flex items-center justify-between p-3 rounded-xl hover:bg-fondo transition-colors">
              <span className="text-sm text-gray-700">Política de privacidad</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/ayuda" className="flex items-center justify-between p-3 rounded-xl hover:bg-fondo transition-colors">
              <span className="text-sm text-gray-700">Centro de ayuda</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full py-3 rounded-xl text-sm font-medium text-urgente-500 border border-urgente-200 bg-white hover:bg-urgente-50 mb-4"
        >
          Cerrar sesión
        </button>

        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="text-sm font-semibold text-red-600 mb-1">Zona de peligro</h2>
          <p className="text-xs text-gray-500 mb-3">
            Al eliminar tu cuenta, tu perfil será desactivado y tus datos personales serán removidos.
          </p>
          {!deleteOpen ? (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium"
                >
                  {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="flex-1 border border-borde text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
