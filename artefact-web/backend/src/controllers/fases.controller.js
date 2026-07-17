/**
 * Controlador de Fases
 * Maneja la lógica de negocio para las fases de selección
 */

import {
  fases,
  artistas_fases,
  votaciones,
  getNextId,
  now
} from '../data/mockData.js'

/**
 * GET /api/fases
 * Obtener todas las fases
 */
export const getAllFases = async (req, res) => {
  try {
    res.json({
      success: true,
      data: fases
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener fases'
    })
  }
}

/**
 * GET /api/fases/:id
 * Obtener una fase por ID
 */
export const getFaseById = async (req, res) => {
  try {
    const { id } = req.params
    const fase = fases.find(f => f.id === parseInt(id))

    if (!fase) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Contar artistas inscritos en esta fase
    const totalArtistas = artistas_fases.filter(af => af.fase_id === fase.id).length

    // Contar votos emitidos
    const totalVotos = votaciones.filter(v => v.fase_id === fase.id).length

    res.json({
      success: true,
      data: {
        ...fase,
        total_artistas: totalArtistas,
        total_votos: totalVotos
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener fase'
    })
  }
}

/**
 * POST /api/fases
 * Crear una nueva fase (Solo admin)
 */
export const createFase = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      porcentaje_seleccion = 20
    } = req.body

    // Validaciones
    if (!nombre || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, fecha_inicio y fecha_fin son requeridos'
      })
    }

    const nuevaFase = {
      id: getNextId.fase(),
      nombre,
      descripcion: descripcion || '',
      fecha_inicio,
      fecha_fin,
      votaciones_abiertas: false,
      finalizada: false,
      porcentaje_seleccion,
      created_at: now(),
      updated_at: now()
    }

    fases.push(nuevaFase)

    res.status(201).json({
      success: true,
      data: nuevaFase,
      message: 'Fase creada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al crear fase'
    })
  }
}

/**
 * PUT /api/fases/:id
 * Actualizar una fase (Solo admin)
 */
export const updateFase = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      votaciones_abiertas,
      finalizada,
      porcentaje_seleccion
    } = req.body

    const faseIndex = fases.findIndex(f => f.id === parseInt(id))

    if (faseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Actualizar campos
    fases[faseIndex] = {
      ...fases[faseIndex],
      ...(nombre && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(fecha_inicio && { fecha_inicio }),
      ...(fecha_fin && { fecha_fin }),
      ...(votaciones_abiertas !== undefined && { votaciones_abiertas }),
      ...(finalizada !== undefined && { finalizada }),
      ...(porcentaje_seleccion !== undefined && { porcentaje_seleccion }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: fases[faseIndex],
      message: 'Fase actualizada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar fase'
    })
  }
}

/**
 * PUT /api/fases/:id/abrir-votaciones
 * Abrir votaciones para una fase (Solo admin)
 */
export const abrirVotaciones = async (req, res) => {
  try {
    const { id } = req.params
    const faseIndex = fases.findIndex(f => f.id === parseInt(id))

    if (faseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    if (fases[faseIndex].finalizada) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden abrir votaciones para una fase finalizada'
      })
    }

    fases[faseIndex].votaciones_abiertas = true
    fases[faseIndex].updated_at = now()

    res.json({
      success: true,
      data: fases[faseIndex],
      message: 'Votaciones abiertas exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al abrir votaciones'
    })
  }
}

/**
 * PUT /api/fases/:id/cerrar-votaciones
 * Cerrar votaciones para una fase (Solo admin)
 */
export const cerrarVotaciones = async (req, res) => {
  try {
    const { id } = req.params
    const faseIndex = fases.findIndex(f => f.id === parseInt(id))

    if (faseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    fases[faseIndex].votaciones_abiertas = false
    fases[faseIndex].updated_at = now()

    res.json({
      success: true,
      data: fases[faseIndex],
      message: 'Votaciones cerradas exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al cerrar votaciones'
    })
  }
}

/**
 * PUT /api/fases/:id/finalizar
 * Finalizar una fase (Solo admin)
 * Esto cierra votaciones y marca la fase como finalizada
 */
export const finalizarFase = async (req, res) => {
  try {
    const { id } = req.params
    const faseIndex = fases.findIndex(f => f.id === parseInt(id))

    if (faseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    if (fases[faseIndex].finalizada) {
      return res.status(400).json({
        success: false,
        error: 'La fase ya está finalizada'
      })
    }

    fases[faseIndex].votaciones_abiertas = false
    fases[faseIndex].finalizada = true
    fases[faseIndex].updated_at = now()

    res.json({
      success: true,
      data: fases[faseIndex],
      message: 'Fase finalizada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al finalizar fase'
    })
  }
}

/**
 * DELETE /api/fases/:id
 * Eliminar una fase (Solo admin)
 */
export const deleteFase = async (req, res) => {
  try {
    const { id } = req.params
    const faseIndex = fases.findIndex(f => f.id === parseInt(id))

    if (faseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Verificar si hay artistas inscritos
    const tieneArtistas = artistas_fases.some(af => af.fase_id === parseInt(id))
    if (tieneArtistas) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una fase con artistas inscritos'
      })
    }

    fases.splice(faseIndex, 1)

    res.json({
      success: true,
      message: 'Fase eliminada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar fase'
    })
  }
}

/**
 * GET /api/fases/:id/artistas
 * Obtener artistas inscritos en una fase
 */
export const getArtistasFase = async (req, res) => {
  try {
    const { id } = req.params
    const fase = fases.find(f => f.id === parseInt(id))

    if (!fase) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Obtener IDs de artistas en esta fase
    const artistaIds = artistas_fases
      .filter(af => af.fase_id === parseInt(id))
      .map(af => af.artista_id)

    res.json({
      success: true,
      data: artistaIds
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener artistas de la fase'
    })
  }
}

/**
 * POST /api/fases/:id/artistas
 * Inscribir artistas en una fase (Solo admin)
 */
export const inscribirArtistas = async (req, res) => {
  try {
    const { id } = req.params
    const { artista_ids } = req.body

    if (!Array.isArray(artista_ids) || artista_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de artista_ids'
      })
    }

    const fase = fases.find(f => f.id === parseInt(id))
    if (!fase) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    const inscritosExistentes = []
    const nuevasInscripciones = []

    artista_ids.forEach(artistaId => {
      // Verificar si ya está inscrito
      const yaInscrito = artistas_fases.some(
        af => af.artista_id === artistaId && af.fase_id === parseInt(id)
      )

      if (yaInscrito) {
        inscritosExistentes.push(artistaId)
      } else {
        const nuevaInscripcion = {
          id: getNextId.artistaFase(),
          artista_id: artistaId,
          fase_id: parseInt(id),
          created_at: now()
        }
        artistas_fases.push(nuevaInscripcion)
        nuevasInscripciones.push(nuevaInscripcion)
      }
    })

    res.json({
      success: true,
      data: {
        nuevas_inscripciones: nuevasInscripciones.length,
        ya_inscritos: inscritosExistentes.length
      },
      message: `${nuevasInscripciones.length} artistas inscritos exitosamente`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al inscribir artistas'
    })
  }
}
