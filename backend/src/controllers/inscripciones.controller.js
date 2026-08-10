/**
 * Controlador de Inscripciones (artistas_fases)
 * Maneja la lógica para inscribir artistas a fases
 * Usa PostgreSQL si está disponible, sino usa mockData
 */
import pool from '../config/database.js'
import { inscripciones, artistas, eventos, paquetes, artistas_fases, getNextId, now } from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * GET /api/inscripciones
 * Obtener todas las inscripciones de artistas a fases
 */
export const getInscripciones = async (req, res) => {
  try {
    const { fase_id, artista_id, seleccionado } = req.query

    if (useDatabase()) {
      let query = `
        SELECT
          af.*,
          a.nombre, a.apellido, a.email, a.categoria,
          f.nombre as fase_nombre, f.numero_fase, f.tipo as fase_tipo
        FROM artistas_fases af
        INNER JOIN artistas a ON a.id = af.artista_id
        INNER JOIN fases f ON f.id = af.fase_id
        WHERE 1=1
      `
      const params = []
      let paramCount = 1

      if (fase_id) {
        query += ` AND af.fase_id = $${paramCount}`
        params.push(fase_id)
        paramCount++
      }

      if (artista_id) {
        query += ` AND af.artista_id = $${paramCount}`
        params.push(artista_id)
        paramCount++
      }

      if (seleccionado !== undefined) {
        query += ` AND af.seleccionado = $${paramCount}`
        params.push(seleccionado === 'true')
        paramCount++
      }

      query += ' ORDER BY af.created_at DESC'

      const result = await pool.query(query, params)

      return res.json({
        success: true,
        data: result.rows,
        total: result.rows.length
      })
    }

    // Fallback a mockData
    let filtered = [...artistas_fases]

    if (fase_id) {
      filtered = filtered.filter(af => af.fase_id === parseInt(fase_id))
    }

    if (artista_id) {
      filtered = filtered.filter(af => af.artista_id === parseInt(artista_id))
    }

    if (seleccionado !== undefined) {
      const isSelected = seleccionado === 'true'
      filtered = filtered.filter(af => af.seleccionado === isSelected)
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    res.json({
      success: true,
      data: filtered,
      total: filtered.length
    })
  } catch (error) {
    console.error('Error al obtener inscripciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener inscripciones'
    })
  }
}

/**
 * POST /api/inscripciones
 * Inscribir artista a una fase
 */
export const createInscripcion = async (req, res) => {
  try {
    const { artista_id, fase_id } = req.body

    if (!artista_id || !fase_id) {
      return res.status(400).json({
        success: false,
        error: 'artista_id y fase_id son requeridos'
      })
    }

    if (useDatabase()) {
      // Verificar que no exista ya
      const checkResult = await pool.query(
        'SELECT id FROM artistas_fases WHERE artista_id = $1 AND fase_id = $2',
        [artista_id, fase_id]
      )

      if (checkResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'El artista ya está inscrito en esta fase'
        })
      }

      // Crear inscripción
      const result = await pool.query(
        `INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [artista_id, fase_id, false]
      )

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Artista inscrito exitosamente'
      })
    }

    // Fallback a mockData
    const existente = artistas_fases.find(
      af => af.artista_id === parseInt(artista_id) && af.fase_id === parseInt(fase_id)
    )

    if (existente) {
      return res.status(400).json({
        success: false,
        error: 'El artista ya está inscrito en esta fase'
      })
    }

    const nuevaInscripcion = {
      id: getNextId.artista_fase(),
      artista_id: parseInt(artista_id),
      fase_id: parseInt(fase_id),
      seleccionado: false,
      created_at: now()
    }

    artistas_fases.push(nuevaInscripcion)

    res.status(201).json({
      success: true,
      data: nuevaInscripcion,
      message: 'Artista inscrito exitosamente'
    })
  } catch (error) {
    console.error('Error al crear inscripción:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear inscripción'
    })
  }
}

/**
 * PUT /api/inscripciones/:id/seleccionar
 * Marcar artista como seleccionado en una fase
 */
export const seleccionarArtista = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        'UPDATE artistas_fases SET seleccionado = true WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Inscripción no encontrada'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Artista seleccionado exitosamente'
      })
    }

    // Fallback a mockData
    const index = artistas_fases.findIndex(af => af.id === parseInt(id))

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Inscripción no encontrada'
      })
    }

    artistas_fases[index].seleccionado = true

    res.json({
      success: true,
      data: artistas_fases[index],
      message: 'Artista seleccionado exitosamente'
    })
  } catch (error) {
    console.error('Error al seleccionar artista:', error)
    res.status(500).json({
      success: false,
      error: 'Error al seleccionar artista'
    })
  }
}

/**
 * DELETE /api/inscripciones/:id
 * Eliminar inscripción de artista a fase
 */
export const deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      const result = await pool.query(
        'DELETE FROM artistas_fases WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Inscripción no encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Inscripción eliminada exitosamente'
      })
    }

    // Fallback a mockData
    const index = artistas_fases.findIndex(af => af.id === parseInt(id))

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Inscripción no encontrada'
      })
    }

    artistas_fases.splice(index, 1)

    res.json({
      success: true,
      message: 'Inscripción eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar inscripción:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar inscripción'
    })
  }
}

// Exports deprecados para compatibilidad
export const getInscripcionById = getInscripciones
export const updateEstadoInscripcion = seleccionarArtista
