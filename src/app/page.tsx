'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { CATEGORIAS } from '@/lib/constants'
import Footer from '@/components/Footer'

type Rol = 'cliente' | 'profesional'

const LandingMap = dynamic(() => import('@/components/LandingMapClient'), {
  ssr: false,
  loading: () => <div className="h-60 bg-gray-100 animate-pulse" />,
})

/* ── SVG ─────────────────────────────────────────────────────── */
const LogoNav = () => (
  <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="22" r="15" fill="#1D9E75"/>
    <circle cx="32" cy="22" r="8.5" fill="#E1F5EE"/>
    <rect x="25.5" y="18.5" width="9.5" height="6" rx="3" fill="none" stroke="#1D9E75" strokeWidth="2.2"/>
    <rect x="29.5" y="20.5" width="9.5" height="6" rx="3" fill="none" stroke="#1D9E75" strokeWidth="2.2"/>
    <path d="M32 37 L25 28 Q32 31 39 28 Z" fill="#1D9E75"/>
    <circle cx="32" cy="49" r="2" fill="#9FE1CB" opacity="0.8"/>
    <circle cx="32" cy="49" r="4" fill="none" stroke="#9FE1CB" strokeWidth="1" opacity="0.5"/>
  </svg>
)

const LogoHero = () => (
  <svg width="68" height="68" viewBox="0 0 64 64" fill="none"
    style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.16))' }}>
    <circle cx="32" cy="22" r="15" fill="#fff" opacity="0.97"/>
    <circle cx="32" cy="22" r="8.5" fill="#1D9E75"/>
    <rect x="25.5" y="18.5" width="9.5" height="6" rx="3" fill="none" stroke="#fff" strokeWidth="2.2"/>
    <rect x="29.5" y="20.5" width="9.5" height="6" rx="3" fill="none" stroke="#fff" strokeWidth="2.2"/>
    <path d="M32 37 L25 28 Q32 31 39 28 Z" fill="#fff" opacity="0.97"/>
    <circle cx="32" cy="50" r="2.5" fill="#9FE1CB" opacity="0.7"/>
    <circle cx="32" cy="50" r="5" fill="none" stroke="#9FE1CB" strokeWidth="1" opacity="0.4"/>
    <circle cx="32" cy="50" r="7.5" fill="none" stroke="#9FE1CB" strokeWidth="0.5" opacity="0.2"/>
  </svg>
)

/* ── Datos ───────────────────────────────────────────────────── */
const PASOS_CLIENTE = [
  { n: 1, title: 'Publica lo que necesitas',   desc: 'Describe el trabajo, adjunta fotos y define tu presupuesto en menos de 2 minutos.' },
  { n: 2, title: 'Recibe postulaciones',        desc: 'Profesionales verificados cerca de ti se postulan. Revisa historial y calificación.' },
  { n: 3, title: 'Elige y agenda',              desc: 'Chatea, confirma el trabajo y gestiona el pago desde la app de forma segura.' },
]
const PASOS_PRO = [
  { n: 1, title: 'Crea tu perfil profesional',     desc: 'Sube tu foto, define tu especialidad, zona de cobertura y verifica tu identidad.' },
  { n: 2, title: 'Recibe alertas de trabajo',       desc: 'Te notificamos cada vez que haya una solicitud que se ajuste a tu perfil y tu zona.' },
  { n: 3, title: 'Postúlate y consigue clientes',   desc: 'Envía tu propuesta, chatea con el cliente y confirma el trabajo. Tú pones el precio.' },
]
const BENEFICIOS_CLIENTE = [
  { icon: '✅', title: 'Profesionales verificados',  desc: 'Cédula y antecedentes validados antes de aparecer en la plataforma.' },
  { icon: '⭐', title: 'Calificaciones reales',       desc: 'Lee lo que otros clientes opinan antes de elegir a quién contratar.' },
  { icon: '💬', title: 'Chat directo',                desc: 'Habla con el profesional, comparte fotos del problema y acuerda el precio.' },
  { icon: '🎁', title: 'Totalmente gratis',           desc: 'Sin comisiones, sin cobros ocultos. Usar Vinclu no te cuesta nada.' },
]
const BENEFICIOS_PRO = [
  { icon: '📍', title: 'Clientes cerca de ti',          desc: 'Solo ves solicitudes dentro de tu zona de cobertura. Sin desplazamientos innecesarios.' },
  { icon: '📊', title: 'Panel de ingresos',              desc: 'Visualiza tus ganancias, calificaciones y rendimiento mes a mes en tiempo real.' },
  { icon: '💳', title: 'Educación financiera',           desc: 'Aprende a gestionar tus ingresos y accede a créditos para materiales y capital de trabajo.' },
  { icon: '🚫', title: 'Sin comisiones por servicio',    desc: 'Lo que ganas es tuyo. Vinclu no cobra porcentaje por cada trabajo que realizas.' },
]
const TESTIMONIOS = [
  { nombre: 'Carolina M.', barrio: 'Ciudad Jardin', rol: 'cliente', texto: 'Necesitaba un plomero urgente un domingo y en 20 minutos ya tenia a alguien en camino. Excelente servicio.' },
  { nombre: 'Jorge A.', barrio: 'El Ingenio', rol: 'profesional', texto: 'Desde que me registre en Vinclu, consigo 3-4 trabajos nuevos por semana en mi zona. Sin pagar comision.' },
  { nombre: 'Maria F.', barrio: 'Granada', rol: 'cliente', texto: 'Me encanta poder ver las calificaciones antes de contratar. Da mucha confianza saber que otros ya probaron el servicio.' },
  { nombre: 'Andres R.', barrio: 'Siloe', rol: 'profesional', texto: 'El panel me ayuda a organizar mis trabajos y ver cuanto voy ganando. Es como tener un asistente.' },
]

const FEATS_CLIENTE = [
  'Publicaciones ilimitadas',
  'Chat con profesionales sin costo',
  'Historial de servicios siempre disponible',
  'Sin comisiones por servicio',
]
const FEATS_PRO = [
  'Perfil verificado visible en el mapa',
  'Alertas de trabajo según tu especialidad',
  'Panel de ingresos y calificaciones',
  'Sin comisiones por cada servicio realizado',
]

/* ── Página ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const [rol, setRol] = useState<Rol>('cliente')
  const esCliente = rol === 'cliente'
  const accent = esCliente ? '#1D9E75' : '#085041'

  return (
    <div className="min-h-screen bg-fondo text-[#1a1a1a]">

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-borde px-5 h-[52px] flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-2">
          <LogoNav />
          <span className="text-lg font-medium text-verde-500 tracking-tight">Vinclu</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/auth/login"
            className="px-3.5 py-1.5 border border-verde-500 text-verde-500 rounded-lg text-xs hover:bg-verde-50 transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/auth/registro"
            className="px-3.5 py-1.5 bg-verde-500 hover:bg-verde-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Regístrate
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        className="pt-[76px] pb-11 px-6 text-center relative overflow-hidden transition-colors duration-300"
        style={{ background: accent }}
      >
        {/* Curva inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-7 bg-fondo rounded-t-[28px]" />

        <div className="flex justify-center"><LogoHero /></div>
        <h1 className="text-[38px] font-medium text-white tracking-tight leading-none mt-3.5">
          Vinclu
        </h1>
        <p className="text-sm text-verde-200 mt-1.5 italic">
          El profesional correcto para tu necesidad
        </p>
        <p className="text-[13px] text-white/80 mt-3 leading-relaxed max-w-[300px] mx-auto min-h-[48px] transition-opacity duration-300">
          {esCliente
            ? 'Conectamos necesidades con soluciones a su medida — donde estés y cuando lo necesites.'
            : 'Tu próximo cliente está cerca. Regístrate y empieza a recibir solicitudes de trabajo en tu zona.'}
        </p>

        {/* Toggle rol */}
        <div
          className="flex rounded-xl p-1 gap-0 mt-4 max-w-[300px] mx-auto border"
          style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.18)' }}
        >
          <button
            onClick={() => setRol('cliente')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[9px] text-[13px] transition-all ${
              esCliente ? 'bg-white text-verde-500 font-medium' : 'text-white/70 hover:text-white'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Necesito un servicio
          </button>
          <button
            onClick={() => setRol('profesional')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[9px] text-[13px] transition-all ${
              !esCliente ? 'bg-white font-medium' : 'text-white/70 hover:text-white'
            }`}
            style={!esCliente ? { color: '#085041' } : {}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            Ofrezco mis servicios
          </button>
        </div>
      </div>

      {/* ── Buscador flotante ── */}
      <div className="mx-4 -mt-5 relative z-10">
        <div className="bg-white rounded-xl border border-borde px-3.5 py-3 flex items-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span className="flex-1 text-[13px] text-gray-400 transition-all">
            {esCliente ? '¿Qué oficio necesitas hoy?' : '¿En qué barrio trabajas?'}
          </span>
          <Link
            href={esCliente ? '/explorar' : '/auth/registro'}
            className="px-3.5 py-1.5 text-white text-xs font-medium rounded-lg whitespace-nowrap transition-colors hover:opacity-90"
            style={{ background: accent }}
          >
            {esCliente ? 'Buscar' : 'Registrarme'}
          </Link>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-[480px] mx-auto px-4 pt-5 pb-10 flex flex-col gap-[18px]">

        {/* Cards de rol */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setRol('cliente')}
            className={`rounded-xl border-[1.5px] p-4 text-center transition-all ${
              esCliente ? 'border-verde-500 bg-verde-50' : 'border-borde bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-[28px] mb-2">🏠</div>
            <h4 className={`text-[13px] font-medium mb-1 ${esCliente ? 'text-pro-500' : 'text-gray-900'}`}>
              Soy cliente
            </h4>
            <p className={`text-[11px] leading-snug ${esCliente ? 'text-[#0F6E56]' : 'text-gray-500'}`}>
              Necesito un profesional para mi hogar u oficina
            </p>
          </button>
          <button
            onClick={() => setRol('profesional')}
            className={`rounded-xl border-[1.5px] p-4 text-center transition-all ${
              !esCliente ? 'bg-verde-50' : 'border-borde bg-white hover:border-gray-300'
            }`}
            style={!esCliente ? { borderColor: '#085041' } : {}}
          >
            <div className="text-[28px] mb-2">🧰</div>
            <h4 className={`text-[13px] font-medium mb-1 ${!esCliente ? 'text-[#04342C]' : 'text-gray-900'}`}>
              Soy profesional
            </h4>
            <p className={`text-[11px] leading-snug ${!esCliente ? 'text-pro-500' : 'text-gray-500'}`}>
              Ofrezco mis servicios y quiero más clientes
            </p>
          </button>
        </div>

        {/* Pasos */}
        <div>
          <h3 className="text-sm font-medium mb-2.5">¿Cómo funciona para ti?</h3>
          <div className="flex flex-col gap-2">
            {(esCliente ? PASOS_CLIENTE : PASOS_PRO).map((paso) => (
              <div key={paso.n} className="bg-white rounded-xl border border-borde p-3.5 flex gap-3 items-start">
                <div
                  className="w-[26px] h-[26px] rounded-full text-[12px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#E1F5EE', color: accent }}
                >
                  {paso.n}
                </div>
                <div>
                  <h4 className="text-[13px] font-medium mb-0.5">{paso.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficios */}
        <div>
          <h3 className="text-sm font-medium mb-2.5">
            {esCliente ? '¿Por qué Vinclu?' : '¿Por qué unirte a Vinclu?'}
          </h3>
          <div className="flex flex-col gap-2">
            {(esCliente ? BENEFICIOS_CLIENTE : BENEFICIOS_PRO).map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-borde p-3.5 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] flex-shrink-0 bg-verde-50">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-[13px] font-medium mb-0.5">{b.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorías populares */}
        {esCliente && (
          <div>
            <h3 className="text-sm font-medium mb-2.5">Servicios disponibles</h3>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIAS.slice(0, 8).map((cat) => (
                <Link
                  key={cat.key}
                  href={`/explorar?cat=${cat.key}`}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-borde hover:border-verde-200 transition-colors"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] text-gray-500 text-center leading-tight">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Testimonios */}
        <div>
          <h3 className="text-sm font-medium mb-2.5">Lo que dicen en Cali</h3>
          <div className="flex flex-col gap-2">
            {TESTIMONIOS
              .filter((t) => esCliente ? true : t.rol === 'profesional')
              .slice(0, 3)
              .map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-borde p-3.5">
                <p className="text-[12px] text-gray-600 leading-relaxed mb-2.5 italic">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-verde-50 flex items-center justify-center text-[10px] font-medium text-verde-500">
                    {t.nombre.split(' ').map(p => p[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-gray-700">{t.nombre}</p>
                    <p className="text-[10px] text-gray-400">{t.barrio} · {t.rol === 'cliente' ? 'Cliente' : 'Profesional'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-xl border border-borde overflow-hidden">
          <div className="px-3.5 py-3 border-b border-[#f0f0ee]">
            <h3 className="text-[13px] font-medium mb-0.5">
              {esCliente ? 'Profesionales cerca de ti ahora' : 'Solicitudes activas en tu zona'}
            </h3>
            <p className="text-[11px] text-gray-400 leading-snug">
              {esCliente
                ? 'Cada punto es un profesional verificado y disponible en tu zona'
                : 'Así verías los trabajos disponibles cerca de ti al registrarte'}
            </p>
          </div>
          <LandingMap key={rol} tipo={rol} />
        </div>

        {/* Banner */}
        <div className="bg-verde-50 rounded-xl border border-verde-200 px-3.5 py-3 flex justify-between items-center">
          <div>
            <strong className="block text-[13px] font-medium text-pro-500 mb-0.5">
              {esCliente ? 'Ferretería El Constructor' : 'Bancamía · Microcrédito'}
            </strong>
            <span className="text-[11px] text-[#0F6E56]">
              {esCliente
                ? 'Materiales con descuento para tus proyectos'
                : 'Financia materiales y capital de trabajo'}
            </span>
          </div>
          <span className="text-[9px] text-[#0F6E56] bg-verde-200 px-2 py-1 rounded font-medium whitespace-nowrap self-start">
            Patrocinado
          </span>
        </div>

        {/* CTA */}
        <div
          className="rounded-xl p-[18px] transition-colors duration-300"
          style={{ background: accent }}
        >
          <h3 className="text-[16px] font-medium text-white mb-1.5 text-center">
            {esCliente ? 'Empieza gratis hoy' : 'Comienza a recibir clientes'}
          </h3>
          <p className="text-[12px] text-verde-200 leading-relaxed mb-4 text-center">
            {esCliente
              ? 'Crear tu cuenta no cuesta nada. Encuentra el profesional correcto para lo que necesitas.'
              : 'Regístrate gratis, crea tu perfil y empieza a recibir solicitudes hoy mismo en tu zona.'}
          </p>
          <div className="flex flex-col gap-1.5 mb-4">
            {(esCliente ? FEATS_CLIENTE : FEATS_PRO).map((f) => (
              <div key={f} className="text-[12px] text-verde-50 flex items-center gap-2">
                <span className="text-verde-200 text-[10px] flex-shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
          <div className="flex gap-2.5">
            <Link
              href="/auth/registro"
              className="flex-1 py-3 bg-white rounded-[10px] text-[13px] font-medium text-center transition-colors hover:bg-gray-50"
              style={{ color: accent }}
            >
              {esCliente ? 'Crear cuenta gratis' : 'Registrarme como profesional'}
            </Link>
            <Link
              href="/auth/login"
              className="flex-1 py-3 rounded-[10px] text-[13px] text-white text-center border border-white/30 hover:bg-white/20 transition-colors"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

      </div>

      <Footer />

    </div>
  )
}
