'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PLANES_PREMIUM } from '@/lib/constants'
import type { Suscripcion } from '@/types'

const BENEFICIOS = [
  { icon: '🎯', label: 'Posición destacada en búsquedas y mapa' },
  { icon: '⭐', label: 'Sello ★ Premium visible en tu perfil' },
  { icon: '⚡', label: 'Acceso prioritario a solicitudes urgentes' },
  { icon: '📊', label: 'Estadísticas avanzadas de visitas al perfil' },
  { icon: '💳', label: 'Acceso a microcréditos — Financia materiales a través de Bancamía' },
]

export default function PanelPremium() {
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>('trimestral')

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
        .maybeSingle()

      if (sub) setSuscripcion(sub as Suscripcion)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>
  }

  const planSeleccionado = PLANES_PREMIUM.find(p => p.key === selected)

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-4 bg-transparent border-none cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>

        <div
          className="rounded-2xl px-6 py-8 mb-5 text-center text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg,#EF9F27 0%,#D88819 100%)' }}
        >
          <div className="text-5xl mb-2">★</div>
          <h1 className="text-2xl font-bold">Vinclu Premium</h1>
          <p className="text-sm text-white/90 mt-2">
            Destaca tu perfil y consigue más clientes
          </p>
        </div>

        {suscripcion && (
          <div className="bg-premium-50 rounded-xl border border-premium-300 p-4 mb-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-premium-500 text-white flex items-center justify-center text-lg flex-shrink-0">
              ★
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-premium-800">
                Premium activo — Plan {suscripcion.plan}
              </p>
              <p className="text-xs text-premium-700 mt-0.5">
                Válido hasta{' '}
                {new Date(suscripcion.fecha_fin).toLocaleDateString('es-CO', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-borde p-5 mb-5">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">Beneficios Premium</h2>
          <div className="space-y-3">
            {BENEFICIOS.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-premium-50 flex items-center justify-center text-sm flex-shrink-0">
                  {b.icon}
                </div>
                <span className="text-sm text-gray-700 leading-snug pt-1.5">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-900 mb-3">Elige tu plan</h2>
        <div className="space-y-2 mb-5">
          {PLANES_PREMIUM.map((plan) => {
            const active = selected === plan.key
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelected(plan.key)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  active
                    ? 'border-premium-500 bg-premium-50 shadow-sm'
                    : 'border-borde bg-white hover:border-premium-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-base font-semibold ${active ? 'text-premium-800' : 'text-gray-900'}`}>
                        {plan.label}
                      </p>
                      {plan.ahorro && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-verde-500 text-white font-medium">
                          Ahorras {plan.ahorro}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${active ? 'text-premium-700' : 'text-gray-500'}`}>
                      {plan.precioLabel}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      active ? 'border-premium-500' : 'border-gray-300'
                    }`}
                  >
                    {active && <div className="w-3.5 h-3.5 rounded-full bg-premium-500" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <a
          href={planSeleccionado?.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-premium-500 hover:bg-premium-600 text-white py-3.5 rounded-xl text-sm font-semibold text-center shadow-md transition-colors"
        >
          {suscripcion ? 'Cambiar plan Premium' : 'Activar Premium ahora'}
        </a>

        <p className="text-[11px] text-gray-400 text-center mt-3 mb-6 leading-relaxed">
          Pago seguro con Mercado Pago · Cancela cuando quieras · Sin comisiones adicionales
        </p>
      </div>
    </div>
  )
}
