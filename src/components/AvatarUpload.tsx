'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { actualizarAvatar } from '@/app/actions/perfil'

interface AvatarUploadProps {
  userId: string
  currentUrl: string | null
  nombre: string
}

export default function AvatarUpload({ userId, currentUrl, nombre }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 2 MB.')
      return
    }

    setError(null)
    setUploading(true)

    // Preview local inmediato
    setPreview(URL.createObjectURL(file))

    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const supabase = createClient()
    const { error: storageError } = await supabase.storage
      .from('avatares')
      .upload(path, file, { upsert: true })

    if (storageError) {
      setError(storageError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatares')
      .getPublicUrl(path)

    // Bustar caché añadiendo timestamp
    const finalUrl = `${publicUrl}?t=${Date.now()}`

    const result = await actualizarAvatar(finalUrl)
    if (result?.error) setError(result.error)

    setPreview(finalUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Círculo de avatar */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-24 h-24 rounded-full overflow-hidden bg-verde-100 flex items-center justify-center ring-4 ring-white shadow-md hover:ring-verde-300 transition-all group"
        disabled={uploading}
      >
        {preview ? (
          <img src={preview} alt={nombre} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-verde-600">{initials}</span>
        )}
        {/* Overlay al hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-medium">
            {uploading ? 'Subiendo…' : 'Cambiar'}
          </span>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-verde-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-400">JPG, PNG o WEBP · máx 2 MB</p>

      {error && (
        <p className="text-xs text-red-500 text-center max-w-xs">{error}</p>
      )}
    </div>
  )
}
