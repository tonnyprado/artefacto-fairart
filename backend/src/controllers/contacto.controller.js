/**
 * Controlador de Mensajes de Contacto
 * Maneja los mensajes enviados desde el formulario de contacto
 */

import { mensajesContacto, getNextId, now } from '../data/mockData.js'

/**
 * POST /api/contacto
 * Enviar mensaje de contacto
 * PÚBLICO - No requiere autenticación
 */
export const enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body

    // Validaciones
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'nombre, email, asunto y mensaje son requeridos'
      })
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      })
    }

    const nuevoMensaje = {
      id: getNextId.mensajeContacto(),
      nombre,
      email,
      telefono: telefono || null,
      asunto,
      mensaje,
      leido: false,
      respondido: false,
      respuesta: null,
      respondido_por: null,
      fecha_respuesta: null,
      created_at: now(),
      updated_at: now()
    }

    mensajesContacto.push(nuevoMensaje)

    res.status(201).json({
      success: true,
      data: nuevoMensaje,
      message: 'Mensaje enviado exitosamente. Nos pondremos en contacto pronto.'
    })
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    res.status(500).json({
      success: false,
      error: 'Error al enviar mensaje'
    })
  }
}

/**
 * GET /api/contacto
 * Obtener todos los mensajes de contacto (Solo admin)
 */
export const getMensajes = async (req, res) => {
  try {
    const { leido, respondido } = req.query

    let filteredMensajes = [...mensajesContacto]

    // Filtrar por leído
    if (leido !== undefined) {
      const isLeido = leido === 'true'
      filteredMensajes = filteredMensajes.filter(m => m.leido === isLeido)
    }

    // Filtrar por respondido
    if (respondido !== undefined) {
      const isRespondido = respondido === 'true'
      filteredMensajes = filteredMensajes.filter(m => m.respondido === isRespondido)
    }

    // Ordenar por fecha (más recientes primero)
    filteredMensajes.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )

    res.json({
      success: true,
      data: filteredMensajes,
      total: filteredMensajes.length
    })
  } catch (error) {
    console.error('Error al obtener mensajes:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener mensajes'
    })
  }
}

/**
 * GET /api/contacto/:id
 * Obtener un mensaje por ID (Solo admin)
 */
export const getMensajeById = async (req, res) => {
  try {
    const { id } = req.params
    const mensaje = mensajesContacto.find(m => m.id === parseInt(id))

    if (!mensaje) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    res.json({
      success: true,
      data: mensaje
    })
  } catch (error) {
    console.error('Error al obtener mensaje:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener mensaje'
    })
  }
}

/**
 * PUT /api/contacto/:id/marcar-leido
 * Marcar mensaje como leído (Solo admin)
 */
export const marcarLeido = async (req, res) => {
  try {
    const { id } = req.params
    const mensajeIndex = mensajesContacto.findIndex(m => m.id === parseInt(id))

    if (mensajeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    mensajesContacto[mensajeIndex].leido = true
    mensajesContacto[mensajeIndex].updated_at = now()

    res.json({
      success: true,
      data: mensajesContacto[mensajeIndex],
      message: 'Mensaje marcado como leído'
    })
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error)
    res.status(500).json({
      success: false,
      error: 'Error al marcar mensaje como leído'
    })
  }
}

/**
 * PUT /api/contacto/:id/responder
 * Responder a un mensaje (Solo admin)
 */
export const responderMensaje = async (req, res) => {
  try {
    const { id } = req.params
    const { respuesta } = req.body
    const adminId = req.user?.id // ID del admin autenticado

    if (!respuesta) {
      return res.status(400).json({
        success: false,
        error: 'La respuesta es requerida'
      })
    }

    const mensajeIndex = mensajesContacto.findIndex(m => m.id === parseInt(id))

    if (mensajeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    mensajesContacto[mensajeIndex].respuesta = respuesta
    mensajesContacto[mensajeIndex].respondido = true
    mensajesContacto[mensajeIndex].respondido_por = adminId
    mensajesContacto[mensajeIndex].fecha_respuesta = now()
    mensajesContacto[mensajeIndex].leido = true
    mensajesContacto[mensajeIndex].updated_at = now()

    res.json({
      success: true,
      data: mensajesContacto[mensajeIndex],
      message: 'Respuesta enviada exitosamente'
    })
  } catch (error) {
    console.error('Error al responder mensaje:', error)
    res.status(500).json({
      success: false,
      error: 'Error al responder mensaje'
    })
  }
}

/**
 * DELETE /api/contacto/:id
 * Eliminar un mensaje (Solo admin)
 */
export const deleteMensaje = async (req, res) => {
  try {
    const { id } = req.params
    const mensajeIndex = mensajesContacto.findIndex(m => m.id === parseInt(id))

    if (mensajeIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    mensajesContacto.splice(mensajeIndex, 1)

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar mensaje:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar mensaje'
    })
  }
}

/**
 * GET /api/contacto/estadisticas
 * Obtener estadísticas de mensajes (Solo admin)
 */
export const getEstadisticas = async (req, res) => {
  try {
    const total = mensajesContacto.length
    const leidos = mensajesContacto.filter(m => m.leido).length
    const noLeidos = total - leidos
    const respondidos = mensajesContacto.filter(m => m.respondido).length
    const pendientes = total - respondidos

    res.json({
      success: true,
      data: {
        total,
        leidos,
        no_leidos: noLeidos,
        respondidos,
        pendientes
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
