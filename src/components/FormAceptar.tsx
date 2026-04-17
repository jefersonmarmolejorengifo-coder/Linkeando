'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { aceptarPostulacion } from '@/app/actions/solicitudes'

function Btn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
    >
      {pending ? 'Aceptando…' : 'Aceptar propuesta'}
    </button>
  )
}

export default function FormAceptar({
  postulacionId,
  solicitudId,
}: {
  postulacionId: string
  solicitudId: string
}) {
  const [state, formAction] = useFormState(aceptarPostulacion, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="postulacion_id" value={postulacionId} />
      <input type="hidden" name="solicitud_id" value={solicitudId} />
      {state?.error && (
        <p className="text-xs text-red-500 mb-1">{state.error}</p>
      )}
      <Btn />
    </form>
  )
}
