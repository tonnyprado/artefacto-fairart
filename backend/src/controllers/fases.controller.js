/**
 * Controlador de Fases
 * Maneja la lógica de negocio para las fases de selección
 * Usa PostgreSQL si está disponible, sino usa mockData
 */

import pool from '../config/database.js'
import {
  fases,
  artistas_fases,
  votaciones,
  curadores,
  getNextId,
  now
} from '../data/mockData.js'

// Helper para determinar si usamos DB o mockData
const useDatabase = () => !!pool

/**
 * GET /api/fases
 * Obtener todas las fases con estadísticas calculadas
 */
export const getAllFases = async (req, res) => {
  try {
    if (useDatabase()) {
      // Usar PostgreSQL
      const result = await pool.query(`
        SELECT
          f.*,
          COUNT(DISTINCT af.id) as total_artistas_inscritos,
          e.nombre as edicion_nombre
        FROM fases f
        LEFT JOIN artistas_fases af ON af.fase_id = f.id
        LEFT JOIN ediciones e ON e.id = f.edicion_id
        GROUP BY f.id, e.nombre
        ORDER BY f.edicion_id DESC, f.numero_fase NULLS LAST
      `)

      return res.json({
        success: true,
        data: result.rows
      })
    }

    // Fallback a mockData
    const fasesConStats = fases.map(fase => {
      const artistasFase = artistas_fases.filter(af => af.fase_id === fase.id)
      const votacionesFase = votaciones.filter(v => v.fase_id === fase.id)

      return {
        ...fase,
        total_inscritos: artistasFase.length,
        total_votos: votacionesFase.length
      }
    })

    res.json({
      success: true,
      data: fasesConStats
    })
  } catch (error) {
    console.error('Error en getAllFases:', error)
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

    if (useDatabase()) {
      // Usar PostgreSQL
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [id]
      )

      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      // Contar artistas inscritos
      const artistasResult = await pool.query(
        'SELECT COUNT(*) as total FROM artistas_fases WHERE fase_id = $1',
        [id]
      )

      return res.json({
        success: true,
        data: {
          ...faseResult.rows[0],
          total_artistas: parseInt(artistasResult.rows[0].total)
        }
      })
    }

    // Fallback a mockData
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
    console.error('Error en getFaseById:', error)
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
      edicion_id,
      nombre,
      descripcion,
      tipo = 'fase',
      numero_fase,
      fecha_inicio_inscripciones,
      fecha_fin_inscripciones,
      fecha_inicio_votaciones,
      fecha_fin_votaciones,
      max_artistas_seleccionados
    } = req.body

    // Validaciones
    if (!nombre || !fecha_inicio_votaciones || !fecha_fin_votaciones) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, fecha_inicio_votaciones y fecha_fin_votaciones son requeridos'
      })
    }

    if (useDatabase()) {
      // Usar PostgreSQL
      const result = await pool.query(`
        INSERT INTO fases (
          edicion_id, nombre, descripcion, tipo, numero_fase,
          fecha_inicio_inscripciones, fecha_fin_inscripciones,
          fecha_inicio_votaciones, fecha_fin_votaciones,
          inscripciones_abiertas, votaciones_abiertas, finalizada,
          max_artistas_seleccionados,
          total_inscritos, total_seleccionados, total_curadores
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        edicion_id || null,
        nombre,
        descripcion || '',
        tipo,
        tipo === 'fase' ? numero_fase : null,
        fecha_inicio_inscripciones || null,
        fecha_fin_inscripciones || null,
        fecha_inicio_votaciones,
        fecha_fin_votaciones,
        false, // inscripciones_abiertas
        false, // votaciones_abiertas
        false, // finalizada
        tipo === 'concurso' ? max_artistas_seleccionados : null,
        0, // total_inscritos
        0, // total_seleccionados
        0  // total_curadores
      ])

      return res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Fase creada exitosamente'
      })
    }

    // Fallback a mockData
    const nuevaFase = {
      id: getNextId.fase(),
      edicion_id: edicion_id || null,
      nombre,
      descripcion: descripcion || '',
      tipo,
      numero_fase: tipo === 'fase' ? numero_fase : null,
      fecha_inicio_inscripciones: fecha_inicio_inscripciones || null,
      fecha_fin_inscripciones: fecha_fin_inscripciones || null,
      fecha_inicio_votaciones,
      fecha_fin_votaciones,
      inscripciones_abiertas: false,
      votaciones_abiertas: false,
      finalizada: false,
      max_artistas_seleccionados: tipo === 'concurso' ? max_artistas_seleccionados : null,
      total_inscritos: 0,
      total_seleccionados: 0,
      total_curadores: curadores.length,
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
    console.error('Error en createFase:', error)
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
      fecha_inicio_votaciones,
      fecha_fin_votaciones,
      votaciones_abiertas,
      finalizada
    } = req.body

    if (useDatabase()) {
      // Construir query dinámicamente solo con campos proporcionados
      const updates = []
      const values = []
      let paramCount = 1

      if (nombre !== undefined) {
        updates.push(`nombre = $${paramCount}`)
        values.push(nombre)
        paramCount++
      }
      if (descripcion !== undefined) {
        updates.push(`descripcion = $${paramCount}`)
        values.push(descripcion)
        paramCount++
      }
      if (fecha_inicio_votaciones !== undefined) {
        updates.push(`fecha_inicio_votaciones = $${paramCount}`)
        values.push(fecha_inicio_votaciones)
        paramCount++
      }
      if (fecha_fin_votaciones !== undefined) {
        updates.push(`fecha_fin_votaciones = $${paramCount}`)
        values.push(fecha_fin_votaciones)
        paramCount++
      }
      if (votaciones_abiertas !== undefined) {
        updates.push(`votaciones_abiertas = $${paramCount}`)
        values.push(votaciones_abiertas)
        paramCount++
      }
      if (finalizada !== undefined) {
        updates.push(`finalizada = $${paramCount}`)
        values.push(finalizada)
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
        UPDATE fases
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values)

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Fase actualizada exitosamente'
      })
    }

    // Fallback a mockData
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
      ...(fecha_inicio_votaciones && { fecha_inicio_votaciones }),
      ...(fecha_fin_votaciones && { fecha_fin_votaciones }),
      ...(votaciones_abiertas !== undefined && { votaciones_abiertas }),
      ...(finalizada !== undefined && { finalizada }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: fases[faseIndex],
      message: 'Fase actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error en updateFase:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar fase'
    })
  }
}

/**
 * PUT /api/fases/:id/inscripciones
 * Toggle inscripciones para una fase (Solo admin)
 */
export const toggleInscripciones = async (req, res) => {
  try {
    const { id } = req.params
    const { abiertas } = req.body

    if (useDatabase()) {
      // Verificar que la fase existe y no está finalizada
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [id]
      )

      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      if (faseResult.rows[0].finalizada) {
        return res.status(400).json({
          success: false,
          error: 'No se pueden modificar inscripciones para una fase finalizada'
        })
      }

      // Si se están abriendo inscripciones, cerrar las de otras fases
      if (abiertas) {
        await pool.query('UPDATE fases SET inscripciones_abiertas = false WHERE id != $1', [id])
      }

      // Actualizar inscripciones de esta fase
      const result = await pool.query(
        'UPDATE fases SET inscripciones_abiertas = $1 WHERE id = $2 RETURNING *',
        [abiertas, id]
      )

      return res.json({
        success: true,
        data: result.rows[0],
        message: `Inscripciones ${abiertas ? 'abiertas' : 'cerradas'} exitosamente`
      })
    }

    // Fallback a mockData
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
        error: 'No se pueden modificar inscripciones para una fase finalizada'
      })
    }

    // Si se están abriendo inscripciones, cerrar las de otras fases
    if (abiertas) {
      fases.forEach((f, idx) => {
        if (idx !== faseIndex) {
          fases[idx].inscripciones_abiertas = false
        }
      })
    }

    fases[faseIndex].inscripciones_abiertas = abiertas
    fases[faseIndex].updated_at = now()

    res.json({
      success: true,
      data: fases[faseIndex],
      message: `Inscripciones ${abiertas ? 'abiertas' : 'cerradas'} exitosamente`
    })
  } catch (error) {
    console.error('Error en toggleInscripciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar inscripciones'
    })
  }
}

/**
 * PUT /api/fases/:id/votaciones
 * Toggle votaciones para una fase (Solo admin)
 */
export const toggleVotaciones = async (req, res) => {
  try {
    const { id } = req.params
    const { abiertas } = req.body

    if (useDatabase()) {
      // Verificar que la fase existe y no está finalizada
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [id]
      )

      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      if (faseResult.rows[0].finalizada) {
        return res.status(400).json({
          success: false,
          error: 'No se pueden abrir votaciones para una fase finalizada'
        })
      }

      // Si se están abriendo votaciones, cerrar las de otras fases
      if (abiertas) {
        await pool.query('UPDATE fases SET votaciones_abiertas = false WHERE id != $1', [id])
      }

      // Actualizar votaciones de esta fase
      const result = await pool.query(
        'UPDATE fases SET votaciones_abiertas = $1 WHERE id = $2 RETURNING *',
        [abiertas, id]
      )

      return res.json({
        success: true,
        data: result.rows[0],
        message: `Votaciones ${abiertas ? 'abiertas' : 'cerradas'} exitosamente`
      })
    }

    // Fallback a mockData
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

    // Si se están abriendo votaciones, cerrar las de otras fases
    if (abiertas) {
      fases.forEach((f, idx) => {
        if (idx !== faseIndex) {
          fases[idx].votaciones_abiertas = false
        }
      })
    }

    fases[faseIndex].votaciones_abiertas = abiertas
    fases[faseIndex].updated_at = now()

    res.json({
      success: true,
      data: fases[faseIndex],
      message: `Votaciones ${abiertas ? 'abiertas' : 'cerradas'} exitosamente`
    })
  } catch (error) {
    console.error('Error en toggleVotaciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar votaciones'
    })
  }
}

/**
 * PUT /api/fases/:id/abrir-votaciones
 * Abrir votaciones para una fase (Solo admin)
 * @deprecated Usar toggleVotaciones en su lugar
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

    if (useDatabase()) {
      // Verificar que la fase existe
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [id]
      )

      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      if (faseResult.rows[0].finalizada) {
        return res.status(400).json({
          success: false,
          error: 'La fase ya está finalizada'
        })
      }

      // Finalizar fase
      const result = await pool.query(`
        UPDATE fases
        SET votaciones_abiertas = false, finalizada = true
        WHERE id = $1
        RETURNING *
      `, [id])

      return res.json({
        success: true,
        data: result.rows[0],
        message: 'Fase finalizada exitosamente'
      })
    }

    // Fallback a mockData
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
    console.error('Error en finalizarFase:', error)
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

    if (useDatabase()) {
      // Verificar si hay artistas inscritos
      const artistasResult = await pool.query(
        'SELECT COUNT(*) as count FROM artistas_fases WHERE fase_id = $1',
        [id]
      )

      const artistasCount = parseInt(artistasResult.rows[0].count)

      if (artistasCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar una fase con artistas inscritos'
        })
      }

      // Eliminar fase
      const result = await pool.query(
        'DELETE FROM fases WHERE id = $1 RETURNING *',
        [id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Fase eliminada exitosamente'
      })
    }

    // Fallback a mockData
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
    console.error('Error en deleteFase:', error)
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

    if (useDatabase()) {
      // Verificar que la fase existe
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [id]
      )

      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      // Obtener artistas de esta fase
      const result = await pool.query(
        'SELECT artista_id, seleccionado, created_at FROM artistas_fases WHERE fase_id = $1',
        [id]
      )

      return res.json({
        success: true,
        data: result.rows.map(r => r.artista_id)
      })
    }

    // Fallback a mockData
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
    console.error('Error en getArtistasFase:', error)
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

    if (useDatabase()) {
      // Verificar que la fase existe
      const faseResult = await pool.query(
        'SELECT * FROM fases WHERE id = $1',
        [id]
      )

      if (faseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Fase no encontrada'
        })
      }

      let inscritosExistentes = 0
      let nuevasInscripciones = 0

      // Insertar artistas (usando ON CONFLICT para evitar duplicados)
      for (const artistaId of artista_ids) {
        try {
          await pool.query(`
            INSERT INTO artistas_fases (artista_id, fase_id, seleccionado)
            VALUES ($1, $2, false)
            ON CONFLICT (artista_id, fase_id) DO NOTHING
          `, [artistaId, id])

          // Verificar si se insertó
          const checkResult = await pool.query(
            'SELECT * FROM artistas_fases WHERE artista_id = $1 AND fase_id = $2',
            [artistaId, id]
          )

          if (checkResult.rows.length > 0) {
            nuevasInscripciones++
          } else {
            inscritosExistentes++
          }
        } catch (err) {
          console.error('Error al inscribir artista:', err)
          inscritosExistentes++
        }
      }

      return res.json({
        success: true,
        data: {
          nuevas_inscripciones: nuevasInscripciones,
          ya_inscritos: inscritosExistentes
        },
        message: `${nuevasInscripciones} artistas inscritos exitosamente`
      })
    }

    // Fallback a mockData
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
          seleccionado: false,
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
    console.error('Error en inscribirArtistas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al inscribir artistas'
    })
  }
}
