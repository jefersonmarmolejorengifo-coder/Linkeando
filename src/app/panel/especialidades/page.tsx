'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS } from '@/lib/constants'
import type { ProEspecialidad } from '@/types'

export default function PanelEspecialidades() {
  const [especialidades, setEspecialidades] = useState<ProEspecialidad[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: esp } = await supabase
        .from('pro_especialidades')
        .select('*')
        .eq('profesional_id', data.user.id)
      if (esp) setEspecialidades(esp as ProEspecialidad[])
      setLoading(false)
    })
  }, [])

  const espKeys = especialidades.map(e => e.categoria) as string[]

  async function toggle(catKey: string) {
    if (didLongPress.current) { didLongPress.current = false; return }
    setSaving(true)
    const supabase = createClient()

    if (espKeys.includes(catKey)) {
      await supabase.from('pro_especialidades').delete().eq('profesional_id', userId).eq('categoria', catKey)
      setEspecialidades(prev => prev.filter(e => e.categoria !== catKey))
    } else {
      const { data } = await supabase.from('pro_especialidades')
        .insert({ profesional_id: userId, categoria: catKey, es_principal: especialidades.length === 0 })
        .select()
        .single()
      if (data) setEspecialidades(prev => [...prev, data as ProEspecialidad])
    }
    setSaving(false)
  }

  async function setPrincipal(catKey: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('pro_especialidades').update({ es_principal: false }).eq('profesional_id', userId)
    await supabase.from('pro_especialidades').update({ es_principal: true }).eq('profesional_id', userId).eq('categoria', catKey)
    setEspecialidades(prev => prev.map(e => ({ ...e, es_principal: e.categoria === catKey })))
    setSaving(false)
  }

  function handleTouchStart(catKey: string, isActive: boolean) {
    if (!isActive) return
    didLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setPrincipal(catKey)
    }, 600)
  }

  function handleTouchEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  if (loading) return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>

  return (
    <div className="px-4 pt-4">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-3 bg-transparent border-none cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        Volver
      </button>
      <div className="bg-pro-500 rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Mis especialidades</h1>
        <p className="text-[12px] text-verde-200">Selecciona los oficios que ofreces</p>
      </div>

      <p className="text-[12px] text-gray-500 mb-3">
        Toca para agregar o quitar. Mantén presionado para marcar como principal.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {CATEGORIAS.map((cat) => {
          const isActive = espKeys.includes(cat.key)
          const esp = especialidades.find(e => e.categoria === cat.key)
          const isPrincipal = esp?.es_principal ?? false

          return (
            <button
              key={cat.key}
              onClick={() => toggle(cat.key)}
              onContextMenu={(e) => { e.preventDefault(); if (isActive) setPrincipal(cat.key) }}
              onTouchStart={() => handleTouchStart(cat.key, isActive)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              disabled={saving}
              className={`rounded-xl border-2 p-3 text-center transition-all select-none ${
                isActive
                  ? isPrincipal
                    ? 'border-premium-500 bg-premium-50'
                    : 'border-pro-500 bg-verde-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <p className={`text-[12px] font-medium ${isActive ? 'text-pro-500' : 'text-gray-500'}`}>
                {cat.label}
              </p>
              {isPrincipal && <p className="text-[10px] text-premium-500 font-medium mt-0.5">★ Principal</p>}
            </button>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-400">
        <strong>Tip:</strong> Los clientes buscan por categoría. Agregar más especialidades aumenta tu visibilidad.
        La especialidad principal aparece destacada en tu perfil.
      </div>
    </div>
  )
}
