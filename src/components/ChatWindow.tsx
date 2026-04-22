'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import VoiceBubble from './VoiceBubble'
import { enviarMensajeVoz, obtenerUrlFirmadaVoz } from '@/app/actions/mensajes'

type Mensaje = {
  id: string
  remitente_id: string
  contenido: string
  created_at: string
  tipo?: 'texto' | 'voz' | 'imagen' | null
  voz_url?: string | null
  voz_duracion?: number | null
}

interface Props {
  solicitudId: string
  userId: string
  destinatarioId: string
  mensajesIniciales: Mensaje[]
}

const MAX_RECORD_SECS = 300

function pickMime(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c
  }
  return 'audio/webm'
}

function extFromMime(mime: string): string {
  if (mime.includes('webm')) return 'webm'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('mp4')) return 'm4a'
  return 'webm'
}

export default function ChatWindow({
  solicitudId,
  userId,
  destinatarioId,
  mensajesIniciales,
}: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recSecs, setRecSecs] = useState(0)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recStartRef = useRef<number>(0)
  const cancelledRef = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [mensajes])

  useEffect(() => {
    const paths = mensajes
      .filter(m => m.tipo === 'voz' && m.voz_url && !signedUrls[m.voz_url])
      .map(m => m.voz_url!)
    if (paths.length === 0) return
    let cancelled = false
    ;(async () => {
      const entries: Record<string, string> = {}
      for (const p of paths) {
        const r = await obtenerUrlFirmadaVoz(p)
        if (r.url) entries[p] = r.url
      }
      if (!cancelled && Object.keys(entries).length) {
        setSignedUrls(prev => ({ ...prev, ...entries }))
      }
    })()
    return () => { cancelled = true }
  }, [mensajes, signedUrls])

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${solicitudId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `solicitud_id=eq.${solicitudId}`,
        },
        (payload) => {
          const nuevo = payload.new as Mensaje
          setMensajes((prev) =>
            prev.some((m) => m.id === nuevo.id) ? prev : [...prev, nuevo],
          )
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [solicitudId, supabase])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido || enviando) return
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.from('mensajes').insert({
      solicitud_id: solicitudId,
      remitente_id: userId,
      destinatario_id: destinatarioId,
      contenido,
      tipo: 'texto',
    })
    if (err) setError('No se pudo enviar el mensaje.')
    else setTexto('')
    setEnviando(false)
    inputRef.current?.focus()
  }

  function cleanupRec() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }

  async function startRecord() {
    if (recording) return
    setError(null)
    cancelledRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickMime()
      const mr = new MediaRecorder(stream, { mimeType: mime })
      recorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const duration = Math.min(
          MAX_RECORD_SECS,
          Math.max(1, Math.round((Date.now() - recStartRef.current) / 1000)),
        )
        const chunks = chunksRef.current
        const wasCancelled = cancelledRef.current
        cleanupRec()
        setRecSecs(0)
        if (wasCancelled || chunks.length === 0 || duration < 1) return
        await uploadAndSend(new Blob(chunks, { type: mime }), mime, duration)
      }
      mr.start()
      recStartRef.current = Date.now()
      setRecording(true)
      setRecSecs(0)
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - recStartRef.current) / 1000)
        setRecSecs(s)
        if (s >= MAX_RECORD_SECS) stopRecord()
      }, 250)
    } catch {
      setError('No se pudo acceder al micrófono.')
      cleanupRec()
      setRecording(false)
    }
  }

  function stopRecord() {
    if (!recording) return
    setRecording(false)
    try { recorderRef.current?.stop() } catch { /* ignore */ }
  }

  function cancelRecord() {
    cancelledRef.current = true
    setRecording(false)
    try { recorderRef.current?.stop() } catch { /* ignore */ }
    cleanupRec()
    setRecSecs(0)
  }

  async function uploadAndSend(blob: Blob, mime: string, durationSec: number) {
    setEnviando(true)
    try {
      const ext = extFromMime(mime)
      const fileName = `${crypto.randomUUID()}.${ext}`
      const path = `${userId}/${fileName}`
      const { error: upErr } = await supabase.storage
        .from('voice-notes')
        .upload(path, blob, { contentType: mime, cacheControl: '3600' })
      if (upErr) {
        setError('No se pudo subir la nota de voz.')
        return
      }
      const { error: sendErr } = await enviarMensajeVoz({
        solicitud_id: solicitudId,
        voz_url: path,
        voz_duracion: durationSec,
      })
      if (sendErr) setError(sendErr)
    } finally {
      setEnviando(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div ref={containerRef} className="flex-1 overflow-y-auto py-2 space-y-2">
        {mensajes.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-12">
            Aún no hay mensajes. ¡Empieza la conversación!
          </p>
        )}

        {mensajes.map((m) => {
          const esMio = m.remitente_id === userId
          const esSistema = m.contenido.startsWith('[SISTEMA]')
          const hora = new Date(m.created_at).toLocaleTimeString('es-CO', {
            hour: '2-digit', minute: '2-digit',
          })

          if (esSistema) {
            const t = m.contenido.replace('[SISTEMA] ', '')
            return (
              <div key={m.id} className="flex justify-center px-4">
                <div className="bg-fondo border border-borde rounded-xl px-4 py-2.5 text-center max-w-[85%]">
                  <p className="text-[11px] text-gray-500 leading-relaxed">{t}</p>
                  <p className="text-[9px] text-gray-400 mt-1">{hora}</p>
                </div>
              </div>
            )
          }

          if (m.tipo === 'voz' && m.voz_url) {
            const src = signedUrls[m.voz_url] ?? null
            return (
              <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'} px-2`}>
                <div className="max-w-[75%]">
                  <VoiceBubble src={src} durationSec={m.voz_duracion ?? 0} isMine={esMio} />
                  <p className={`text-[10px] mt-1 ${esMio ? 'text-right text-gray-400' : 'text-gray-400'}`}>{hora}</p>
                </div>
              </div>
            )
          }

          return (
            <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  esMio
                    ? 'bg-verde-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="break-words">{m.contenido}</p>
                <p className={`text-[10px] mt-1 text-right ${esMio ? 'text-verde-100' : 'text-gray-400'}`}>{hora}</p>
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="text-xs text-red-500 text-center py-1">{error}</p>}

      {recording ? (
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
          <div className="flex-1 bg-urgente-50 border border-urgente-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-urgente-500 animate-pulse" />
            <span className="text-sm text-urgente-700 font-medium flex-1">
              Grabando… {Math.floor(recSecs / 60)}:{(recSecs % 60).toString().padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={cancelRecord}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
          <button
            type="button"
            onPointerUp={stopRecord}
            onPointerLeave={stopRecord}
            className="bg-verde-500 hover:bg-verde-600 text-white p-3 rounded-full flex-shrink-0 shadow-lg"
            aria-label="Enviar nota de voz"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2">
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje…"
            disabled={enviando}
            autoComplete="off"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 disabled:opacity-50"
          />
          {texto.trim() ? (
            <button
              type="submit"
              disabled={enviando}
              className="bg-verde-500 hover:bg-verde-600 disabled:opacity-40 text-white p-2.5 rounded-xl flex-shrink-0"
              aria-label="Enviar"
            >
              <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); void startRecord() }}
              disabled={enviando}
              className="bg-verde-500 hover:bg-verde-600 disabled:opacity-40 text-white p-2.5 rounded-xl flex-shrink-0 select-none touch-none"
              aria-label="Grabar nota de voz"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
              </svg>
            </button>
          )}
        </form>
      )}
    </div>
  )
}
