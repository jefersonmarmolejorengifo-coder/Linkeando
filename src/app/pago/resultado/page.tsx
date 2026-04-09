import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { registrarResultadoPago } from '@/app/actions/pagos'

interface SearchParams {
  servicio_id?:   string
  payment_id?:    string  // MP envía este parámetro
  status?:        string  // approved | rejected | pending
  collection_id?: string  // alias de payment_id que MP también envía
}

export default async function PagoResultadoPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const servicio_id  = searchParams.servicio_id ?? ''
  const mp_payment_id = searchParams.payment_id ?? searchParams.collection_id ?? ''
  const mp_status    = searchParams.status ?? 'pending'

  // Registrar el resultado en Supabase si tenemos los datos
  if (servicio_id && mp_payment_id) {
    await registrarResultadoPago({ servicio_id, mp_payment_id, mp_status })
  }

  // Leer el registro de pago actualizado
  const { data: pago } = await supabase
    .from('pagos')
    .select('*, servicio:servicio_completado_id(solicitud_id, profesional:profesional_id(nombre))')
    .eq('servicio_completado_id', servicio_id)
    .maybeSingle()

  const aprobado  = mp_status === 'approved'
  const rechazado = mp_status === 'rejected' || mp_status === 'cancelled'
  const pendiente = !aprobado && !rechazado

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">

      {/* Ícono de estado */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
        aprobado  ? 'bg-green-50'  :
        rechazado ? 'bg-red-50'    :
                    'bg-yellow-50'
      }`}>
        {aprobado && (
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {rechazado && (
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {pendiente && (
          <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* Título */}
      <h1 className={`text-2xl font-bold mb-2 ${
        aprobado  ? 'text-green-700'  :
        rechazado ? 'text-red-600'    :
                    'text-yellow-700'
      }`}>
        {aprobado  ? '¡Pago aprobado!'     :
         rechazado ? 'Pago rechazado'      :
                     'Pago en revisión'}
      </h1>

      {/* Descripción */}
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        {aprobado && (
          <>
            Tu pago fue procesado exitosamente.{' '}
            {pago && `El profesional ${(pago.servicio as any)?.profesional?.nombre ?? ''} recibirá la notificación.`}
          </>
        )}
        {rechazado && 'El pago no pudo procesarse. Puedes intentarlo de nuevo o usar otro método de pago.'}
        {pendiente && 'El pago está siendo procesado por Mercado Pago. Te notificaremos cuando sea confirmado.'}
      </p>

      {/* Detalle del pago */}
      {pago && (
        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Monto</span>
            <span className="font-semibold text-gray-800">
              ${Number(pago.monto).toLocaleString('es-CO')} COP
            </span>
          </div>
          {mp_payment_id && (
            <div className="flex justify-between">
              <span className="text-gray-500">ID de pago</span>
              <span className="font-mono text-xs text-gray-600">{mp_payment_id}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Estado</span>
            <span className={`font-semibold ${
              aprobado  ? 'text-green-600'  :
              rechazado ? 'text-red-500'    :
                          'text-yellow-600'
            }`}>
              {aprobado  ? 'Aprobado'    :
               rechazado ? 'Rechazado'   :
                           'En revisión'}
            </span>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3">
        {rechazado && servicio_id && (
          <Link
            href={`/calificar/${servicio_id}`}
            className="w-full bg-[#009EE3] hover:bg-[#0088C7] text-white font-bold py-3 rounded-xl transition-colors"
          >
            Intentar de nuevo
          </Link>
        )}
        {(aprobado || pendiente) && pago && (
          <Link
            href={`/calificar/${servicio_id}`}
            className="w-full bg-verde-500 hover:bg-verde-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Ir a calificar el servicio
          </Link>
        )}
        <Link
          href="/solicitudes"
          className="w-full border border-gray-200 text-gray-600 hover:border-gray-300 font-medium py-3 rounded-xl transition-colors"
        >
          Mis solicitudes
        </Link>
      </div>

      {/* Leyenda */}
      <p className="text-xs text-gray-400 mt-6">
        Linkeando no almacena datos bancarios. El pago fue procesado directamente por Mercado Pago.
      </p>
    </div>
  )
}
