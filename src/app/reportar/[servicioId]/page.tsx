'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { crearIncidencia } from '@/app/actions/incidencias'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-urgente-500 hover:bg-urgente-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
    >
      {pending ? 'Enviando...' : 'Enviar reporte'}
    </button>
  )
}

export default function ReportarPage({
  params,
}: {
  params: { servicioId: string }
}) {
  const [state, formAction] = useFormState(crearIncidencia, null)

  if (state?.success) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-verde-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-verde-200">
            <svg className="w-8 h-8 text-verde-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reporte enviado</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tu incidencia ha sido registrada. La revisaremos y tomaremos las acciones correspondientes.
          </p>
          <Link
            href="/mis-solicitudes"
            className="inline-block w-full bg-verde-500 hover:bg-verde-600 text-white py-3 rounded-xl text-sm font-medium transition-colors text-center"
          >
            Volver a mis servicios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-lg mx-auto px-4 py-10">
        <Link
          href="/mis-solicitudes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reportar incidencia</h1>
          <p className="text-sm text-gray-500 mt-1">
            Describe el problema que tuviste con este servicio. Tu reporte sera revisado por nuestro equipo.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-4">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="servicio_id" value={params.servicioId} />

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Tipo de incidencia
              </label>
              <select
                name="tipo"
                required
                defaultValue=""
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 transition-colors bg-white"
              >
                <option value="" disabled>Selecciona el tipo...</option>
                <option value="no_show">No se presento al trabajo</option>
                <option value="trabajo_incompleto">Trabajo no completado</option>
                <option value="mala_calidad">Mala calidad del trabajo</option>
                <option value="problema_pago">Problema con el pago</option>
                <option value="comportamiento">Comportamiento inadecuado</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Descripcion del problema
              </label>
              <textarea
                name="descripcion"
                rows={4}
                placeholder="Describe lo que paso con el mayor detalle posible..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 transition-colors resize-none"
              />
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
