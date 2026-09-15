/**
 * Controlador de Pre-Registro de Artistas
 * Maneja el registro parcial (solo datos de Step1)
 * para capturar leads y enviar recordatorios
 */

import crypto from 'crypto'
import pool from '../config/database.js'
import { enviarConfirmacionPreRegistro, enviarRecordatorioPreRegistro, isBrevoConfigured } from '../services/email.service.js'

// Generar token único para magic link
const generarTokenAcceso = () => {
  return crypto.randomBytes(32).toString('hex') // 64 caracteres hex
}

// Funciones de validación
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone) => {
  if (!phone) return true // Teléfono opcional
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '')
  return /^\d{10,15}$/.test(cleanPhone)
}

/**
 * POST /api/preregistro
 * Crear o actualizar pre-registro de artista
 * Solo guarda datos básicos de Step1 (sin archivos)
 */
export const crearPreRegistro = async (req, res) => {
  const timestamp = new Date().toISOString()
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

  console.log('='.repeat(60))
  console.log('📝 PRE-REGISTRO INICIADO')
  console.log(`⏰ Timestamp: ${timestamp}`)
  console.log(`🌐 IP: ${ip}`)
  console.log(`🔗 Origin: ${req.headers.origin || 'N/A'}`)
  console.log('='.repeat(60))

  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento,
      ciudad,
      pais
    } = req.body

    console.log('📧 Email:', email)
    console.log('👤 Nombre:', nombre, apellido)
    console.log('📍 Ubicación:', ciudad, pais)

    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, apellido y email son requeridos'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      })
    }

    if (!isValidPhone(telefono)) {
      return res.status(400).json({
        success: false,
        error: 'Teléfono inválido'
      })
    }

    // Verificar si el email ya existe
    const existingResult = await pool.query(
      'SELECT id, estado_registro FROM artistas WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0]

      // Si ya está registrado completamente, no permitir pre-registro
      if (['pendiente', 'aprobado', 'rechazado'].includes(existing.estado_registro)) {
        return res.status(400).json({
          success: false,
          error: 'Este email ya tiene un registro completo',
          code: 'EMAIL_ALREADY_REGISTERED'
        })
      }

      // Si es pre_registrado, actualizar datos y regenerar token
      if (existing.estado_registro === 'pre_registrado') {
        console.log('📝 Actualizando pre-registro existente...')

        const nuevoToken = generarTokenAcceso()

        await pool.query(`
          UPDATE artistas SET
            nombre = $1,
            apellido = $2,
            telefono = $3,
            fecha_nacimiento = $4,
            ciudad = $5,
            pais = $6,
            token_acceso = $7,
            updated_at = NOW()
          WHERE id = $8
        `, [nombre, apellido, telefono, fecha_nacimiento, ciudad, pais, nuevoToken, existing.id])

        console.log('✅ Pre-registro actualizado con nuevo token')

        return res.status(200).json({
          success: true,
          message: 'Pre-registro actualizado',
          artista_id: existing.id,
          token: nuevoToken,
          isUpdate: true
        })
      }
    }

    // Crear nuevo pre-registro con token
    console.log('📝 Creando nuevo pre-registro...')

    const tokenAcceso = generarTokenAcceso()

    const insertResult = await pool.query(`
      INSERT INTO artistas (
        nombre, apellido, email, telefono,
        fecha_nacimiento, ciudad, pais,
        estado_registro, fecha_pre_registro,
        recordatorios_enviados, token_acceso,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        'pre_registrado', NOW(),
        0, $8, NOW(), NOW()
      )
      RETURNING id
    `, [
      nombre,
      apellido,
      email.toLowerCase().trim(),
      telefono,
      fecha_nacimiento,
      ciudad,
      pais,
      tokenAcceso
    ])

    const artistaId = insertResult.rows[0].id
    console.log('='.repeat(60))
    console.log('✅ PRE-REGISTRO EXITOSO')
    console.log(`⏰ Completado: ${new Date().toISOString()}`)
    console.log(`🆔 Artista ID: ${artistaId}`)
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Nombre: ${nombre} ${apellido}`)
    console.log(`🔑 Token generado: ${tokenAcceso.substring(0, 10)}...`)
    console.log('='.repeat(60))

    // Enviar email de bienvenida con token (async, no bloquea)
    if (isBrevoConfigured()) {
      enviarConfirmacionPreRegistro({
        nombre,
        apellido,
        email: email.toLowerCase().trim(),
        token: tokenAcceso
      }).catch(err => {
        console.error('❌ Error enviando email de pre-registro:', err.message)
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Pre-registro creado exitosamente',
      artista_id: artistaId,
      token: tokenAcceso,
      isNew: true
    })

  } catch (error) {
    console.log('='.repeat(60))
    console.error('❌ ERROR EN PRE-REGISTRO')
    console.error(`⏰ Timestamp: ${new Date().toISOString()}`)
    console.error(`🌐 IP: ${ip}`)
    console.error(`📧 Email intentado: ${req.body.email || 'N/A'}`)
    console.error(`❌ Error: ${error.message}`)
    console.error(`📚 Stack:`, error.stack)
    console.log('='.repeat(60))

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * GET /api/preregistro/datos
 * Obtener datos de pre-registro por email (para auto-llenar formulario)
 * DEPRECADO: Usar /api/preregistro/token/:token en su lugar
 */
export const obtenerDatosPreRegistro = async (req, res) => {
  try {
    const { email } = req.query

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      })
    }

    const result = await pool.query(`
      SELECT
        id, nombre, apellido, email, telefono,
        fecha_nacimiento, ciudad, pais
      FROM artistas
      WHERE email = $1 AND estado_registro = 'pre_registrado'
    `, [email.toLowerCase().trim()])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pre-registro no encontrado'
      })
    }

    return res.json({
      success: true,
      artista: result.rows[0]
    })

  } catch (error) {
    console.error('❌ Error obteniendo datos pre-registro:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
}

/**
 * GET /api/preregistro/token/:token
 * Obtener datos de pre-registro por Magic Link token
 * Este es el método seguro para que usuarios regresen a completar registro
 */
export const obtenerDatosPorToken = async (req, res) => {
  try {
    const { token } = req.params

    if (!token || token.length !== 64) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido'
      })
    }

    const result = await pool.query(`
      SELECT
        id, nombre, apellido, email, telefono,
        fecha_nacimiento, ciudad, pais
      FROM artistas
      WHERE token_acceso = $1 AND estado_registro = 'pre_registrado'
    `, [token])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Enlace inválido o expirado. Es posible que ya hayas completado tu registro.'
      })
    }

    console.log('✅ Token válido para:', result.rows[0].email)

    return res.json({
      success: true,
      artista: result.rows[0]
    })

  } catch (error) {
    console.error('❌ Error validando token:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
}

/**
 * GET /api/admin/preregistros
 * Listar todos los pre-registros (solo admin)
 */
export const getPreRegistros = async (req, res) => {
  try {
    const { search, limit = 100, offset = 0 } = req.query

    let query = `
      SELECT
        id, nombre, apellido, email, telefono,
        fecha_nacimiento, ciudad, pais,
        fecha_pre_registro, recordatorios_enviados,
        ultimo_recordatorio_enviado, created_at,
        EXTRACT(DAY FROM (NOW() - fecha_pre_registro)) as dias_desde_registro
      FROM artistas
      WHERE estado_registro = 'pre_registrado'
    `
    const params = []

    if (search) {
      params.push(`%${search}%`)
      query += ` AND (nombre ILIKE $${params.length} OR apellido ILIKE $${params.length} OR email ILIKE $${params.length})`
    }

    query += ` ORDER BY fecha_pre_registro DESC`

    params.push(parseInt(limit))
    query += ` LIMIT $${params.length}`

    params.push(parseInt(offset))
    query += ` OFFSET $${params.length}`

    const result = await pool.query(query, params)

    // Obtener total
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM artistas WHERE estado_registro = 'pre_registrado'
    `)

    return res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

  } catch (error) {
    console.error('❌ Error obteniendo pre-registros:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
}

/**
 * GET /api/admin/preregistros/stats
 * Estadísticas de pre-registros
 */
export const getPreRegistroStats = async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE estado_registro = 'pre_registrado') as total_pre_registros,
        COUNT(*) FILTER (WHERE estado_registro = 'pre_registrado' AND recordatorios_enviados = 0) as sin_recordatorio,
        COUNT(*) FILTER (WHERE estado_registro = 'pre_registrado' AND recordatorios_enviados >= 5) as max_recordatorios,
        COUNT(*) FILTER (
          WHERE estado_registro IN ('pendiente', 'aprobado', 'rechazado')
          AND fecha_pre_registro IS NOT NULL
        ) as convertidos
      FROM artistas
    `)

    const stats = statsResult.rows[0]

    // Calcular tasa de conversión
    const totalPreRegistros = parseInt(stats.total_pre_registros) + parseInt(stats.convertidos)
    const tasaConversion = totalPreRegistros > 0
      ? ((parseInt(stats.convertidos) / totalPreRegistros) * 100).toFixed(1)
      : 0

    return res.json({
      success: true,
      stats: {
        totalPreRegistros: parseInt(stats.total_pre_registros),
        sinRecordatorio: parseInt(stats.sin_recordatorio),
        maxRecordatorios: parseInt(stats.max_recordatorios),
        convertidos: parseInt(stats.convertidos),
        tasaConversion: parseFloat(tasaConversion)
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
}

/**
 * POST /api/admin/preregistros/:id/recordatorio
 * Enviar recordatorio manual a un pre-registrado
 */
export const enviarRecordatorioManual = async (req, res) => {
  try {
    const { id } = req.params

    // Obtener datos del artista incluyendo token
    const artistaResult = await pool.query(`
      SELECT id, nombre, apellido, email, fecha_pre_registro, recordatorios_enviados, token_acceso
      FROM artistas
      WHERE id = $1 AND estado_registro = 'pre_registrado'
    `, [id])

    if (artistaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pre-registro no encontrado'
      })
    }

    const artista = artistaResult.rows[0]

    // Verificar límite de recordatorios
    const maxRecordatorios = parseInt(process.env.MAX_RECORDATORIOS_PREREGISTRO) || 5
    if (artista.recordatorios_enviados >= maxRecordatorios) {
      return res.status(400).json({
        success: false,
        error: `Ya se enviaron ${maxRecordatorios} recordatorios a este usuario`
      })
    }

    // Enviar email
    if (!isBrevoConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Brevo no está configurado'
      })
    }

    const numeroRecordatorio = artista.recordatorios_enviados + 1

    await enviarRecordatorioPreRegistro(artista, numeroRecordatorio)

    // Actualizar contador
    await pool.query(`
      UPDATE artistas SET
        recordatorios_enviados = $1,
        ultimo_recordatorio_enviado = NOW()
      WHERE id = $2
    `, [numeroRecordatorio, id])

    console.log(`✅ Recordatorio #${numeroRecordatorio} enviado a ${artista.email}`)

    return res.json({
      success: true,
      message: `Recordatorio #${numeroRecordatorio} enviado a ${artista.email}`,
      recordatoriosEnviados: numeroRecordatorio
    })

  } catch (error) {
    console.error('❌ Error enviando recordatorio:', error)
    return res.status(500).json({
      success: false,
      error: 'Error enviando recordatorio',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * POST /api/admin/preregistros/recordatorio-masivo
 * Enviar recordatorio a todos los pre-registrados elegibles
 */
export const enviarRecordatorioMasivo = async (req, res) => {
  try {
    if (!isBrevoConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Brevo no está configurado'
      })
    }

    const maxRecordatorios = parseInt(process.env.MAX_RECORDATORIOS_PREREGISTRO) || 5

    // Obtener pre-registros elegibles incluyendo token
    const result = await pool.query(`
      SELECT id, nombre, apellido, email, fecha_pre_registro, recordatorios_enviados, token_acceso
      FROM artistas
      WHERE estado_registro = 'pre_registrado'
        AND recordatorios_enviados < $1
      ORDER BY fecha_pre_registro ASC
    `, [maxRecordatorios])

    const elegibles = result.rows
    console.log(`📧 ${elegibles.length} pre-registros elegibles para recordatorio masivo`)

    let enviados = 0
    let errores = 0

    for (const artista of elegibles) {
      try {
        const numeroRecordatorio = artista.recordatorios_enviados + 1

        await enviarRecordatorioPreRegistro(artista, numeroRecordatorio)

        await pool.query(`
          UPDATE artistas SET
            recordatorios_enviados = $1,
            ultimo_recordatorio_enviado = NOW()
          WHERE id = $2
        `, [numeroRecordatorio, artista.id])

        enviados++

        // Pausa entre emails para no saturar
        await new Promise(r => setTimeout(r, 300))

      } catch (error) {
        errores++
        console.error(`❌ Error enviando a ${artista.email}:`, error.message)
      }
    }

    console.log(`🔔 Recordatorio masivo completado: ${enviados} enviados, ${errores} errores`)

    return res.json({
      success: true,
      message: `Recordatorio masivo completado`,
      enviados,
      errores,
      total: elegibles.length
    })

  } catch (error) {
    console.error('❌ Error en recordatorio masivo:', error)
    return res.status(500).json({
      success: false,
      error: 'Error en recordatorio masivo'
    })
  }
}
