'use client'

import { useState, type ReactNode } from 'react'

type Props = {
  label: string
  icon: ReactNode
  value: string | null | undefined
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea'
  onSave?: (value: string) => Promise<void> | void
  disabled?: boolean
}

export default function EditField({
  label,
  icon,
  value,
  placeholder = 'Sin definir',
  type = 'text',
  onSave,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  function toggle() {
    if (disabled) return
    if (!open) setDraft(value ?? '')
    setOpen(!open)
  }

  async function handleSave() {
    if (saving || !onSave) return
    setSaving(true)
    try {
      await onSave(draft.trim())
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-borde py-3">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="w-full flex items-center justify-between bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-full bg-verde-50 text-verde-500 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
              {value || placeholder}
            </div>
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {open && (
        <div className="pt-3 pl-11">
          {type === 'textarea' ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full border border-borde rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-verde-500 resize-none"
            />
          ) : (
            <input
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-borde rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-verde-500"
            />
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setDraft(value ?? '')
                setOpen(false)
              }}
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm text-gray-600 border border-borde bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm text-white bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-wait"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
