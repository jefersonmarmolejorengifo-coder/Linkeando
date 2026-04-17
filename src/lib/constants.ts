// ─── Categorías (14) ──────────────────────────────────────────
export const CATEGORIAS = [
  { key: 'cerrajeria',        icon: '🔑', label: 'Cerrajería' },
  { key: 'plomeria',          icon: '🔧', label: 'Plomería' },
  { key: 'electricidad',      icon: '⚡', label: 'Electricidad' },
  { key: 'pintura',           icon: '🎨', label: 'Pintura' },
  { key: 'albanileria',       icon: '🧱', label: 'Albañilería' },
  { key: 'carpinteria',       icon: '🪚', label: 'Carpintería' },
  { key: 'muebles',           icon: '🪑', label: 'Muebles' },
  { key: 'aire_acondicionado', icon: '❄️', label: 'Aire acondicionado' },
  { key: 'jardineria',        icon: '🌿', label: 'Jardinería' },
  { key: 'limpieza',          icon: '🧹', label: 'Limpieza' },
  { key: 'gas',               icon: '🔥', label: 'Gas / Gasfitería' },
  { key: 'techos',            icon: '🏠', label: 'Techos y cubiertas' },
  { key: 'soldadura',         icon: '⚙️', label: 'Soldadura' },
  { key: 'otros',             icon: '🛠️', label: 'Otros' },
] as const

export type CategoriaKey = (typeof CATEGORIAS)[number]['key']

export const CATEGORIA_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.key, c.label]),
)

// ─── Barrios de Cali ──────────────────────────────────────────
export const BARRIOS_CALI = [
  {
    zona: 'Norte',
    barrios: ['Granada', 'Chipichape', 'Versalles', 'Normandía', 'Los Álamos', 'El Bosque', 'Vipasa', 'Centenario', 'El Refugio'],
  },
  {
    zona: 'Centro',
    barrios: ['El Centro', 'San Nicolás', 'Alameda', 'La Flora', 'Galerías', 'Santa Rosa', 'El Calvario', 'San Pedro'],
  },
  {
    zona: 'Sur',
    barrios: ['Ciudad Jardín', 'El Peñón', 'San Fernando', 'Tequendama', 'El Ingenio', 'Meléndez', 'Pance', 'Lili', 'Caney', 'La Hacienda', 'Capri'],
  },
  {
    zona: 'Oriente',
    barrios: ['Aguablanca', 'Marroquín', 'El Diamante', 'Villanueva', 'Alfonso López', 'Floralia', 'El Poblado', 'Comuneros'],
  },
  {
    zona: 'Oeste / Ladera',
    barrios: ['Siloé', 'Terrón Colorado', 'Univalle', 'Manzanares', 'El Cortijo', 'Alto Menga', 'La Sultana'],
  },
]

// ─── Colores para avatares por categoría ──────────────────────
export const CATEGORIA_COLORS = [
  '#1D9E75', '#185FA5', '#7C3AED', '#B45309',
  '#0F766E', '#CA8A04', '#D85A30',
] as const

// ─── Password strength ───────────────────────────────────────
export const STRENGTH_COLORS = ['#F09595', '#EF9F27', '#97C459', '#1D9E75'] as const
export const STRENGTH_LABELS = ['Muy débil', 'Débil', 'Buena', 'Fuerte'] as const

// ─── Colores de marca ─────────────────────────────────────────
export const COLORS = {
  cliente: '#1D9E75',
  profesional: '#085041',
  premium: '#EF9F27',
  urgente: '#D85A30',
  verdeClaro: '#9FE1CB',
  verdeSuave: '#E1F5EE',
  fondo: '#f5f5f3',
  borde: '#e8e8e6',
} as const

// ─── Modalidades de pago (CST colombiano) ─────────────────────
export const MODALIDADES = [
  { key: 'puntual',    label: 'Servicio puntual' },
  { key: 'jornal',     label: 'Jornal (diario)' },
  { key: 'hora',       label: 'Por hora' },
  { key: 'destajo',    label: 'A destajo (por tarea)' },
  { key: 'proyecto',   label: 'Por proyecto' },
  { key: 'mixto',      label: 'Mixto (anticipo + saldo)' },
  { key: 'hito',       label: 'Por hitos' },
  { key: 'semanal',    label: 'Semanal' },
  { key: 'quincenal',  label: 'Quincenal' },
] as const

// ─── Planes Premium ───────────────────────────────────────────
export const PLANES_PREMIUM = [
  {
    key: 'mensual',
    label: 'Mensual',
    precio: 35000,
    precioLabel: '$35.000/mes',
    ahorro: null,
    url: 'https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=3b6309405ef64d858a0fa21d654e0e99',
  },
  {
    key: 'trimestral',
    label: 'Trimestral',
    precio: 95000,
    precioLabel: '$95.000/3 meses',
    ahorro: '$10.000',
    url: 'https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=594000f26a0747289ec8e531b9806e4e',
  },
  {
    key: 'semestral',
    label: 'Semestral',
    precio: 180000,
    precioLabel: '$180.000/6 meses',
    ahorro: '$30.000',
    url: 'https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=eabaa9e35783400aa668b3908a52031d',
  },
  {
    key: 'anual',
    label: 'Anual',
    precio: 300000,
    precioLabel: '$300.000/año',
    ahorro: '$120.000',
    url: 'https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=ee5d500b780a410eb019343bdc2e1027',
  },
] as const
