// ─── Categorías / Especialidades (14) ─────────────────────────
export const CATEGORIAS = [
  { key: 'cerrajeria',            icon: '🔑', label: 'Cerrajería' },
  { key: 'chapas_electricas',     icon: '🔒', label: 'Chapas eléctricas' },
  { key: 'cerrajeria_automotriz', icon: '🚗', label: 'Cerrajería automotriz' },
  { key: 'plomeria',              icon: '🔧', label: 'Plomería' },
  { key: 'electricidad',          icon: '⚡', label: 'Electricidad' },
  { key: 'pintura',               icon: '🎨', label: 'Pintura' },
  { key: 'albanileria',           icon: '🧱', label: 'Albañilería' },
  { key: 'muebles',               icon: '🪑', label: 'Instalación de muebles' },
  { key: 'aire_acondicionado',    icon: '❄️', label: 'Aire acondicionado' },
  { key: 'jardineria',            icon: '🌿', label: 'Jardinería' },
  { key: 'limpieza',              icon: '🧹', label: 'Limpieza profunda' },
  { key: 'gas',                   icon: '🔥', label: 'Gas / Gasfitería' },
  { key: 'techos',                icon: '🏠', label: 'Techos y cubiertas' },
  { key: 'soldadura',             icon: '⚙️', label: 'Soldadura' },
] as const

export type CategoriaKey = (typeof CATEGORIAS)[number]['key']

export const CATEGORIA_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.key, c.label]),
)

// ─── Barrios de Cali (lista completa por zona) ───────────────
export const BARRIOS_CALI = [
  {
    zona: 'Norte',
    barrios: [
      'Granada', 'San Vicente', 'Versalles', 'Normandía', 'Vipasa', 'Chipichape',
      'Los Álamos', 'El Bosque', 'El Refugio', 'Centenario', 'La Merced', 'Champagnat',
      'Mariano Ramos', 'La Flora', 'Arboleda', 'Floresta', 'Camilo Torres', 'Jorge Robledo',
      'La Campiña', 'Alcázares', 'El Troncal', 'Porvenir', 'La Riviera', 'Bello Horizonte',
      'Panorama', 'Olaya Herrera', 'Alfonso López Norte', 'Julio Rincón', 'Capri Norte',
      'Habitación', 'Los Naranjos', 'El Guabal',
    ],
  },
  {
    zona: 'Centro',
    barrios: [
      'El Centro', 'San Nicolás', 'Alameda', 'Galerías', 'Santa Rosa', 'San Pedro',
      'San Juan Bosco', 'El Calvario', 'Junín', 'Bretaña', 'Cañaverales', 'Municipal',
      'Sucre', 'San Cayetano', 'La Esmeralda', 'El Templete', 'Alfonso López Centro',
      'Benjamín Herrera', 'La Base', 'San Judas', 'Cristóbal Colón', 'Granada Centro',
    ],
  },
  {
    zona: 'Sur',
    barrios: [
      'Ciudad Jardín', 'El Peñón', 'San Fernando Viejo', 'San Fernando Nuevo',
      'Tequendama', 'Miraflores', 'El Ingenio I', 'El Ingenio II', 'Meléndez',
      'La Hacienda', 'Capri', 'Lili', 'Pance', 'El Caney', 'La Sirena',
      'Colseguros', 'El Cedro', 'Quintas de Don Simón', 'Santa Anita', 'Prados del Sur',
      'Portales de Valle', 'Calipso', 'Nápoles Sur', 'Ciudadela Comfandi',
      'Unidad Deportiva', 'Pasoancho', 'La Selva', 'Ciudad Capri', 'Los Portales',
      'Napoles', 'El Limonar', 'Urbanización Caldas',
    ],
  },
  {
    zona: 'Oriente',
    barrios: [
      'Aguablanca', 'Marroquín I', 'Marroquín II', 'El Diamante I', 'El Diamante II',
      'Villanueva', 'Alfonso López', 'Floralia', 'El Poblado I', 'El Poblado II',
      'Comuneros I', 'Comuneros II', 'Mojica', 'Manuela Beltrán', 'El Pondaje',
      'Charco Azul', 'Petecuy I', 'Petecuy II', 'Petecuy III', 'Sardi',
      'Julia Palacios', 'Laureano Gómez', 'Calimío', 'El Vallado', 'Alirio Mora Borrero',
      'Omar Torrijos', 'Rodrigo Lara Bonilla', 'Palmas I', 'Palmas II',
    ],
  },
  {
    zona: 'Ladera / Oeste',
    barrios: [
      'Siloé', 'Terrón Colorado', 'La Sultana', 'El Cortijo', 'Alto Menga',
      'Manzanares', 'El Rodeo', 'Belisario Caicedo', 'Nápoles Ladera', 'Jorge Zawadzky',
      'Polvorines', 'Lleras Camargo', 'Ospina Pérez', 'Los Chorros', 'Las Orquídeas',
      'Univalle', 'Alto Nápoles', 'La Choclona', 'San Luis Gonzaga', 'Bello Horizonte Ladera',
    ],
  },
]

// ─── Barrios por ciudad (todas las ciudades principales) ──────
type BarrioZona = { zona: string; barrios: string[] }

export const BARRIOS_POR_CIUDAD: Record<string, BarrioZona[]> = {
  // ── Valle del Cauca ──
  'cali': BARRIOS_CALI,
  'palmira': [
    { zona: 'Centro', barrios: ['El Centro', 'Obrero', 'Fray Luis Amigó', 'Champagnat', 'Lleras', 'El Bosque', 'Uribe Uribe', 'San Pedro', 'Alameda', 'La Esmeralda'] },
    { zona: 'Norte', barrios: ['El Paraíso', 'La Emilia', 'Recreo', 'Boyacá', 'Colombia', 'La Umbría', 'Ciudad Jardín'] },
    { zona: 'Sur', barrios: ['Portales', 'El Jardín', 'Villa Nueva', 'Las Américas', 'El Prado', 'El Bosque Sur', 'El Limonar', 'San Luis'] },
    { zona: 'Oriente', barrios: ['El Triunfo', 'Jorge Eliécer Gaitán', 'Las Palmas', 'La Paz', 'Miraflores', 'El Vergel'] },
  ],
  'buenaventura': [
    { zona: 'Isla Cascajal', barrios: ['El Centro', 'La Playita', 'Guayabal', 'Lleras', 'San Francisco', 'El Cristal', 'Miramar', 'Santa Fe', 'La Inmaculada', 'El Jardín'] },
    { zona: 'Continente Norte', barrios: ['Independencia', 'Urb. Vásquez', 'Pueblo Nuevo', 'Firme Galindo', 'Nuevos Horizontes', 'Miramar Norte', 'La Colonia'] },
    { zona: 'Continente Sur', barrios: ['Alfonso López', 'Córdoba', 'El Paraíso', 'Nayita', 'La Pilota', 'Las Palmas', 'Alberto Lleras'] },
  ],
  'tulua': [
    { zona: 'Centro', barrios: ['El Centro', 'El Cucho', 'Gaitán', 'La Inmaculada', 'Venecia', 'Fátima', 'San Luis'] },
    { zona: 'Norte', barrios: ['El Jardín', 'La Viga', 'Villa del Pilar', 'Nuevo Milenio', 'Laureles', 'La Paz'] },
    { zona: 'Sur', barrios: ['El Bosque', 'El Triunfo', 'Las Acacias', 'Villa del Río', 'La Pradera', 'Cañasgordas'] },
  ],
  'cartago': [
    { zona: 'Centro', barrios: ['El Centro', 'La Libertad', 'San Jerónimo', 'Fátima', 'El Jardín', 'Guadalupe'] },
    { zona: 'Norte y Sur', barrios: ['El Bosque', 'La Aurora', 'El Triunfo', 'San Martín', 'Nuevo Cartago', 'Alfonso López', 'Las Brisas'] },
  ],
  'guadalajara de buga': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'San Pedro', 'Las Mercedes', 'Guadalupe', 'El Jardín', 'Los Álamos', 'Villa del Lago', 'Santa Bárbara', 'El Paraíso', 'La Concordia', 'Alfonso Bonilla', 'El Progreso'] },
  ],
  'yumbo': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'La Salud', 'Alfonso López', 'El Dorado', 'Las Américas', 'La Independencia', 'Villa del Prado', 'El Carmelo', 'San Marcos', 'San Isidro'] },
  ],
  'jamundi': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'La Libertad', 'El Vergel', 'Villa del Sol', 'San Antonio', 'El Porvenir', 'Ciudadela Comfaicauca', 'El Bosque', 'Los Cerezos', 'La Unión'] },
  ],
  'florida': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'El Paraíso', 'El Jardín', 'La Independencia', 'Alfonso López', 'La Paz', 'Nuevo Florida', 'El Poblado'] },
  ],
  'pradera': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'El Jardín', 'La Libertad', 'La Unión', 'El Porvenir', 'Alfonso López', 'La Candelaria'] },
  ],
  'candelaria': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'San Joaquín', 'El Jardín', 'La Esperanza', 'Cauca Seco', 'Puerto Tejada'] },
  ],
  // ── Bogotá ──
  'bogota': [
    { zona: 'Usaquén', barrios: ['Usaquén', 'Santa Bárbara', 'La Uribe', 'Country Club', 'Cedritos', 'Toberín', 'La Cita', 'Los Cedros', 'Verbenal', 'San Cristóbal Norte'] },
    { zona: 'Chapinero', barrios: ['Chapinero', 'El Refugio', 'La Cabrera', 'Chicó', 'Quinta Camacho', 'Rosales', 'Marly', 'La Salle', 'Sucre', 'San Isidro'] },
    { zona: 'Santa Fe y La Candelaria', barrios: ['La Candelaria', 'Santa Fe', 'Las Cruces', 'La Concordia', 'Egipto', 'La Perseverancia'] },
    { zona: 'San Cristóbal', barrios: ['20 de Julio', 'La Victoria', 'San Blas', 'Altamira', 'La Gloria', 'Los Libertadores', 'Ramajal', 'El Triángulo'] },
    { zona: 'Usme', barrios: ['Usme Centro', 'La Flora', 'El Bosque', 'Alfonso López', 'La Marichuela', 'La Fiscala'] },
    { zona: 'Tunjuelito', barrios: ['Tunjuelito', 'San Benito', 'El Tunal', 'Abraham Lincoln', 'Venecia', 'Fátima'] },
    { zona: 'Bosa', barrios: ['Bosa Central', 'El Porvenir', 'San Pablo', 'San José', 'La Estación', 'Primavera'] },
    { zona: 'Kennedy', barrios: ['Kennedy', 'Timiza', 'Castilla', 'Las Américas', 'Patio Bonito', 'Gran Britalia', 'Villa Alsacia', 'Carvajal', 'El Tintal'] },
    { zona: 'Fontibón', barrios: ['Fontibón', 'Modelia', 'Granjas de Techo', 'Ciudad Salitre', 'Capellanía', 'El Recuerdo', 'Villemar'] },
    { zona: 'Engativá', barrios: ['Engativá', 'Bolivia', 'La Floresta', 'Garcés Navas', 'Minuto de Dios', 'El Encanto', 'Boyacá Real', 'Santa Cecilia', 'Los Álamos'] },
    { zona: 'Suba', barrios: ['Suba', 'Niza', 'La Alambra', 'Britalia', 'El Prado', 'Rincón', 'Casablanca', 'Lisboa', 'Tibabuyes'] },
    { zona: 'Barrios Unidos', barrios: ['Doce de Octubre', 'Los Alcázares', 'Colombia', 'La Paz', 'Siete de Agosto', 'Chapinero Norte'] },
    { zona: 'Teusaquillo', barrios: ['Teusaquillo', 'Palermo', 'Marsella', 'La Soledad', 'Galerías', 'Armenia', 'Sta. Teresita'] },
    { zona: 'Puente Aranda', barrios: ['Puente Aranda', 'Muzú', 'San Rafael', 'Pensilvania', 'Montecarlo', 'Ciudad Montes'] },
    { zona: 'Rafael Uribe Uribe', barrios: ['Quiroga', 'Marco Fidel Suárez', 'Marruecos', 'Diana Turbay', 'Los Libertadores', 'Sosiego'] },
    { zona: 'Ciudad Bolívar', barrios: ['El Tesoro', 'Arborizadora', 'La Sierra', 'Jerusalem', 'Lucero', 'Vista Hermosa', 'Ismael Perdomo'] },
  ],
  // ── Medellín ──
  'medellin': [
    { zona: 'El Poblado / Envigado', barrios: ['El Poblado', 'Patio Bonito', 'Los Balsos', 'La Florida', 'Alejandría', 'El Diamante', 'Envigado Centro', 'Loma de Los Bernal', 'La Aguacatala'] },
    { zona: 'Laureles / Estadio', barrios: ['Laureles', 'Los Conquistadores', 'Estadio', 'Belén', 'La América', 'San Javier', 'El Velodromo', 'Suramericana'] },
    { zona: 'Robledo / Castilla', barrios: ['Robledo', 'Castilla', 'Doce de Octubre', 'La Esperanza', 'Nuevos Conquistadores', 'El Pesebre', 'Florencia'] },
    { zona: 'Aranjuez / Manrique', barrios: ['Aranjuez', 'Manrique', 'La Cruz', 'El Jardín', 'Santa Cruz', 'Popular', 'La Salle'] },
    { zona: 'El Centro', barrios: ['La Candelaria', 'El Chagualo', 'Colón', 'Jesús Nazareno', 'San Benito', 'Barrio Triste', 'Boston'] },
    { zona: 'Guayabal / Belén', barrios: ['Guayabal', 'Belén Rincón', 'Belén Los Alpes', 'Belén Rosales', 'Belén Miravalle', 'Fátima', 'Nutibara'] },
    { zona: 'Norte (Bello / Copacabana)', barrios: ['Bello Centro', 'Niquía', 'Zamora', 'Copacabana', 'La Campiña', 'Polo Club'] },
    { zona: 'Sur (Sabaneta / Itagüí)', barrios: ['Itagüí Centro', 'Sabaneta', 'Santa María', 'Los Naranjos', 'La Paz', 'El Rosario'] },
  ],
  // ── Barranquilla ──
  'barranquilla': [
    { zona: 'Norte / Riomar', barrios: ['El Prado', 'Alto Prado', 'Villa Santos', 'Riomar', 'La Castellana', 'Los Nogales', 'El Golf', 'La Floresta', 'Altos del Limón'] },
    { zona: 'Centro', barrios: ['Centro Histórico', 'Boston', 'Manga', 'La Concepción', 'El Rosario', 'San Roque', 'Barranquillita'] },
    { zona: 'Sur', barrios: ['Lucero', 'Ciudad Jardín', 'Las Nieves', 'La Pradera', 'Ciudadela 20 de Julio', 'Los Alpes', 'Las Américas'] },
    { zona: 'Occidente', barrios: ['El Silencio', 'La Esmeralda', 'Los Pinos', 'Buena Vista', 'Carrizal', 'La Sierrita', 'El Recreo'] },
    { zona: 'Suroccidente', barrios: ['Villanueva', 'San José', 'La Unión', 'Los Girasoles', 'El Pueblo', 'Rebolo', 'Las Flores'] },
  ],
  // ── Cartagena ──
  'cartagena de indias': [
    { zona: 'Centro Histórico', barrios: ['Centro Histórico', 'Getsemaní', 'La Matuna', 'San Diego', 'Manga', 'Pie de la Popa'] },
    { zona: 'Norte / Turístico', barrios: ['Bocagrande', 'El Laguito', 'Castillogrande', 'Marbella', 'Crespo', 'La Boquilla'] },
    { zona: 'Sur / Suroccidente', barrios: ['Olaya Herrera', 'Blas de Lezo', 'San Fernando', 'Villa Estrella', 'Amberes', 'El Socorro'] },
    { zona: 'Noroccidente', barrios: ['Torices', 'España', 'Chiquinquirá', 'La Esperanza', 'Daniel Lemaitre', 'El Pozón'] },
  ],
  // ── Eje Cafetero ──
  'manizales': [
    { zona: 'Centro y Occidente', barrios: ['El Centro', 'Versalles', 'Los Cedros', 'Chipre', 'Palermo', 'La Estrella', 'El Cable', 'San Sebastián'] },
    { zona: 'Norte', barrios: ['La Enea', 'El Bosque', 'San Cayetano', 'Campohermoso', 'Villa María', 'Belén'] },
    { zona: 'Sur', barrios: ['Aranjuez', 'La Sultana', 'Río Claro', 'El Jardín', 'La Linda', 'Solferino', 'Comuneros'] },
  ],
  'pereira': [
    { zona: 'Centro', barrios: ['El Centro', 'El Lago', 'San Judas', 'Villavicencio', 'La Julita', 'El Oso'] },
    { zona: 'Sur / Cuba', barrios: ['Cuba', 'El Poblado', 'Laureles', 'San Mateo', 'El Jardín', 'Cedritos', 'Villa del Prado'] },
    { zona: 'Norte / Álamos', barrios: ['Álamos', 'Belmonte', 'La Circunvalar', 'San Nicolás', 'Pinares', 'El Bosque'] },
    { zona: 'Dosquebradas', barrios: ['Dosquebradas Centro', 'La Romelia', 'Mirador', 'El Balso', 'La Badea', 'La Pradera'] },
  ],
  'armenia': [
    { zona: 'Centro', barrios: ['El Centro', 'Centenario', 'La Pradera', 'San José', 'Los Álamos'] },
    { zona: 'Norte', barrios: ['El Bosque', 'La Clarita', 'Autocasa', 'El Cafetal', 'Nuevo Armenia'] },
    { zona: 'Sur', barrios: ['El Caimo', 'Los Quindos', 'El Recreo', 'San Judas', 'Pinares del Río'] },
  ],
  // ── Santander ──
  'bucaramanga': [
    { zona: 'Centro', barrios: ['El Centro', 'Cabecera del Llano', 'Quinta Paredes', 'La Victoria', 'Los Andes', 'Mejoras Públicas'] },
    { zona: 'Norte', barrios: ['El Refugio', 'La Aurora', 'San Alonso', 'Lagos', 'Sotomayor', 'Provenza', 'Terrazas'] },
    { zona: 'Sur / Floridablanca', barrios: ['El Reposo', 'Cañaveral', 'El Pinar', 'Lagos del Cacique', 'Floridablanca Centro', 'Caldas'] },
    { zona: 'Girón', barrios: ['Girón Centro', 'Las Naranjas', 'El Poblado', 'El Pantano', 'Ciudad Bolívar'] },
  ],
  // ── Costa Caribe ──
  'santa marta': [
    { zona: 'Centro y Norte', barrios: ['El Rodadero', 'El Centro', 'Taganga', 'Gaira', 'El Pando', 'Los Almendros'] },
    { zona: 'Sur y Oriente', barrios: ['Mamatoco', 'Bastidas', 'Curinca', 'Cristo Rey', 'La Paz', 'Nacho Vives', 'Timayui'] },
  ],
  'monteria': [
    { zona: 'Centro', barrios: ['El Centro', 'Santafé', 'La Coquera', 'Obrero', 'La Granja', 'Mogambito'] },
    { zona: 'Norte y Sur', barrios: ['El Dorado', 'Los Almendros', 'Buenavista', 'Villa Cielo', 'Nuevo Horizonte', 'Robinson Pitalúa'] },
  ],
  'sincelejo': [
    { zona: 'Todos los barrios', barrios: ['El Centro', 'El Toro', 'La Colina', 'Las Delicias', 'San Carlos', 'Olímpico', 'La Sabana', 'Don Bosco', 'Alfonso López'] },
  ],
  'valledupar': [
    { zona: 'Centro', barrios: ['El Centro', 'Los Músicos', 'La Esperanza', 'Siete de Agosto', 'Alfonso López', 'La Nevada'] },
    { zona: 'Norte y Sur', barrios: ['Los Robles', 'La Guajira', 'El Paraíso', 'San Martín', 'Los Mayales', 'Nuestro Esfuerzo'] },
  ],
  // ── Tolima / Huila ──
  'ibague': [
    { zona: 'Centro', barrios: ['El Centro', 'Ambala', 'La Pola', 'El Jordán', 'Calambeo', 'La Trinidad'] },
    { zona: 'Norte y Sur', barrios: ['Picaleña', 'Santa Helena', 'Nuevo Amanecer', 'El Salado', 'El Vergel', 'La Arboleda', 'Chapetón', 'Piedra Pintada'] },
  ],
  'neiva': [
    { zona: 'Centro', barrios: ['El Centro', 'Las Granjas', 'Suramérica', 'La Gaitana', 'Timanco'] },
    { zona: 'Norte y Sur', barrios: ['El Arado', 'Ventilador', 'Villa Café', 'Los Cauchos', 'La Nohora', 'Santa Lucía', 'El Caguán'] },
  ],
  // ── Llanos / Sur ──
  'villavicencio': [
    { zona: 'Centro', barrios: ['El Centro', 'Barzal', 'Almaverde', 'El Paraíso', 'La Rosita'] },
    { zona: 'Norte y Sur', barrios: ['Maizaro', 'La Lambada', 'Gaitán', 'Siete de Agosto', 'Kirpas', 'Los Centauros', 'El Buque', 'Porfía'] },
  ],
  // ── Nariño / Cauca ──
  'pasto': [
    { zona: 'Centro', barrios: ['El Centro', 'Torobajo', 'Chapítero', 'Lorenzo', 'Aranda', 'San Ignacio'] },
    { zona: 'Norte y Sur', barrios: ['La Minga', 'Obrero', 'Mijitayo', 'Briceño', 'Pinar del Río', 'El Rosario', 'Jongovito', 'Anganoy'] },
  ],
  'popayan': [
    { zona: 'Centro', barrios: ['El Centro', 'Bolívar', 'Bello Horizonte', 'El Uvo', 'Las Américas', 'Tulcán'] },
    { zona: 'Norte y Sur', barrios: ['La Arboleda', 'El Lago', 'Pandiguando', 'Los Comuneros', 'El Tablazo', 'Alfonso López', 'La Esmeralda'] },
  ],
  // ── Norte de Santander ──
  'cucuta': [
    { zona: 'Centro', barrios: ['El Centro', 'Atalaya', 'Quinta Orientales', 'La Libertad', 'La Playa'] },
    { zona: 'Norte y Sur', barrios: ['Los Comuneros', 'El Llano', 'Juan Atalaya', 'Blanco', 'La Riviera', 'Cundinamarca', 'Belén', 'Antonia Santos'] },
  ],
}

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
