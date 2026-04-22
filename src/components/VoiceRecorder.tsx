'use client'

import { useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 300

type RecordedAudio = {
  blob: Blob
  mimeType: string
  durationSec: number
}

type Props = {
  onRecorded: (audio: RecordedAudio) => void | Promise<void>
  onCancel?: () => void
  disabled?: boolean
  className?: string
  label?: string
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

function pickMime(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) {
      return c
    }
  }
  return 'audio/webm'
}

export default function VoiceRecorder({
  onRecorded,
  onCancel,
  disabled = false,
  className = '',
  label = 'Mantén presionado para grabar',
}: Props) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)
  const cancelledRef = useRef(false)

  useEffect(() => () => cleanup(), [])

  function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current = null
    chunksRef.current = []
  }

  async function start() {
    if (disabled || recording) return
    setError(null)
    cancelledRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickMime()
      const mr = new MediaRecorder(stream, { mimeType: mime })
      recorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const duration = Math.min(
          MAX_SECONDS,
          Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
        )
        const chunks = chunksRef.current
        cleanup()
        if (cancelledRef.current) return
        if (chunks.length === 0 || duration < 1) {
          setError('Graba al menos 1 segundo.')
          return
        }
        const blob = new Blob(chunks, { type: mime })
        void onRecorded({ blob, mimeType: mime, durationSec: duration })
      }
      mr.start()
      startedAtRef.current = Date.now()
      setRecording(true)
      setElapsed(0)
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startedAtRef.current) / 1000)
        setElapsed(s)
        if (s >= MAX_SECONDS) stop()
      }, 250)
    } catch (e) {
      console.error(e)
      setError('No se pudo acceder al micrófono.')
      cleanup()
      setRecording(false)
    }
  }

  function stop() {
    if (!recording) return
    setRecording(false)
    try {
      recorderRef.current?.stop()
    } catch {
      // ignore
    }
  }

  function cancel() {
    cancelledRef.current = true
    setRecording(false)
    try {
      recorderRef.current?.stop()
    } catch {
      // ignore
    }
    cleanup()
    setElapsed(0)
    onCancel?.()
  }

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault()
    void start()
  }
  const handleUp = (e: React.PointerEvent) => {
    e.preventDefault()
    stop()
  }

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={cancel}
        onPointerLeave={(e) => { if (recording) handleUp(e) }}
        disabled={disabled}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform select-none touch-none ${
          recording ? 'bg-urgente-500 scale-110 animate-pulse' : 'bg-verde-500 hover:bg-verde-600'
        } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label="Grabar nota de voz"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
          <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" />
        </svg>
      </button>
      <div className="text-xs text-gray-500 text-center">
        {recording ? (
          <span className="text-urgente-500 font-medium">Grabando… {fmt(elapsed)}</span>
        ) : (
          label
        )}
      </div>
      {error && <div className="text-xs text-urgente-500">{error}</div>}
    </div>
  )
}
