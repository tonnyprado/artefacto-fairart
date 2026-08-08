/**
 * Controlador de Eventos
 * Maneja la lógica de eventos/ferias
 */

import { eventos, getNextId, now } from '../data/mockData.js'

/**
 * GET /api/eventos/principal
 * Obtener el evento principal activo
 * PÚBLICO - No requiere autenticación
 */
export const getEventoPrincipal = async (req, res) => {
  try {
    // Buscar evento principal activo
    const eventoPrincipal = eventos.find(
      e => e.tipo_evento === 'feria_principal' && e.activo === true
    )

    if (!eventoPrincipal) {
      return res.status(404).json({
        success: false,
        error: 'No hay evento principal activo'
      })
    }

    res.json({
      success: true,
      data: eventoPrincipal
    })
  } catch (error) {
    console.error('Error al obtener evento principal:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener evento principal'
    })
  }
}

/**
 * GET /api/eventos/calendario
 * Obtener eventos para el calendario
 * PÚBLICO - No requiere autenticación
 */
export const getEventosCalendario = async (req, res) => {
  try {
    // Filtrar eventos activos del tipo 'calendario' o 'especial'
    const eventosCalendario = eventos.filter(
      e => e.activo === true && ['calendario', 'especial'].includes(e.tipo_evento)
    )

    // Ordenar por fecha de inicio
    eventosCalendario.sort((a, b) =>
      new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
    )

    res.json({
      success: true,
      data: eventosCalendario
    })
  } catch (error) {
    console.error('Error al obtener eventos del calendario:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener eventos del calendario'
    })
  }
}

/**
 * GET /api/eventos
 * Obtener todos los eventos
 */
export const getAllEventos = async (req, res) => {
  try {
    const { activo, tipo_evento } = req.query

    let filteredEventos = [...eventos]

    // Filtrar por activo
    if (activo !== undefined) {
      const isActivo = activo === 'true'
      filteredEventos = filteredEventos.filter(e => e.activo === isActivo)
    }

    // Filtrar por tipo
    if (tipo_evento) {
      filteredEventos = filteredEventos.filter(e => e.tipo_evento === tipo_evento)
    }

    // Ordenar por fecha de inicio (más reciente primero)
    filteredEventos.sort((a, b) =>
      new Date(b.fecha_inicio) - new Date(a.fecha_inicio)
    )

    res.json({
      success: true,
      data: filteredEventos
    })
  } catch (error) {
    console.error('Error al obtener eventos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener eventos'
    })
  }
}

/**
 * GET /api/eventos/:id
 * Obtener un evento por ID
 */
export const getEventoById = async (req, res) => {
  try {
    const { id } = req.params
    const evento = eventos.find(e => e.id === parseInt(id))

    if (!evento) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      })
    }

    res.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener evento'
    })
  }
}

/**
 * GET /api/eventos/slug/:slug
 * Obtener evento por slug
 */
export const getEventoBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const evento = eventos.find(e => e.slug === slug)

    if (!evento) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      })
    }

    res.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Error al obtener evento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener evento'
    })
  }
}

/**
 * POST /api/eventos
 * Crear un nuevo evento (Solo admin)
 */
export const createEvento = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      tipo_evento,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      lugar_nombre,
      direccion_completa,
      ciudad,
      estado,
      codigo_postal,
      pais,
      coordenadas_lat,
      coordenadas_lng,
      mapa_embed_url,
      info_transporte,
      imagen,
      slug
    } = req.body

    // Validaciones
    if (!nombre || !fecha_inicio || !fecha_fin || !ubicacion) {
      return res.status(400).json({
        success: false,
        error: 'nombre, fecha_inicio, fecha_fin y ubicacion son requeridos'
      })
    }

    // Generar slug si no se proporciona
    const generatedSlug = slug || nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Verificar que el slug no exista
    const slugExiste = eventos.some(e => e.slug === generatedSlug)
    if (slugExiste) {
      return res.status(400).json({
        success: false,
        error: 'El slug ya está en uso'
      })
    }

    const nuevoEvento = {
      id: getNextId.evento(),
      nombre,
      descripcion: descripcion || null,
      tipo_evento: tipo_evento || 'feria_principal',
      fecha_inicio,
      fecha_fin,
      ubicacion,
      lugar_nombre: lugar_nombre || null,
      direccion_completa: direccion_completa || null,
      ciudad: ciudad || null,
      estado: estado || null,
      codigo_postal: codigo_postal || null,
      pais: pais || 'México',
      coordenadas_lat: coordenadas_lat || null,
      coordenadas_lng: coordenadas_lng || null,
      mapa_embed_url: mapa_embed_url || null,
      info_transporte: info_transporte || null,
      imagen: imagen || null,
      slug: generatedSlug,
      activo: true,
      created_at: now(),
      updated_at: now()
    }

    eventos.push(nuevoEvento)

    res.status(201).json({
      success: true,
      data: nuevoEvento,
      message: 'Evento creado exitosamente'
    })
  } catch (error) {
    console.error('Error al crear evento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear evento'
    })
  }
}

/**
 * PUT /api/eventos/:id
 * Actualizar un evento (Solo admin)
 */
export const updateEvento = async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      descripcion,
      tipo_evento,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      lugar_nombre,
      direccion_completa,
      ciudad,
      estado,
      codigo_postal,
      pais,
      coordenadas_lat,
      coordenadas_lng,
      mapa_embed_url,
      info_transporte,
      imagen,
      slug,
      activo
    } = req.body

    const eventoIndex = eventos.findIndex(e => e.id === parseInt(id))

    if (eventoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      })
    }

    // Si se cambia el slug, verificar que no esté en uso
    if (slug && slug !== eventos[eventoIndex].slug) {
      const slugExiste = eventos.some(e => e.slug === slug && e.id !== parseInt(id))
      if (slugExiste) {
        return res.status(400).json({
          success: false,
          error: 'El slug ya está en uso'
        })
      }
    }

    // Actualizar evento
    eventos[eventoIndex] = {
      ...eventos[eventoIndex],
      ...(nombre && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(tipo_evento && { tipo_evento }),
      ...(fecha_inicio && { fecha_inicio }),
      ...(fecha_fin && { fecha_fin }),
      ...(ubicacion && { ubicacion }),
      ...(lugar_nombre !== undefined && { lugar_nombre }),
      ...(direccion_completa !== undefined && { direccion_completa }),
      ...(ciudad !== undefined && { ciudad }),
      ...(estado !== undefined && { estado }),
      ...(codigo_postal !== undefined && { codigo_postal }),
      ...(pais && { pais }),
      ...(coordenadas_lat !== undefined && { coordenadas_lat }),
      ...(coordenadas_lng !== undefined && { coordenadas_lng }),
      ...(mapa_embed_url !== undefined && { mapa_embed_url }),
      ...(info_transporte !== undefined && { info_transporte }),
      ...(imagen !== undefined && { imagen }),
      ...(slug && { slug }),
      ...(activo !== undefined && { activo }),
      updated_at: now()
    }

    res.json({
      success: true,
      data: eventos[eventoIndex],
      message: 'Evento actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar evento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar evento'
    })
  }
}

/**
 * DELETE /api/eventos/:id
 * Eliminar un evento (Solo admin)
 */
export const deleteEvento = async (req, res) => {
  try {
    const { id } = req.params
    const eventoIndex = eventos.findIndex(e => e.id === parseInt(id))

    if (eventoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      })
    }

    eventos.splice(eventoIndex, 1)

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar evento'
    })
  }
}
