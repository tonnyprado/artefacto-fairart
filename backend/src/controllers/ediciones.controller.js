/**
 * Controlador de Ediciones
 * Maneja la lógica de negocio para las ediciones de ARTEFACT
 * Usa PostgreSQL si está disponible, sino usa mockData
 */

import pool from '../config/database.js'
import {
  ediciones,
  fases,
  getNextId,
  now
} from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * GET /api/ediciones
 * Obtener todas las ediciones
 */
export const getAllEdiciones = async (req, res) => {
  try {
    if (useDatabase()) {
      // Usar PostgreSQL
      const result = await pool.query(`
        SELECT
          e.*,
          COUNT(f.id) as total_fases,
          COUNT(CASE WHEN f.finalizada = false THEN 1 END) as fases_activas,
          COUNT(CASE WHEN f.finalizada = true THEN 1 END) as fases_finalizadas
        FROM ediciones e
        LEFT JOIN fases f ON f.edicion_id = e.id
        GROUP BY e.id
        ORDER BY e.anio DESC, e.id DESC
      `)

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    const edicionesConStats = ediciones.map(edicion => {
      const fasesEdicion = fases.filter(f => f.edicion_id === edicion.id)
      const fasesActivas = fasesEdicion.filter(f => !f.finalizada)
      const fasesFinalizadas = fasesEdicion.filter(f => f.finalizada)

      return {
        ...edicion,
        total_fases: fasesEdicion.length,
        fases_activas: fasesActivas.length,
        fases_finalizadas: fasesFinalizadas.length
      }
    })

    res.json({
      success: true,
      data: edicionesConStats
    })
  } catch (error) {
    console.error('Error en getAllEdiciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener ediciones'
    })
  }
}

/**
 * GET /api/ediciones/:id
 * Obtener una edición por ID
 */
export const getEdicionById = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      // Usar PostgreSQL
      const edicionResult = await pool.query(
        'SELECT * FROM ediciones WHERE id = $1',
        [id]
      )

      if (edicionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Edición no encontrada'
        })
      }

      const fasesResult = await pool.query(
        'SELECT * FROM fases WHERE edicion_id = $1 ORDER BY numero_fase NULLS LAST',
        [id]
      )

      return res.json({
        success: true,
        data: {
          ...edicionResult.rows[0],
          fases: fasesResult.rows
        }
      })
    }

    // Fallback a mockData
    const edicion = ediciones.find(e => e.id === parseInt(id))

    if (!edicion) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    const fasesEdicion = fases.filter(f => f.edicion_id === parseInt(id))

    res.json({
      success: true,
      data: {
        ...edicion,
        fases: fasesEdicion
      }
    })
  } catch (error) {
    console.error('Error en getEdicionById:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener edición'
    })
  }
}

/**
 * GET /api/ediciones/activa
 * Obtener la edición activa
 */
export const getEdicionActiva = async (req, res) => {
  try {
    if (useDatabase()) {
      // Usar PostgreSQL
      const result = await pool.query(
        'SELECT * FROM ediciones WHERE activa = true LIMIT 1'
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No hay edición activa'
        })
      }

      const fasesResult = await pool.query(
        'SELECT * FROM fases WHERE edicion_id = $1 ORDER BY numero_fase NULLS LAST',
        [result.rows[0].id]
      )

      return res.json({
        success: true,
        data: {
          ...result.rows[0],
          fases: fasesResult.rows
        }
      })
    }

    // Fallback a mockData
    const edicionActiva = ediciones.find(e => e.activa)

    if (!edicionActiva) {
      return res.status(404).json({
        success: false,
        error: 'No hay edición activa'
      })
    }

    const fasesEdicion = fases.filter(f => f.edicion_id === edicionActiva.id)

    res.json({
      success: true,
      data: {
        ...edicionActiva,
        fases: fasesEdicion
      }
    })
  } catch (error) {
    console.error('Error en getEdicionActiva:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener edición activa'
    })
  }
}

/**
 * POST /api/ediciones
 * Crear una nueva edición (Solo admin)
 */
export const createEdicion = async (req, res) => {
  try {
    const {
      nombre,
      anio,
      descripcion,
      fecha_inicio,
      fecha_fin,
      evento_id,
      activa = false
    } = req.body

    // Validaciones
    if (!nombre || !anio || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, año, fecha_inicio y fecha_fin son requeridos'
      })
    }

    if (useDatabase()) {
      // Si se marca como activa, desactivar las demás
      if (activa) {
        await pool.query('UPDATE ediciones SET activa = false')
      }

      // Usar PostgreSQL
      const result = await pool.query(`
        INSERT INTO ediciones (nombre, anio, descripcion, fecha_inicio, fecha_fin, evento_id, activa)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [nombre, anio, descripcion || '', fecha_inicio, fecha_fin, evento_id || null, activa])

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Edición creada exitosamente'
      })
    }

    // Fallback a mockData
    if (activa) {
      ediciones.forEach((e, idx) => {
        ediciones[idx].activa = false
      })
    }

    const nuevaEdicion = {
      id: getNextId.edicion(),
      nombre,
      anio,
      descripcion: descripcion || '',
      fecha_inicio,
      fecha_fin,
      evento_id: evento_id || null,
      activa,
      created_at: now(),
      updated_at: now()
    }

    ediciones.push(nuevaEdicion)

    res.status(201).json({
      success: true,
      data: nuevaEdicion,
      message: 'Edición creada exitosamente'
    })
  } catch (error) {
    console.error('Error en createEdicion:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear edición'
    })
  }
}

/**
 * PUT /api/ediciones/:id
 * Actualizar una edición (Solo admin)
 */
export const updateEdicion = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      anio,
      descripcion,
      fecha_inicio,
      fecha_fin,
      evento_id,
      activa
    } = req.body

    if (useDatabase()) {
      // Si se marca como activa, desactivar las demás
      if (activa === true) {
        await pool.query('UPDATE ediciones SET activa = false WHERE id != $1', [id])
      }

      // Construir query dinámicamente solo con campos proporcionados
      const updates = []
      const values = []
      let paramCount = 1

      if (nombre !== undefined) {
        updates.push(`nombre = $${paramCount}`)
        values.push(nombre)
        paramCount++
      }
      if (anio !== undefined) {
        updates.push(`anio = $${paramCount}`)
        values.push(anio)
        paramCount++
      }
      if (descripcion !== undefined) {
        updates.push(`descripcion = $${paramCount}`)
        values.push(descripcion)
        paramCount++
      }
      if (fecha_inicio !== undefined) {
        updates.push(`fecha_inicio = $${paramCount}`)
        values.push(fecha_inicio)
        paramCount++
      }
      if (fecha_fin !== undefined) {
        updates.push(`fecha_fin = $${paramCount}`)
        values.push(fecha_fin)
        paramCount++
      }
      if (evento_id !== undefined) {
        updates.push(`evento_id = $${paramCount}`)
        values.push(evento_id)
        paramCount++
      }
      if (activa !== undefined) {
        updates.push(`activa = $${paramCount}`)
        values.push(activa)
        paramCount++
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No hay campos para actualizar'
        })
      }

      values.push(id)
      const result = await pool.query(`
        UPDATE ediciones
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values)

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Edición no encontrada'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Edición actualizada exitosamente'
      })
    }

    // Fallback a mockData
    const edicionIndex = ediciones.findIndex(e => e.id === parseInt(id))

    if (edicionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    if (activa === true) {
      ediciones.forEach((e, idx) => {
        if (idx !== edicionIndex) {
          ediciones[idx].activa = false
        }
      })
    }

    ediciones[edicionIndex] = {
      ...ediciones[edicionIndex],
      ...(nombre && { nombre }),
      ...(anio && { anio }),
      ...(descripcion !== undefined && { descripcion }),
      ...(fecha_inicio && { fecha_inicio }),
      ...(fecha_fin && { fecha_fin }),
      ...(evento_id !== undefined && { evento_id }),
      ...(activa !== undefined && { activa }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: ediciones[edicionIndex],
      message: 'Edición actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error en updateEdicion:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar edición'
    })
  }
}

/**
 * DELETE /api/ediciones/:id
 * Eliminar una edición (Solo admin)
 * Permite eliminación en cascada con query param ?force=true
 */
export const deleteEdicion = async (req, res) => {
  try {
    const { id } = req.params
    const { force } = req.query

    if (useDatabase()) {
      // Verificar si hay fases asociadas
      const fasesResult = await pool.query(
        'SELECT COUNT(*) as count FROM fases WHERE edicion_id = $1',
        [id]
      )

      const fasesCount = parseInt(fasesResult.rows[0].count)

      if (fasesCount > 0 && force !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar una edición con fases asociadas',
          message: `Esta edición tiene ${fasesCount} fase(s) asociada(s). Use force=true para eliminar todo.`,
          fases_count: fasesCount
        })
      }

      // Eliminar edición (cascada automática eliminará las fases)
      const result = await pool.query(
        'DELETE FROM ediciones WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Edición no encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Edición eliminada exitosamente',
        fases_eliminadas: fasesCount
      })
    }

    // Fallback a mockData
    const edicionIndex = ediciones.findIndex(e => e.id === parseInt(id))

    if (edicionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    const fasesAsociadas = fases.filter(f => f.edicion_id === parseInt(id))

    if (fasesAsociadas.length > 0) {
      if (force !== 'true') {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar una edición con fases asociadas',
          message: `Esta edición tiene ${fasesAsociadas.length} fase(s) asociada(s). Use force=true para eliminar todo.`,
          fases_count: fasesAsociadas.length
        })
      }

      fasesAsociadas.forEach(fase => {
        const faseIndex = fases.findIndex(f => f.id === fase.id)
        if (faseIndex !== -1) {
          fases.splice(faseIndex, 1)
        }
      })
    }

    ediciones.splice(edicionIndex, 1)

    res.json({
      success: true,
      message: 'Edición eliminada exitosamente',
      fases_eliminadas: fasesAsociadas.length
    })
  } catch (error) {
    console.error('Error en deleteEdicion:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar edición'
    })
  }
}

/**
 * GET /api/ediciones/:id/fases
 * Obtener fases de una edición
 */
export const getFasesEdicion = async (req, res) => {
  try {
    const { id } = req.params

    if (useDatabase()) {
      // Verificar que la edición existe
      const edicionResult = await pool.query(
        'SELECT * FROM ediciones WHERE id = $1',
        [id]
      )

      if (edicionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Edición no encontrada'
        })
      }

      // Obtener fases
      const fasesResult = await pool.query(
        'SELECT * FROM fases WHERE edicion_id = $1 ORDER BY numero_fase NULLS LAST',
        [id]
      )

      return res.json({
        success: true,
        data: fasesResult.rows
      })
    }

    // Fallback a mockData
    const edicion = ediciones.find(e => e.id === parseInt(id))

    if (!edicion) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    const fasesEdicion = fases.filter(f => f.edicion_id === parseInt(id))

    res.json({
      success: true,
      data: fasesEdicion
    })
  } catch (error) {
    console.error('Error en getFasesEdicion:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener fases de la edición'
    })
  }
}
