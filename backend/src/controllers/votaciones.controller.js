/**
 * Controlador de Votaciones
 * Maneja la lógica de negocio para las votaciones de curadores
 * Usa PostgreSQL si está disponible, sino usa mockData
 */

import pool from '../config/database.js'
import {
  votaciones,
  fases,
  curadores,
  artistas,
  artistas_fases,
  getNextId,
  now
} from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

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

    if (useDatabase()) {
      // Verificar que la fase existe y tiene votaciones abiertas
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [fase_id]
      )
      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      const fase = faseResult.rows[0]

      if (!fase.votaciones_abiertas) {
        return res.status(400).json({
          success: false,
          error: 'Las votaciones están cerradas para esta fase'
        })
      }

      if (fase.finalizada) {
        return res.status(400).json({
          success: false,
          error: 'No se puede votar en una fase finalizada'
        })
      }

      // Verificar que el artista existe
      const artistaResult = await pool.query(
        'SELECT id FROM artistas WHERE id = $1',
        [artista_id]
      )
      if (artistaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Artista no encontrado'
        })
      }

      // Verificar que el artista está inscrito en la fase
      const inscripcionResult = await pool.query(
        'SELECT id FROM artistas_fases WHERE artista_id = $1 AND fase_id = $2',
        [artista_id, fase_id]
      )
      if (inscripcionResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El artista no está inscrito en esta fase'
        })
      }

      // Verificar que el curador no ha votado ya por este artista en esta fase
      const votacionExistenteResult = await pool.query(
        'SELECT id FROM votaciones WHERE curador_id = $1 AND artista_id = $2 AND fase_id = $3',
        [curadorId, artista_id, fase_id]
      )
      if (votacionExistenteResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Ya has votado por este artista en esta fase. Usa PUT para actualizar tu voto.'
        })
      }

      // Crear votación
      const result = await pool.query(
        `INSERT INTO votaciones (curador_id, artista_id, fase_id, voto, comentario, fecha, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [curadorId, artista_id, fase_id, Boolean(voto), comentario || null]
      )

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Voto registrado exitosamente'
      })
    }

    // Fallback a mockData
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

    if (useDatabase()) {
      // Buscar votación con información de fase
      const votacionResult = await pool.query(
        `SELECT v.*, f.finalizada as fase_finalizada
         FROM votaciones v
         LEFT JOIN fases f ON f.id = v.fase_id
         WHERE v.id = $1`,
        [id]
      )
      if (votacionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Votación no encontrada'
        })
      }

      const votacion = votacionResult.rows[0]

      // Verificar permisos
      if (votacion.curador_id !== curadorId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para editar esta votación'
        })
      }

      // Verificar que la fase no está finalizada
      if (votacion.fase_finalizada) {
        return res.status(400).json({
          success: false,
          error: 'No se puede editar un voto de una fase finalizada'
        })
      }

      // Construir UPDATE dinámico
      const updates = []
      const values = []
      let paramCount = 1

      if (voto !== undefined) {
        updates.push(`voto = $${paramCount}`)
        values.push(Boolean(voto))
        paramCount++
      }
      if (comentario !== undefined) {
        updates.push(`comentario = $${paramCount}`)
        values.push(comentario)
        paramCount++
      }
      updates.push('updated_at = CURRENT_TIMESTAMP')

      values.push(id)
      const query = `UPDATE votaciones SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`
      const result = await pool.query(query, values)

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Voto actualizado exitosamente'
      })
    }

    // Fallback a mockData
    const votacionIndex = votaciones.findIndex(v => v.id === parseInt(id))
    if (votacionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Votación no encontrada'
      })
    }

    const votacion = votaciones[votacionIndex]

    if (votacion.curador_id !== curadorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para editar esta votación'
      })
    }

    const fase = fases.find(f => f.id === votacion.fase_id)
    if (!fase || fase.finalizada) {
      return res.status(400).json({
        success: false,
        error: 'No se puede editar un voto de una fase finalizada'
      })
    }

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

    console.log('getMisVotaciones - user:', req.user)
    console.log('getMisVotaciones - curadorId:', curadorId)

    if (!curadorId) {
      return res.status(400).json({
        success: false,
        error: 'curadorId no encontrado en el token. Por favor, cierra sesión e inicia de nuevo.'
      })
    }

    if (useDatabase()) {
      let query = `
        SELECT v.*,
               a.nombre_artistico,
               a.nombre,
               a.apellido,
               a.foto_perfil,
               f.nombre as fase_nombre
        FROM votaciones v
        LEFT JOIN artistas a ON a.id = v.artista_id
        LEFT JOIN fases f ON f.id = v.fase_id
        WHERE v.curador_id = $1
      `
      const values = [curadorId]

      if (fase_id) {
        query += ' AND v.fase_id = $2'
        values.push(fase_id)
      }

      query += ' ORDER BY v.fecha DESC'

      const result = await pool.query(query, values)

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
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
    console.error('Error stack:', error.stack)
    res.status(500).json({
      success: false,
      error: 'Error al obtener votaciones',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    if (useDatabase()) {
      // Verificar que la fase existe
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [fase_id]
      )
      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      // Obtener resultados agregados por artista con ranking
      const result = await pool.query(`
        SELECT
          a.id as artista_id,
          a.nombre_artistico,
          a.nombre,
          a.apellido,
          a.foto_perfil,
          COUNT(CASE WHEN v.voto = true THEN 1 END)::int as total_votos_favor,
          COUNT(CASE WHEN v.voto = false THEN 1 END)::int as total_votos_contra,
          COUNT(v.id)::int as total_votos,
          CASE
            WHEN COUNT(v.id) > 0
            THEN ROUND((COUNT(CASE WHEN v.voto = true THEN 1 END)::numeric / COUNT(v.id) * 100), 2)
            ELSE 0
          END as porcentaje_aprobacion,
          ROW_NUMBER() OVER (
            ORDER BY
              CASE
                WHEN COUNT(v.id) > 0
                THEN (COUNT(CASE WHEN v.voto = true THEN 1 END)::numeric / COUNT(v.id))
                ELSE 0
              END DESC,
              COUNT(CASE WHEN v.voto = true THEN 1 END) DESC
          ) as posicion
        FROM artistas_fases af
        JOIN artistas a ON a.id = af.artista_id
        LEFT JOIN votaciones v ON v.artista_id = a.id AND v.fase_id = af.fase_id
        WHERE af.fase_id = $1
        GROUP BY a.id, a.nombre_artistico, a.nombre, a.apellido, a.foto_perfil
        ORDER BY posicion
      `, [fase_id])

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
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

    console.log('getEstadisticasCurador - user:', req.user)
    console.log('getEstadisticasCurador - curadorId:', curadorId)

    if (!curadorId) {
      // Si no hay curadorId, devolver estadísticas vacías en lugar de error
      return res.json({
        success: true,
        data: {
          total_votos: 0,
          votos_favor: 0,
          votos_contra: 0,
          porcentaje_favor: 0
        }
      })
    }

    if (useDatabase()) {
      let query = `
        SELECT
          COUNT(*)::int as total_votos,
          COUNT(CASE WHEN voto = true THEN 1 END)::int as votos_favor,
          COUNT(CASE WHEN voto = false THEN 1 END)::int as votos_contra,
          CASE
            WHEN COUNT(*) > 0
            THEN ROUND((COUNT(CASE WHEN voto = true THEN 1 END)::numeric / COUNT(*) * 100), 1)
            ELSE 0
          END as porcentaje_favor
        FROM votaciones
        WHERE curador_id = $1
      `
      const values = [curadorId]

      if (fase_id) {
        query += ' AND fase_id = $2'
        values.push(fase_id)
      }

      const result = await pool.query(query, values)

      return res.json({
        success: true,
        data: result.rows[0]
      })
    }

    // Fallback a mockData
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

    if (useDatabase()) {
      // Buscar votación con información de fase
      const votacionResult = await pool.query(
        `SELECT v.*, f.finalizada as fase_finalizada
         FROM votaciones v
         LEFT JOIN fases f ON f.id = v.fase_id
         WHERE v.id = $1`,
        [id]
      )
      if (votacionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Votación no encontrada'
        })
      }

      const votacion = votacionResult.rows[0]

      // Verificar permisos
      if (votacion.curador_id !== curadorId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para eliminar esta votación'
        })
      }

      // Verificar que la fase no está finalizada
      if (votacion.fase_finalizada) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar un voto de una fase finalizada'
        })
      }

      await pool.query('DELETE FROM votaciones WHERE id = $1', [id])

      return res.json({
        success: true,
        message: 'Votación eliminada exitosamente'
      })
    }

    // Fallback a mockData
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

    if (useDatabase()) {
      const result = await pool.query(
        `SELECT * FROM votaciones
         WHERE curador_id = $1 AND artista_id = $2 AND fase_id = $3`,
        [curadorId, artista_id, fase_id]
      )

      const votacion = result.rows.length > 0 ? result.rows[0] : null

      return res.json({
        success: true,
        data: {
          has_votado: !!votacion,
          votacion: votacion
        }
      })
    }

    // Fallback a mockData
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
