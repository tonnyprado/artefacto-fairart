/**
 * Rutas temporales para limpieza de perfiles dobles
 * ELIMINAR DESPUÉS DE USAR
 */

import { Router } from 'express'
import pool from '../config/database.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = Router()

// Middleware: solo admin
router.use(authenticateToken)
router.use(authorizeRole(['admin']))

/**
 * GET /api/cleanup/check-duplicates
 * Ver artistas con perfiles dobles
 */
router.get('/check-duplicates', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.email,
        a.nombre,
        a.apellido,
        array_agg(DISTINCT f.nombre ORDER BY f.nombre) as fases,
        array_agg(DISTINCT f.id ORDER BY f.id) as fase_ids
      FROM artistas a
      JOIN artistas_fases af ON af.artista_id = a.id
      JOIN fases f ON f.id = af.fase_id
      GROUP BY a.id, a.email, a.nombre, a.apellido
      HAVING COUNT(DISTINCT af.fase_id) > 1
      ORDER BY a.id
    `)

    res.json({
      success: true,
      count: result.rows.length,
      duplicates: result.rows
    })
  } catch (error) {
    console.error('Error checking duplicates:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/cleanup/remove-duplicates
 * Eliminar perfiles dobles automáticamente
 * Estrategia: Mantener registro más reciente, eliminar los demás
 */
router.post('/remove-duplicates', async (req, res) => {
  try {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Obtener artistas con perfiles dobles
      const duplicates = await client.query(`
        SELECT artista_id, array_agg(id ORDER BY created_at DESC) as registro_ids
        FROM artistas_fases
        GROUP BY artista_id
        HAVING COUNT(DISTINCT fase_id) > 1
      `)

      let deletedCount = 0

      // Para cada artista con duplicados, mantener solo el más reciente
      for (const dup of duplicates.rows) {
        const [keepId, ...deleteIds] = dup.registro_ids

        if (deleteIds.length > 0) {
          const deleteResult = await client.query(
            'DELETE FROM artistas_fases WHERE id = ANY($1)',
            [deleteIds]
          )
          deletedCount += deleteResult.rowCount
        }
      }

      await client.query('COMMIT')

      res.json({
        success: true,
        deletedCount,
        message: `Eliminados ${deletedCount} registros duplicados`
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error removing duplicates:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/cleanup/remove-specific
 * Eliminar registros específicos de artistas_fases
 * Body: { artistaId: number, faseId: number }
 */
router.post('/remove-specific', async (req, res) => {
  try {
    const { artistaId, faseId } = req.body

    if (!artistaId || !faseId) {
      return res.status(400).json({
        success: false,
        error: 'artistaId y faseId son requeridos'
      })
    }

    const result = await pool.query(
      'DELETE FROM artistas_fases WHERE artista_id = $1 AND fase_id = $2',
      [artistaId, faseId]
    )

    res.json({
      success: true,
      deletedCount: result.rowCount,
      message: `Registro eliminado: artista ${artistaId}, fase ${faseId}`
    })
  } catch (error) {
    console.error('Error removing specific:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
