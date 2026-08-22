/**
 * DATOS HARDCODEADOS TEMPORALES
 *
 * Este archivo contiene datos en memoria para desarrollo.
 * IMPORTANTE: Estos datos están estructurados para coincidir
 * exactamente con el schema de PostgreSQL (ver DATABASE_STRUCTURE.md)
 *
 * Cuando se migre a PostgreSQL, estos datos serán reemplazados
 * por queries a la base de datos real.
 */

import bcrypt from 'bcryptjs'

// Simulamos IDs autoincrementales
let nextUsuarioId = 4
let nextArtistaId = 6
let nextEdicionId = 2
let nextFaseId = 5
let nextCuradorId = 3
let nextVotacionId = 7
let nextArtistaFaseId = 7
let nextPaqueteId = 4
let nextContenidoId = 4
let nextEventoId = 2
let nextMensajeContactoId = 1

// USUARIOS (Admin y Curadores)
// Password: admin123 (hasheado con bcrypt)
export const usuarios = [
  {
    id: 1,
    email: 'admin@artefact.com',
    password: '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.', // admin123
    nombre: 'Administrador Principal',
    role: 'admin',
    created_at: '2027-01-10T10:00:00Z',
    updated_at: '2027-01-10T10:00:00Z'
  },
  {
    id: 2,
    email: 'sofia.martinez@artefact.com',
    password: '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.', // admin123
    nombre: 'Sofía Martínez',
    role: 'curador',
    created_at: '2027-01-15T10:00:00Z',
    updated_at: '2027-01-15T10:00:00Z'
  },
  {
    id: 3,
    email: 'diego.ruiz@artefact.com',
    password: '$2a$10$6M62/oODgMNGizQENsGY.ObsynGWcQbEBMEq04QQkpSaYE2itDTM.', // admin123
    nombre: 'Diego Ruiz',
    role: 'curador',
    created_at: '2027-01-15T10:00:00Z',
    updated_at: '2027-01-15T10:00:00Z'
  }
]

// ARTISTAS
export const artistas = [
  {
    id: 1,
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@example.com',
    telefono: '+52 55 1234 5678',
    fecha_nacimiento: '1990-05-15',
    ciudad: 'Ciudad de México',
    pais: 'México',
    categoria: 'pintura',
    bio: 'Artista visual especializada en arte abstracto y técnicas mixtas. Mi trabajo explora la intersección entre el color y la emoción, buscando crear experiencias visuales que resuenen con el espectador a nivel profundo. He expuesto en galerías nacionales e internacionales durante los últimos 10 años.',
    foto: 'https://i.pravatar.cc/300?img=1',
    redes_sociales: {
      instagram: 'https://instagram.com/mariagonzalezart',
      facebook: 'https://facebook.com/mariagonzalezarte',
      website: 'https://mariagonzalez.art'
    },
    documentos: {
      cv: 'https://cloudinary.com/sample-cv-1.pdf',
      portfolio: 'https://cloudinary.com/sample-portfolio-1.pdf',
      identificacion: 'https://cloudinary.com/sample-id-1.pdf'
    },
    aprobado: true,
    estado_registro: 'aprobado',
    created_at: '2027-01-20T14:30:00Z',
    updated_at: '2027-02-01T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'Ramírez',
    email: 'carlos.ramirez@example.com',
    telefono: '+52 55 8765 4321',
    fecha_nacimiento: '1985-08-22',
    ciudad: 'Guadalajara',
    pais: 'México',
    categoria: 'escultura',
    bio: 'Escultor contemporáneo trabajando principalmente con materiales reciclados. Mi práctica artística se centra en la transformación de desechos industriales en piezas que cuestionan nuestra relación con el consumo. Premio Nacional de Arte 2024.',
    foto: 'https://i.pravatar.cc/300?img=12',
    redes_sociales: {
      instagram: 'https://instagram.com/carlosramirezarte',
      website: 'https://carlosramirez.art'
    },
    documentos: {
      cv: 'https://cloudinary.com/sample-cv-2.pdf',
      portfolio: 'https://cloudinary.com/sample-portfolio-2.pdf',
      identificacion: 'https://cloudinary.com/sample-id-2.pdf'
    },
    aprobado: true,
    estado_registro: 'aprobado',
    created_at: '2027-01-21T09:15:00Z',
    updated_at: '2027-02-01T10:00:00Z'
  },
  {
    id: 3,
    nombre: 'Ana',
    apellido: 'Torres',
    email: 'ana.torres@example.com',
    telefono: '+52 55 9876 5432',
    fecha_nacimiento: '1992-11-03',
    ciudad: 'Oaxaca',
    pais: 'México',
    categoria: 'fotografia',
    bio: 'Fotógrafa documental enfocada en retratos urbanos y paisajes mexicanos. Mi trabajo busca capturar la esencia de las comunidades marginadas, dando voz visual a historias no contadas.',
    foto: 'https://i.pravatar.cc/300?img=5',
    redes_sociales: {
      instagram: 'https://instagram.com/anatorresphoto',
      twitter: 'https://twitter.com/anatorres'
    },
    documentos: {
      cv: 'https://cloudinary.com/sample-cv-3.pdf',
      portfolio: 'https://cloudinary.com/sample-portfolio-3.pdf',
      identificacion: 'https://cloudinary.com/sample-id-3.pdf'
    },
    aprobado: true,
    estado_registro: 'aprobado',
    created_at: '2027-01-22T16:45:00Z',
    updated_at: '2027-02-01T10:00:00Z'
  },
  {
    id: 4,
    nombre: 'Luis',
    apellido: 'Hernández',
    email: 'luis.hernandez@example.com',
    telefono: '+52 55 3456 7890',
    fecha_nacimiento: '1988-03-17',
    ciudad: 'Monterrey',
    pais: 'México',
    categoria: 'ilustracion',
    bio: 'Ilustrador digital especializado en narrativa visual. Combino técnicas tradicionales con herramientas digitales para crear mundos imaginarios llenos de detalle y simbolismo.',
    foto: 'https://i.pravatar.cc/300?img=8',
    redes_sociales: {
      instagram: 'https://instagram.com/luishernandezart',
      behance: 'https://behance.net/luishernandez'
    },
    documentos: {
      cv: 'https://cloudinary.com/sample-cv-4.pdf',
      portfolio: 'https://cloudinary.com/sample-portfolio-4.pdf',
      identificacion: 'https://cloudinary.com/sample-id-4.pdf'
    },
    aprobado: true,
    estado_registro: 'aprobado',
    created_at: '2027-01-23T11:20:00Z',
    updated_at: '2027-02-01T10:00:00Z'
  },
  {
    id: 5,
    nombre: 'Elena',
    apellido: 'Castro',
    email: 'elena.castro@example.com',
    telefono: '+52 55 6543 2109',
    fecha_nacimiento: '1995-07-28',
    ciudad: 'Puebla',
    pais: 'México',
    categoria: 'arte_digital',
    bio: 'Artista digital explorando la intersección entre tecnología y naturaleza. Creo experiencias interactivas que invitan al espectador a reflexionar sobre nuestra relación con el mundo digital.',
    foto: 'https://i.pravatar.cc/300?img=9',
    redes_sociales: {
      instagram: 'https://instagram.com/elenacastroart',
      website: 'https://elenacastro.digital'
    },
    documentos: {
      cv: 'https://cloudinary.com/sample-cv-5.pdf',
      portfolio: 'https://cloudinary.com/sample-portfolio-5.pdf',
      identificacion: 'https://cloudinary.com/sample-id-5.pdf'
    },
    aprobado: false,
    estado_registro: 'pendiente',
    created_at: '2027-02-05T08:30:00Z',
    updated_at: '2027-02-05T08:30:00Z'
  }
]

// EDICIONES
export const ediciones = [
  {
    id: 1,
    nombre: 'ARTEFACTO 2027',
    anio: 2027,
    descripcion: 'Primera edición de ARTEFACT - Feria de Arte Contemporáneo',
    fecha_inicio: '2027-01-15T00:00:00Z',
    fecha_fin: '2027-03-31T23:59:59Z',
    evento_id: 1,
    activa: true,
    created_at: '2027-01-01T10:00:00Z',
    updated_at: '2027-01-01T10:00:00Z'
  }
]

// FASES
export const fases = [
  {
    id: 1,
    edicion_id: 1,
    nombre: 'Fase 1 - Selección Inicial',
    descripcion: 'Primera fase de selección de artistas para ARTEFACTO 2027',
    tipo: 'fase',
    numero_fase: 1,
    fecha_inicio_inscripciones: '2027-01-15T00:00:00Z',
    fecha_fin_inscripciones: '2027-01-31T23:59:59Z',
    fecha_inicio_votaciones: '2027-02-01T00:00:00Z',
    fecha_fin_votaciones: '2027-02-15T23:59:59Z',
    inscripciones_abiertas: false,
    votaciones_abiertas: false,
    finalizada: true,
    total_inscritos: 4,
    total_seleccionados: 2,
    total_curadores: 2,
    created_at: '2027-01-25T10:00:00Z',
    updated_at: '2027-02-16T10:00:00Z'
  },
  {
    id: 2,
    edicion_id: 1,
    nombre: 'Fase 2 - Selección Intermedia',
    descripcion: 'Segunda fase de selección para artistas que pasaron la Fase 1',
    tipo: 'fase',
    numero_fase: 2,
    fecha_inicio_inscripciones: null,
    fecha_fin_inscripciones: null,
    fecha_inicio_votaciones: '2027-02-16T00:00:00Z',
    fecha_fin_votaciones: '2027-02-28T23:59:59Z',
    inscripciones_abiertas: false,
    votaciones_abiertas: true,
    finalizada: false,
    total_inscritos: 2,
    total_seleccionados: 0,
    total_curadores: 2,
    created_at: '2027-02-01T10:00:00Z',
    updated_at: '2027-02-16T10:00:00Z'
  },
  {
    id: 3,
    edicion_id: 1,
    nombre: 'Fase 3 - Selección Final',
    descripcion: 'Tercera y última fase de selección',
    tipo: 'fase',
    numero_fase: 3,
    fecha_inicio_inscripciones: null,
    fecha_fin_inscripciones: null,
    fecha_inicio_votaciones: '2027-03-01T00:00:00Z',
    fecha_fin_votaciones: '2027-03-15T23:59:59Z',
    inscripciones_abiertas: false,
    votaciones_abiertas: false,
    finalizada: false,
    total_inscritos: 0,
    total_seleccionados: 0,
    total_curadores: 2,
    created_at: '2027-02-01T10:00:00Z',
    updated_at: '2027-02-01T10:00:00Z'
  },
  {
    id: 4,
    edicion_id: 1,
    nombre: 'Concurso Final',
    descripcion: 'Concurso final para seleccionar a los ganadores de ARTEFACTO 2027',
    tipo: 'concurso',
    numero_fase: null,
    fecha_inicio_inscripciones: null,
    fecha_fin_inscripciones: null,
    fecha_inicio_votaciones: '2027-03-16T00:00:00Z',
    fecha_fin_votaciones: '2027-03-30T23:59:59Z',
    inscripciones_abiertas: false,
    votaciones_abiertas: false,
    finalizada: false,
    max_artistas_seleccionados: 10,
    total_inscritos: 0,
    total_seleccionados: 0,
    total_curadores: 2,
    created_at: '2027-02-01T10:00:00Z',
    updated_at: '2027-02-01T10:00:00Z'
  }
]

// CURADORES
export const curadores = [
  {
    id: 1,
    usuario_id: 2,
    nombre: 'Sofía',
    apellido: 'Martínez',
    email: 'sofia.martinez@artefact.com',
    telefono: '+52 55 1111 2222',
    especialidad: 'Arte Contemporáneo',
    bio: 'Curadora con 15 años de experiencia en arte contemporáneo latinoamericano. Especializada en nuevas narrativas visuales y prácticas artísticas experimentales.',
    foto: 'https://i.pravatar.cc/300?img=47',
    activo: true,
    created_at: '2027-01-15T10:00:00Z',
    updated_at: '2027-01-15T10:00:00Z'
  },
  {
    id: 2,
    usuario_id: 3,
    nombre: 'Diego',
    apellido: 'Ruiz',
    email: 'diego.ruiz@artefact.com',
    telefono: '+52 55 3333 4444',
    especialidad: 'Fotografía y Video Arte',
    bio: 'Curador y crítico de arte especializado en medios visuales contemporáneos. Curador en jefe del Museo de Arte Moderno 2020-2025.',
    foto: 'https://i.pravatar.cc/300?img=13',
    activo: true,
    created_at: '2027-01-15T10:00:00Z',
    updated_at: '2027-01-15T10:00:00Z'
  }
]

// ARTISTAS_FASES (Relación many-to-many)
export const artistas_fases = [
  { id: 1, artista_id: 1, fase_id: 1, created_at: '2027-02-01T10:00:00Z' },
  { id: 2, artista_id: 2, fase_id: 1, created_at: '2027-02-01T10:00:00Z' },
  { id: 3, artista_id: 3, fase_id: 1, created_at: '2027-02-01T10:00:00Z' },
  { id: 4, artista_id: 4, fase_id: 1, created_at: '2027-02-01T10:00:00Z' },
  { id: 5, artista_id: 1, fase_id: 2, created_at: '2027-02-16T10:00:00Z' },
  { id: 6, artista_id: 2, fase_id: 2, created_at: '2027-02-16T10:00:00Z' }
]

// PAQUETES
export const paquetes = [
  {
    id: 1,
    nombre: 'Paquete Básico',
    descripcion: 'Ideal para artistas emergentes que desean mostrar sus primeras obras en ARTEFACT',
    precio: 1500.00,
    metros_lineales: 3.0,
    altura_pared: 2.4,
    obras_maximas: 8,
    beneficios: [
      'Espacio de 3 metros lineales de pared',
      'Altura de 2.4 metros',
      'Iluminación profesional LED',
      'Tarjeta de presentación junto a las obras',
      'Mención en catálogo digital',
      'Acceso a inauguración'
    ],
    activo: true,
    created_at: '2027-01-10T10:00:00Z',
    updated_at: '2027-01-10T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Paquete Profesional',
    descripcion: 'Para artistas establecidos con trayectoria reconocida que buscan mayor espacio de exhibición',
    precio: 2800.00,
    metros_lineales: 5.0,
    altura_pared: 2.8,
    obras_maximas: 15,
    beneficios: [
      'Espacio de 5 metros lineales de pared',
      'Altura de 2.8 metros',
      'Iluminación premium con spotlights dirigibles',
      'Página completa en catálogo impreso',
      'Sesión fotográfica profesional de las obras',
      'Promoción en redes sociales de ARTEFACT',
      'Invitaciones VIP para la inauguración (5)',
      'Video time-lapse del montaje'
    ],
    activo: true,
    created_at: '2027-01-10T10:00:00Z',
    updated_at: '2027-01-10T10:00:00Z'
  },
  {
    id: 3,
    nombre: 'Paquete Premium',
    descripcion: 'Espacio exclusivo para artistas de alto reconocimiento con propuestas ambiciosas',
    precio: 4500.00,
    metros_lineales: 8.0,
    altura_pared: 3.0,
    obras_maximas: 25,
    beneficios: [
      'Espacio de 8 metros lineales de pared',
      'Altura de 3 metros',
      'Iluminación de museo con sistema de control',
      'Stand personalizado con diseño arquitectónico',
      'Portada del catálogo impreso',
      'Video promocional de 2 minutos',
      'Conferencia de prensa con medios especializados',
      'Cocktail privado de inauguración (20 invitados)',
      'Entrevista en revista de arte',
      'Coordinador personal de montaje'
    ],
    activo: true,
    created_at: '2027-01-10T10:00:00Z',
    updated_at: '2027-01-10T10:00:00Z'
  }
]

// VOTACIONES
export const votaciones = [
  {
    id: 1,
    curador_id: 1,
    artista_id: 1,
    fase_id: 1,
    voto: true,
    comentario: 'Excelente uso del color y composición. El trabajo muestra madurez artística y una visión personal clara.',
    fecha: '2027-02-05T14:30:00Z',
    created_at: '2027-02-05T14:30:00Z',
    updated_at: '2027-02-05T14:30:00Z'
  },
  {
    id: 2,
    curador_id: 1,
    artista_id: 2,
    fase_id: 1,
    voto: true,
    comentario: 'Trabajo innovador con materiales reciclados. Propuesta conceptual sólida.',
    fecha: '2027-02-05T15:00:00Z',
    created_at: '2027-02-05T15:00:00Z',
    updated_at: '2027-02-05T15:00:00Z'
  },
  {
    id: 3,
    curador_id: 1,
    artista_id: 3,
    fase_id: 1,
    voto: false,
    comentario: 'Buen trabajo técnico pero falta cohesión conceptual en el portfolio.',
    fecha: '2027-02-05T15:30:00Z',
    created_at: '2027-02-05T15:30:00Z',
    updated_at: '2027-02-05T15:30:00Z'
  },
  {
    id: 4,
    curador_id: 2,
    artista_id: 1,
    fase_id: 1,
    voto: true,
    comentario: 'Propuesta sólida y coherente. Recomiendo su participación.',
    fecha: '2027-02-06T10:00:00Z',
    created_at: '2027-02-06T10:00:00Z',
    updated_at: '2027-02-06T10:00:00Z'
  },
  {
    id: 5,
    curador_id: 2,
    artista_id: 2,
    fase_id: 1,
    voto: true,
    comentario: 'Trabajo excepcional. El uso de materiales reciclados es magistral.',
    fecha: '2027-02-06T10:30:00Z',
    created_at: '2027-02-06T10:30:00Z',
    updated_at: '2027-02-06T10:30:00Z'
  },
  {
    id: 6,
    curador_id: 2,
    artista_id: 3,
    fase_id: 1,
    voto: true,
    comentario: 'Excelente narrativa visual. La sensibilidad fotográfica es notable.',
    fecha: '2027-02-06T11:00:00Z',
    created_at: '2027-02-06T11:00:00Z',
    updated_at: '2027-02-06T11:00:00Z'
  }
]

// CONFIGURACION DEL SITIO (Singleton - un solo registro)
export const configuracionSitio = {
  id: 1,
  nombre_sitio: 'ARTEFACT',
  logo_url: '/images/logo.png',
  descripcion: 'Feria de arte contemporáneo que conecta artistas emergentes con el público',
  email_contacto: 'info@artefact.com.mx',
  telefono_contacto: '+52 55 1234 5678',
  whatsapp: '+52 55 1234 5678',
  direccion_completa: 'Av. Reforma 123, Cuauhtémoc, CDMX, México',
  instagram: 'https://instagram.com/artefact',
  facebook: 'https://facebook.com/artefact',
  twitter: 'https://twitter.com/artefact',
  linkedin: 'https://linkedin.com/company/artefact',
  copyright_text: '© 2027 ARTEFACT - Todos los derechos reservados',
  created_at: '2027-01-01T00:00:00Z',
  updated_at: '2027-01-01T00:00:00Z'
}

// CONTENIDO DEL LANDING
export const contenidos = [
  {
    id: 1,
    tipo: 'hero',
    titulo: 'ARTEFACTO 2027',
    subtitulo: 'Feria de Arte Contemporáneo',
    slug: 'hero-principal',
    contenido: 'Descubre el talento emergente de artistas locales en la feria de arte contemporáneo más importante de México. Un espacio donde el arte cobra vida y las nuevas propuestas encuentran su público.',
    imagen: '/images/hero-bg.jpg',
    publicado: true,
    cta_principal_texto: 'Registrarse como Artista',
    cta_principal_url: '/registro',
    cta_secundario_texto: 'Ver Convocatoria',
    cta_secundario_url: '#convocatoria',
    created_at: '2027-01-05T10:00:00Z',
    updated_at: '2027-01-05T10:00:00Z'
  },
  {
    id: 2,
    tipo: 'about',
    titulo: 'Acerca de ARTEFACT',
    slug: 'about',
    contenido: 'ARTEFACT es una feria de arte contemporáneo que nace con el objetivo de crear un puente entre artistas emergentes y el público amante del arte. Creemos en el poder transformador del arte y en la importancia de dar voz a nuevos talentos.',
    publicado: true,
    mision: 'Nuestra misión es crear un puente entre artistas emergentes y coleccionistas, galeristas y público en general, promoviendo el arte contemporáneo mexicano.',
    vision: 'Ser la plataforma líder en América Latina para el descubrimiento y promoción de artistas contemporáneos emergentes.',
    valores: [
      {
        title: 'Calidad',
        description: 'Selección rigurosa de artistas que demuestren excelencia técnica y propuesta conceptual sólida.',
        icon: '🎨'
      },
      {
        title: 'Inclusión',
        description: 'Abrimos espacios para artistas de todas las disciplinas, estilos y orígenes.',
        icon: '🤝'
      },
      {
        title: 'Innovación',
        description: 'Fomentamos propuestas creativas que desafíen los límites del arte contemporáneo.',
        icon: '💡'
      },
      {
        title: 'Transparencia',
        description: 'Proceso de selección claro y justo evaluado por curadores profesionales.',
        icon: '✨'
      }
    ],
    created_at: '2027-01-05T10:00:00Z',
    updated_at: '2027-01-05T10:00:00Z'
  },
  {
    id: 3,
    tipo: 'convocatoria',
    titulo: 'Convocatoria Abierta',
    slug: 'convocatoria',
    contenido: 'Invitamos a artistas emergentes a formar parte de ARTEFACTO 2027. Esta es tu oportunidad de mostrar tu trabajo ante coleccionistas, galeristas y un público ávido de nuevas propuestas artísticas.',
    publicado: true,
    pdf_url: '/pdfs/Convocatoria_ARTEFACTO.pdf',
    requisitos: [
      'Ser mayor de 18 años',
      'Obra original y de autoría propia',
      'No haber participado en ediciones anteriores de ARTEFACT como artista seleccionado',
      'Contar con mínimo 5 obras disponibles para exhibición',
      'Presentar portfolio digital con imágenes de alta calidad',
      'Comprometerse a montar y desmontar obra en las fechas establecidas'
    ],
    beneficios: [
      'Espacio de exhibición profesional con iluminación especializada',
      'Difusión en redes sociales y medios de comunicación',
      'Inclusión en catálogo oficial (digital e impreso según paquete)',
      'Acceso a eventos de networking con coleccionistas y galeristas',
      'Posibilidad de venta directa de obras',
      'Certificado de participación',
      'Asesoría para el montaje de obra'
    ],
    created_at: '2027-01-05T10:00:00Z',
    updated_at: '2027-01-05T10:00:00Z'
  }
]

// EVENTOS
export const eventos = [
  {
    id: 1,
    nombre: 'ARTEFACTO 2027',
    descripcion: 'La feria de arte contemporáneo más importante de México regresa en 2027 con una selección de los mejores artistas emergentes del país.',
    tipo_evento: 'feria_principal',
    fecha_inicio: '2027-02-01T10:00:00Z',
    fecha_fin: '2027-02-28T20:00:00Z',
    ubicacion: 'Centro de Convenciones de la Ciudad de México',
    lugar_nombre: 'Centro de Convenciones CDMX',
    direccion_completa: 'Av. Paseo de la Reforma 123, Cuauhtémoc, 06600 Ciudad de México, CDMX',
    ciudad: 'Ciudad de México',
    estado: 'CDMX',
    codigo_postal: '06600',
    pais: 'México',
    coordenadas_lat: 19.4326,
    coordenadas_lng: -99.1332,
    mapa_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.6153488304847!2d-99.13553492451584!3d19.432607981886226!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sPaseo%20de%20la%20Reforma%2C%20Cuauht%C3%A9moc%2C%20CDMX!5e0!3m2!1sen!2smx!4v1234567890123!5m2!1sen!2smx',
    info_transporte: {
      metro: 'Línea 1 - Estación Insurgentes (10 min caminando)',
      metrobus: 'Línea 4 - Estación Reforma (5 min caminando)',
      estacionamiento: 'Estacionamiento disponible en el lugar ($50 MXN hora)'
    },
    imagen: '/images/evento-principal.jpg',
    slug: 'artefact-2027',
    activo: true,
    created_at: '2027-01-01T10:00:00Z',
    updated_at: '2027-01-01T10:00:00Z'
  }
]

// MENSAJES DE CONTACTO
export const mensajesContacto = []

// Funciones helper para generar IDs
export const getNextId = {
  usuario: () => nextUsuarioId++,
  artista: () => nextArtistaId++,
  edicion: () => nextEdicionId++,
  fase: () => nextFaseId++,
  curador: () => nextCuradorId++,
  votacion: () => nextVotacionId++,
  artistaFase: () => nextArtistaFaseId++,
  paquete: () => nextPaqueteId++,
  contenido: () => nextContenidoId++,
  evento: () => nextEventoId++,
  mensajeContacto: () => nextMensajeContactoId++
}

// Helper para crear timestamp
export const now = () => new Date().toISOString()

// Helper para hashear passwords
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

// Helper para comparar passwords
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}
