'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS } from '@/lib/constants'

export default function PanelEspecialidades() {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth/login'); return }

      setUserId(data.user.id)

      // Cargar especialidades existentes
      const { data: esp } = await supabase
        .from('pro_especialidades')
        .select('categoria')
        .eq('profesional_id', data.user.id)

      if (esp) {
        setSelected(new Set(esp.map((e: { categoria: string }) => e.categoria)))
      }
      setLoading(false)
    })
  }, [router])

  function toggle(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function guardar() {
    if (selected.size === 0) {
      setToast('Selecciona al menos una especialidad')
      setTimeout(() => setToast(''), 3000)
      return
    }

    setSaving(true)
    const supabase = createClient()

    // Borrar todas las existentes
    await supabase
      .from('pro_especialidades')
      .delete()
      .eq('profesional_id', userId)

    // Insertar las seleccionadas (la primera como principal)
    const keys = Array.from(selected)
    const inserts = keys.map((categoria, i) => ({
      profesional_id: userId,
      categoria,
      es_principal: i === 0,
    }))

    const { error } = await supabase.from('pro_especialidades').insert(inserts)

    if (error) {
      setToast('Error al guardar. Intenta de nuevo.')
      setTimeout(() => setToast(''), 3000)
      setSaving(false)
      return
    }

    setToast('Especialidades guardadas correctamente')
    setTimeout(() => {
      router.push('/panel')
    }, 1200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] flex justify-center">
        <div className="w-full max-w-sm">
          <div className="bg-[#085041] px-4 pt-4 pb-4" />
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen relative">

        {/* Header */}
        <div className="bg-[#085041] px-4 pt-4 pb-5">
          <button
            onClick={() => router.push('/panel')}
            className="inline-flex items-center gap-1.5 text-[12px] text-[#9FE1CB] hover:text-white mb-3 bg-transparent border-none cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Volver al dashboard
          </button>
          <h1 className="text-[18px] font-semibold text-white">Mis especialidades</h1>
          <p className="text-[12px] text-[#9FE1CB] mt-1 leading-relaxed">
            Selecciona todas las que dominas. Los clientes te encontrarán al buscar cualquiera de ellas.
          </p>
        </div>

        {/* Grid de chips */}
        <div className="flex-1 px-4 pt-4 pb-32">
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIAS.map((cat) => {
              const isActive = selected.has(cat.key)
              return (
                <button
                  key={cat.key}
                  onClick={() => toggle(cat.key)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-3 text-left transition-all ${
                    isActive
                      ? 'bg-[#E1F5EE] border-[#9FE1CB]'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{cat.icon}</span>
                  <span className={`text-[12px] font-medium leading-tight ${
                    isActive ? 'text-[#085041]' : 'text-gray-500'
                  }`}>
                    {cat.label}
                  </span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-auto flex-shrink-0">
                      <circle cx="12" cy="12" r="10" fill="#1D9E75"/>
                      <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {selected.size > 0 && (
            <p className="text-[11px] text-gray-400 text-center mt-4">
              {selected.size} especialidad{selected.size !== 1 ? 'es' : ''} seleccionada{selected.size !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Botón guardar fijo abajo */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-[#e8e8e6] px-4 py-3 z-40">
          <button
            onClick={guardar}
            disabled={saving}
            className="w-full bg-[#085041] hover:bg-[#063a2e] disabled:bg-gray-300 text-white py-3 rounded-xl text-[14px] font-medium transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar especialidades'}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#085041] text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
