'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS } from '@/lib/constants'
import type { ProEspecialidad } from '@/types'

export default function PanelEspecialidades() {
  const [especialidades, setEspecialidades] = useState<ProEspecialidad[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState('')

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
    setSaving(true)
    const supabase = createClient()

    if (espKeys.includes(catKey)) {
      // Eliminar
      await supabase.from('pro_especialidades').delete().eq('profesional_id', userId).eq('categoria', catKey)
      setEspecialidades(prev => prev.filter(e => e.categoria !== catKey))
    } else {
      // Agregar
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

    // Quitar principal de todas
    await supabase.from('pro_especialidades').update({ es_principal: false }).eq('profesional_id', userId)
    // Marcar la seleccionada
    await supabase.from('pro_especialidades').update({ es_principal: true }).eq('profesional_id', userId).eq('categoria', catKey)

    setEspecialidades(prev => prev.map(e => ({ ...e, es_principal: e.categoria === catKey })))
    setSaving(false)
  }

  if (loading) return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>

  return (
    <div className="px-4 pt-4">
      <div className="bg-[#085041] rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Mis especialidades</h1>
        <p className="text-[12px] text-[#9FE1CB]">Selecciona los oficios que ofreces</p>
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
              disabled={saving}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                isActive
                  ? isPrincipal
                    ? 'border-[#EF9F27] bg-[#FAEEDA]'
                    : 'border-[#085041] bg-[#E1F5EE]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <p className={`text-[12px] font-medium ${isActive ? 'text-[#085041]' : 'text-gray-500'}`}>
                {cat.label}
              </p>
              {isPrincipal && <p className="text-[10px] text-[#EF9F27] font-medium mt-0.5">★ Principal</p>}
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
