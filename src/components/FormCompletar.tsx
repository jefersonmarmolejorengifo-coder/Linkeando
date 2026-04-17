'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const OPCIONES = [
  { key: 'satisfactorio', label: 'Servicio satisfactorio', desc: 'El trabajo se completó correctamente', icon: '✅', color: 'border-green-200 bg-green-50 hover:border-green-400' },
  { key: 'cancel_cliente', label: 'Cancelé el servicio', desc: 'Decidí no continuar con el servicio', icon: '❌', color: 'border-gray-200 bg-gray-50 hover:border-gray-400' },
  { key: 'no_show', label: 'El profesional no se presentó', desc: 'Se generará una huella de incumplimiento', icon: '⚠️', color: 'border-red-200 bg-red-50 hover:border-red-400' },
  { key: 'pro_cancel', label: 'El profesional canceló', desc: 'Se generará una huella de incumplimiento', icon: '🚫', color: 'border-red-200 bg-red-50 hover:border-red-400' },
]

export default function FormCompletar({
  solicitudId,
  postulacionId,
  profesionalId,
}: {
  solicitudId: string
  postulacionId: string
  profesionalId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmIncidencia, setConfirmIncidencia] = useState<string | null>(null)

  async function handleCierre(cierreTipo: string) {
    // Para incidencias, pedir confirmación
    if ((cierreTipo === 'no_show' || cierreTipo === 'pro_cancel') && !confirmIncidencia) {
      setConfirmIncidencia(cierreTipo)
      return
    }

    setProcessing(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('No autenticado.'); setProcessing(false); return }

    // Verificar solicitud
    const { data: solicitud } = await supabase
      .from('solicitudes')
      .select('cliente_id, estado')
      .eq('id', solicitudId)
      .single()

    if (!solicitud) { setError('Solicitud no encontrada.'); setProcessing(false); return }
    if (solicitud.cliente_id !== user.id) { setError('Solo el cliente puede cerrar el servicio.'); setProcessing(false); return }
    if (solicitud.estado !== 'en_proceso') { setError('El servicio no está en proceso.'); setProcessing(false); return }

    // Crear servicio completado
    const { data: servicio, error: errServicio } = await supabase
      .from('servicios_completados')
      .insert({
        solicitud_id: solicitudId,
        postulacion_id: postulacionId,
        cliente_id: user.id,
        profesional_id: profesionalId,
        cierre_tipo: cierreTipo,
      })
      .select('id')
      .single()

    if (errServicio) { setError(errServicio.message); setProcessing(false); return }

    // Actualizar estado solicitud
    const nuevoEstado = cierreTipo === 'satisfactorio' ? 'completada' : 'cancelada'
    await supabase.from('solicitudes').update({ estado: nuevoEstado }).eq('id', solicitudId)

    // Si es incidencia, registrar
    if (cierreTipo === 'no_show' || cierreTipo === 'pro_cancel') {
      await supabase.from('incidencias').insert({
        servicio_completado_id: servicio.id,
        profesional_id: profesionalId,
        tipo: cierreTipo,
        reportado_por: user.id,
      })
      router.push('/mis-solicitudes')
      return
    }

    // Si es cancelado por cliente, ir a solicitudes
    if (cierreTipo === 'cancel_cliente') {
      router.push('/mis-solicitudes')
      return
    }

    // Si es satisfactorio, ir a calificación 3D
    router.push(`/calificar-pro/${servicio.id}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-verde-500 hover:bg-verde-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Cerrar solicitud
      </button>

      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => { setOpen(false); setConfirmIncidencia(null) }}>
          <div className="bg-white rounded-t-2xl w-full max-w-sm p-4 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-[15px] font-medium mb-1">¿Cómo terminó el servicio?</h3>
            <p className="text-[12px] text-gray-400 mb-4">Selecciona el motivo de cierre</p>

            {!confirmIncidencia ? (
              <div className="space-y-2">
                {OPCIONES.map((op) => (
                  <button
                    key={op.key}
                    onClick={() => handleCierre(op.key)}
                    disabled={processing}
                    className={`w-full rounded-xl border-2 p-3 text-left transition-all ${op.color} disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{op.icon}</span>
                      <div>
                        <p className="text-[13px] font-medium">{op.label}</p>
                        <p className="text-[11px] text-gray-400">{op.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-[13px] font-medium text-red-700">⚠ Confirmar incidencia</p>
                  <p className="text-[12px] text-red-600 mt-1">
                    Esta acción generará una <strong>huella de incumplimiento permanente</strong> en el perfil del profesional. No se puede deshacer.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmIncidencia(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleCierre(confirmIncidencia)}
                    disabled={processing}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {processing ? 'Procesando…' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
