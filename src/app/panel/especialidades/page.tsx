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
  const [open, setOpen] = useState(false)

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
  const disponibles = CATEGORIAS.filter(c => !espKeys.includes(c.key))

  async function agregar(catKey: string) {
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('pro_especialidades')
      .insert({ profesional_id: userId, categoria: catKey, es_principal: especialidades.length === 0 })
      .select()
      .single()
    if (data) setEspecialidades(prev => [...prev, data as ProEspecialidad])
    setOpen(false)
    setSaving(false)
  }

  async function quitar(catKey: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('pro_especialidades').delete().eq('profesional_id', userId).eq('categoria', catKey)
    const nuevas = especialidades.filter(e => e.categoria !== catKey)
    // Si se eliminó la principal y quedan otras, asignar la primera como principal
    if (nuevas.length > 0 && !nuevas.some(e => e.es_principal)) {
      await supabase.from('pro_especialidades').update({ es_principal: true }).eq('profesional_id', userId).eq('categoria', nuevas[0].categoria)
      nuevas[0] = { ...nuevas[0], es_principal: true }
    }
    setEspecialidades(nuevas)
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

  if (loading) return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>

  return (
    <div className="px-4 pt-4 pb-8">
      <a href="/panel" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-3 no-underline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        Volver al panel
      </a>

      <div className="bg-pro-500 rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Mis especialidades</h1>
        <p className="text-[12px] text-verde-200">Selecciona los oficios que ofreces</p>
      </div>

      {/* Especialidades seleccionadas */}
      {especialidades.length > 0 ? (
        <div className="flex flex-col gap-2 mb-4">
          {especialidades.map((esp) => {
            const cat = CATEGORIAS.find(c => c.key === esp.categoria)
            if (!cat) return null
            return (
              <div
                key={esp.categoria}
                className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all ${
                  esp.es_principal ? 'border-premium-500 bg-premium-50' : 'border-verde-200 bg-verde-50'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-pro-500">{cat.label}</p>
                  {esp.es_principal && (
                    <p className="text-[10px] text-premium-500 font-medium">★ Principal</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!esp.es_principal && (
                    <button
                      onClick={() => setPrincipal(esp.categoria)}
                      disabled={saving}
                      className="text-[10px] text-pro-500 border border-pro-500 px-2 py-1 rounded-lg hover:bg-verde-100 transition-colors disabled:opacity-50"
                      title="Marcar como principal"
                    >
                      ★ Principal
                    </button>
                  )}
                  <button
                    onClick={() => quitar(esp.categoria)}
                    disabled={saving}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Quitar especialidad"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center mb-4">
          <p className="text-[13px] text-gray-400 mb-1">No tienes especialidades configuradas</p>
          <p className="text-[11px] text-gray-300">Agrega al menos una para aparecer en las búsquedas</p>
        </div>
      )}

      {/* Selector desplegable */}
      <div className="relative mb-4">
        <button
          onClick={() => setOpen(!open)}
          disabled={disponibles.length === 0 || saving}
          className="w-full flex items-center justify-between bg-white border-2 border-dashed border-verde-300 rounded-xl px-4 py-3 text-left hover:border-verde-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2 text-[13px] text-pro-500 font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            {disponibles.length > 0 ? 'Agregar especialidad' : 'Todas las especialidades agregadas'}
          </span>
          {disponibles.length > 0 && (
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          )}
        </button>

        {open && disponibles.length > 0 && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-borde rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {disponibles.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => agregar(cat.key)}
                  disabled={saving}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-verde-50 transition-colors border-b border-gray-50 last:border-b-0 disabled:opacity-50"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[13px] text-gray-700">{cat.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tip */}
      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-400">
        <strong>Tip:</strong> Agrega las especialidades en las que tienes experiencia. La especialidad principal aparece destacada en tu perfil y determina tu categoría en las búsquedas.
      </div>
    </div>
  )
}
