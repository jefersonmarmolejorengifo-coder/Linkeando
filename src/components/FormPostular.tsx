'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { crearPostulacion } from '@/app/actions/solicitudes'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-colors"
    >
      {pending ? 'Enviando…' : 'Enviar propuesta'}
    </button>
  )
}

export default function FormPostular({ solicitudId }: { solicitudId: string }) {
  const [state, formAction] = useFormState(crearPostulacion, null)

  if (state?.success) {
    return (
      <div className="bg-verde-50 border border-verde-200 rounded-xl p-5 text-center">
        <p className="text-2xl mb-1">✅</p>
        <p className="text-verde-700 font-semibold">¡Propuesta enviada!</p>
        <p className="text-sm text-verde-600 mt-1">El cliente revisará tu perfil pronto.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="solicitud_id" value={solicitudId} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {state.error}
        </div>
      )}

      {/* Precio propuesto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precio propuesto (COP)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            name="precio_propuesto"
            type="number"
            min="0"
            step="5000"
            className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            placeholder="80000"
          />
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje al cliente <span className="text-red-400">*</span>
        </label>
        <textarea
          name="mensaje"
          required
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
          placeholder="Cuéntale tu experiencia con este tipo de trabajo, cuándo podrías empezar…"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
