export type Categoria =
  | 'plomeria'
  | 'electricidad'
  | 'carpinteria'
  | 'pintura'
  | 'limpieza'
  | 'jardineria'
  | 'cerrajeria'
  | 'otros'

export type TipoUsuario = 'cliente' | 'profesional'

export type EstadoSolicitud = 'abierta' | 'en_proceso' | 'completada' | 'cancelada'

export type EstadoPostulacion = 'pendiente' | 'aceptada' | 'rechazada'

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
  tarifa?: number
  lat?: number
  lng?: number
  rating_promedio: number
  total_servicios: number
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
  // Joins opcionales
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

// ─── Database helper (para tipado de Supabase) ───────────────

export interface Database {
  public: {
    Tables: {
      usuarios: { Row: Usuario; Insert: Omit<Usuario, 'rating_promedio' | 'total_servicios' | 'created_at'>; Update: Partial<Usuario> }
      solicitudes: { Row: Solicitud; Insert: Omit<Solicitud, 'id' | 'estado' | 'created_at' | 'updated_at'>; Update: Partial<Solicitud> }
      postulaciones: { Row: Postulacion; Insert: Omit<Postulacion, 'id' | 'estado' | 'created_at'>; Update: Partial<Postulacion> }
      mensajes: { Row: Mensaje; Insert: Omit<Mensaje, 'id' | 'leido' | 'created_at'>; Update: Partial<Mensaje> }
      servicios_completados: { Row: ServicioCompletado; Insert: Omit<ServicioCompletado, 'id' | 'fecha_completado' | 'created_at'>; Update: Partial<ServicioCompletado> }
      calificaciones: { Row: Calificacion; Insert: Omit<Calificacion, 'id' | 'created_at'>; Update: never }
    }
  }
}
