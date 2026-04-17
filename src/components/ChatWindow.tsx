'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Mensaje {
  id: string
  remitente_id: string
  contenido: string
  created_at: string
}

interface Props {
  solicitudId: string
  userId: string
  destinatarioId: string
  mensajesIniciales: Mensaje[]
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
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Scroll al fondo
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [mensajes])

  // Suscripción Realtime
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
  }, [solicitudId])

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
    })

    if (err) {
      setError('No se pudo enviar el mensaje.')
    } else {
      setTexto('')
    }

    setEnviando(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Lista de mensajes */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-2 space-y-2"
      >
        {mensajes.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-12">
            Aún no hay mensajes. ¡Empieza la conversación!
          </p>
        )}

        {mensajes.map((m) => {
          const esMio = m.remitente_id === userId
          const esSistema = m.contenido.startsWith('[SISTEMA]')
          const hora = new Date(m.created_at).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })

          // Mensaje de sistema
          if (esSistema) {
            const texto = m.contenido.replace('[SISTEMA] ', '')
            return (
              <div key={m.id} className="flex justify-center px-4">
                <div className="bg-[#f5f5f3] border border-[#e8e8e6] rounded-xl px-4 py-2.5 text-center max-w-[85%]">
                  <p className="text-[11px] text-gray-500 leading-relaxed">{texto}</p>
                  <p className="text-[9px] text-gray-400 mt-1">{hora}</p>
                </div>
              </div>
            )
          }

          return (
            <div
              key={m.id}
              className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  esMio
                    ? 'bg-verde-500 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="break-words">{m.contenido}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    esMio ? 'text-verde-100' : 'text-gray-400'
                  }`}
                >
                  {hora}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      {error && (
        <p className="text-xs text-red-500 text-center py-1">{error}</p>
      )}
      <form
        onSubmit={enviar}
        className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje…"
          disabled={enviando}
          autoComplete="off"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="bg-verde-500 hover:bg-verde-600 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
          aria-label="Enviar"
        >
          <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
