/**
 * Controlador de Votaciones
 * Maneja la lógica de negocio para las votaciones de curadores
 */

import {
  votaciones,
  fases,
  curadores,
  artistas,
  artistas_fases,
  getNextId,
  now
} from '../data/mockData.js'

/**
 * POST /api/votaciones
 * Crear una nueva votación (Solo curador)
 */
export const createVotacion = async (req, res) => {
  try {
    const { artista_id, fase_id, voto, comentario } = req.body
    const curadorId = req.user.curadorId // El middleware debe añadir esto al req.user

    // Validaciones
    if (!artista_id || !fase_id || voto === undefined) {
      return res.status(400).json({
        success: false,
        error: 'artista_id, fase_id y voto son requeridos'
      })
    }

    // Verificar que la fase existe
    const fase = fases.find(f => f.id === parseInt(fase_id))
    if (!fase) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Verificar que las votaciones están abiertas
    if (!fase.votaciones_abiertas) {
      return res.status(400).json({
        success: false,
        error: 'Las votaciones están cerradas para esta fase'
      })
    }

    // Verificar que la fase no está finalizada
    if (fase.finalizada) {
      return res.status(400).json({
        success: false,
        error: 'No se puede votar en una fase finalizada'
      })
    }

    // Verificar que el artista existe
    const artista = artistas.find(a => a.id === parseInt(artista_id))
    if (!artista) {
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Verificar que el artista está inscrito en la fase
    const inscripcion = artistas_fases.find(
      af => af.artista_id === parseInt(artista_id) && af.fase_id === parseInt(fase_id)
    )
    if (!inscripcion) {
      return res.status(400).json({
        success: false,
        error: 'El artista no está inscrito en esta fase'
      })
    }

    // Verificar que el curador no ha votado ya por este artista en esta fase
    const votacionExistente = votaciones.find(
      v => v.curador_id === curadorId &&
           v.artista_id === parseInt(artista_id) &&
           v.fase_id === parseInt(fase_id)
    )
    if (votacionExistente) {
      return res.status(400).json({
        success: false,
        error: 'Ya has votado por este artista en esta fase. Usa PUT para actualizar tu voto.'
      })
    }

    // Crear votación
    const nuevaVotacion = {
      id: getNextId.votacion(),
      curador_id: curadorId,
      artista_id: parseInt(artista_id),
      fase_id: parseInt(fase_id),
      voto: Boolean(voto),
      comentario: comentario || null,
      fecha: now(),
      created_at: now(),
      updated_at: now()
    }

    votaciones.push(nuevaVotacion)

    res.status(201).json({
      success: true,
      data: nuevaVotacion,
      message: 'Voto registrado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear votación'
    })
  }
}

/**
 * PUT /api/votaciones/:id
 * Actualizar una votación existente (Solo curador que creó el voto)
 */
export const updateVotacion = async (req, res) => {
  try {
    const { id } = req.params
    const { voto, comentario } = req.body
    const curadorId = req.user.curadorId

    // Buscar votación
    const votacionIndex = votaciones.findIndex(v => v.id === parseInt(id))
    if (votacionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Votación no encontrada'
      })
    }

    const votacion = votaciones[votacionIndex]

    // Verificar que el curador es dueño de la votación
    if (votacion.curador_id !== curadorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para editar esta votación'
      })
    }

    // Verificar que la fase aún tiene votaciones abiertas
    const fase = fases.find(f => f.id === votacion.fase_id)
    if (!fase || fase.finalizada) {
      return res.status(400).json({
        success: false,
        error: 'No se puede editar un voto de una fase finalizada'
      })
    }

    // Actualizar votación
    if (voto !== undefined) {
      votaciones[votacionIndex].voto = Boolean(voto)
    }
    if (comentario !== undefined) {
      votaciones[votacionIndex].comentario = comentario
    }
    votaciones[votacionIndex].updated_at = now()

    res.json({
      success: true,
      data: votaciones[votacionIndex],
      message: 'Voto actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar votación'
    })
  }
}

/**
 * GET /api/votaciones/mis-votos
 * Obtener votaciones del curador autenticado
 */
export const getMisVotaciones = async (req, res) => {
  try {
    const curadorId = req.user.curadorId
    const { fase_id } = req.query

    let votacionesCurador = votaciones.filter(v => v.curador_id === curadorId)

    // Filtrar por fase si se especifica
    if (fase_id) {
      votacionesCurador = votacionesCurador.filter(v => v.fase_id === parseInt(fase_id))
    }

    res.json({
      success: true,
      data: votacionesCurador
    })
  } catch (error) {
    console.error('Error al obtener votaciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener votaciones'
    })
  }
}

/**
 * GET /api/votaciones/resultados/:fase_id
 * Obtener resultados de una fase (ranking de artistas)
 */
export const getResultadosFase = async (req, res) => {
  try {
    const { fase_id } = req.params

    // Verificar que la fase existe
    const fase = fases.find(f => f.id === parseInt(fase_id))
    if (!fase) {
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    // Obtener todas las votaciones de esta fase
    const votacionesFase = votaciones.filter(v => v.fase_id === parseInt(fase_id))

    // Agrupar por artista y calcular votos
    const resultadosPorArtista = {}

    votacionesFase.forEach(votacion => {
      const artistaId = votacion.artista_id

      if (!resultadosPorArtista[artistaId]) {
        resultadosPorArtista[artistaId] = {
          artista_id: artistaId,
          total_votos_favor: 0,
          total_votos_contra: 0
        }
      }

      if (votacion.voto === true) {
        resultadosPorArtista[artistaId].total_votos_favor++
      } else {
        resultadosPorArtista[artistaId].total_votos_contra++
      }
    })

    // Convertir a array y calcular porcentajes
    let resultados = Object.values(resultadosPorArtista).map(resultado => {
      const totalVotos = resultado.total_votos_favor + resultado.total_votos_contra
      const porcentajeAprobacion = totalVotos > 0
        ? ((resultado.total_votos_favor / totalVotos) * 100).toFixed(2)
        : 0

      return {
        ...resultado,
        porcentaje_aprobacion: parseFloat(porcentajeAprobacion)
      }
    })

    // Ordenar por porcentaje de aprobación (mayor a menor)
    resultados.sort((a, b) => b.porcentaje_aprobacion - a.porcentaje_aprobacion)

    // Agregar posición
    resultados = resultados.map((resultado, index) => ({
      ...resultado,
      posicion: index + 1
    }))

    res.json({
      success: true,
      data: resultados
    })
  } catch (error) {
    console.error('Error al obtener resultados:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener resultados'
    })
  }
}

/**
 * GET /api/votaciones/estadisticas
 * Obtener estadísticas de votaciones del curador autenticado
 */
export const getEstadisticasCurador = async (req, res) => {
  try {
    const curadorId = req.user.curadorId
    const { fase_id } = req.query

    let votacionesCurador = votaciones.filter(v => v.curador_id === curadorId)

    // Filtrar por fase si se especifica
    if (fase_id) {
      votacionesCurador = votacionesCurador.filter(v => v.fase_id === parseInt(fase_id))
    }

    const totalVotos = votacionesCurador.length
    const votosFavor = votacionesCurador.filter(v => v.voto === true).length
    const votosContra = votacionesCurador.filter(v => v.voto === false).length
    const porcentajeFavor = totalVotos > 0
      ? ((votosFavor / totalVotos) * 100).toFixed(1)
      : 0

    res.json({
      success: true,
      data: {
        total_votos: totalVotos,
        votos_favor: votosFavor,
        votos_contra: votosContra,
        porcentaje_favor: parseFloat(porcentajeFavor)
      }
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    })
  }
}

/**
 * DELETE /api/votaciones/:id
 * Eliminar una votación (Solo admin o curador dueño)
 */
export const deleteVotacion = async (req, res) => {
  try {
    const { id } = req.params
    const curadorId = req.user.curadorId

    const votacionIndex = votaciones.findIndex(v => v.id === parseInt(id))
    if (votacionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Votación no encontrada'
      })
    }

    const votacion = votaciones[votacionIndex]

    // Verificar permisos
    if (votacion.curador_id !== curadorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta votación'
      })
    }

    // Verificar que la fase no está finalizada
    const fase = fases.find(f => f.id === votacion.fase_id)
    if (fase && fase.finalizada) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un voto de una fase finalizada'
      })
    }

    votaciones.splice(votacionIndex, 1)

    res.json({
      success: true,
      message: 'Votación eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar votación'
    })
  }
}

/**
 * GET /api/votaciones/fase/:fase_id/artista/:artista_id
 * Verificar si el curador ya votó por un artista en una fase
 */
export const verificarVoto = async (req, res) => {
  try {
    const { fase_id, artista_id } = req.params
    const curadorId = req.user.curadorId

    const votacion = votaciones.find(
      v => v.curador_id === curadorId &&
           v.artista_id === parseInt(artista_id) &&
           v.fase_id === parseInt(fase_id)
    )

    res.json({
      success: true,
      data: {
        has_votado: !!votacion,
        votacion: votacion || null
      }
    })
  } catch (error) {
    console.error('Error al verificar voto:', error)
    res.status(500).json({
      success: false,
      error: 'Error al verificar voto'
    })
  }
}
