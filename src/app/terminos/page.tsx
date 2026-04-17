import Link from 'next/link'

export default function TerminosPage() {
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Terminos y Condiciones de Uso</h1>
          <p className="text-sm text-gray-400 mb-6">Ultima actualizacion: abril 2026</p>

          <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-800">1. Naturaleza del servicio</h2>
              <p>
                Linkeando es una plataforma digital de intermediacion que conecta a personas que necesitan
                servicios para el hogar (clientes) con profesionales independientes del oficio en la ciudad
                de Cali, Colombia. Linkeando <strong>no es empleador</strong> de los profesionales, ni
                garantiza la ejecucion de los servicios contratados entre las partes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">2. Registro y cuenta</h2>
              <p>
                Al crear una cuenta en Linkeando, el usuario declara ser mayor de 18 anos y que la
                informacion proporcionada es veridica. Cada persona puede tener una sola cuenta activa.
                El usuario es responsable de mantener la seguridad de sus credenciales de acceso.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">3. Responsabilidades del cliente</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Describir de manera clara y precisa el servicio que necesita.</li>
                <li>Proporcionar la direccion y condiciones reales del trabajo.</li>
                <li>Realizar el pago acordado al profesional una vez completado el servicio.</li>
                <li>Calificar al profesional de manera justa y objetiva.</li>
                <li>Reportar cualquier incidencia a traves de los canales de la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">4. Responsabilidades del profesional</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Mantener actualizada su informacion de perfil, especialidades y zona de cobertura.</li>
                <li>Cumplir con los compromisos de servicio aceptados a traves de la plataforma.</li>
                <li>Presentarse en el horario acordado con el cliente.</li>
                <li>Realizar el trabajo con calidad y profesionalismo.</li>
                <li>Fijar precios justos y transparentes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">5. Pagos y comisiones</h2>
              <p>
                Los pagos entre clientes y profesionales pueden realizarse directamente o a traves de
                Mercado Pago, integrado en la plataforma. <strong>Linkeando actualmente no cobra comision
                por transaccion</strong>. Los profesionales Premium pagan una suscripcion mensual para
                acceder a beneficios adicionales de visibilidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">6. Incidencias y cancelaciones</h2>
              <p>
                Si un profesional no se presenta o un cliente cancela sin aviso, la parte afectada puede
                reportar una incidencia. Las incidencias acumuladas pueden resultar en restricciones de
                la cuenta. Linkeando se reserva el derecho de suspender cuentas con comportamiento
                reiterado de incumplimiento.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">7. Calificaciones</h2>
              <p>
                El sistema de calificacion es bidireccional: clientes califican a profesionales y
                viceversa. Las calificaciones son publicas y no pueden eliminarse, salvo por contenido
                ofensivo o que viole las normas de la comunidad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">8. Propiedad intelectual</h2>
              <p>
                El nombre Linkeando, su logotipo, diseno y codigo fuente son propiedad de sus creadores.
                El contenido generado por los usuarios (descripciones, fotos, calificaciones) se licencia
                a Linkeando para su uso dentro de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">9. Proteccion de datos</h2>
              <p>
                El tratamiento de datos personales se rige por nuestra{' '}
                <Link href="/privacidad" className="text-verde-500 hover:underline">
                  Politica de Privacidad
                </Link>{' '}
                y por la Ley 1581 de 2012 de Proteccion de Datos Personales de Colombia.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">10. Modificaciones</h2>
              <p>
                Linkeando puede modificar estos terminos en cualquier momento. Los cambios se comunicaran
                a los usuarios registrados y entraran en vigencia desde su publicacion en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">11. Contacto</h2>
              <p>
                Para consultas sobre estos terminos, puedes escribirnos a{' '}
                <a href="mailto:soporte@linkeando.co" className="text-verde-500 hover:underline">
                  soporte@linkeando.co
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
