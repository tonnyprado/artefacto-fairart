/**
 * Controlador de Rondas
 * Maneja la lógica de gestión de rondas de votación
 */

import pool from '../config/database.js'

/**
 * GET /api/rondas/fase/:fase_id
 * Obtener todas las rondas de una fase
 */
export const getRondasPorFase = async (req, res) => {
  try {
    const { fase_id } = req.params

    const result = await pool.query(
      `SELECT * FROM rondas
       WHERE fase_id = $1
       ORDER BY numero ASC`,
      [fase_id]
    )

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error al obtener rondas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener rondas'
    })
  }
}

/**
 * GET /api/rondas/:id
 * Obtener una ronda específica
 */
export const getRonda = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'SELECT * FROM rondas WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ronda no encontrada'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error al obtener ronda:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener ronda'
    })
  }
}

/**
 * POST /api/rondas
 * Crear una nueva ronda (Solo admin)
 */
export const createRonda = async (req, res) => {
  try {
    const { fase_id, numero, votos_asignados } = req.body

    // Validar que la fase existe
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

    // Verificar que no existe ya una ronda con ese número para esa fase
    const existeResult = await pool.query(
      'SELECT id FROM rondas WHERE fase_id = $1 AND numero = $2',
      [fase_id, numero]
    )

    if (existeResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Ya existe la Ronda ${numero} para esta fase`
      })
    }

    // Crear ronda
    const result = await pool.query(
      `INSERT INTO rondas (fase_id, numero, estado, votos_asignados)
       VALUES ($1, $2, 'cerrada', $3)
       RETURNING *`,
      [fase_id, numero, votos_asignados || null]
    )

    // Log de creación
    await pool.query(
      `INSERT INTO log_votaciones (fase_id, ronda_id, accion, valor_nuevo)
       VALUES ($1, $2, 'ronda_creada', $3)`,
      [fase_id, result.rows[0].id, JSON.stringify(result.rows[0])]
    )

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Ronda creada exitosamente'
    })
  } catch (error) {
    console.error('Error al crear ronda:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear ronda'
    })
  }
}

/**
 * POST /api/rondas/:id/abrir
 * Abrir una ronda para votación (Solo admin)
 */
export const abrirRonda = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params

    // Obtener ronda
    const rondaResult = await client.query(
      'SELECT * FROM rondas WHERE id = $1',
      [id]
    )

    if (rondaResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        success: false,
        error: 'Ronda no encontrada'
      })
    }

    const ronda = rondaResult.rows[0]

    if (ronda.estado === 'abierta') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'La ronda ya está abierta'
      })
    }

    // Cerrar otras rondas abiertas de la misma fase
    await client.query(
      `UPDATE rondas
       SET estado = 'cerrada', fecha_cierre = CURRENT_TIMESTAMP
       WHERE fase_id = $1 AND estado = 'abierta'`,
      [ronda.fase_id]
    )

    // Abrir ronda
    const result = await client.query(
      `UPDATE rondas
       SET estado = 'abierta', fecha_apertura = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    // Log de apertura
    await client.query(
      `INSERT INTO log_votaciones (fase_id, ronda_id, accion, valor_nuevo)
       VALUES ($1, $2, 'ronda_abierta', $3)`,
      [ronda.fase_id, id, JSON.stringify(result.rows[0])]
    )

    await client.query('COMMIT')

    res.json({
      success: true,
      data: result.rows[0],
      message: `Ronda ${ronda.numero} abierta exitosamente`
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al abrir ronda:', error)
    res.status(500).json({
      success: false,
      error: 'Error al abrir ronda'
    })
  } finally {
    client.release()
  }
}

/**
 * POST /api/rondas/:id/cerrar
 * Cerrar una ronda y calcular resultados (Solo admin)
 */
export const cerrarRonda = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params

    // Obtener ronda con información de fase
    const rondaResult = await client.query(
      `SELECT r.*, f.config_json
       FROM rondas r
       JOIN fases f ON f.id = r.fase_id
       WHERE r.id = $1`,
      [id]
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

    if (ronda.estado === 'cerrada') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'La ronda ya está cerrada'
      })
    }

    // Verificar quórum
    const quorumResult = await client.query(
      `SELECT COUNT(DISTINCT curador_id) as total_votantes
       FROM votaciones
       WHERE ronda_id = $1`,
      [id]
    )

    const totalVotantes = parseInt(quorumResult.rows[0].total_votantes)
    const quorumRequerido = config.quorum || 5

    if (totalVotantes < quorumRequerido) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: `No se puede cerrar la ronda. Se requiere un mínimo de ${quorumRequerido} votantes. Actualmente: ${totalVotantes}`
      })
    }

    // Cerrar ronda
    await client.query(
      `UPDATE rondas
       SET estado = 'cerrada', fecha_cierre = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    )

    // Calcular y actualizar métricas según el número de ronda
    if (ronda.numero === 1) {
      // RONDA 1: Calcular índice de respaldo y actualizar estados
      await calcularResultadosRonda1(client, ronda.fase_id, id, config)
    } else if (ronda.numero === 2) {
      // RONDA 2: Calcular respaldo y actualizar estados
      await calcularResultadosRonda2(client, ronda.fase_id, id, config)
    } else if (ronda.numero === 3) {
      // RONDA 3: Calcular aprobación final y seleccionar ganadores
      await calcularResultadosRonda3(client, ronda.fase_id, id, config)
    }

    // Log de cierre
    await client.query(
      `INSERT INTO log_votaciones (fase_id, ronda_id, accion, valor_nuevo)
       VALUES ($1, $2, 'ronda_cerrada', $3)`,
      [ronda.fase_id, id, JSON.stringify({ total_votantes: totalVotantes })]
    )

    await client.query('COMMIT')

    res.json({
      success: true,
      message: `Ronda ${ronda.numero} cerrada exitosamente`,
      data: {
        total_votantes: totalVotantes,
        quorum_requerido: quorumRequerido
      }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al cerrar ronda:', error)
    res.status(500).json({
      success: false,
      error: 'Error al cerrar ronda',
      details: error.message
    })
  } finally {
    client.release()
  }
}

/**
 * Calcular resultados de Ronda 1
 * Índice de respaldo: suma(valores) / (2 * numero_de_votos_emitidos)
 */
async function calcularResultadosRonda1(client, faseId, rondaId, config) {
  const umbralR1 = config.umbral_r1 || 0.60
  const umbralReserva = config.umbral_reserva || 0.30

  // Actualizar índices y estados
  await client.query(`
    UPDATE postulaciones p
    SET
      indice_r1 = subq.indice,
      estado = CASE
        WHEN subq.indice >= ${umbralR1} THEN 'shortlist'
        WHEN subq.indice >= ${umbralReserva} THEN 'reserva'
        ELSE 'no_continua'
      END
    FROM (
      SELECT
        v.postulacion_id,
        SUM(v.valor)::DECIMAL / (2.0 * COUNT(*)) as indice
      FROM votaciones v
      WHERE v.ronda_id = $1
      GROUP BY v.postulacion_id
    ) subq
    WHERE p.id = subq.postulacion_id
      AND p.fase_actual_id = $2
  `, [rondaId, faseId])
}

/**
 * Calcular resultados de Ronda 2
 * Respaldo: curadores_que_votaron_al_artista / curadores_que_votaron_en_la_ronda
 */
async function calcularResultadosRonda2(client, faseId, rondaId, config) {
  const umbralConsenso = config.umbral_consenso || 0.80
  const umbralDelib = config.umbral_delib || 0.50

  // Obtener total de curadores que votaron
  const totalCuradoresResult = await client.query(
    `SELECT COUNT(DISTINCT curador_id) as total FROM votaciones WHERE ronda_id = $1`,
    [rondaId]
  )
  const totalCuradores = parseInt(totalCuradoresResult.rows[0].total)

  // Actualizar respaldo y estados
  await client.query(`
    UPDATE postulaciones p
    SET
      respaldo_r2 = subq.respaldo,
      estado = CASE
        WHEN subq.respaldo >= ${umbralConsenso} THEN 'seleccionada'
        WHEN subq.respaldo >= ${umbralDelib} THEN 'deliberacion'
        ELSE 'no_continua'
      END
    FROM (
      SELECT
        v.postulacion_id,
        COUNT(DISTINCT v.curador_id)::DECIMAL / ${totalCuradores} as respaldo
      FROM votaciones v
      WHERE v.ronda_id = $1 AND v.valor = 1
      GROUP BY v.postulacion_id
    ) subq
    WHERE p.id = subq.postulacion_id
      AND p.fase_actual_id = $2
  `, [rondaId, faseId])
}

/**
 * Calcular resultados de Ronda 3
 * Aprobación: votos_si / votos_emitidos
 * Se ordenan por respaldo_r2 descendente y se toman los mejores hasta llenar cupo
 */
async function calcularResultadosRonda3(client, faseId, rondaId, config) {
  const cupo2d = config.cupo_2d || 8
  const cupo3d = config.cupo_3d

  // Actualizar aprobación
  await client.query(`
    UPDATE postulaciones p
    SET aprobacion_r3 = subq.aprobacion
    FROM (
      SELECT
        v.postulacion_id,
        COUNT(CASE WHEN v.valor = 1 THEN 1 END)::DECIMAL / COUNT(*) as aprobacion
      FROM votaciones v
      WHERE v.ronda_id = $1
      GROUP BY v.postulacion_id
    ) subq
    WHERE p.id = subq.postulacion_id
      AND p.fase_actual_id = $2
  `, [rondaId, faseId])

  // Seleccionar ganadores 2D (ordenados por respaldo_r2, luego por indice_r1)
  await client.query(`
    UPDATE postulaciones
    SET estado = 'seleccionada', posicion = subq.rn
    FROM (
      SELECT
        id,
        ROW_NUMBER() OVER (
          ORDER BY respaldo_r2 DESC, indice_r1 DESC
        ) as rn
      FROM postulaciones
      WHERE fase_actual_id = $1
        AND tipo = '2d'
        AND estado = 'deliberacion'
        AND aprobacion_r3 > 0.50
    ) subq
    WHERE postulaciones.id = subq.id
      AND subq.rn <= $2
  `, [faseId, cupo2d])

  // Seleccionar ganadores 3D si hay cupo definido
  if (cupo3d) {
    await client.query(`
      UPDATE postulaciones
      SET estado = 'seleccionada', posicion = subq.rn
      FROM (
        SELECT
          id,
          ROW_NUMBER() OVER (
            ORDER BY respaldo_r2 DESC, indice_r1 DESC
          ) as rn
        FROM postulaciones
        WHERE fase_actual_id = $1
          AND tipo = '3d'
          AND estado = 'deliberacion'
          AND aprobacion_r3 > 0.50
      ) subq
      WHERE postulaciones.id = subq.id
        AND subq.rn <= $2
    `, [faseId, cupo3d])
  }

  // Marcar el resto como no_continua
  await client.query(`
    UPDATE postulaciones
    SET estado = 'no_continua'
    WHERE fase_actual_id = $1
      AND estado = 'deliberacion'
  `, [faseId])
}

/**
 * GET /api/rondas/:id/estadisticas
 * Obtener estadísticas de participación en una ronda
 */
export const getEstadisticasRonda = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que la ronda existe
    const rondaResult = await pool.query(
      'SELECT * FROM rondas WHERE id = $1',
      [id]
    )

    if (rondaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ronda no encontrada'
      })
    }

    const ronda = rondaResult.rows[0]

    // Estadísticas generales
    const statsResult = await pool.query(`
      SELECT
        COUNT(DISTINCT v.curador_id) as total_curadores_votaron,
        COUNT(DISTINCT v.postulacion_id) as total_postulaciones_votadas,
        COUNT(*) as total_votos,
        COUNT(CASE WHEN v.conoce_artista THEN 1 END) as votos_con_conoce_artista
      FROM votaciones v
      WHERE v.ronda_id = $1
    `, [id])

    // Curadores que han votado
    const curadoresResult = await pool.query(`
      SELECT
        c.id,
        c.nombre,
        c.email,
        COUNT(v.id) as total_votos,
        MIN(v.created_at) as primer_voto,
        MAX(v.created_at) as ultimo_voto
      FROM curadores c
      LEFT JOIN votaciones v ON v.curador_id = c.id AND v.ronda_id = $1
      WHERE c.activo = true
      GROUP BY c.id, c.nombre, c.email
      ORDER BY total_votos DESC
    `, [id])

    res.json({
      success: true,
      data: {
        ronda,
        estadisticas: statsResult.rows[0],
        curadores: curadoresResult.rows
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
 * DELETE /api/rondas/:id
 * Eliminar una ronda (Solo admin, solo si no tiene votos)
 */
export const deleteRonda = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id } = req.params

    // Verificar que no tiene votos
    const votosResult = await client.query(
      'SELECT COUNT(*) as total FROM votaciones WHERE ronda_id = $1',
      [id]
    )

    if (parseInt(votosResult.rows[0].total) > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una ronda que ya tiene votos registrados'
      })
    }

    // Eliminar ronda
    await client.query('DELETE FROM rondas WHERE id = $1', [id])

    await client.query('COMMIT')

    res.json({
      success: true,
      message: 'Ronda eliminada exitosamente'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error al eliminar ronda:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar ronda'
    })
  } finally {
    client.release()
  }
}
