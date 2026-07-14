/**
 * DATOS HARDCODEADOS TEMPORALES
 *
 * Este archivo contiene datos en memoria para desarrollo.
 * IMPORTANTE: Estos datos están estructurados para coincidir
 * exactamente con el schema de PostgreSQL (ver database/schema.sql)
 *
 * Cuando se migre a PostgreSQL, estos datos serán reemplazados
 * por queries a la base de datos real.
 */

import bcrypt from 'bcryptjs'

// Simulamos IDs autoincrementales
let nextUsuarioId = 2
let nextArtistaId = 4
let nextObraId = 5
let nextEventoId = 3
let nextPaqueteId = 4
let nextInscripcionId = 4
let nextContenidoId = 3

// USUARIOS (Administradores)
// Password: admin123 (hasheado con bcrypt)
export const usuarios = [
  {
    id: 1,
    email: 'admin@artefact.com',
    password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', // admin123
    nombre: 'Administrador',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// ARTISTAS
export const artistas = [
  {
    id: 1,
    nombre: 'María González',
    email: 'maria@example.com',
    bio: 'Artista visual especializada en arte abstracto y técnicas mixtas. 10 años de experiencia en galerías internacionales.',
    categoria: 'Pintura',
    foto: null,
    slug: 'maria-gonzalez',
    redes_sociales: {
      instagram: '@mariagonzalezart',
      facebook: 'mariagonzalezarte'
    },
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nombre: 'Carlos Ramírez',
    email: 'carlos@example.com',
    bio: 'Escultor contemporáneo trabajando con materiales reciclados. Premio Nacional de Arte 2024.',
    categoria: 'Escultura',
    foto: null,
    slug: 'carlos-ramirez',
    redes_sociales: {
      instagram: '@carlosramirezarte',
      website: 'https://carlosramirez.art'
    },
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    nombre: 'Ana Torres',
    email: 'ana@example.com',
    bio: 'Fotógrafa documental enfocada en retratos urbanos y paisajes mexicanos.',
    categoria: 'Fotografía',
    foto: null,
    slug: 'ana-torres',
    redes_sociales: {
      instagram: '@anatorresphoto',
      twitter: '@anatorres'
    },
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// OBRAS
export const obras = [
  {
    id: 1,
    titulo: 'Sueños de Color',
    descripcion: 'Obra abstracta en acrílico sobre lienzo, explorando emociones a través del color.',
    artista_id: 1,
    precio: 8500.00,
    categoria: 'Pintura',
    imagen: null,
    dimensiones: '100x80 cm',
    año: 2025,
    disponible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    titulo: 'Reflejo Urbano',
    descripcion: 'Escultura en metal reciclado representando la vida en la ciudad moderna.',
    artista_id: 2,
    precio: 15000.00,
    categoria: 'Escultura',
    imagen: null,
    dimensiones: '150x60x40 cm',
    año: 2025,
    disponible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    titulo: 'Atardecer en Oaxaca',
    descripcion: 'Fotografía fine art de paisaje oaxaqueño al atardecer.',
    artista_id: 3,
    precio: 3500.00,
    categoria: 'Fotografía',
    imagen: null,
    dimensiones: '60x40 cm',
    año: 2024,
    disponible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    titulo: 'Geometría Interior',
    descripcion: 'Pintura minimalista explorando formas geométricas y espacios negativos.',
    artista_id: 1,
    precio: 6000.00,
    categoria: 'Pintura',
    imagen: null,
    dimensiones: '80x80 cm',
    año: 2025,
    disponible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// EVENTOS
export const eventos = [
  {
    id: 1,
    nombre: 'ARTEFACT 2026 - Primavera',
    descripcion: 'Primera edición de la feria de arte ARTEFACT. Descubre talento emergente y obras únicas.',
    fecha_inicio: '2026-03-15T10:00:00Z',
    fecha_fin: '2026-03-17T20:00:00Z',
    ubicacion: 'Centro Cultural Metro CDMX',
    imagen: null,
    slug: 'artefact-2026-primavera',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nombre: 'ARTEFACT 2026 - Otoño',
    descripcion: 'Segunda edición de la feria con más artistas y categorías.',
    fecha_inicio: '2026-09-10T10:00:00Z',
    fecha_fin: '2026-09-12T20:00:00Z',
    ubicacion: 'Museo de Arte Moderno',
    imagen: null,
    slug: 'artefact-2026-otono',
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// PAQUETES
export const paquetes = [
  {
    id: 1,
    nombre: 'Básico',
    descripcion: 'Paquete básico para artistas emergentes',
    precio: 1500.00,
    beneficios: [
      'Espacio de 2x2 metros',
      'Mesa y silla',
      'Acceso durante el evento'
    ],
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nombre: 'Estándar',
    descripcion: 'Paquete estándar con beneficios adicionales',
    precio: 3000.00,
    beneficios: [
      'Espacio de 3x3 metros',
      'Mesa, silla y biombo',
      'Acceso durante el evento',
      'Mención en redes sociales'
    ],
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    nombre: 'Premium',
    descripcion: 'Paquete premium con todos los beneficios',
    precio: 5000.00,
    beneficios: [
      'Espacio de 4x4 metros',
      'Mobiliario completo',
      'Acceso VIP',
      'Promoción destacada en redes',
      'Sesión fotográfica profesional'
    ],
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// INSCRIPCIONES
export const inscripciones = [
  {
    id: 1,
    artista_id: 1,
    evento_id: 1,
    paquete_id: 2,
    estado: 'aprobada',
    notas: 'Artista con excelente portafolio',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    artista_id: 2,
    evento_id: 1,
    paquete_id: 3,
    estado: 'aprobada',
    notas: 'Premio Nacional de Arte',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    artista_id: 3,
    evento_id: 1,
    paquete_id: 1,
    estado: 'pendiente',
    notas: 'Primera participación en feria',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// CONTENIDO
export const contenido = [
  {
    id: 1,
    tipo: 'pagina',
    titulo: 'Acerca de ARTEFACT',
    slug: 'acerca-de',
    contenido: 'ARTEFACT es una feria de arte que busca promover el talento emergente mexicano...',
    imagen: null,
    publicado: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    tipo: 'noticia',
    titulo: 'Lanzamiento ARTEFACT 2026',
    slug: 'lanzamiento-artefact-2026',
    contenido: 'Nos complace anunciar el lanzamiento de la primera edición de ARTEFACT...',
    imagen: null,
    publicado: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Funciones helper para generar IDs
export const getNextId = {
  usuario: () => nextUsuarioId++,
  artista: () => nextArtistaId++,
  obra: () => nextObraId++,
  evento: () => nextEventoId++,
  paquete: () => nextPaqueteId++,
  inscripcion: () => nextInscripcionId++,
  contenido: () => nextContenidoId++
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
