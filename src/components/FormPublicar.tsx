'use client'

import { useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createClient } from '@/utils/supabase/client'
import { crearSolicitud } from '@/app/actions/solicitudes'
import { CATEGORIAS, BARRIOS_CALI, MODALIDADES } from '@/lib/constants'

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors"
    >
      {pending ? 'Publicando…' : 'Publicar solicitud'}
    </button>
  )
}

export default function FormPublicar({ userId, urgente: isUrgente }: { userId: string; urgente?: boolean }) {
  const [state, formAction] = useFormState(crearSolicitud, null)
  const [fotoUrl, setFotoUrl] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fotoError, setFotoError] = useState<string | null>(null)
  const [urgente, setUrgente] = useState(isUrgente ?? false)
  const [modalidad, setModalidad] = useState('puntual')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setFotoError('La imagen debe pesar menos de 5 MB.')
      return
    }
    setFotoError(null)
    setUploading(true)
    setFotoPreview(URL.createObjectURL(file))

    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    const supabase = createClient()
    const { error } = await supabase.storage.from('solicitudes').upload(path, file)
    if (error) {
      setFotoError(error.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('solicitudes').getPublicUrl(path)
    setFotoUrl(publicUrl)
    setUploading(false)
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {state.error}
        </div>
      )}

      <input type="hidden" name="foto_url" value={fotoUrl} />
      <input type="hidden" name="urgente" value={urgente ? 'true' : 'false'} />
      <input type="hidden" name="modalidad" value={modalidad} />

      {/* Urgente */}
      {urgente && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="text-lg">🚨</span>
          <div>
            <p className="text-[13px] font-medium text-red-700">Solicitud urgente</p>
            <p className="text-[11px] text-red-500">Los profesionales verán tu solicitud como prioritaria</p>
          </div>
        </div>
      )}

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría <span className="text-red-400">*</span>
        </label>
        <select
          name="categoria"
          required
          defaultValue=""
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        >
          <option value="" disabled>Selecciona una categoría</option>
          {CATEGORIAS.map((c) => (
            <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
          ))}
        </select>
      </div>

      {/* Modalidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de trabajo</label>
        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        >
          {MODALIDADES.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Cuándo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuándo lo necesitas?</label>
        <input
          name="cuando"
          type="text"
          placeholder="Ej: Lo antes posible, mañana por la tarde, esta semana..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del trabajo <span className="text-red-400">*</span>
        </label>
        <textarea
          name="descripcion"
          required
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
          placeholder="Describe qué necesitas hacer, el estado actual, detalles relevantes…"
        />
      </div>

      {/* Barrio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barrio <span className="text-red-400">*</span>
        </label>
        <select
          name="barrio"
          required
          defaultValue=""
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        >
          <option value="" disabled>Selecciona tu barrio</option>
          {BARRIOS_CALI.map(({ zona, barrios }) => (
            <optgroup key={zona} label={`── ${zona}`}>
              {barrios.map((b) => <option key={b} value={b}>{b}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Presupuesto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Presupuesto máximo (COP)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            name="presupuesto"
            type="number"
            min="0"
            step="5000"
            className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            placeholder="150000"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Déjalo vacío si no tienes un tope definido.</p>
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-verde-400 transition-colors"
        >
          {fotoPreview ? (
            <img src={fotoPreview} alt="preview" className="mx-auto max-h-48 rounded-lg object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{uploading ? 'Subiendo…' : 'Haz clic para adjuntar una foto'}</span>
              <span className="text-xs">JPG, PNG o WEBP · máx 5 MB</span>
            </div>
          )}
          {uploading && (
            <p className="text-xs text-verde-600 mt-2">Subiendo imagen…</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFoto}
        />
        {fotoError && <p className="text-xs text-red-500 mt-1">{fotoError}</p>}
      </div>

      {/* Toggle urgente si no venía como prop */}
      {!isUrgente && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUrgente(!urgente)}
            className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${urgente ? 'bg-[#D85A30]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-all ${urgente ? 'left-[20px]' : 'left-[2px]'}`} />
          </button>
          <span className="text-sm text-gray-600">🚨 Marcar como urgente</span>
        </div>
      )}

      <SubmitButton disabled={uploading} />
    </form>
  )
}
