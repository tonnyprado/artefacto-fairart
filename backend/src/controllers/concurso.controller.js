/**
 * Controlador de Concurso
 *
 * RESPONSABILIDAD: HTTP request/response handling
 * DELEGA lógica de negocio a ConcursoService
 *
 * SOLID Principles Applied:
 * - SRP: Solo maneja HTTP, no lógica de negocio
 * - DIP: Depende de service (abstracción)
 *
 * @module ConcursoController
 */

import concursoService from '../services/concurso.service.js'

/**
 * GET /api/concurso/artistas-elegibles
 * Obtener artistas elegibles para concurso
 * Query params: search, limit, offset
 */
export const getArtistasElegibles = async (req, res) => {
  try {
    const { search, limit, offset } = req.query

    const artistas = await concursoService.getArtistasElegibles({
      search,
      limit,
      offset
    })

    res.json({
      success: true,
      data: artistas,
      total: artistas.length
    })
  } catch (error) {
    console.error('Error al obtener artistas elegibles:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener artistas elegibles para concurso',
      details: error.message
    })
  }
}

/**
 * GET /api/concurso/artistas/:artista_id/obras
 * Obtener obras de un artista con información de selección
 */
export const getObrasArtista = async (req, res) => {
  try {
    const { artista_id } = req.params

    if (!artista_id || isNaN(parseInt(artista_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de artista inválido'
      })
    }

    const obras = await concursoService.getObrasArtistaParaConcurso(artista_id)

    res.json({
      success: true,
      data: obras,
      total: obras.length
    })
  } catch (error) {
    console.error('Error al obtener obras del artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener obras del artista',
      details: error.message
    })
  }
}

/**
 * POST /api/concurso/:fase_id/seleccionar-obra
 * Seleccionar una obra para concurso
 * Body: { obra_id, notas? }
 */
export const seleccionarObra = async (req, res) => {
  try {
    const { fase_id } = req.params
    const { obra_id, notas } = req.body
    const admin_id = req.user?.id // Del middleware de autenticación

    // Validaciones
    if (!fase_id || isNaN(parseInt(fase_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de fase inválido'
      })
    }

    if (!obra_id || isNaN(parseInt(obra_id))) {
      return res.status(400).json({
        success: false,
        error: 'El ID de la obra es requerido y debe ser válido'
      })
    }

    const resultado = await concursoService.seleccionarObraParaConcurso(
      parseInt(fase_id),
      parseInt(obra_id),
      admin_id,
      notas
    )

    res.json({
      success: true,
      data: resultado,
      message: 'Obra seleccionada para concurso exitosamente'
    })
  } catch (error) {
    console.error('Error al seleccionar obra:', error)

    // Errores de validación de PL/pgSQL
    if (error.message.includes('no es de tipo concurso')) {
      return res.status(400).json({
        success: false,
        error: 'La fase especificada no es de tipo concurso'
      })
    }

    if (error.message.includes('no acepta participar en concursos')) {
      return res.status(400).json({
        success: false,
        error: 'El artista no ha aceptado participar en concursos'
      })
    }

    if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al seleccionar obra para concurso'
    })
  }
}

/**
 * DELETE /api/concurso/:fase_id/deseleccionar-obra/:obra_id
 * Deseleccionar una obra de concurso
 */
export const deseleccionarObra = async (req, res) => {
  try {
    const { fase_id, obra_id } = req.params

    // Validaciones
    if (!fase_id || isNaN(parseInt(fase_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de fase inválido'
      })
    }

    if (!obra_id || isNaN(parseInt(obra_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de obra inválido'
      })
    }

    const resultado = await concursoService.deseleccionarObraParaConcurso(
      parseInt(fase_id),
      parseInt(obra_id)
    )

    if (!resultado) {
      return res.status(404).json({
        success: false,
        error: 'Obra no encontrada en concurso'
      })
    }

    res.json({
      success: true,
      data: resultado,
      message: 'Obra deseleccionada exitosamente'
    })
  } catch (error) {
    console.error('Error al deseleccionar obra:', error)
    res.status(500).json({
      success: false,
      error: 'Error al deseleccionar obra',
      details: error.message
    })
  }
}

/**
 * GET /api/concurso/:fase_id/obras-seleccionadas
 * Obtener obras seleccionadas de un concurso
 * Query params: artista_id (opcional)
 */
export const getObrasSeleccionadas = async (req, res) => {
  try {
    const { fase_id } = req.params
    const { artista_id } = req.query

    // Validaciones
    if (!fase_id || isNaN(parseInt(fase_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de fase inválido'
      })
    }

    const obras = await concursoService.getObrasSeleccionadasConcurso(
      parseInt(fase_id),
      { artista_id: artista_id ? parseInt(artista_id) : undefined }
    )

    res.json({
      success: true,
      data: obras,
      total: obras.length
    })
  } catch (error) {
    console.error('Error al obtener obras seleccionadas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener obras seleccionadas',
      details: error.message
    })
  }
}

/**
 * GET /api/concurso/:fase_id/estadisticas
 * Obtener estadísticas de un concurso
 */
export const getEstadisticas = async (req, res) => {
  try {
    const { fase_id } = req.params

    // Validaciones
    if (!fase_id || isNaN(parseInt(fase_id))) {
      return res.status(400).json({
        success: false,
        error: 'ID de fase inválido'
      })
    }

    const stats = await concursoService.getEstadisticasConcurso(parseInt(fase_id))

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del concurso',
      details: error.message
    })
  }
}
