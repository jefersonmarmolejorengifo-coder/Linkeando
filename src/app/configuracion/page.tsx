'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ConfiguracionPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' })
      return
    }
    setSaving(true)
    setMsg(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setSaving(false)
    if (error) {
      setMsg({ type: 'error', text: error.message })
    } else {
      setMsg({ type: 'ok', text: 'Contraseña actualizada correctamente.' })
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const supabase = createClient()

    // Marcar la cuenta como eliminada (soft delete)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('usuarios').update({ nombre: '[Cuenta eliminada]', telefono: null, barrio: null }).eq('id', user.id)
      await supabase.auth.signOut()
    }

    setDeleting(false)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-lg mx-auto px-4 py-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-6 bg-transparent border-none cursor-pointer transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuracion de cuenta</h1>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Cambiar contraseña</h2>

          {msg && (
            <div className={`p-3 rounded-xl text-sm mb-4 ${msg.type === 'ok' ? 'bg-verde-50 border border-verde-200 text-verde-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimo 8 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        {/* Links legales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Legal</h2>
          <div className="space-y-2">
            <Link
              href="/terminos"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-fondo transition-colors"
            >
              <span className="text-sm text-gray-700">Terminos y condiciones</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/privacidad"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-fondo transition-colors"
            >
              <span className="text-sm text-gray-700">Politica de privacidad</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/ayuda"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-fondo transition-colors"
            >
              <span className="text-sm text-gray-700">Centro de ayuda</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Eliminar cuenta */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="text-base font-semibold text-red-600 mb-2">Zona de peligro</h2>
          <p className="text-sm text-gray-500 mb-4">
            Al eliminar tu cuenta, tu perfil sera desactivado y tus datos personales seran removidos.
            Esta accion no se puede deshacer.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600 font-medium">
                Estas seguro? Esta accion no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {deleting ? 'Eliminando...' : 'Si, eliminar mi cuenta'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
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
