'use client'

import { useRef, useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { actualizarPerfil } from '@/app/actions/perfil'
import { BARRIOS_POR_CIUDAD, CATEGORIA_LABELS } from '@/lib/constants'
import type { Usuario } from '@/types'

interface Departamento { id: number; name: string }
interface Ciudad { id: number; name: string }

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// Normaliza para comparar: sin acentos, minúsculas
function normalizarClave(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ── Botón de geolocalización (solo para profesionales) ────────
function GeoButton({
  latRef,
  lngRef,
  tieneUbicacion,
}: {
  latRef: React.RefObject<HTMLInputElement>
  lngRef: React.RefObject<HTMLInputElement>
  tieneUbicacion: boolean
}) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    tieneUbicacion ? 'ok' : 'idle',
  )

  function obtener() {
    if (!navigator?.geolocation) { setEstado('error'); return }
    setEstado('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (latRef.current) latRef.current.value = String(coords.latitude)
        if (lngRef.current) lngRef.current.value = String(coords.longitude)
        setEstado('ok')
      },
      () => setEstado('error'),
      { timeout: 8000 },
    )
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={obtener}
        disabled={estado === 'loading'}
        className="inline-flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:border-verde-400 hover:text-verde-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {estado === 'loading' ? 'Detectando…' : estado === 'ok' ? 'Actualizar ubicación' : 'Usar mi ubicación actual'}
      </button>
      {estado === 'ok' && (
        <span className="text-xs text-verde-600 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-verde-500" />
          Ubicación lista — guarda los cambios para publicarla
        </span>
      )}
      {estado === 'error' && (
        <span className="text-xs text-red-500">No se pudo obtener la ubicación del dispositivo</span>
      )}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-verde-500 hover:bg-verde-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium transition-colors"
    >
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}

export default function FormPerfil({ usuario, email }: { usuario: Usuario; email: string }) {
  const [state, formAction] = useFormState(actualizarPerfil, null)
  const esProfesional = usuario.tipo === 'profesional'
  const latRef = useRef<HTMLInputElement>(null)
  const lngRef = useRef<HTMLInputElement>(null)

  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [deptId, setDeptId] = useState<number | null>(null)
  const [deptNombre, setDeptNombre] = useState(usuario.departamento ?? '')
  const [ciudadNombre, setCiudadNombre] = useState(usuario.ciudad ?? '')
  const [barrio, setBarrio] = useState(usuario.barrio ?? '')
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [loadingCiudades, setLoadingCiudades] = useState(false)

  // Geocodificación por dirección
  const [direccion, setDireccion] = useState('')
  const [geocodificando, setGeocodificando] = useState(false)
  const [geoMsg, setGeoMsg] = useState<string | null>(null)

  // Cargar departamentos al montar
  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/Department')
      .then(r => r.json())
      .then((data: Departamento[]) => {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
        setDepartamentos(sorted)
        if (usuario.departamento) {
          const found = sorted.find(d =>
            normalizarClave(d.name) === normalizarClave(usuario.departamento!)
          )
          if (found) setDeptId(found.id)
        }
        setLoadingDepts(false)
      })
      .catch(() => setLoadingDepts(false))
  }, [])

  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    if (!deptId) { setCiudades([]); return }
    setLoadingCiudades(true)
    fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`)
      .then(r => r.json())
      .then((data: Ciudad[]) => {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
        setCiudades(sorted)
        setLoadingCiudades(false)
      })
      .catch(() => setLoadingCiudades(false))
  }, [deptId])

  // Geocodificación con debounce
  useEffect(() => {
    if (!direccion.trim() || direccion.length < 8) { setGeoMsg(null); return }
    const timer = setTimeout(() => geocodificarDireccion(direccion), 700)
    return () => clearTimeout(timer)
  }, [direccion, departamentos]) // departamentos como dep para no correr antes de que carguen

  async function geocodificarDireccion(dir: string) {
    if (!departamentos.length) return
    setGeocodificando(true)
    setGeoMsg(null)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dir)}&format=json&addressdetails=1&countrycodes=co&limit=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (!data.length) {
        setGeoMsg('No se encontró la dirección. Completa los campos manualmente.')
        setGeocodificando(false)
        return
      }

      const r = data[0]
      const addr = r.address ?? {}

      // Lat / Lng
      if (latRef.current) latRef.current.value = String(r.lat)
      if (lngRef.current) lngRef.current.value = String(r.lon)

      // Departamento
      const stateName: string = addr.state ?? addr.region ?? ''
      const foundDept = departamentos.find(d => normalizarClave(d.name) === normalizarClave(stateName))
      if (foundDept) {
        setDeptNombre(foundDept.name)
        setDeptId(foundDept.id)

        // Ciudades de ese departamento
        const citiesRes = await fetch(`https://api-colombia.com/api/v1/Department/${foundDept.id}/cities`)
        const citiesData: Ciudad[] = await citiesRes.json()
        const sortedCities = citiesData.sort((a, b) => a.name.localeCompare(b.name))
        setCiudades(sortedCities)

        // Ciudad
        const cityRaw: string = addr.city ?? addr.town ?? addr.municipality ?? addr.county ?? ''
        const foundCity = sortedCities.find(c => normalizarClave(c.name) === normalizarClave(cityRaw))
        const resolvedCity = foundCity ? foundCity.name : cityRaw.toUpperCase()
        setCiudadNombre(resolvedCity)

        // Barrio — solo sobreescribir si Nominatim devuelve algo concreto
        const barrioGeo: string = addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.city_district ?? ''
        if (barrioGeo) {
          setBarrio(barrioGeo)
        } else if (normalizarClave(resolvedCity) !== 'cali') {
          setBarrio(resolvedCity)
        }

        setGeoMsg('Ubicación detectada — revisa y ajusta si es necesario.')
      } else {
        setGeoMsg('Departamento no reconocido. Selecciónalo manualmente.')
      }
    } catch {
      setGeoMsg('Error al geocodificar. Completa los campos manualmente.')
    }
    setGeocodificando(false)
  }

  function handleDeptChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value
    const found = departamentos.find(d => d.name === name)
    setDeptNombre(name)
    setDeptId(found?.id ?? null)
    setCiudadNombre('')
    setBarrio('')
    setCiudades([])
  }

  function handleCiudadChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const name = e.target.value
    setCiudadNombre(name)
    if (normalizarClave(name) !== 'cali') {
      setBarrio(name)
    } else {
      setBarrio(usuario.barrio ?? '')
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Campos ocultos */}
      <input type="hidden" name="departamento" value={deptNombre} />
      <input type="hidden" name="ciudad" value={ciudadNombre} />
      <input type="hidden" name="barrio" value={barrio} />

      {/* Mensajes de servidor */}
      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-verde-50 border border-verde-200 text-verde-700 text-sm rounded-lg">
          ¡Perfil actualizado correctamente!
        </div>
      )}

      {/* Correo (solo lectura) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">El correo no se puede cambiar desde aquí.</p>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          name="nombre"
          type="text"
          required
          defaultValue={usuario.nombre}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          name="telefono"
          type="tel"
          defaultValue={usuario.telefono ?? ''}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
          placeholder="310 000 0000"
        />
      </div>

      {/* Dirección — helper de geocodificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <div className="relative">
          <input
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            placeholder="Ej: Cra 5 # 12-34, Cali, Colombia"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
          />
          {geocodificando && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verde-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
        </div>
        {geoMsg && (
          <p className={`text-xs mt-1 ${geoMsg.startsWith('Ubicación') ? 'text-verde-600' : 'text-gray-400'}`}>
            {geoMsg}
          </p>
        )}
        {!geoMsg && (
          <p className="text-xs text-gray-400 mt-1">
            Escribe tu dirección para rellenar automáticamente los campos de abajo.
          </p>
        )}
      </div>

      {/* Departamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Departamento
        </label>
        <select
          value={deptNombre}
          onChange={handleDeptChange}
          disabled={loadingDepts}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">{loadingDepts ? 'Cargando departamentos…' : 'Selecciona un departamento'}</option>
          {departamentos.map(d => (
            <option key={d.id} value={d.name}>{toTitleCase(d.name)}</option>
          ))}
        </select>
      </div>

      {/* Ciudad / Municipio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ciudad / Municipio
        </label>
        <select
          value={ciudadNombre}
          onChange={handleCiudadChange}
          disabled={!deptId || loadingCiudades}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {!deptId ? 'Primero selecciona un departamento' : loadingCiudades ? 'Cargando municipios…' : 'Selecciona una ciudad'}
          </option>
          {ciudades.map(c => (
            <option key={c.id} value={c.name}>{toTitleCase(c.name)}</option>
          ))}
        </select>
      </div>

      {/* Barrio — condicional según ciudad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {esProfesional ? 'Barrio donde trabajas' : 'Barrio'}
        </label>
        {(() => {
          const listaBarrios = ciudadNombre ? BARRIOS_POR_CIUDAD[normalizarClave(ciudadNombre)] : undefined
          if (listaBarrios) {
            return (
              <select
                value={barrio}
                onChange={e => setBarrio(e.target.value)}
                disabled={!ciudadNombre}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Selecciona tu barrio</option>
                {listaBarrios.map(({ zona, barrios: bs }) => (
                  <optgroup key={zona} label={`── ${zona}`}>
                    {bs.map((b: string) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )
          }
          if (!ciudadNombre) {
            return (
              <div className="flex items-center border border-gray-100 rounded-xl px-3 py-2.5 bg-gray-50">
                <span className="text-sm text-gray-400">Primero selecciona una ciudad</span>
              </div>
            )
          }
          return (
            <input
              type="text"
              value={barrio}
              onChange={e => setBarrio(e.target.value)}
              placeholder="Escribe tu barrio o sector"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          )
        })()}
      </div>

      {/* Campos exclusivos para profesional */}
      {esProfesional && (
        <>
          {/* Especialidad (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
              <span className="text-sm text-gray-700">
                {CATEGORIA_LABELS[usuario.categoria ?? ''] ?? usuario.categoria}
              </span>
              <span className="ml-auto text-xs text-gray-400">No editable</span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción y experiencia
            </label>
            <textarea
              name="descripcion"
              rows={4}
              defaultValue={usuario.descripcion ?? ''}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-verde-500 resize-none"
              placeholder="Cuéntale a los clientes sobre tu experiencia, años de trabajo, herramientas que usas…"
            />
          </div>

          {/* Ubicación en el mapa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación en el mapa
            </label>
            <input ref={latRef} type="hidden" name="lat" defaultValue={usuario.lat ?? ''} />
            <input ref={lngRef} type="hidden" name="lng" defaultValue={usuario.lng ?? ''} />
            <GeoButton
              latRef={latRef}
              lngRef={lngRef}
              tieneUbicacion={!!usuario.lat}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Tu posición aparecerá en el mapa de profesionales de Vinclu.
            </p>
          </div>
        </>
      )}

      <SubmitButton />
    </form>
  )
}
