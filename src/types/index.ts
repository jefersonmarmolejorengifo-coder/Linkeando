export type Categoria =
  | 'cerrajeria'
  | 'chapas_electricas'
  | 'cerrajeria_automotriz'
  | 'plomeria'
  | 'electricidad'
  | 'pintura'
  | 'carpinteria'
  | 'limpieza'
  | 'jardineria'
  | 'albanileria'
  | 'aire_acondicionado'
  | 'gas'
  | 'techos'
  | 'soldadura'
  | 'muebles'
  | 'otros'

export type TipoUsuario = 'cliente' | 'profesional'

export type EstadoSolicitud = 'abierta' | 'en_proceso' | 'completada' | 'cancelada'

export type EstadoPostulacion = 'pendiente' | 'aceptada' | 'rechazada'

export type CierreTipo = 'satisfactorio' | 'cancel_cliente' | 'no_show' | 'pro_cancel'

export type Modalidad = 'puntual' | 'jornal' | 'hora' | 'destajo' | 'proyecto' | 'mixto' | 'hito' | 'semanal' | 'quincenal'

// ─── Tablas ──────────────────────────────────────────────────

export interface Usuario {
  id: string
  tipo: TipoUsuario
  nombre: string
  telefono?: string
  avatar_url?: string
  // Solo profesionales
  categoria?: Categoria
  descripcion?: string
  barrio?: string
  departamento?: string
  ciudad?: string
  tarifa?: number
  lat?: number
  lng?: number
  rating_promedio: number
  total_servicios: number
  onboarded?: boolean
  cedula?: string | null
  created_at: string
}

export interface Profesional {
  usuario_id: string
  bio?: string
  anos_experiencia: number
  disponible: boolean
  radio_km: number
  lat_base?: number
  lng_base?: number
  es_premium: boolean
  premium_hasta?: string
  total_incidencias: number
  negocio_fijo?: boolean
  negocio_direccion?: string | null
  negocio_descripcion?: string | null
  created_at: string
}

export interface ProEspecialidad {
  id: string
  profesional_id: string
  categoria: Categoria
  es_principal: boolean
  created_at: string
}

export interface ProZona {
  id: string
  profesional_id: string
  departamento: string
  ciudad: string
  barrio: string
  created_at: string
}

export interface Solicitud {
  id: string
  cliente_id: string
  categoria: Categoria
  titulo: string
  descripcion: string
  direccion: string
  barrio?: string
  lat?: number
  lng?: number
  presupuesto_max?: number
  estado: EstadoSolicitud
  sid?: string
  modalidad?: Modalidad
  cuando?: string
  urgente?: boolean
  foto_url?: string
  created_at: string
  updated_at: string
  // Joins opcionales
  cliente?: Usuario
}

export interface Postulacion {
  id: string
  solicitud_id: string
  profesional_id: string
  mensaje: string
  precio_propuesto?: number
  estado: EstadoPostulacion
  created_at: string
  // Joins opcionales
  profesional?: Usuario
  solicitud?: Solicitud
}

export interface Mensaje {
  id: string
  solicitud_id: string
  remitente_id: string
  destinatario_id: string
  contenido: string
  leido: boolean
  created_at: string
  tipo?: 'texto' | 'voz' | 'imagen'
  voz_url?: string | null
  voz_duracion?: number | null
  remitente?: Usuario
}

export interface ServicioCompletado {
  id: string
  solicitud_id: string
  postulacion_id: string
  cliente_id: string
  profesional_id: string
  monto_final?: number
  fecha_completado: string
  cierre_tipo?: CierreTipo
  sid?: string
  created_at: string
  // Joins opcionales
  solicitud?: Solicitud
  cliente?: Usuario
  profesional?: Usuario
}

export interface Calificacion {
  id: string
  servicio_completado_id: string
  calificador_id: string
  calificado_id: string
  puntuacion: 1 | 2 | 3 | 4 | 5
  comentario?: string
  created_at: string
}

export interface CalProfesional {
  id: string
  servicio_completado_id: string
  cliente_id: string
  profesional_id: string
  calidad: number
  precio: number
  oportunidad: number
  monto_mano_obra?: number
  comentario?: string
  created_at: string
}

export interface CalCliente {
  id: string
  servicio_completado_id: string
  profesional_id: string
  cliente_id: string
  pago_oportuno: number
  disponibilidad: number
  atencion: number
  comentario?: string
  created_at: string
}

export interface Incidencia {
  id: string
  servicio_completado_id?: string
  profesional_id: string
  tipo: 'no_show' | 'pro_cancel'
  reportado_por: string
  descripcion?: string
  created_at: string
}

export interface Suscripcion {
  id: string
  profesional_id: string
  plan: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  mp_preapproval_id?: string
  estado: 'activa' | 'cancelada' | 'vencida'
  monto: number
  fecha_inicio: string
  fecha_fin: string
  created_at: string
}

export interface Alerta {
  id: string
  usuario_id: string
  tipo: string
  titulo: string
  mensaje?: string
  leida: boolean
  referencia_id?: string
  referencia_tipo?: string
  created_at: string
}

// ─── Database helper (para tipado de Supabase) ───────────────

export interface Database {
  public: {
    Tables: {
      usuarios: { Row: Usuario; Insert: Omit<Usuario, 'rating_promedio' | 'total_servicios' | 'created_at'>; Update: Partial<Usuario> }
      profesionales: { Row: Profesional; Insert: Omit<Profesional, 'created_at'>; Update: Partial<Profesional> }
      pro_especialidades: { Row: ProEspecialidad; Insert: Omit<ProEspecialidad, 'id' | 'created_at'>; Update: Partial<ProEspecialidad> }
      pro_zonas: { Row: ProZona; Insert: Omit<ProZona, 'id' | 'created_at'>; Update: Partial<ProZona> }
      solicitudes: { Row: Solicitud; Insert: Omit<Solicitud, 'id' | 'estado' | 'created_at' | 'updated_at'>; Update: Partial<Solicitud> }
      postulaciones: { Row: Postulacion; Insert: Omit<Postulacion, 'id' | 'estado' | 'created_at'>; Update: Partial<Postulacion> }
      mensajes: { Row: Mensaje; Insert: Omit<Mensaje, 'id' | 'leido' | 'created_at'>; Update: Partial<Mensaje> }
      servicios_completados: { Row: ServicioCompletado; Insert: Omit<ServicioCompletado, 'id' | 'fecha_completado' | 'created_at'>; Update: Partial<ServicioCompletado> }
      calificaciones: { Row: Calificacion; Insert: Omit<Calificacion, 'id' | 'created_at'>; Update: never }
      cal_profesional: { Row: CalProfesional; Insert: Omit<CalProfesional, 'id' | 'created_at'>; Update: never }
      cal_cliente: { Row: CalCliente; Insert: Omit<CalCliente, 'id' | 'created_at'>; Update: never }
      incidencias: { Row: Incidencia; Insert: Omit<Incidencia, 'id' | 'created_at'>; Update: never }
      suscripciones: { Row: Suscripcion; Insert: Omit<Suscripcion, 'id' | 'created_at'>; Update: Partial<Suscripcion> }
      alertas: { Row: Alerta; Insert: Omit<Alerta, 'id' | 'created_at'>; Update: Partial<Alerta> }
    }
  }
}
