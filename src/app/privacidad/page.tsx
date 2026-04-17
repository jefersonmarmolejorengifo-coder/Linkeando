import Link from 'next/link'

export default function PrivacidadPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Politica de Privacidad</h1>
          <p className="text-sm text-gray-400 mb-6">Ultima actualizacion: abril 2026</p>

          <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-800">1. Responsable del tratamiento</h2>
              <p>
                Linkeando, con domicilio en la ciudad de Cali, Valle del Cauca, Colombia, es el
                responsable del tratamiento de los datos personales recopilados a traves de esta
                plataforma, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">2. Datos que recopilamos</h2>
              <p>Recopilamos los siguientes datos personales:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Datos de identificacion:</strong> nombre completo, correo electronico, numero de celular.</li>
                <li><strong>Datos de ubicacion:</strong> barrio, zona de trabajo, coordenadas GPS (solo profesionales que activan el mapa).</li>
                <li><strong>Datos profesionales:</strong> especialidad, tarifa, descripcion, experiencia.</li>
                <li><strong>Datos de uso:</strong> solicitudes publicadas, calificaciones, historial de chat, pagos realizados.</li>
                <li><strong>Datos tecnicos:</strong> direccion IP, tipo de navegador, dispositivo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">3. Finalidad del tratamiento</h2>
              <p>Los datos personales se utilizan para:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Crear y gestionar tu cuenta de usuario.</li>
                <li>Conectarte con profesionales o clientes segun tu necesidad.</li>
                <li>Procesar pagos a traves de Mercado Pago.</li>
                <li>Mostrar tu perfil publico a otros usuarios de la plataforma.</li>
                <li>Enviar notificaciones sobre solicitudes, propuestas y calificaciones.</li>
                <li>Mejorar la experiencia de usuario y la seguridad de la plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">4. Derechos del titular (ARCO)</h2>
              <p>
                De acuerdo con la Ley 1581 de 2012, como titular de los datos personales tienes derecho a:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Acceso:</strong> conocer que datos personales tenemos sobre ti.</li>
                <li><strong>Rectificacion:</strong> solicitar la correccion de datos inexactos o incompletos.</li>
                <li><strong>Cancelacion:</strong> solicitar la eliminacion de tus datos cuando ya no sean necesarios.</li>
                <li><strong>Oposicion:</strong> oponerte al tratamiento de tus datos para fines especificos.</li>
              </ul>
              <p>
                Para ejercer estos derechos, escribe a{' '}
                <a href="mailto:soporte@linkeando.co" className="text-verde-500 hover:underline">
                  soporte@linkeando.co
                </a>{' '}
                indicando tu nombre, correo registrado y el derecho que deseas ejercer.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">5. Compartir datos con terceros</h2>
              <p>
                Linkeando no vende ni comparte tus datos personales con terceros para fines comerciales.
                Los datos se comparten unicamente con:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Supabase:</strong> proveedor de base de datos y autenticacion.</li>
                <li><strong>Mercado Pago:</strong> procesamiento de pagos (solo datos necesarios para la transaccion).</li>
                <li><strong>Google:</strong> si eliges iniciar sesion con Google, se reciben nombre y correo de tu cuenta.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">6. Seguridad</h2>
              <p>
                Implementamos medidas tecnicas y organizativas para proteger tus datos: cifrado en
                transito (HTTPS), autenticacion segura, y politicas de acceso restringido a la base
                de datos. Linkeando nunca almacena datos bancarios — los pagos son procesados
                directamente por Mercado Pago.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">7. Conservacion de datos</h2>
              <p>
                Tus datos se conservan mientras tu cuenta este activa. Si solicitas la eliminacion de
                tu cuenta, tus datos seran eliminados en un plazo de 30 dias, salvo aquellos que debamos
                conservar por obligaciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">8. Cookies</h2>
              <p>
                Linkeando utiliza cookies esenciales para el funcionamiento de la sesion de usuario.
                No utilizamos cookies de seguimiento ni publicidad de terceros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">9. Modificaciones</h2>
              <p>
                Esta politica puede actualizarse periodicamente. Notificaremos cambios significativos
                a traves de la plataforma. La fecha de ultima actualizacion se indica al inicio del documento.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800">10. Contacto</h2>
              <p>
                Para consultas sobre el tratamiento de tus datos personales, escribenos a{' '}
                <a href="mailto:soporte@linkeando.co" className="text-verde-500 hover:underline">
                  soporte@linkeando.co
                </a>.
              </p>
              <p className="mt-2">
                Consulta tambien nuestros{' '}
                <Link href="/terminos" className="text-verde-500 hover:underline">
                  Terminos y Condiciones
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
