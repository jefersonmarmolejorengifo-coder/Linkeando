'use client'

import { useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { actualizarPerfil } from '@/app/actions/perfil'
import { BARRIOS_CALI, CATEGORIA_LABELS } from '@/lib/constants'
import type { Usuario } from '@/types'

// ── Botón de geolocalización (solo para profesionales) ────────
function GeoButton({
  latRef,
  lngRef,
  tieneUbicacion,
}: {
  latRef: React.RefObject<HTMLInputElement>
  lngRef: React.RefObject<HTMLInputElement>
  tieneUbicacion: boolean
}) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    tieneUbicacion ? 'ok' : 'idle',
  )

  function obtener() {
    if (!navigator?.geolocation) { setEstado('error'); return }
    setEstado('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (latRef.current) latRef.current.value = String(coords.latitude)
        if (lngRef.current) lngRef.current.value = String(coords.longitude)
        setEstado('ok')
      },
      () => setEstado('error'),
      { timeout: 8000 },
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={obtener}
        disabled={estado === 'loading'}
        className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:border-verde-400 hover:text-verde-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {estado === 'loading' ? 'Detectando…' : estado === 'ok' ? 'Actualizar ubicación' : 'Usar mi ubicación actual'}
      </button>
      {estado === 'ok' && (
        <span className="text-xs text-verde-600 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-verde-500" />
          Ubicación lista — guarda los cambios para publicarla
        </span>
      )}
      {estado === 'error' && (
        <span className="text-xs text-red-500">No se pudo obtener la ubicación del dispositivo</span>
      )}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
    >
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}

export default function FormPerfil({ usuario }: { usuario: Usuario }) {
  const [state, formAction] = useFormState(actualizarPerfil, null)
  const esProfesional = usuario.tipo === 'profesional'
  const latRef = useRef<HTMLInputElement>(null)
  const lngRef = useRef<HTMLInputElement>(null)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Mensajes */}
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-verde-50 border border-verde-200 text-verde-700 text-sm rounded-lg">
          ¡Perfil actualizado correctamente!
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          name="nombre"
          type="text"
          required
          defaultValue={usuario.nombre}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          name="telefono"
          type="tel"
          defaultValue={usuario.telefono ?? ''}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
          placeholder="310 000 0000"
        />
      </div>

      {/* Zona de trabajo — profesional o cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {esProfesional ? 'Barrio donde trabajas' : 'Barrio'}
        </label>
        <select
          name="barrio"
          defaultValue={usuario.barrio ?? ''}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        >
          <option value="">Selecciona tu barrio</option>
          {BARRIOS_CALI.map(({ zona, barrios }) => (
            <optgroup key={zona} label={`── ${zona}`}>
              {barrios.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Campos exclusivos para profesional */}
      {esProfesional && (
        <>
          {/* Especialidad (solo lectura — definida al registrarse) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
              <span className="text-sm text-gray-700">
                {CATEGORIA_LABELS[usuario.categoria ?? ''] ?? usuario.categoria}
              </span>
              <span className="ml-auto text-xs text-gray-400">No editable</span>
            </div>
          </div>

          {/* Tarifa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarifa por hora (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                name="tarifa"
                type="number"
                min="0"
                step="1000"
                defaultValue={usuario.tarifa ?? ''}
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                placeholder="35000"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Deja vacío si prefieres cotizar caso a caso.</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción y experiencia
            </label>
            <textarea
              name="descripcion"
              rows={4}
              defaultValue={usuario.descripcion ?? ''}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
              placeholder="Cuéntale a los clientes sobre tu experiencia, años de trabajo, herramientas que usas…"
            />
          </div>

          {/* Ubicación en el mapa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación en el mapa
            </label>
            <input ref={latRef} type="hidden" name="lat" defaultValue={usuario.lat ?? ''} />
            <input ref={lngRef} type="hidden" name="lng" defaultValue={usuario.lng ?? ''} />
            <GeoButton
              latRef={latRef}
              lngRef={lngRef}
              tieneUbicacion={!!usuario.lat}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Tu posición aparecerá en el mapa de profesionales de Linkeando.
            </p>
          </div>
        </>
      )}

      <SubmitButton />
    </form>
  )
}
