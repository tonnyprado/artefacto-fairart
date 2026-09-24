/**
 * Controlador de Votaciones - Sistema de Rondas
 * Maneja la lógica de negocio para las votaciones de curadores con 3 rondas
 */

import pool from '../config/database.js'

/**
 * POST /api/votaciones
 * Crear o actualizar una votación (Solo curador)
 */
export const createOrUpdateVotacion = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { postulacion_id, ronda_id, valor, comentario, conoce_artista } = req.body
    const curadorId = req.user.curadorId

    // Validaciones
    if (!postulacion_id || !ronda_id || valor === undefined) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'postulacion_id, ronda_id y valor son requeridos'
      })
    }

    // Verificar que la ronda existe y está abierta
    const rondaResult = await client.query(
      'SELECT r.*, f.config_json FROM rondas r JOIN fases f ON f.id = r.fase_id WHERE r.id = $1',
      [ronda_id]
    )

    if (rondaResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Ronda no encontrada'
      })
    }

    const ronda = rondaResult.rows[0]
    const config = ronda.config_json

    if (ronda.estado !== 'abierta') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'La ronda está cerrada. No se pueden emitir o modificar votos.'
      })
    }

    // Validar valor según el número de ronda
    if (ronda.numero === 1) {
      if (![0, 1, 2].includes(valor)) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error: 'En Ronda 1, el valor debe ser: 0=No, 1=Tal vez, 2=Sí'
        })
      }
    } else if (ronda.numero === 2) {
      if (valor !== 1) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error: 'En Ronda 2, el valor debe ser: 1=voto'
        })
      }

      // Verificar límite de votos en Ronda 2
      const totalVotosResult = await client.query(
        'SELECT COUNT(*) as total FROM votaciones WHERE curador_id = $1 AND ronda_id = $2',
        [curadorId, ronda_id]
      )

      const totalVotos = parseInt(totalVotosResult.rows[0].total)
      const maxVotos = config.votos_r2 || 10

      // Verificar si ya votó por esta postulación
      const yaCuentaResult = await client.query(
        'SELECT id FROM votaciones WHERE curador_id = $1 AND postulacion_id = $2 AND ronda_id = $3',
        [curadorId, postulacion_id, ronda_id]
      )

      if (yaCuentaResult.rows.length === 0 && totalVotos >= maxVotos) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error: `Has alcanzado el límite de ${maxVotos} votos para esta ronda`,
          total_votos: totalVotos,
          max_votos: maxVotos
        })
      }
    } else if (ronda.numero === 3) {
      if (![0, 1].includes(valor)) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          error: 'En Ronda 3, el valor debe ser: 0=No, 1=Sí'
        })
      }
    }

    // Verificar que la postulación existe y obtener datos
    const postulacionResult = await client.query(
      'SELECT * FROM postulaciones WHERE id = $1',
      [postulacion_id]
    )

    if (postulacionResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Postulación no encontrada'
      })
    }

    const postulacion = postulacionResult.rows[0]

    // Usar fase_id de la ronda que ya fue consultada arriba
    const fase_id = ronda.fase_id

    // Verificar si ya existe un voto
    const existeResult = await client.query(
      'SELECT * FROM votaciones WHERE curador_id = $1 AND postulacion_id = $2 AND ronda_id = $3',
      [curadorId, postulacion_id, ronda_id]
    )

    let result
    let accion

    if (existeResult.rows.length > 0) {
      // Actualizar voto existente
      const votoAnterior = existeResult.rows[0]

      result = await client.query(
        `UPDATE votaciones
         SET valor = $1, comentario = $2, conoce_artista = $3, voto = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [valor, comentario || null, conoce_artista || false, valor > 0, existeResult.rows[0].id]
      )

      accion = 'voto_actualizado'

      // Log de actualización
      await client.query(
        `INSERT INTO log_votaciones (curador_id, postulacion_id, ronda_id, accion, valor_anterior, valor_nuevo)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          curadorId,
          postulacion_id,
          ronda_id,
          accion,
          JSON.stringify(votoAnterior),
          JSON.stringify(result.rows[0])
        ]
      )
    } else {
      // Crear nuevo voto (incluir campos legacy para compatibilidad)
      result = await client.query(
        `INSERT INTO votaciones (
          curador_id, postulacion_id, ronda_id, artista_id, fase_id, valor, voto, comentario, conoce_artista
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          curadorId,
          postulacion_id,
          ronda_id,
          postulacion.artista_id,
          fase_id,
          valor,
          valor > 0, // voto boolean (legacy)
          comentario || null,
          conoce_artista || false
        ]
      )

      accion = 'voto_creado'

      // Log de creación
      await client.query(
        `INSERT INTO log_votaciones (curador_id, postulacion_id, ronda_id, accion, valor_nuevo)
         VALUES ($1, $2, $3, $4, $5)`,
        [curadorId, postulacion_id, ronda_id, accion, JSON.stringify(result.rows[0])]
      )
    }

    await client.query('COMMIT')

    res.status(existeResult.rows.length > 0 ? 200 : 201).json({
      success: true,
      data: result.rows[0],
      message: existeResult.rows.length > 0 ? 'Voto actualizado exitosamente' : 'Voto registrado exitosamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al crear/actualizar votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear/actualizar votación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  } finally {
    client.release()
  }
}

/**
 * GET /api/votaciones/mis-votos
 * Obtener votaciones del curador autenticado
 */
export const getMisVotaciones = async (req, res) => {
  try {
    const curadorId = req.user.curadorId
    const { ronda_id, fase_id } = req.query

    if (!curadorId) {
      return res.status(400).json({
        success: false,
        error: 'curadorId no encontrado en el token'
      })
    }

    let query = `
      SELECT v.*,
             p.disciplina,
             p.tipo,
             p.estado as postulacion_estado,
             a.nombre,
             a.apellido,
             a.foto as artista_foto,
             r.numero as ronda_numero,
             r.estado as ronda_estado,
             f.nombre as fase_nombre
      FROM votaciones v
      JOIN postulaciones p ON p.id = v.postulacion_id
      JOIN artistas a ON a.id = p.artista_id
      JOIN rondas r ON r.id = v.ronda_id
      JOIN fases f ON f.id = r.fase_id
      WHERE v.curador_id = $1
    `
    const values = [curadorId]
    let paramCount = 2

    if (ronda_id) {
      query += ` AND v.ronda_id = $${paramCount}`
      values.push(ronda_id)
      paramCount++
    }

    if (fase_id) {
      query += ` AND f.id = $${paramCount}`
      values.push(fase_id)
      paramCount++
    }

    query += ' ORDER BY v.created_at DESC'

    const result = await pool.query(query, values)

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
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
 * GET /api/votaciones/ronda/:ronda_id/resultados
 * Obtener resultados de una ronda (Solo si está cerrada o es admin)
 */
export const getResultadosRonda = async (req, res) => {
  try {
    const { ronda_id } = req.params
    const esAdmin = req.user.role === 'admin'

    // Verificar que la ronda existe
    const rondaResult = await pool.query(
      'SELECT * FROM rondas WHERE id = $1',
      [ronda_id]
    )

    if (rondaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ronda no encontrada'
      })
    }

    const ronda = rondaResult.rows[0]

    // VOTO CIEGO: Solo admin puede ver resultados de ronda abierta
    if (ronda.estado === 'abierta' && !esAdmin) {
      return res.status(403).json({
        success: false,
        error: 'No se pueden ver los resultados de una ronda abierta'
      })
    }

    // Obtener resultados agregados
    const result = await pool.query(`
      SELECT
        p.id as postulacion_id,
        p.disciplina,
        p.tipo,
        p.estado,
        p.indice_r1,
        p.respaldo_r2,
        p.aprobacion_r3,
        p.posicion,
        a.id as artista_id,
        a.nombre,
        a.apellido,
        a.foto as artista_foto,
        COUNT(v.id) as total_votos,
        COUNT(CASE WHEN v.conoce_artista THEN 1 END) as votos_conoce_artista,

        -- Distribución de votos según ronda
        ${ronda.numero === 1 ? `
          COUNT(CASE WHEN v.valor = 2 THEN 1 END) as votos_si,
          COUNT(CASE WHEN v.valor = 1 THEN 1 END) as votos_tal_vez,
          COUNT(CASE WHEN v.valor = 0 THEN 1 END) as votos_no,
          CASE
            WHEN COUNT(v.id) > 0
            THEN ROUND((SUM(v.valor)::DECIMAL / (2.0 * COUNT(v.id)))::NUMERIC, 4)
            ELSE 0
          END as indice_calculado
        ` : ''}

        ${ronda.numero === 2 ? `
          COUNT(CASE WHEN v.valor = 1 THEN 1 END) as votos_favor
        ` : ''}

        ${ronda.numero === 3 ? `
          COUNT(CASE WHEN v.valor = 1 THEN 1 END) as votos_si,
          COUNT(CASE WHEN v.valor = 0 THEN 1 END) as votos_no,
          CASE
            WHEN COUNT(v.id) > 0
            THEN ROUND((COUNT(CASE WHEN v.valor = 1 THEN 1 END)::DECIMAL / COUNT(v.id))::NUMERIC, 4)
            ELSE 0
          END as aprobacion_calculada
        ` : ''}

      FROM postulaciones p
      JOIN artistas a ON a.id = p.artista_id
      LEFT JOIN votaciones v ON v.postulacion_id = p.id AND v.ronda_id = $1
      WHERE p.fase_actual_id = (SELECT fase_id FROM rondas WHERE id = $1)
      GROUP BY p.id, a.id, a.nombre, a.apellido, a.foto
      ORDER BY
        ${ronda.numero === 1 ? 'indice_calculado DESC' : ''}
        ${ronda.numero === 2 ? 'votos_favor DESC' : ''}
        ${ronda.numero === 3 ? 'aprobacion_calculada DESC, p.respaldo_r2 DESC' : ''}
    `, [ronda_id])

    // Si la ronda está cerrada, también obtener todos los votos individuales
    let votosDetalle = []
    if (ronda.estado === 'cerrada' || esAdmin) {
      const votosResult = await pool.query(`
        SELECT
          v.*,
          c.nombre as curador_nombre,
          c.email as curador_email,
          p.artista_id,
          a.nombre as artista_nombre,
          a.apellido as artista_apellido
        FROM votaciones v
        JOIN curadores c ON c.id = v.curador_id
        JOIN postulaciones p ON p.id = v.postulacion_id
        JOIN artistas a ON a.id = p.artista_id
        WHERE v.ronda_id = $1
        ORDER BY c.nombre, a.nombre
      `, [ronda_id])

      votosDetalle = votosResult.rows
    }

    res.json({
      success: true,
      data: {
        ronda,
        resultados: result.rows,
        votos_detalle: votosDetalle
      }
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
 * Obtener estadísticas del curador autenticado
 */
export const getEstadisticasCurador = async (req, res) => {
  try {
    const curadorId = req.user.curadorId
    const { ronda_id, fase_id } = req.query

    if (!curadorId) {
      return res.json({
        success: true,
        data: {
          total_votos: 0,
          votos_por_ronda: [],
          postulaciones_pendientes: 0
        }
      })
    }

    let query = `
      SELECT
        r.numero as ronda_numero,
        r.id as ronda_id,
        COUNT(v.id) as total_votos,
        COUNT(CASE WHEN v.conoce_artista THEN 1 END) as votos_conoce_artista,
        MIN(v.created_at) as primer_voto,
        MAX(v.created_at) as ultimo_voto
      FROM votaciones v
      JOIN rondas r ON r.id = v.ronda_id
      WHERE v.curador_id = $1
    `
    const values = [curadorId]
    let paramCount = 2

    if (ronda_id) {
      query += ` AND v.ronda_id = $${paramCount}`
      values.push(ronda_id)
      paramCount++
    }

    if (fase_id) {
      query += ` AND r.fase_id = $${paramCount}`
      values.push(fase_id)
      paramCount++
    }

    query += ' GROUP BY r.numero, r.id ORDER BY r.numero'

    const result = await pool.query(query, values)

    // Total general
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM votaciones WHERE curador_id = $1`,
      [curadorId]
    )

    res.json({
      success: true,
      data: {
        total_votos: parseInt(totalResult.rows[0].total),
        votos_por_ronda: result.rows
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
 * Eliminar una votación (Solo curador dueño, solo si la ronda está abierta)
 */
export const deleteVotacion = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params
    const curadorId = req.user.curadorId

    // Buscar votación con información de ronda
    const votacionResult = await client.query(
      `SELECT v.*, r.estado as ronda_estado
       FROM votaciones v
       JOIN rondas r ON r.id = v.ronda_id
       WHERE v.id = $1`,
      [id]
    )

    if (votacionResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Votación no encontrada'
      })
    }

    const votacion = votacionResult.rows[0]

    // Verificar permisos
    if (votacion.curador_id !== curadorId && req.user.role !== 'admin') {
      await client.query('ROLLBACK')
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta votación'
      })
    }

    // Verificar que la ronda está abierta (solo admin puede eliminar de ronda cerrada)
    if (votacion.ronda_estado === 'cerrada' && req.user.role !== 'admin') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un voto de una ronda cerrada'
      })
    }

    // Log antes de eliminar
    await client.query(
      `INSERT INTO log_votaciones (curador_id, postulacion_id, ronda_id, accion, valor_anterior)
       VALUES ($1, $2, $3, 'voto_eliminado', $4)`,
      [curadorId, votacion.postulacion_id, votacion.ronda_id, JSON.stringify(votacion)]
    )

    // Eliminar votación
    await client.query('DELETE FROM votaciones WHERE id = $1', [id])

    await client.query('COMMIT')

    res.json({
      success: true,
      message: 'Votación eliminada exitosamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al eliminar votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar votación'
    })
  } finally {
    client.release()
  }
}

/**
 * GET /api/votaciones/ronda/:ronda_id/progreso
 * Obtener progreso de votación del curador en una ronda
 */
export const getProgresoRonda = async (req, res) => {
  try {
    const { ronda_id } = req.params
    const curadorId = req.user.curadorId

    // Total de postulaciones disponibles para votar en esta ronda
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM postulaciones p
      JOIN rondas r ON r.fase_id = p.fase_actual_id
      WHERE r.id = $1
        AND p.estado IN (
          CASE
            WHEN r.numero = 1 THEN 'admitida'
            WHEN r.numero = 2 THEN 'shortlist'
            WHEN r.numero = 3 THEN 'deliberacion'
          END
        )
    `, [ronda_id])

    // Total votadas por el curador
    const votadasResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM votaciones
      WHERE ronda_id = $1 AND curador_id = $2
    `, [ronda_id, curadorId])

    // Si es Ronda 2, verificar límite de votos
    const rondaResult = await pool.query(
      `SELECT r.numero, f.config_json
       FROM rondas r
       JOIN fases f ON f.id = r.fase_id
       WHERE r.id = $1`,
      [ronda_id]
    )

    const ronda = rondaResult.rows[0]
    const config = ronda.config_json
    const maxVotosR2 = ronda.numero === 2 ? (config.votos_r2 || 10) : null

    res.json({
      success: true,
      data: {
        total_postulaciones: parseInt(totalResult.rows[0].total),
        total_votadas: parseInt(votadasResult.rows[0].total),
        max_votos_r2: maxVotosR2,
        votos_restantes_r2: maxVotosR2 ? maxVotosR2 - parseInt(votadasResult.rows[0].total) : null
      }
    })
  } catch (error) {
    console.error('Error al obtener progreso:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener progreso'
    })
  }
}

// Mantener compatibilidad con endpoints antiguos
export const createVotacion = createOrUpdateVotacion
export const updateVotacion = createOrUpdateVotacion
export const verificarVoto = async (req, res) => {
  try {
    const { fase_id, artista_id } = req.params
    const { ronda_id } = req.query
    const curadorId = req.user.curadorId

    // Buscar postulación
    const postulacionResult = await pool.query(
      'SELECT id FROM postulaciones WHERE artista_id = $1 AND fase_actual_id = $2',
      [artista_id, fase_id]
    )

    if (postulacionResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          has_votado: false,
          votacion: null
        }
      })
    }

    const postulacionId = postulacionResult.rows[0].id

    // Buscar voto
    const result = await pool.query(
      `SELECT * FROM votaciones
       WHERE curador_id = $1 AND postulacion_id = $2 AND ronda_id = $3`,
      [curadorId, postulacionId, ronda_id]
    )

    const votacion = result.rows.length > 0 ? result.rows[0] : null

    res.json({
      success: true,
      data: {
        has_votado: !!votacion,
        votacion: votacion
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

// Alias para compatibilidad
export const getResultadosFase = getResultadosRonda
