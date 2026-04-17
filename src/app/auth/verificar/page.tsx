'use client'

import { useRef, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function VerificarPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const celular = searchParams.get('celular') ?? ''
  const rol = searchParams.get('rol') ?? 'cliente'

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      handleVerify(pasted)
    }
  }

  async function handleVerify(otp: string) {
    setVerifying(true)
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      phone: celular,
      token: otp,
      type: 'sms',
    })

    if (error) {
      setError('Código incorrecto o expirado. Intenta de nuevo.')
      setVerifying(false)
      return
    }

    router.push(rol === 'profesional' ? '/panel' : '/inicio')
  }

  async function handleResend() {
    if (resendTimer > 0) return
    const supabase = createClient()
    await supabase.auth.signInWithOtp({ phone: celular })
    setResendTimer(60)
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-gray-100">
        <div className="bg-verde-500 px-6 pt-8 pb-6 text-center">
          <div className="text-3xl mb-2">📱</div>
          <h1 className="text-xl font-medium text-white">Verificar celular</h1>
          <p className="text-[13px] text-verde-200 mt-1">
            Ingresa el código de 6 dígitos enviado a
          </p>
          <p className="text-[14px] text-white font-medium mt-0.5">{celular || '***'}</p>
        </div>

        <div className="bg-white px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* 6 cajas de código */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={verifying}
                className="w-12 h-14 text-center text-xl font-medium border-2 border-gray-200 rounded-xl focus:outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-500/20 transition-colors disabled:opacity-50"
              />
            ))}
          </div>

          {verifying && (
            <div className="text-center text-sm text-verde-500 mb-4">Verificando...</div>
          )}

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="text-sm text-verde-500 hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {resendTimer > 0
                ? `Reenviar código en ${resendTimer}s`
                : 'Reenviar código'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
