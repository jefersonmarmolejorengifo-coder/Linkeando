import Link from 'next/link'
import { registro } from '@/app/actions/auth'

export default function RegistroPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-verde-500">
            Linkeando
          </Link>
          <p className="mt-2 text-gray-500 text-sm">
            Crea tu cuenta — es gratis
          </p>
        </div>

        {/* Error */}
        {searchParams.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {decodeURIComponent(searchParams.error)}
          </div>
        )}

        <form action={registro} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">

          {/* Tipo de cuenta */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">¿Cómo quieres usar Linkeando?</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="tipo" value="cliente" className="peer sr-only" defaultChecked />
                <div className="border-2 border-gray-200 rounded-xl p-3 text-center transition-all peer-checked:border-verde-500 peer-checked:bg-verde-50">
                  <span className="text-2xl block mb-1">🔍</span>
                  <span className="text-sm font-semibold text-gray-700">Cliente</span>
                  <p className="text-xs text-gray-400 mt-0.5">Busco servicios</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="tipo" value="profesional" className="peer sr-only" id="tipo-profesional" />
                <div className="border-2 border-gray-200 rounded-xl p-3 text-center transition-all peer-checked:border-verde-500 peer-checked:bg-verde-50">
                  <span className="text-2xl block mb-1">🛠️</span>
                  <span className="text-sm font-semibold text-gray-700">Profesional</span>
                  <p className="text-xs text-gray-400 mt-0.5">Ofrezco servicios</p>
                </div>
              </label>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                name="nombre"
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                placeholder="Tu nombre"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                placeholder="tu@correo.com"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                name="telefono"
                type="tel"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                placeholder="310 000 0000"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>

          {/* Campos extra para profesional — visibles via JS */}
          <ProfessionalFields />

          <button
            type="submit"
            className="w-full bg-verde-500 hover:bg-verde-600 text-white py-2.5 rounded-xl font-semibold transition-colors mt-1"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-verde-500 font-medium hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  )
}

// Campos condicionales para profesional (controlados con JS del cliente)
function ProfessionalFields() {
  return (
    <div id="campos-profesional" className="flex flex-col gap-4 hidden">
      <hr className="border-gray-100" />
      <p className="text-sm font-semibold text-verde-600">Datos de tu oficio</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          name="categoria"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        >
          <option value="">Selecciona tu oficio</option>
          <option value="plomeria">Plomería</option>
          <option value="electricidad">Electricidad</option>
          <option value="carpinteria">Carpintería</option>
          <option value="pintura">Pintura</option>
          <option value="limpieza">Limpieza</option>
          <option value="jardineria">Jardinería</option>
          <option value="cerrajeria">Cerrajería</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barrio donde trabajas
        </label>
        <input
          name="barrio"
          type="text"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
          placeholder="Ej: El Peñón, Granada, Ciudad Jardín…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción de tu experiencia
        </label>
        <textarea
          name="descripcion"
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
          placeholder="Cuéntale a los clientes sobre tu experiencia…"
        />
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var radios = document.querySelectorAll('input[name="tipo"]');
              var campos = document.getElementById('campos-profesional');
              function toggle() {
                var checked = document.querySelector('input[name="tipo"]:checked');
                if (checked && checked.value === 'profesional') {
                  campos.classList.remove('hidden');
                } else {
                  campos.classList.add('hidden');
                }
              }
              radios.forEach(function(r) { r.addEventListener('change', toggle); });
            })();
          `,
        }}
      />
    </div>
  )
}
