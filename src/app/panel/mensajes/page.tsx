'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface ChatPreview {
  solicitud_id: string
  titulo: string
  otro_nombre: string
  ultimo_mensaje: string
  ultimo_fecha: string
  no_leidos: number
}

export default function PanelMensajes() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const userId = data.user.id

      // Obtener solicitudes donde el profesional tiene mensajes
      const { data: mensajes } = await supabase
        .from('mensajes')
        .select('solicitud_id, contenido, created_at, leido, remitente_id, destinatario_id')
        .or(`remitente_id.eq.${userId},destinatario_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (!mensajes || mensajes.length === 0) { setLoading(false); return }

      // Agrupar por solicitud_id
      const grouped = new Map<string, typeof mensajes>()
      for (const m of mensajes) {
        const existing = grouped.get(m.solicitud_id) ?? []
        existing.push(m)
        grouped.set(m.solicitud_id, existing)
      }

      const previews: ChatPreview[] = []
      for (const [solId, msgs] of Array.from(grouped)) {
        const ultimo = msgs[0]
        const noLeidos = msgs.filter(m => m.destinatario_id === userId && !m.leido).length
        const otroId = ultimo.remitente_id === userId ? ultimo.destinatario_id : ultimo.remitente_id

        // Obtener datos
        const [{ data: sol }, { data: otro }] = await Promise.all([
          supabase.from('solicitudes').select('titulo').eq('id', solId).single(),
          supabase.from('usuarios').select('nombre').eq('id', otroId).single(),
        ])

        previews.push({
          solicitud_id: solId,
          titulo: (sol as { titulo: string })?.titulo ?? 'Solicitud',
          otro_nombre: (otro as { nombre: string })?.nombre ?? 'Usuario',
          ultimo_mensaje: ultimo.contenido.slice(0, 60) + (ultimo.contenido.length > 60 ? '…' : ''),
          ultimo_fecha: ultimo.created_at,
          no_leidos: noLeidos,
        })
      }

      setChats(previews)
      setLoading(false)
    })
  }, [])

  return (
    <div className="px-4 pt-4">
      <div className="bg-pro-500 rounded-xl px-4 py-3 mb-4">
        <h1 className="text-[16px] font-medium text-white">Mensajes</h1>
        <p className="text-[12px] text-verde-200">Conversaciones con tus clientes</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      ) : chats.length === 0 ? (
        <div className="bg-white rounded-xl border border-borde p-6 text-center text-sm text-gray-400">
          No tienes conversaciones activas.
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.solicitud_id}
              onClick={() => router.push(`/chat/${chat.solicitud_id}`)}
              className="w-full bg-white rounded-xl border border-borde p-3 text-left hover:border-pro-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{chat.otro_nombre}</p>
                  <p className="text-[11px] text-gray-400 truncate">{chat.titulo}</p>
                  <p className="text-[12px] text-gray-500 mt-1 truncate">{chat.ultimo_mensaje}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <span className="text-[10px] text-gray-400">
                    {new Date(chat.ultimo_fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                  </span>
                  {chat.no_leidos > 0 && (
                    <span className="bg-pro-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {chat.no_leidos}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
