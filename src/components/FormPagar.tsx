'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { crearPreferenciaPago } from '@/app/actions/pagos'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2.5 bg-[#009EE3] hover:bg-[#0088C7] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-sm"
    >
      {pending ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Redirigiendo a Mercado Pago…
        </>
      ) : (
        <>
          {/* Logo MP simplificado */}
          <svg className="h-5" viewBox="0 0 48 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="16" fontFamily="Arial" fontWeight="bold" fontSize="14" fill="white">MP</text>
          </svg>
          Pagar con Mercado Pago
        </>
      )}
    </button>
  )
}

interface Props {
  servicioId: string
  profesionalId: string
  titulo: string
  montoSugerido?: number
}

export default function FormPagar({ servicioId, profesionalId, titulo, montoSugerido }: Props) {
  const [state, formAction] = useFormState(crearPreferenciaPago, null)
  const [monto, setMonto]   = useState(montoSugerido ?? 0)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="servicio_id"    value={servicioId} />
      <input type="hidden" name="profesional_id" value={profesionalId} />
      <input type="hidden" name="titulo"         value={titulo} />
      <input type="hidden" name="monto"          value={monto} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {state.error}
        </div>
      )}

      {/* Monto editable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto a pagar (COP)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            type="number"
            min="1000"
            step="1000"
            value={monto || ''}
            onChange={(e) => setMonto(Number(e.target.value))}
            placeholder="80000"
            required
            className="w-full border border-gray-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009EE3]"
          />
        </div>
        {montoSugerido && montoSugerido > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Precio acordado:{' '}
            <button
              type="button"
              onClick={() => setMonto(montoSugerido)}
              className="text-verde-600 font-medium hover:underline"
            >
              ${montoSugerido.toLocaleString('es-CO')}
            </button>
          </p>
        )}
      </div>

      <SubmitButton />

      {/* Leyenda de seguridad */}
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>
          Serás redirigido al portal seguro de Mercado Pago. Linkeando nunca almacena tus datos bancarios.
        </span>
      </div>
    </form>
  )
}
