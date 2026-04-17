'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CATEGORIAS, BARRIOS_CALI } from '@/lib/constants'
import AvatarUpload from '@/components/AvatarUpload'
import type { Usuario, Profesional, ProEspecialidad, ProZona } from '@/types'

export default function PanelPerfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [perfil, setPerfil] = useState<Profesional | null>(null)
  const [especialidades, setEspecialidades] = useState<ProEspecialidad[]>([])
  const [zonas, setZonas] = useState<ProZona[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lngRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const [{ data: u }, { data: p }, { data: esp }, { data: z }] = await Promise.all([
        supabase.from('usuarios').select('*').eq('id', data.user.id).single(),
        supabase.from('profesionales').select('*').eq('usuario_id', data.user.id).single(),
        supabase.from('pro_especialidades').select('*').eq('profesional_id', data.user.id),
        supabase.from('pro_zonas').select('*').eq('profesional_id', data.user.id),
      ])
      if (u) setUsuario(u as Usuario)
      if (p) setPerfil(p as Profesional)
      if (esp) setEspecialidades(esp as ProEspecialidad[])
      if (z) setZonas(z as ProZona[])
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()

    // Actualizar usuarios
    const { error: errU } = await supabase.from('usuarios').update({
      nombre: fd.get('nombre') as string,
      telefono: (fd.get('telefono') as string) || null,
      barrio: (fd.get('barrio') as string) || null,
      tarifa: fd.get('tarifa') ? Number(fd.get('tarifa')) : null,
      descripcion: (fd.get('descripcion') as string) || null,
      lat: latRef.current?.value ? Number(latRef.current.value) : null,
      lng: lngRef.current?.value ? Number(lngRef.current.value) : null,
    }).eq('id', usuario!.id)

    if (errU) { setMsg({ type: 'err', text: errU.message }); setSaving(false); return }

    // Actualizar profesionales
    await supabase.from('profesionales').upsert({
      usuario_id: usuario!.id,
      bio: (fd.get('bio') as string) || null,
      anos_experiencia: Number(fd.get('anos_experiencia')) || 0,
      radio_km: Number(fd.get('radio_km')) || 10,
      lat_base: latRef.current?.value ? Number(latRef.current.value) : null,
      lng_base: lngRef.current?.value ? Number(lngRef.current.value) : null,
    }, { onConflict: 'usuario_id' })

    setMsg({ type: 'ok', text: '¡Perfil actualizado correctamente!' })
    setSaving(false)
  }

  function detectarUbi() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (latRef.current) latRef.current.value = String(coords.latitude)
        if (lngRef.current) lngRef.current.value = String(coords.longitude)
      },
      () => {},
      { timeout: 8000 },
    )
  }

  if (loading) return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="bg-[#085041] rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Mi perfil profesional</h1>
        <p className="text-[12px] text-[#9FE1CB]">Edita tu información para atraer más clientes</p>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <AvatarUpload userId={usuario!.id} currentUrl={usuario!.avatar_url ?? null} nombre={usuario!.nombre} />
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${msg.type === 'ok' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre completo</label>
          <input name="nombre" type="text" required defaultValue={usuario?.nombre} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
          <input name="telefono" type="tel" defaultValue={usuario?.telefono ?? ''} placeholder="310 000 0000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bio / Descripción</label>
          <textarea name="bio" rows={3} defaultValue={perfil?.bio ?? usuario?.descripcion ?? ''} placeholder="Cuéntale a los clientes sobre tu experiencia..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Años de experiencia</label>
            <input name="anos_experiencia" type="number" min="0" max="50" defaultValue={perfil?.anos_experiencia ?? 0} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Radio de cobertura (km)</label>
            <input name="radio_km" type="number" min="1" max="50" defaultValue={perfil?.radio_km ?? 10} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tarifa por hora (COP)</label>
          <input name="tarifa" type="number" min="0" step="1000" defaultValue={usuario?.tarifa ?? ''} placeholder="35000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Barrio principal</label>
          <select name="barrio" defaultValue={usuario?.barrio ?? ''} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041]">
            <option value="">Selecciona tu barrio</option>
            {BARRIOS_CALI.map(({ zona, barrios }) => (
              <optgroup key={zona} label={`── ${zona}`}>
                {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción para clientes</label>
          <textarea name="descripcion" rows={3} defaultValue={usuario?.descripcion ?? ''} placeholder="Cuéntale a los clientes sobre tu experiencia, herramientas..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#085041]/20 focus:border-[#085041] resize-none" />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación en el mapa</label>
          <input ref={latRef} type="hidden" name="lat" defaultValue={usuario?.lat ?? perfil?.lat_base ?? ''} />
          <input ref={lngRef} type="hidden" name="lng" defaultValue={usuario?.lng ?? perfil?.lng_base ?? ''} />
          <button type="button" onClick={detectarUbi} className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:border-[#085041] hover:text-[#085041] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Usar mi ubicación actual
          </button>
        </div>

        {/* Especialidades (solo lectura, link a editar) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Especialidades</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {especialidades.length > 0 ? especialidades.map((e) => {
              const cat = CATEGORIAS.find(c => c.key === e.categoria)
              return (
                <span key={e.id} className={`text-[12px] px-3 py-1.5 rounded-full border ${e.es_principal ? 'bg-[#085041] text-white border-[#085041]' : 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]'}`}>
                  {cat ? `${cat.icon} ${cat.label}` : e.categoria}
                  {e.es_principal && ' ★'}
                </span>
              )
            }) : <span className="text-[12px] text-gray-400">Sin especialidades</span>}
          </div>
          <a href="/panel/especialidades" className="text-xs text-[#085041] underline">Gestionar especialidades →</a>
        </div>

        {/* Zonas (solo lectura, lista) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Zonas de cobertura</label>
          <div className="flex gap-2 flex-wrap">
            {zonas.length > 0 ? zonas.map((z) => (
              <span key={z.id} className="text-[12px] px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                📍 {z.barrio}
              </span>
            )) : <span className="text-[12px] text-gray-400">Sin zonas configuradas</span>}
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-[#085041] hover:bg-[#04342C] disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-colors">
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
