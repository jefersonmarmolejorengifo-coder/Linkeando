import { z } from 'zod'

const trim = (max: number) =>
  z.string().transform(v => v.trim()).pipe(z.string().max(max))

const nullableTrim = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform(v => {
      if (v === null || v === undefined) return null
      const t = v.trim()
      return t.length === 0 ? null : t
    })
    .pipe(z.string().max(max).nullable())

export const categoriaEnum = z.enum([
  'plomeria',
  'electricidad',
  'pintura',
  'cerrajeria',
  'albanileria',
  'muebles',
  'aire',
  'jardineria',
  'limpieza',
  'gas',
  'techos',
  'soldadura',
])

export const cuandoEnum = z.enum(['ahora', 'hoy', 'manana', 'semana'])

export const perfilSchema = z.object({
  nombre: trim(80).pipe(z.string().min(2, 'El nombre es muy corto.')),
  telefono: z
    .union([z.string(), z.null(), z.undefined()])
    .transform(v => (v ? v.trim() : null))
    .pipe(
      z
        .string()
        .regex(/^\+?[0-9\s-]{7,15}$/, 'Teléfono inválido.')
        .nullable(),
    ),
  barrio: nullableTrim(60),
  departamento: nullableTrim(60),
  ciudad: nullableTrim(60),
  descripcion: nullableTrim(500),
  lat: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(v => (v === null || v === undefined || v === '' ? undefined : Number(v)))
    .pipe(z.number().min(-90).max(90).optional()),
  lng: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(v => (v === null || v === undefined || v === '' ? undefined : Number(v)))
    .pipe(z.number().min(-180).max(180).optional()),
})

export const solicitudSchema = z.object({
  categoria: categoriaEnum,
  descripcion: trim(1000).pipe(z.string().min(10, 'Describe tu necesidad.')),
  barrio: trim(60),
  direccion: nullableTrim(160),
  presupuesto_max: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(v => (v === null || v === undefined || v === '' ? null : Number(v)))
    .pipe(z.number().int().positive().max(50_000_000).nullable()),
  urgente: z
    .union([z.string(), z.boolean(), z.null(), z.undefined()])
    .transform(v => v === true || v === 'true' || v === 'on' || v === '1'),
  cuando: cuandoEnum,
})

export const postulacionSchema = z.object({
  solicitud_id: z.string().uuid(),
  mensaje: trim(500).pipe(z.string().min(5)),
  precio_propuesto: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(v => (v === null || v === undefined || v === '' ? null : Number(v)))
    .pipe(z.number().int().positive().max(50_000_000).nullable()),
  voz_url: nullableTrim(200),
  voz_duracion: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform(v => (v === null || v === undefined || v === '' ? null : Number(v)))
    .pipe(z.number().int().min(1).max(300).nullable()),
})

export const calificacionSchema = z.object({
  servicio_id: z.string().uuid(),
  calidad: z.coerce.number().int().min(1).max(5),
  precio: z.coerce.number().int().min(1).max(5),
  oportunidad: z.coerce.number().int().min(1).max(5),
  monto_mano_obra: z.coerce
    .number({ message: 'Ingresa el costo de mano de obra.' })
    .int()
    .positive('El costo debe ser mayor a 0.')
    .max(50_000_000),
  comentario: nullableTrim(1000),
})

export const mensajeTextoSchema = z.object({
  solicitud_id: z.string().uuid(),
  texto: trim(1000).pipe(z.string().min(1)),
})

export const mensajeVozSchema = z.object({
  solicitud_id: z.string().uuid(),
  voz_url: z.string().min(5).max(200),
  voz_duracion: z.coerce.number().int().min(1).max(300),
})

export const suscripcionSchema = z.object({
  plan: z.enum(['mensual', 'trimestral', 'semestral', 'anual']),
})

export const incidenciaSchema = z.object({
  servicio_id: z.string().uuid(),
  tipo: z.enum(['calidad', 'cobro', 'incumplimiento', 'comportamiento', 'otro']),
  descripcion: trim(1000).pipe(z.string().min(10)),
})

export const cedulaSchema = z
  .string()
  .regex(/^[0-9]{5,15}$/, 'Cédula inválida.')

export type PerfilInput = z.infer<typeof perfilSchema>
export type SolicitudInput = z.infer<typeof solicitudSchema>
export type CalificacionInput = z.infer<typeof calificacionSchema>
export type PostulacionInput = z.infer<typeof postulacionSchema>

export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos.'
}
