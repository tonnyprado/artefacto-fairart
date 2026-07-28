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
let nextFaseId = 3
let nextCuradorId = 3
let nextVotacionId = 7
let nextArtistaFaseId = 7

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

// FASES
export const fases = [
  {
    id: 1,
    nombre: 'Fase 1 - Selección Inicial',
    descripcion: 'Primera fase de selección de artistas para ARTEFACT 2027',
    fecha_inicio: '2027-02-01T00:00:00Z',
    fecha_fin: '2027-02-15T23:59:59Z',
    votaciones_abiertas: false,
    finalizada: true,
    porcentaje_seleccion: 20,
    created_at: '2027-01-25T10:00:00Z',
    updated_at: '2027-02-16T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Fase 2 - Selección Final',
    descripcion: 'Segunda fase de selección para artistas que pasaron la Fase 1',
    fecha_inicio: '2027-02-16T00:00:00Z',
    fecha_fin: '2027-02-28T23:59:59Z',
    votaciones_abiertas: true,
    finalizada: false,
    porcentaje_seleccion: 20,
    created_at: '2027-02-01T10:00:00Z',
    updated_at: '2027-02-16T10:00:00Z'
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

// Funciones helper para generar IDs
export const getNextId = {
  usuario: () => nextUsuarioId++,
  artista: () => nextArtistaId++,
  fase: () => nextFaseId++,
  curador: () => nextCuradorId++,
  votacion: () => nextVotacionId++,
  artistaFase: () => nextArtistaFaseId++
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
