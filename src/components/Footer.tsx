import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="22" r="15" fill="#1D9E75" />
              <circle cx="32" cy="22" r="8.5" fill="#E1F5EE" />
              <rect x="25.5" y="18.5" width="9.5" height="6" rx="3" fill="none" stroke="#1D9E75" strokeWidth="2.2" />
              <rect x="29.5" y="20.5" width="9.5" height="6" rx="3" fill="none" stroke="#1D9E75" strokeWidth="2.2" />
              <path d="M32 37 L25 28 Q32 31 39 28 Z" fill="#1D9E75" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Linkeando</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
            <Link href="/ayuda" className="hover:text-verde-500 transition-colors">Ayuda</Link>
            <Link href="/terminos" className="hover:text-verde-500 transition-colors">Terminos</Link>
            <Link href="/privacidad" className="hover:text-verde-500 transition-colors">Privacidad</Link>
            <a href="mailto:soporte@linkeando.co" className="hover:text-verde-500 transition-colors">Contacto</a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-300">
            Linkeando {new Date().getFullYear()} · Cali, Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
