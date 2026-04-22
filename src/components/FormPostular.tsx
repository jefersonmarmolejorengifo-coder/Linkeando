'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { crearPostulacion } from '@/app/actions/solicitudes'
import VoiceRecorder from './VoiceRecorder'
import VoiceBubble from './VoiceBubble'

function extFromMime(mime: string): string {
  if (mime.includes('webm')) return 'webm'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('mp4')) return 'm4a'
  return 'webm'
}

export default function FormPostular({ solicitudId }: { solicitudId: string }) {
  const [mensaje, setMensaje] = useState('')
  const [precio, setPrecio] = useState('')
  const [voice, setVoice] = useState<{
    path: string
    previewUrl: string
    durationSec: number
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRecorded(audio: { blob: Blob; mimeType: string; durationSec: number }) {
    setError(null)
    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Debes iniciar sesión.'); return }
      const ext = extFromMime(audio.mimeType)
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('voice-notes')
        .upload(path, audio.blob, { contentType: audio.mimeType, cacheControl: '3600' })
      if (upErr) {
        setError('No se pudo subir la nota de voz.')
        return
      }
      setVoice({
        path,
        previewUrl: URL.createObjectURL(audio.blob),
        durationSec: audio.durationSec,
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mensaje.trim() || mensaje.trim().length < 5) {
      setError('El mensaje debe tener al menos 5 caracteres.')
      return
    }
    setSubmitting(true)
    setError(null)
    const fd = new FormData()
    fd.set('solicitud_id', solicitudId)
    fd.set('mensaje', mensaje.trim())
    if (precio) fd.set('precio_propuesto', precio)
    if (voice) {
      fd.set('voz_url', voice.path)
      fd.set('voz_duracion', String(voice.durationSec))
    }
    const result = await crearPostulacion(null, fd)
    setSubmitting(false)
    if (result?.error) setError(result.error)
    else if (result?.success) setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-verde-50 border border-verde-200 rounded-xl p-5 text-center">
        <p className="text-2xl mb-1">✅</p>
        <p className="text-verde-700 font-semibold">¡Propuesta enviada!</p>
        <p className="text-sm text-verde-600 mt-1">El cliente revisará tu perfil pronto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precio propuesto (COP)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            type="number"
            min="0"
            step="5000"
            className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            placeholder="80000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje al cliente <span className="text-red-400">*</span>
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
          placeholder="Cuéntale tu experiencia con este tipo de trabajo, cuándo podrías empezar…"
        />
      </div>

      <div className="border border-dashed border-borde rounded-xl p-4">
        <p className="text-xs font-medium text-gray-700 mb-1">Nota de voz (opcional)</p>
        <p className="text-xs text-gray-500 mb-3">
          Agrega un saludo personal para destacar tu propuesta.
        </p>
        {voice ? (
          <div className="space-y-2">
            <VoiceBubble src={voice.previewUrl} durationSec={voice.durationSec} />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(voice.previewUrl)
                setVoice(null)
              }}
              className="text-xs text-urgente-500 hover:text-urgente-600"
            >
              Quitar nota de voz
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <VoiceRecorder
              onRecorded={handleRecorded}
              disabled={uploading}
              label={uploading ? 'Subiendo…' : 'Mantén presionado para grabar'}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
      >
        {submitting ? 'Enviando…' : 'Enviar propuesta'}
      </button>
    </form>
  )
}
