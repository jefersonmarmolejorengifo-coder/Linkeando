'use client'

type Rol = 'cliente' | 'profesional'

export default function RolToggle({
  value,
  onChange,
  className = '',
}: {
  value: Rol
  onChange: (r: Rol) => void
  className?: string
}) {
  const base = 'px-3 py-1.5 rounded-full text-xs font-medium transition-colors'
  return (
    <div className={`inline-flex items-center gap-1 bg-white/10 p-1 rounded-full ${className}`}>
      <button
        type="button"
        onClick={() => onChange('cliente')}
        className={`${base} ${value === 'cliente' ? 'bg-white text-verde-600 shadow-sm' : 'text-white/85 hover:text-white'}`}
      >
        🏠 Cliente
      </button>
      <button
        type="button"
        onClick={() => onChange('profesional')}
        className={`${base} ${value === 'profesional' ? 'bg-white text-pro-500 shadow-sm' : 'text-white/85 hover:text-white'}`}
      >
        🔧 Profesional
      </button>
    </div>
  )
}
