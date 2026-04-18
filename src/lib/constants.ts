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

// ─── Barrios de Cali — 22 comunas oficiales ───────────────────
export const BARRIOS_CALI = [
  {
    zona: 'C1 · Terrón Colorado',
    barrios: [
      'Terrón Colorado', 'Polvorines', 'Lleras Camargo', 'Las Orquídeas', 'El Chorro',
      'Belisario Caicedo', 'Nápoles', 'Jorge Zawadzky', 'Manzanares', 'Ospina Pérez',
      'Alto Nápoles', 'La Choclona', 'San Luis Gonzaga', 'El Vergel',
    ],
  },
  {
    zona: 'C2 · Santa Mónica',
    barrios: [
      'Santa Mónica Residencial', 'Santa Mónica Popular', 'Normandía', 'Versalles 1',
      'Versalles 2', 'Menga', 'El Pedregal', 'Champagnat', 'Arboleda', 'Prados del Norte',
      'Vipasa', 'Los Farallones', 'El Salitre', 'Los Almendros',
    ],
  },
  {
    zona: 'C3 · Granada',
    barrios: [
      'Modelo', 'Municipal', 'Granada', 'San Vicente', 'Santa Rita', 'Centenario',
      'Departamental', 'San Pedro', 'Galerías', 'San Nicolás',
    ],
  },
  {
    zona: 'C4 · Alameda',
    barrios: [
      'Jorge Robledo', 'Benjamín Herrera', 'Ricardo Balcázar', 'La Merced', 'Bretaña',
      'Alameda', 'La Concordia', 'Sucre', 'Camilo Torres',
    ],
  },
  {
    zona: 'C5 · Guabal',
    barrios: [
      'Alfonso López 1', 'Alfonso López 2', 'La Base', 'Junín', 'Cañaverales',
      'El Paraíso Norte', 'Guabal', 'Obrero', 'Tres de Julio', 'Cristóbal Colón',
      'Santa Fe', 'La Flora',
    ],
  },
  {
    zona: 'C6 · La Rivera',
    barrios: [
      'Floralia', 'Doce de Octubre', 'El Troncal', 'Panamericano', 'Los Álamos',
      'La Rivera', 'La Campiña', 'Boyacá', 'El Poblado 1', 'El Poblado 2',
      'La Esperanza', 'Marroquín 1', 'Marroquín 2',
    ],
  },
  {
    zona: 'C7 · Chipichape',
    barrios: [
      'Chipichape', 'El Bosque', 'El Refugio', 'Los Naranjos', 'Simón Bolívar',
      'La Flora Norte', 'Porvenir', 'Habitación', 'Alcázares',
    ],
  },
  {
    zona: 'C8 · Salomia',
    barrios: [
      'San Luis', 'Olaya Herrera', 'Salomia', 'San Judas Parte Alta', 'San Judas Parte Baja',
      'Urb. Antonio Nariño', 'El Troncal Centro', 'Panorama',
    ],
  },
  {
    zona: 'C9 · Los Comuneros',
    barrios: [
      'El Popular 1', 'El Popular 2', 'El Sena', 'Julio Rincón', 'El Rodeo',
      'El Pondaje', 'Prados del Sur', 'Villacolombia', 'Mojica', 'Los Comuneros 2',
    ],
  },
  {
    zona: 'C10 · El Centro',
    barrios: [
      'El Centro', 'San Juan Bosco', 'El Calvario', 'Santa Rosa', 'El Hoyo',
      'Sucre Centro', 'Obrero Centro', 'El Templete', 'San Cayetano Bajo',
    ],
  },
  {
    zona: 'C11 · San Cayetano',
    barrios: [
      'San Cayetano', 'La Esmeralda', 'Los Andes', 'Jorge Isaacs', 'Bello Horizonte',
      'La Merced Alta', 'El Peñón Centro',
    ],
  },
  {
    zona: 'C12 · El Vallado',
    barrios: [
      'El Vallado', 'Calimío', 'Cauca Viejo', 'El Diamante 1', 'El Diamante 2',
      'Marroquín 3', 'El Vergel Oriente',
    ],
  },
  {
    zona: 'C13 · El Poblado Oriente',
    barrios: [
      'Comuneros 1', 'Comuneros 2', 'Manuela Beltrán', 'Charco Azul', 'El Pondaje Oriente',
      'El Retiro',
    ],
  },
  {
    zona: 'C14 · Villanueva',
    barrios: [
      'Villanueva', 'Alfonso López Oriente', 'Floralia Oriente', 'El Diamante Oriente',
      'Alirio Mora', 'Petecuy 1 Sur',
    ],
  },
  {
    zona: 'C15 · Sardi',
    barrios: [
      'Sardi', 'Julia Palacios', 'Laureano Gómez', 'Omar Torrijos', 'Rodrigo Lara Bonilla',
      'El Amparo', 'Petecuy 3',
    ],
  },
  {
    zona: 'C16 · Petecuy',
    barrios: [
      'Petecuy 1', 'Petecuy 2', 'Petecuy 3', 'Alirio Mora Borrero', 'El Vallado Norte',
    ],
  },
  {
    zona: 'C17 · El Ingenio',
    barrios: [
      'El Ingenio 1', 'El Ingenio 2', 'El Ingenio 3', 'Capri', 'El Caney', 'La Hacienda',
      'Ciudad Jardín', 'Villa del Sol', 'San Joaquín', 'Los Portales', 'El Limonar',
      'Prados del Limonar', 'Quintas de Don Simón', 'Calipso',
    ],
  },
  {
    zona: 'C18 · Meléndez',
    barrios: [
      'El Jordán', 'Cuarteles Nápoles', 'Meléndez', 'Lili', 'La Sirena', 'Los Álamos Sur',
      'Pance', 'Colinas del Sur', 'La Hacienda Sur', 'Santa Anita',
    ],
  },
  {
    zona: 'C19 · San Fernando',
    barrios: [
      'El Peñón', 'San Fernando Viejo', 'San Fernando Nuevo', 'Tequendama', 'Miraflores',
      'Colseguros', 'Bellavista', 'La Merced Sur', 'Santa Rita Sur', 'El Cedro',
    ],
  },
  {
    zona: 'C20 · Siloé',
    barrios: [
      'Siloé', 'El Cortijo', 'Alto Menga', 'La Sultana', 'El Rodeo Ladera',
      'Las Vegas Ladera', 'Bello Horizonte Ladera', 'Los Chorros',
    ],
  },
  {
    zona: 'C21 · Rodrigo Lara',
    barrios: [
      'Rodrigo Lara Bonilla', 'Palmas 1', 'Palmas 2', 'Puertas del Sol', 'Compartir',
      'El Remanso',
    ],
  },
  {
    zona: 'C22 · Pance',
    barrios: [
      'Pance', 'Ciudadela Comfandi', 'El Retiro Sur', 'El Cacique', 'La Sirena Sur',
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
