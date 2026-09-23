/**
 * Controlador de Postulaciones
 * Maneja la lógica de postulaciones de artistas a fases
 */

import pool from '../config/database.js'

/**
 * GET /api/postulaciones
 * Obtener todas las postulaciones con filtros opcionales
 */
export const getPostulaciones = async (req, res) => {
  try {
    const { fase_id, estado, tipo, es_carryover, artista_id } = req.query

    let query = 'SELECT * FROM v_postulaciones_metricas WHERE 1=1'
    const values = []
    let paramCount = 1

    if (fase_id) {
      query += ` AND fase_actual_id = $${paramCount}`
      values.push(fase_id)
      paramCount++
    }

    if (estado) {
      query += ` AND estado = $${paramCount}`
      values.push(estado)
      paramCount++
    }

    if (tipo) {
      query += ` AND tipo = $${paramCount}`
      values.push(tipo)
      paramCount++
    }

    if (es_carryover !== undefined) {
      query += ` AND es_carryover = $${paramCount}`
      values.push(es_carryover === 'true')
      paramCount++
    }

    if (artista_id) {
      query += ` AND artista_id = $${paramCount}`
      values.push(artista_id)
      paramCount++
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, values)

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    })
  } catch (error) {
    console.error('Error al obtener postulaciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener postulaciones'
    })
  }
}

/**
 * GET /api/postulaciones/:id
 * Obtener una postulación específica con todas sus obras
 */
export const getPostulacion = async (req, res) => {
  try {
    const { id } = req.params

    // Obtener postulación con métricas
    const postulacionResult = await pool.query(
      'SELECT * FROM v_postulaciones_metricas WHERE id = $1',
      [id]
    )

    if (postulacionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Postulación no encontrada'
      })
    }

    const postulacion = postulacionResult.rows[0]

    // Obtener obras asociadas
    const obrasResult = await pool.query(
      `SELECT * FROM obras
       WHERE postulacion_id = $1
       ORDER BY orden ASC, created_at ASC`,
      [id]
    )

    // Obtener votos (solo si la ronda está cerrada o es admin)
    const votosResult = await pool.query(
      `SELECT v.*, c.nombre as curador_nombre, r.numero as ronda_numero, r.estado as ronda_estado
       FROM votaciones v
       JOIN curadores c ON c.id = v.curador_id
       JOIN rondas r ON r.id = v.ronda_id
       WHERE v.postulacion_id = $1
       ORDER BY r.numero, c.nombre`,
      [id]
    )

    res.json({
      success: true,
      data: {
        ...postulacion,
        obras: obrasResult.rows,
        votos: votosResult.rows
      }
    })
  } catch (error) {
    console.error('Error al obtener postulación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener postulación'
    })
  }
}

/**
 * POST /api/postulaciones
 * Crear una nueva postulación
 */
export const createPostulacion = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const {
      fase_origen_id,
      artista_id,
      disciplina,
      tipo
    } = req.body

    // Validaciones
    if (!fase_origen_id || !artista_id || !disciplina || !tipo) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'fase_origen_id, artista_id, disciplina y tipo son requeridos'
      })
    }

    if (!['2d', '3d'].includes(tipo)) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'El tipo debe ser "2d" o "3d"'
      })
    }

    // Verificar que la fase existe y tiene inscripciones abiertas
    const faseResult = await client.query(
      'SELECT * FROM fases WHERE id = $1',
      [fase_origen_id]
    )

    if (faseResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Fase no encontrada'
      })
    }

    const fase = faseResult.rows[0]

    if (!fase.inscripciones_abiertas) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'Las inscripciones están cerradas para esta fase'
      })
    }

    // Verificar que el artista existe
    const artistaResult = await client.query(
      'SELECT id FROM artistas WHERE id = $1',
      [artista_id]
    )

    if (artistaResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Artista no encontrado'
      })
    }

    // Verificar que no existe ya una postulación para este artista en esta fase
    const existeResult = await client.query(
      'SELECT id FROM postulaciones WHERE artista_id = $1 AND fase_origen_id = $2',
      [artista_id, fase_origen_id]
    )

    if (existeResult.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'Ya existe una postulación para este artista en esta fase'
      })
    }

    // Crear postulación
    const result = await client.query(
      `INSERT INTO postulaciones (
        fase_origen_id, artista_id, disciplina, tipo, estado, fase_actual_id
      ) VALUES ($1, $2, $3, $4, 'admitida', $1)
      RETURNING *`,
      [fase_origen_id, artista_id, disciplina, tipo]
    )

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Postulación creada exitosamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al crear postulación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear postulación'
    })
  } finally {
    client.release()
  }
}

/**
 * PUT /api/postulaciones/:id
 * Actualizar una postulación
 */
export const updatePostulacion = async (req, res) => {
  try {
    const { id } = req.params
    const { estado, disciplina, tipo } = req.body

    // Verificar que la postulación existe
    const existeResult = await pool.query(
      'SELECT * FROM postulaciones WHERE id = $1',
      [id]
    )

    if (existeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Postulación no encontrada'
      })
    }

    // Construir UPDATE dinámico
    const updates = []
    const values = []
    let paramCount = 1

    if (estado !== undefined) {
      updates.push(`estado = $${paramCount}`)
      values.push(estado)
      paramCount++
    }

    if (disciplina !== undefined) {
      updates.push(`disciplina = $${paramCount}`)
      values.push(disciplina)
      paramCount++
    }

    if (tipo !== undefined) {
      if (!['2d', '3d'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          error: 'El tipo debe ser "2d" o "3d"'
        })
      }
      updates.push(`tipo = $${paramCount}`)
      values.push(tipo)
      paramCount++
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      })
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)

    const query = `UPDATE postulaciones SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`
    const result = await pool.query(query, values)

    // Log de cambio de estado
    if (estado !== undefined) {
      await pool.query(
        `INSERT INTO log_votaciones (postulacion_id, accion, valor_anterior, valor_nuevo)
         VALUES ($1, 'estado_cambiado', $2, $3)`,
        [id, JSON.stringify({ estado: existeResult.rows[0].estado }), JSON.stringify({ estado })]
      )
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Postulación actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar postulación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar postulación'
    })
  }
}

/**
 * POST /api/postulaciones/:id/mover-a-shortlist
 * Mover manualmente una postulación de reserva a shortlist (Solo admin)
 */
export const moverAShortlist = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params

    // Verificar que la postulación existe y está en reserva
    const postulacionResult = await client.query(
      'SELECT * FROM postulaciones WHERE id = $1',
      [id]
    )

    if (postulacionResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Postulación no encontrada'
      })
    }

    const postulacion = postulacionResult.rows[0]

    if (postulacion.estado !== 'reserva') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden mover postulaciones que estén en estado "reserva"'
      })
    }

    // Mover a shortlist
    const result = await client.query(
      `UPDATE postulaciones
       SET estado = 'shortlist', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    // Log del cambio manual
    await client.query(
      `INSERT INTO log_votaciones (postulacion_id, accion, valor_anterior, valor_nuevo, curador_id)
       VALUES ($1, 'movido_a_shortlist', $2, $3, $4)`,
      [
        id,
        JSON.stringify({ estado: 'reserva' }),
        JSON.stringify({ estado: 'shortlist' }),
        req.user?.curadorId || null
      ]
    )

    await client.query('COMMIT')

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Postulación movida a shortlist exitosamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al mover a shortlist:', error)
    res.status(500).json({
      success: false,
      error: 'Error al mover a shortlist'
    })
  } finally {
    client.release()
  }
}

/**
 * GET /api/postulaciones/fase/:fase_id/para-votacion
 * Obtener postulaciones de una fase en orden aleatorio para el curador actual
 */
export const getPostulacionesParaVotacion = async (req, res) => {
  try {
    const { fase_id } = req.params
    const { ronda_id } = req.query
    const curadorId = req.user.curadorId

    if (!curadorId) {
      return res.status(400).json({
        success: false,
        error: 'curadorId no encontrado en el token'
      })
    }

    // Verificar que la ronda está abierta
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

    // Obtener postulaciones según la ronda
    let estadosPermitidos = []
    if (ronda.numero === 1) {
      estadosPermitidos = ['admitida', 'ronda_1']
    } else if (ronda.numero === 2) {
      estadosPermitidos = ['shortlist', 'ronda_2']
    } else if (ronda.numero === 3) {
      estadosPermitidos = ['deliberacion', 'ronda_3']
    }

    // Orden aleatorio estable por curador (semilla = curador_id + ronda_id)
    const seed = (curadorId * 1000) + parseInt(ronda_id)
    const seedValue = seed / 1000000.0

    // Ejecutar setseed primero
    await pool.query('SELECT setseed($1)', [seedValue])

    const result = await pool.query(`
      SELECT
        p.*,
        a.nombre,
        a.apellido,
        a.email as artista_email,
        a.foto as artista_foto,
        (SELECT COUNT(*) FROM obras WHERE postulacion_id = p.id) as total_obras,
        COALESCE(v.id IS NOT NULL, false) as ya_votado,
        v.valor as mi_voto,
        v.comentario as mi_comentario,
        v.conoce_artista as mi_conoce_artista
      FROM postulaciones p
      JOIN artistas a ON a.id = p.artista_id
      LEFT JOIN votaciones v ON v.postulacion_id = p.id AND v.curador_id = $1 AND v.ronda_id = $2
      WHERE p.fase_actual_id = $3
        AND p.estado = ANY($4::varchar[])
      ORDER BY RANDOM()
    `, [curadorId, ronda_id, fase_id, estadosPermitidos])

    console.log(`[Votación] Fase ${fase_id}, Ronda ${ronda.numero}: Encontradas ${result.rows.length} postulaciones con estados ${estadosPermitidos.join(', ')}`)

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      ronda: ronda,
      estados_permitidos: estadosPermitidos
    })
  } catch (error) {
    console.error('Error al obtener postulaciones para votación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener postulaciones para votación'
    })
  }
}

/**
 * DELETE /api/postulaciones/:id
 * Eliminar una postulación (Solo admin, solo si no tiene votos)
 */
export const deletePostulacion = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params

    // Verificar que no tiene votos
    const votosResult = await client.query(
      'SELECT COUNT(*) as total FROM votaciones WHERE postulacion_id = $1',
      [id]
    )

    if (parseInt(votosResult.rows[0].total) > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una postulación que ya tiene votos registrados'
      })
    }

    // Eliminar postulación (las obras se eliminan en cascada)
    await client.query('DELETE FROM postulaciones WHERE id = $1', [id])

    await client.query('COMMIT')

    res.json({
      success: true,
      message: 'Postulación eliminada exitosamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al eliminar postulación:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar postulación'
    })
  } finally {
    client.release()
  }
}
