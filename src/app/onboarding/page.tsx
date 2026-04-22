'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { completarOnboarding } from '@/app/actions/onboarding'

const SLIDES = [
  {
    emoji: '🔗',
    title: 'Conectamos personas con los mejores profesionales de tu zona',
    desc: 'Plomeros, electricistas, pintores, cerrajeros y más — verificados y cerca de ti.',
  },
  {
    emoji: '⚡',
    title: 'Publica en 2 minutos y recibe propuestas al instante',
    desc: 'Describe tu necesidad, elige al mejor profesional y gestiona todo desde tu celular.',
  },
  {
    emoji: '⭐',
    title: '¿Eres profesional? Consigue más clientes sin comisiones',
    desc: 'Regístrate gratis, define tu zona y empieza a recibir solicitudes hoy mismo.',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [pending, startTransition] = useTransition()

  const last = step === SLIDES.length - 1
  const s = SLIDES[step]!

  function finalizar(tipo: 'cliente' | 'profesional') {
    startTransition(async () => {
      const res = await completarOnboarding(tipo)
      if (res?.error) {
        alert(res.error)
        return
      }
      router.replace(tipo === 'profesional' ? '/panel' : '/inicio')
    })
  }

  function saltar() {
    router.replace('/inicio')
  }

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen">
        <div className="flex items-center justify-between pt-12 px-5">
          <Logo size={28} />
          <button
            onClick={saltar}
            className="text-[13px] font-semibold text-gray-500 hover:text-gray-700"
          >
            Saltar
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-[130px] h-[130px] rounded-[36px] bg-verde-500/10 flex items-center justify-center text-[60px] mb-8">
            {s.emoji}
          </div>
          <h2 className="text-[22px] font-extrabold text-gray-900 leading-snug mb-3.5 tracking-tight">
            {s.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
        </div>

        <div className="flex justify-center gap-2 pb-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Ir al paso ${i + 1}`}
              className="h-2 rounded transition-all"
              style={{
                width: i === step ? 28 : 8,
                background: i === step ? '#1D9E75' : '#e5e7eb',
              }}
            />
          ))}
        </div>

        <div className="px-6 pb-11 flex flex-col gap-2.5">
          {!last ? (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full py-3.5 bg-verde-500 hover:bg-verde-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Siguiente →
            </button>
          ) : (
            <>
              <button
                disabled={pending}
                onClick={() => finalizar('cliente')}
                className="w-full py-3.5 bg-verde-500 hover:bg-verde-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                🏠 Necesito un servicio
              </button>
              <button
                disabled={pending}
                onClick={() => finalizar('profesional')}
                className="w-full py-3.5 bg-pro-500 hover:bg-pro-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                🔧 Ofrezco mis servicios
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
