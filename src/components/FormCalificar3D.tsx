'use client'

import { useState } from 'react'

function StarRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-gray-600 flex-shrink-0 w-28">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="text-xl transition-transform hover:scale-110"
          >
            <span className={star <= (hover || value) ? 'text-premium-500' : 'text-gray-200'}>★</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FormCalificar3D({
  tipo,
  onSubmit,
}: {
  tipo: 'profesional' | 'cliente'
  onSubmit: (data: Record<string, number | string | null>) => Promise<void>
}) {
  const [valores, setValores] = useState<Record<string, number>>({})
  const [monto, setMonto] = useState('')
  const [comentario, setComentario] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const dimensiones = tipo === 'profesional'
    ? [
        { key: 'calidad', label: 'Calidad del servicio' },
        { key: 'precio', label: 'Precio / valor' },
        { key: 'oportunidad', label: 'Oportunidad' },
      ]
    : [
        { key: 'pago_oportuno', label: 'Pago oportuno' },
        { key: 'disponibilidad', label: 'Disponibilidad' },
        { key: 'atencion', label: 'Atención y trato' },
      ]

  const allFilled = dimensiones.every(d => valores[d.key] && valores[d.key] > 0)

  async function handleSubmit() {
    if (!allFilled) return
    setSaving(true)
    await onSubmit({
      ...valores,
      monto_mano_obra: monto ? Number(monto) : null,
      comentario: comentario.trim() || null,
    })
    setDone(true)
    setSaving(false)
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-[16px] font-medium text-gray-700">¡Gracias por tu calificación!</h2>
        <p className="text-[13px] text-gray-400 mt-1">Tu opinión ayuda a mejorar la comunidad de Linkeando.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Estrellas por dimensión */}
      <div className="space-y-4">
        {dimensiones.map((dim) => (
          <StarRow
            key={dim.key}
            label={dim.label}
            value={valores[dim.key] ?? 0}
            onChange={(v) => setValores(prev => ({ ...prev, [dim.key]: v }))}
          />
        ))}
      </div>

      {/* Monto pagado (solo para calificar profesional) */}
      {tipo === 'profesional' && (
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Monto pagado en mano de obra (COP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="50000"
              className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500"
            />
          </div>
        </div>
      )}

      {/* Comentario */}
      <div>
        <label className="block text-[12px] font-medium text-gray-500 mb-1">Comentario (opcional)</label>
        <textarea
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={tipo === 'profesional' ? 'Cuéntanos cómo fue tu experiencia con el profesional...' : 'Cuéntanos cómo fue tu experiencia con el cliente...'}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500/20 focus:border-verde-500 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allFilled || saving}
        className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 text-white py-3 rounded-xl text-[14px] font-medium transition-colors"
      >
        {saving ? 'Enviando…' : 'Enviar calificación'}
      </button>
    </div>
  )
}
