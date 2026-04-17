'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FAQ {
  q: string
  a: string
}

const FAQ_CLIENTES: FAQ[] = [
  {
    q: 'Como publico una solicitud de servicio?',
    a: 'Ingresa a tu cuenta, ve a "Publicar" y describe lo que necesitas: tipo de servicio, ubicacion, presupuesto y fotos si las tienes. Los profesionales cercanos recibiran una alerta y podran enviarte sus propuestas.',
  },
  {
    q: 'Como elijo al mejor profesional?',
    a: 'Revisa las propuestas que recibas. Cada profesional tiene un perfil con calificaciones, especialidades, zona de cobertura y experiencia. Puedes chatear con ellos antes de aceptar una propuesta.',
  },
  {
    q: 'Como pago por el servicio?',
    a: 'Una vez completado el servicio, puedes pagar a traves de Mercado Pago directamente desde la plataforma. Linkeando nunca almacena tus datos bancarios.',
  },
  {
    q: 'Que hago si el profesional no se presenta?',
    a: 'Puedes reportar una incidencia desde la seccion "Mis servicios". Las incidencias quedan registradas en el historial del profesional y pueden afectar su visibilidad en la plataforma.',
  },
  {
    q: 'Linkeando cobra comision?',
    a: 'No. Actualmente Linkeando no cobra comision por transaccion. El precio que acuerdas con el profesional es lo que pagas.',
  },
]

const FAQ_PROFESIONALES: FAQ[] = [
  {
    q: 'Como me registro como profesional?',
    a: 'Crea tu cuenta seleccionando "Profesional", elige tu especialidad principal y zona de trabajo. Despues podras agregar mas especialidades desde tu panel.',
  },
  {
    q: 'Como recibo solicitudes de trabajo?',
    a: 'Recibiras alertas cuando haya solicitudes en tu zona y especialidad. Tambien puedes explorar solicitudes abiertas desde tu panel y enviar propuestas.',
  },
  {
    q: 'Que es Premium y como funciona?',
    a: 'Premium es una suscripcion mensual que te da mayor visibilidad, badge destacado, y posicion prioritaria en las busquedas. Puedes activarlo desde tu panel en la seccion Premium.',
  },
  {
    q: 'Como me pagan los clientes?',
    a: 'Los clientes pueden pagarte directamente o a traves de Mercado Pago integrado en la plataforma. El dinero llega a tu cuenta de Mercado Pago sin comisiones de Linkeando.',
  },
  {
    q: 'Como mejoro mi calificacion?',
    a: 'Llega a tiempo, realiza un trabajo de calidad, y mantiene una buena comunicacion con el cliente. Las calificaciones son bidireccionales y publicas.',
  },
]

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed bg-white border-t border-gray-50">
          {faq.a}
        </div>
      )}
    </div>
  )
}

export default function AyudaPage() {
  const [tab, setTab] = useState<'cliente' | 'profesional'>('cliente')

  return (
    <div className="min-h-screen bg-fondo">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-verde-500 mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver al inicio
        </Link>

        {/* Header */}
        <div className="bg-verde-500 rounded-2xl px-6 py-8 text-center mb-6">
          <div className="text-3xl mb-2">💬</div>
          <h1 className="text-xl font-medium text-white">Centro de ayuda</h1>
          <p className="text-sm text-verde-200 mt-1">Resolvemos tus dudas sobre Linkeando</p>
        </div>

        {/* Como funciona */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Como funciona Linkeando</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: '1', icon: '📝', title: 'Publica o busca', desc: 'Los clientes publican lo que necesitan. Los profesionales exploran solicitudes.' },
              { n: '2', icon: '🤝', title: 'Conecta', desc: 'Revisa propuestas, chatea y acuerda precio y horario.' },
              { n: '3', icon: '⭐', title: 'Califica', desc: 'Despues del servicio, ambas partes se califican mutuamente.' },
            ].map((step) => (
              <div key={step.n} className="text-center p-4 rounded-xl bg-fondo">
                <div className="text-2xl mb-2">{step.icon}</div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preguntas frecuentes</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('cliente')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'cliente' ? 'bg-verde-500 text-white' : 'bg-fondo text-gray-500 hover:text-gray-700'}`}
            >
              Soy cliente
            </button>
            <button
              onClick={() => setTab('profesional')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'profesional' ? 'bg-pro-500 text-white' : 'bg-fondo text-gray-500 hover:text-gray-700'}`}
            >
              Soy profesional
            </button>
          </div>

          <div className="space-y-2">
            {(tab === 'cliente' ? FAQ_CLIENTES : FAQ_PROFESIONALES).map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contactanos</h2>
          <p className="text-sm text-gray-500 mb-4">
            Si no encontraste respuesta a tu pregunta, escribenos y te ayudamos.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:soporte@linkeando.co"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-verde-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-verde-50 flex items-center justify-center text-verde-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Correo electronico</p>
                <p className="text-xs text-gray-400">soporte@linkeando.co</p>
              </div>
            </a>
            <a
              href="https://wa.me/573000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-verde-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-verde-50 flex items-center justify-center text-verde-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">WhatsApp</p>
                <p className="text-xs text-gray-400">Respuesta en menos de 24 horas</p>
              </div>
            </a>
          </div>
        </div>

        {/* Links legales */}
        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-400">
          <Link href="/terminos" className="hover:text-verde-500 transition-colors">Terminos de uso</Link>
          <span>·</span>
          <Link href="/privacidad" className="hover:text-verde-500 transition-colors">Politica de privacidad</Link>
        </div>
      </div>
    </div>
  )
}
