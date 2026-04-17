'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { CalProfesional, Incidencia } from '@/types'

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return <span className="text-premium-500 text-[12px]">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
}

export default function PanelResultados() {
  const [calificaciones, setCalificaciones] = useState<CalProfesional[]>([])
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const [{ data: cals }, { data: incs }] = await Promise.all([
        supabase.from('cal_profesional').select('*').eq('profesional_id', data.user.id).order('created_at', { ascending: false }),
        supabase.from('incidencias').select('*').eq('profesional_id', data.user.id).order('created_at', { ascending: false }),
      ])
      if (cals) setCalificaciones(cals as CalProfesional[])
      if (incs) setIncidencias(incs as Incidencia[])
      setLoading(false)
    })
  }, [])

  const promedios = calificaciones.length > 0 ? {
    calidad: calificaciones.reduce((s, c) => s + c.calidad, 0) / calificaciones.length,
    precio: calificaciones.reduce((s, c) => s + c.precio, 0) / calificaciones.length,
    oportunidad: calificaciones.reduce((s, c) => s + c.oportunidad, 0) / calificaciones.length,
    general: calificaciones.reduce((s, c) => s + (c.calidad + c.precio + c.oportunidad) / 3, 0) / calificaciones.length,
  } : null

  if (loading) return <div className="p-6"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>

  return (
    <div className="px-4 pt-4">
      <div className="bg-pro-500 rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Mis resultados</h1>
        <p className="text-[12px] text-verde-200">Calificaciones e incidencias</p>
      </div>

      {/* Promedios */}
      {promedios ? (
        <div className="bg-white rounded-xl border border-borde p-4 mb-4">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-pro-500">{promedios.general.toFixed(1)}</div>
            <Stars rating={promedios.general} />
            <p className="text-[11px] text-gray-400 mt-1">{calificaciones.length} calificaciones</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Calidad del servicio', val: promedios.calidad },
              { label: 'Precio / relación valor', val: promedios.precio },
              { label: 'Oportunidad', val: promedios.oportunidad },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 w-32 flex-shrink-0">{d.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pro-500 rounded-full" style={{ width: `${(d.val / 5) * 100}%` }} />
                </div>
                <span className="text-[11px] font-medium text-pro-500 w-8 text-right">{d.val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-borde p-6 text-center text-sm text-gray-400 mb-4">
          Aún no tienes calificaciones.
        </div>
      )}

      {/* Incidencias */}
      <div className="bg-white rounded-xl border border-borde p-4 mb-4">
        <h2 className="text-[13px] font-medium mb-3">Historial de incidencias</h2>
        {incidencias.length === 0 ? (
          <div className="flex items-center gap-2 text-[12px] text-green-600">
            <span>✓</span> Sin incidencias — ¡Excelente historial!
          </div>
        ) : (
          <div className="space-y-2">
            {incidencias.map((inc) => (
              <div key={inc.id} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                <span className="text-red-500 text-sm">⚠</span>
                <div>
                  <p className="text-[12px] font-medium text-red-700">
                    {inc.tipo === 'no_show' ? 'No se presentó' : 'Canceló el servicio'}
                  </p>
                  <p className="text-[10px] text-red-400">
                    {new Date(inc.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comentarios recientes */}
      {calificaciones.filter(c => c.comentario).length > 0 && (
        <div className="bg-white rounded-xl border border-borde p-4 mb-4">
          <h2 className="text-[13px] font-medium mb-3">Comentarios recientes</h2>
          <div className="space-y-3">
            {calificaciones.filter(c => c.comentario).slice(0, 10).map((cal) => (
              <div key={cal.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <Stars rating={(cal.calidad + cal.precio + cal.oportunidad) / 3} />
                  <span className="text-[10px] text-gray-400">
                    {new Date(cal.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600">{cal.comentario}</p>
                {cal.monto_mano_obra && (
                  <p className="text-[10px] text-gray-400 mt-1">Monto pagado: ${cal.monto_mano_obra.toLocaleString('es-CO')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
