'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PLANES_PREMIUM } from '@/lib/constants'
import type { Suscripcion } from '@/types'

const BENEFICIOS = [
  'Posición destacada en búsquedas y mapa',
  'Sello ★ Premium visible en tu perfil',
  'Acceso prioritario a solicitudes urgentes',
  'Estadísticas avanzadas de visitas al perfil',
  'Soporte preferencial por chat',
]

export default function PanelPremium() {
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>('mensual')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return }
      const { data: sub } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('profesional_id', data.user.id)
        .eq('estado', 'activa')
        .gte('fecha_fin', new Date().toISOString())
        .order('fecha_fin', { ascending: false })
        .limit(1)
        .single()

      if (sub) setSuscripcion(sub as Suscripcion)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>

  return (
    <div className="px-4 pt-4">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-3 bg-transparent border-none cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        Volver
      </button>
      <div className="bg-gradient-to-br from-[#EF9F27] to-premium-600 rounded-xl px-4 py-4 mb-4 text-center">
        <div className="text-3xl mb-1">★</div>
        <h1 className="text-[18px] font-bold text-white">Vinclu Premium</h1>
        <p className="text-[12px] text-white/80 mt-1">Destaca tu perfil y consigue más clientes</p>
      </div>

      {/* Estado actual */}
      {suscripcion && (
        <div className="bg-premium-100 rounded-xl border border-premium-300 p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-premium-500 text-lg">★</span>
            <div>
              <p className="text-[13px] font-medium text-[#412402]">Premium activo — Plan {suscripcion.plan}</p>
              <p className="text-[11px] text-[#854F0B]">
                Válido hasta {new Date(suscripcion.fecha_fin).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Beneficios */}
      <div className="bg-white rounded-xl border border-borde p-4 mb-4">
        <h2 className="text-[13px] font-medium mb-3">Beneficios Premium</h2>
        <div className="space-y-2.5">
          {BENEFICIOS.map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-premium-500 text-sm mt-0.5">✓</span>
              <span className="text-[12px] text-gray-600">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Planes */}
      <div className="space-y-2 mb-4">
        {PLANES_PREMIUM.map((plan) => (
          <button
            key={plan.key}
            onClick={() => setSelected(plan.key)}
            className={`w-full rounded-xl border-2 p-3 text-left transition-all ${selected === plan.key ? 'border-premium-500 bg-premium-100' : 'border-borde bg-white'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-[14px] font-medium ${selected === plan.key ? 'text-[#412402]' : 'text-gray-700'}`}>
                  {plan.label}
                </p>
                <p className={`text-[12px] ${selected === plan.key ? 'text-[#854F0B]' : 'text-gray-400'}`}>
                  {plan.precioLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {plan.ahorro && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Ahorras {plan.ahorro}
                  </span>
                )}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === plan.key ? 'border-premium-500' : 'border-gray-300'}`}>
                  {selected === plan.key && <div className="w-3 h-3 rounded-full bg-premium-500" />}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <a
        href={PLANES_PREMIUM.find(p => p.key === selected)?.url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-premium-500 hover:bg-[#D88819] text-white py-3 rounded-xl text-[14px] font-medium text-center transition-colors"
      >
        {suscripcion ? 'Cambiar plan Premium' : 'Activar Premium ahora'}
      </a>

      <p className="text-[10px] text-gray-400 text-center mt-3 mb-6">
        Pago seguro con Mercado Pago · Cancela cuando quieras · Sin comisiones adicionales
      </p>
    </div>
  )
}
