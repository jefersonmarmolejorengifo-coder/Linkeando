import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-sm font-semibold text-gray-700">Vinclu</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
            <Link href="/ayuda" className="hover:text-verde-500 transition-colors">Ayuda</Link>
            <Link href="/terminos" className="hover:text-verde-500 transition-colors">Terminos</Link>
            <Link href="/privacidad" className="hover:text-verde-500 transition-colors">Privacidad</Link>
            <a href="mailto:soporte@vinclu.co" className="hover:text-verde-500 transition-colors">Contacto</a>
          </div>

          <p className="text-xs text-gray-300">
            Vinclu {new Date().getFullYear()} · Cali, Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
