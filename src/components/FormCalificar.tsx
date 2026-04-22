'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { calificar } from '@/app/actions/servicios'

const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
    >
      {pending ? 'Enviando…' : 'Enviar calificación'}
    </button>
  )
}

interface Props {
  servicioId: string
  calificadoId: string
  calificadoNombre: string
  esCalificandoProfesional: boolean
}

export default function FormCalificar({
  servicioId,
  calificadoId,
  calificadoNombre,
  esCalificandoProfesional,
}: Props) {
  const [state, formAction] = useFormState(calificar, null)
  const [hovered,  setHovered]  = useState(0)
  const [selected, setSelected] = useState(0)

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <p className="text-5xl mb-3">⭐</p>
        <p className="font-bold text-gray-900 text-xl mb-1">¡Gracias por tu opinión!</p>
        <p className="text-sm text-gray-500">
          Tu calificación ayuda a mejorar la comunidad de Vinclu.
        </p>
      </div>
    )
  }

  const activo = hovered || selected

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="servicio_completado_id" value={servicioId} />
      <input type="hidden" name="calificado_id"          value={calificadoId} />
      {/* puntuacion se envía via hidden actualizado en onClick */}
      <input type="hidden" name="puntuacion" value={selected} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {state.error}
        </div>
      )}

      <p className="text-sm text-gray-600 text-center leading-relaxed">
        ¿Cómo fue tu experiencia{' '}
        {esCalificandoProfesional ? 'con el trabajo de' : 'atendiendo a'}{' '}
        <strong className="text-gray-900">{calificadoNombre}</strong>?
      </p>

      {/* Selector de estrellas */}
      <div className="flex justify-center gap-3 py-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSelected(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className={`w-11 h-11 transition-colors duration-100 ${
                n <= activo ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Etiqueta verbal */}
      <div className="h-5 text-center">
        {selected > 0 && (
          <p className="text-sm font-semibold text-gray-700">{LABELS[selected]}</p>
        )}
      </div>

      {/* Comentario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comentario{' '}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="comentario"
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
          placeholder={
            esCalificandoProfesional
              ? 'Puntualidad, calidad del trabajo, trato, limpieza…'
              : 'Comunicación, trato, disposición para el trabajo…'
          }
        />
      </div>

      <SubmitButton disabled={selected === 0} />
    </form>
  )
}
