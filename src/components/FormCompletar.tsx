'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { completarServicio } from '@/app/actions/servicios'

function Btn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 bg-verde-500 hover:bg-verde-600 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
    >
      {pending ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Procesando…
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Marcar como completado
        </>
      )}
    </button>
  )
}

export default function FormCompletar({
  solicitudId,
  postulacionId,
  profesionalId,
}: {
  solicitudId: string
  postulacionId: string
  profesionalId: string
}) {
  const [state, formAction] = useFormState(completarServicio, null)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="solicitud_id"   value={solicitudId} />
      <input type="hidden" name="postulacion_id" value={postulacionId} />
      <input type="hidden" name="profesional_id" value={profesionalId} />
      {state?.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
      <Btn />
    </form>
  )
}
