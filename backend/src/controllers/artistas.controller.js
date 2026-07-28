/**
 * Controlador de Artistas
 * Maneja la lógica de negocio para los artistas
 */

import {
  artistas,
  artistas_fases,
  votaciones,
  getNextId,
  now
} from '../data/mockData.js'

/**
 * GET /api/artistas
 * Obtener todos los artistas
 */
export const getAllArtistas = async (req, res) => {
  try {
    const {
      categoria,
      aprobado,
      estado_registro,
      search,
      limit = 50,
      offset = 0
    } = req.query

    let filteredArtistas = [...artistas]

    // Filtrar por categoría
    if (categoria) {
      filteredArtistas = filteredArtistas.filter(a => a.categoria === categoria)
    }

    // Filtrar por aprobado
    if (aprobado !== undefined) {
      const isAprobado = aprobado === 'true'
      filteredArtistas = filteredArtistas.filter(a => a.aprobado === isAprobado)
    }

    // Filtrar por estado de registro
    if (estado_registro) {
      filteredArtistas = filteredArtistas.filter(a => a.estado_registro === estado_registro)
    }

    // Filtrar por búsqueda (nombre, apellido, email)
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArtistas = filteredArtistas.filter(a =>
        a.nombre.toLowerCase().includes(searchLower) ||
        a.apellido.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        (a.bio && a.bio.toLowerCase().includes(searchLower))
      )
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredArtistas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // Paginación
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedArtistas = filteredArtistas.slice(startIndex, endIndex)

    res.json({
      success: true,
      data: paginatedArtistas,
      total: filteredArtistas.length
    })
  } catch (error) {
    console.error('Error al obtener artistas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artistas'
    })
  }
}

/**
 * GET /api/artistas/:id
 * Obtener un artista por ID
 */
export const getArtistaById = async (req, res) => {
  try {
    const { id } = req.params
    const artista = artistas.find(a => a.id === parseInt(id))

    if (!artista) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Obtener fases en las que participa
    const fasesArtista = artistas_fases
      .filter(af => af.artista_id === parseInt(id))
      .map(af => af.fase_id)

    // Contar votos del artista
    const totalVotos = votaciones.filter(v => v.artista_id === parseInt(id)).length

    res.json({
      success: true,
      data: {
        ...artista,
        fases: fasesArtista,
        total_votos: totalVotos
      }
    })
  } catch (error) {
    console.error('Error al obtener artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artista'
    })
  }
}

/**
 * POST /api/artistas
 * Crear un nuevo artista (Registro público)
 */
export const createArtista = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      ciudad,
      pais,
      categoria,
      bio,
      foto,
      redes_sociales,
      documentos
    } = req.body

    // Validaciones básicas
    if (!nombre || !apellido || !email || !fecha_nacimiento || !ciudad || !pais || !categoria) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: nombre, apellido, email, fecha_nacimiento, ciudad, pais, categoria'
      })
    }

    // Verificar si el email ya existe
    const emailExistente = artistas.some(a => a.email === email)
    if (emailExistente) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      })
    }

    // Crear artista
    const nuevoArtista = {
      id: getNextId.artista(),
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      fecha_nacimiento,
      ciudad,
      pais,
      categoria,
      bio: bio || null,
      foto: foto || null,
      redes_sociales: redes_sociales || {},
      documentos: documentos || {},
      aprobado: false,
      estado_registro: 'pendiente',
      created_at: now(),
      updated_at: now()
    }

    artistas.push(nuevoArtista)

    res.status(201).json({
      success: true,
      data: nuevoArtista,
      message: 'Artista registrado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear artista'
    })
  }
}

/**
 * PUT /api/artistas/:id
 * Actualizar un artista (Solo admin)
 */
export const updateArtista = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      ciudad,
      pais,
      categoria,
      bio,
      foto,
      redes_sociales,
      documentos,
      aprobado,
      estado_registro
    } = req.body

    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Si se cambia el email, verificar que no esté en uso
    if (email && email !== artistas[artistaIndex].email) {
      const emailExistente = artistas.some(a => a.email === email && a.id !== parseInt(id))
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        })
      }
    }

    // Actualizar artista
    artistas[artistaIndex] = {
      ...artistas[artistaIndex],
      ...(nombre && { nombre }),
      ...(apellido && { apellido }),
      ...(email && { email }),
      ...(telefono !== undefined && { telefono }),
      ...(fecha_nacimiento && { fecha_nacimiento }),
      ...(ciudad && { ciudad }),
      ...(pais && { pais }),
      ...(categoria && { categoria }),
      ...(bio !== undefined && { bio }),
      ...(foto !== undefined && { foto }),
      ...(redes_sociales !== undefined && { redes_sociales }),
      ...(documentos !== undefined && { documentos }),
      ...(aprobado !== undefined && { aprobado }),
      ...(estado_registro && { estado_registro }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: artistas[artistaIndex],
      message: 'Artista actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar artista'
    })
  }
}

/**
 * PUT /api/artistas/:id/aprobar
 * Aprobar un artista (Solo admin)
 */
export const aprobarArtista = async (req, res) => {
  try {
    const { id } = req.params
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    artistas[artistaIndex].aprobado = true
    artistas[artistaIndex].estado_registro = 'aprobado'
    artistas[artistaIndex].updated_at = now()

    res.json({
      success: true,
      data: artistas[artistaIndex],
      message: 'Artista aprobado exitosamente'
    })
  } catch (error) {
    console.error('Error al aprobar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al aprobar artista'
    })
  }
}

/**
 * PUT /api/artistas/:id/rechazar
 * Rechazar un artista (Solo admin)
 */
export const rechazarArtista = async (req, res) => {
  try {
    const { id } = req.params
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    artistas[artistaIndex].aprobado = false
    artistas[artistaIndex].estado_registro = 'rechazado'
    artistas[artistaIndex].updated_at = now()

    res.json({
      success: true,
      data: artistas[artistaIndex],
      message: 'Artista rechazado'
    })
  } catch (error) {
    console.error('Error al rechazar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al rechazar artista'
    })
  }
}

/**
 * DELETE /api/artistas/:id
 * Eliminar un artista (Solo admin)
 */
export const deleteArtista = async (req, res) => {
  try {
    const { id } = req.params
    const artistaIndex = artistas.findIndex(a => a.id === parseInt(id))

    if (artistaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Verificar si tiene votaciones
    const tieneVotaciones = votaciones.some(v => v.artista_id === parseInt(id))
    if (tieneVotaciones) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un artista con votaciones registradas'
      })
    }

    // Eliminar inscripciones a fases
    const inscripcionesIndexes = []
    artistas_fases.forEach((af, index) => {
      if (af.artista_id === parseInt(id)) {
        inscripcionesIndexes.push(index)
      }
    })
    inscripcionesIndexes.reverse().forEach(index => {
      artistas_fases.splice(index, 1)
    })

    // Eliminar artista
    artistas.splice(artistaIndex, 1)

    res.json({
      success: true,
      message: 'Artista eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar artista'
    })
  }
}

/**
 * GET /api/artistas/fase/:fase_id
 * Obtener artistas de una fase específica
 */
export const getArtistasByFase = async (req, res) => {
  try {
    const { fase_id } = req.params

    // Obtener IDs de artistas en la fase
    const artistaIds = artistas_fases
      .filter(af => af.fase_id === parseInt(fase_id))
      .map(af => af.artista_id)

    // Obtener datos completos de los artistas
    const artistasFase = artistas.filter(a => artistaIds.includes(a.id))

    res.json({
      success: true,
      data: artistasFase
    })
  } catch (error) {
    console.error('Error al obtener artistas de fase:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artistas de fase'
    })
  }
}
