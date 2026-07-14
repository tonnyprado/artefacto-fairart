// TEMPORAL: Usando datos hardcodeados en lugar de PostgreSQL
// TODO: Reemplazar con queries a la base de datos cuando se configure PostgreSQL
import { inscripciones, artistas, eventos, paquetes, getNextId, now } from '../data/mockData.js'

/**
 * Obtener todas las inscripciones
 */
export const getInscripciones = async (req, res) => {
  try {
    const { estado, evento_id, limit = 50, offset = 0 } = req.query

    let filteredInscripciones = [...inscripciones]

    // Filtrar por estado
    if (estado) {
      filteredInscripciones = filteredInscripciones.filter(i => i.estado === estado)
    }

    // Filtrar por evento
    if (evento_id) {
      filteredInscripciones = filteredInscripciones.filter(
        i => i.evento_id === parseInt(evento_id)
      )
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredInscripciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // Paginación
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedInscripciones = filteredInscripciones.slice(startIndex, endIndex)

    // Enriquecer con datos relacionados
    const enrichedInscripciones = paginatedInscripciones.map(i => {
      const artista = artistas.find(a => a.id === i.artista_id)
      const evento = eventos.find(e => e.id === i.evento_id)
      const paquete = paquetes.find(p => p.id === i.paquete_id)

      return {
        ...i,
        artista_nombre: artista?.nombre || 'Desconocido',
        evento_nombre: evento?.nombre || 'Desconocido',
        paquete_nombre: paquete?.nombre || 'Desconocido',
        paquete_precio: paquete?.precio || 0
      }
    })

    res.json({
      inscripciones: enrichedInscripciones,
      total: filteredInscripciones.length
    })
  } catch (error) {
    console.error('Error al obtener inscripciones:', error)
    res.status(500).json({ error: 'Error al obtener inscripciones' })
  }
}

/**
 * Obtener inscripción por ID
 */
export const getInscripcionById = async (req, res) => {
  try {
    const { id } = req.params
    const inscripcion = inscripciones.find(i => i.id === parseInt(id))

    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripción no encontrada' })
    }

    // Enriquecer con datos relacionados
    const artista = artistas.find(a => a.id === inscripcion.artista_id)
    const evento = eventos.find(e => e.id === inscripcion.evento_id)
    const paquete = paquetes.find(p => p.id === inscripcion.paquete_id)

    const enrichedInscripcion = {
      ...inscripcion,
      artista_nombre: artista?.nombre || 'Desconocido',
      artista_email: artista?.email || '',
      evento_nombre: evento?.nombre || 'Desconocido',
      paquete_nombre: paquete?.nombre || 'Desconocido',
      paquete_precio: paquete?.precio || 0
    }

    res.json(enrichedInscripcion)
  } catch (error) {
    console.error('Error al obtener inscripción:', error)
    res.status(500).json({ error: 'Error al obtener inscripción' })
  }
}

/**
 * Crear nueva inscripción
 */
export const createInscripcion = async (req, res) => {
  try {
    const { artista_id, evento_id, paquete_id, notas } = req.body

    // Verificar que no exista una inscripción previa
    const existente = inscripciones.find(
      i => i.artista_id === artista_id && i.evento_id === evento_id
    )

    if (existente) {
      return res.status(400).json({
        error: 'El artista ya está inscrito en este evento'
      })
    }

    const nuevaInscripcion = {
      id: getNextId.inscripcion(),
      artista_id,
      evento_id,
      paquete_id,
      estado: 'pendiente',
      notas: notas || null,
      created_at: now(),
      updated_at: now()
    }

    inscripciones.push(nuevaInscripcion)

    res.status(201).json({
      message: 'Inscripción creada exitosamente',
      inscripcion: nuevaInscripcion
    })
  } catch (error) {
    console.error('Error al crear inscripción:', error)
    res.status(500).json({ error: 'Error al crear inscripción' })
  }
}

/**
 * Actualizar estado de inscripción
 */
export const updateEstadoInscripcion = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const index = inscripciones.findIndex(i => i.id === parseInt(id))

    if (index === -1) {
      return res.status(404).json({ error: 'Inscripción no encontrada' })
    }

    inscripciones[index] = {
      ...inscripciones[index],
      estado,
      updated_at: now()
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      inscripcion: inscripciones[index]
    })
  } catch (error) {
    console.error('Error al actualizar inscripción:', error)
    res.status(500).json({ error: 'Error al actualizar inscripción' })
  }
}

/**
 * Eliminar inscripción
 */
export const deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params
    const index = inscripciones.findIndex(i => i.id === parseInt(id))

    if (index === -1) {
      return res.status(404).json({ error: 'Inscripción no encontrada' })
    }

    inscripciones.splice(index, 1)

    res.json({
      message: 'Inscripción eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar inscripción:', error)
    res.status(500).json({ error: 'Error al eliminar inscripción' })
  }
}
