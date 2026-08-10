/**
 * Controlador de Ediciones
 * Maneja la lógica de negocio para las ediciones de ARTEFACT
 */

import {
  ediciones,
  fases,
  getNextId,
  now
} from '../data/mockData.js'

/**
 * GET /api/ediciones
 * Obtener todas las ediciones
 */
export const getAllEdiciones = async (req, res) => {
  try {
    // Calcular estadísticas para cada edición
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
    const edicion = ediciones.find(e => e.id === parseInt(id))

    if (!edicion) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    // Obtener fases de esta edición
    const fasesEdicion = fases.filter(f => f.edicion_id === parseInt(id))

    res.json({
      success: true,
      data: {
        ...edicion,
        fases: fasesEdicion
      }
    })
  } catch (error) {
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
    const edicionActiva = ediciones.find(e => e.activa)

    if (!edicionActiva) {
      return res.status(404).json({
        success: false,
        error: 'No hay edición activa'
      })
    }

    // Obtener fases de esta edición
    const fasesEdicion = fases.filter(f => f.edicion_id === edicionActiva.id)

    res.json({
      success: true,
      data: {
        ...edicionActiva,
        fases: fasesEdicion
      }
    })
  } catch (error) {
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

    // Si se está marcando como activa, desactivar las demás
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

    const edicionIndex = ediciones.findIndex(e => e.id === parseInt(id))

    if (edicionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    // Si se está marcando como activa, desactivar las demás
    if (activa === true) {
      ediciones.forEach((e, idx) => {
        if (idx !== edicionIndex) {
          ediciones[idx].activa = false
        }
      })
    }

    // Actualizar campos
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
    const { force } = req.query // ?force=true para eliminación en cascada
    const edicionIndex = ediciones.findIndex(e => e.id === parseInt(id))

    if (edicionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Edición no encontrada'
      })
    }

    // Verificar si hay fases asociadas
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

      // Eliminar todas las fases asociadas (eliminación en cascada)
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
    res.status(500).json({
      success: false,
      error: 'Error al obtener fases de la edición'
    })
  }
}
