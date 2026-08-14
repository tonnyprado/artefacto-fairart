/**
 * Controlador de Mensajes de Contacto
 * Maneja los mensajes enviados desde el formulario de contacto
 * Usa PostgreSQL para persistencia y Brevo para envío de emails
 */

import pool from '../config/database.js'
import { notificarNuevoMensaje, enviarRespuestaMensaje, isBrevoConfigured } from '../services/email.service.js'

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

    // Insertar en base de datos
    const result = await pool.query(
      `INSERT INTO mensajes_contacto (nombre, email, telefono, asunto, mensaje)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, email, telefono || null, asunto, mensaje]
    )

    const nuevoMensaje = result.rows[0]

    // Enviar notificación al admin por email (async, no bloquea respuesta)
    if (isBrevoConfigured()) {
      notificarNuevoMensaje({ nombre, email, telefono, asunto, mensaje })
        .then(result => {
          if (result.success) {
            console.log('✅ Notificación de nuevo mensaje enviada al admin')
          }
        })
        .catch(err => console.error('Error enviando notificación:', err))
    }

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
    const { leido, respondido, limit = 50, offset = 0 } = req.query

    let query = 'SELECT * FROM mensajes_contacto WHERE 1=1'
    const params = []
    let paramCount = 1

    // Filtrar por leído
    if (leido !== undefined) {
      query += ` AND leido = $${paramCount}`
      params.push(leido === 'true')
      paramCount++
    }

    // Filtrar por respondido
    if (respondido !== undefined) {
      query += ` AND respondido = $${paramCount}`
      params.push(respondido === 'true')
      paramCount++
    }

    // Ordenar por fecha (más recientes primero)
    query += ' ORDER BY created_at DESC'

    // Paginación
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, params)

    // Obtener total sin paginación
    let countQuery = 'SELECT COUNT(*) FROM mensajes_contacto WHERE 1=1'
    const countParams = []
    let countParamNum = 1

    if (leido !== undefined) {
      countQuery += ` AND leido = $${countParamNum}`
      countParams.push(leido === 'true')
      countParamNum++
    }
    if (respondido !== undefined) {
      countQuery += ` AND respondido = $${countParamNum}`
      countParams.push(respondido === 'true')
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)

    res.json({
      success: true,
      data: result.rows,
      total
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

    const result = await pool.query(
      `SELECT mc.*, u.nombre as admin_nombre, u.apellido as admin_apellido
       FROM mensajes_contacto mc
       LEFT JOIN usuarios u ON u.id = mc.respondido_por
       WHERE mc.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
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

    const result = await pool.query(
      `UPDATE mensajes_contacto
       SET leido = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
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
 * Envía email al contacto con la respuesta
 */
export const responderMensaje = async (req, res) => {
  try {
    const { id } = req.params
    const { respuesta } = req.body
    const adminId = req.user?.id // ID del admin autenticado
    const adminNombre = req.user?.nombre || 'Equipo ARTEFACTO'

    if (!respuesta) {
      return res.status(400).json({
        success: false,
        error: 'La respuesta es requerida'
      })
    }

    // Obtener el mensaje original
    const mensajeResult = await pool.query(
      'SELECT * FROM mensajes_contacto WHERE id = $1',
      [id]
    )

    if (mensajeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

    const mensajeOriginal = mensajeResult.rows[0]

    // Enviar email de respuesta
    let emailEnviado = false
    if (isBrevoConfigured()) {
      try {
        const emailResult = await enviarRespuestaMensaje(mensajeOriginal, respuesta, adminNombre)
        emailEnviado = emailResult.success
        if (emailEnviado) {
          console.log('✅ Email de respuesta enviado a:', mensajeOriginal.email)
        }
      } catch (emailError) {
        console.error('Error enviando email de respuesta:', emailError)
      }
    } else {
      console.warn('⚠️ Brevo no configurado. La respuesta se guardó pero NO se envió por email.')
    }

    // Actualizar mensaje en BD
    const result = await pool.query(
      `UPDATE mensajes_contacto
       SET respuesta = $1,
           respondido = true,
           respondido_por = $2,
           email_enviado = $3,
           fecha_respuesta = CURRENT_TIMESTAMP,
           leido = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [respuesta, adminId, emailEnviado, id]
    )

    res.json({
      success: true,
      data: result.rows[0],
      email_enviado: emailEnviado,
      message: emailEnviado
        ? 'Respuesta enviada exitosamente por email'
        : 'Respuesta guardada (email no configurado)'
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

    const result = await pool.query(
      'DELETE FROM mensajes_contacto WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      })
    }

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
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE leido = true) as leidos,
        COUNT(*) FILTER (WHERE leido = false) as no_leidos,
        COUNT(*) FILTER (WHERE respondido = true) as respondidos,
        COUNT(*) FILTER (WHERE respondido = false) as pendientes,
        COUNT(*) FILTER (WHERE email_enviado = true) as emails_enviados
      FROM mensajes_contacto
    `)

    const stats = result.rows[0]

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        leidos: parseInt(stats.leidos),
        no_leidos: parseInt(stats.no_leidos),
        respondidos: parseInt(stats.respondidos),
        pendientes: parseInt(stats.pendientes),
        emails_enviados: parseInt(stats.emails_enviados)
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
