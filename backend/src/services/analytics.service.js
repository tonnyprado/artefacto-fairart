/**
 * Analytics Service
 * Sistema de tracking de eventos y sesiones de usuarios
 *
 * Características:
 * - Queue con batch processing para reducir carga en DB
 * - Hash de IP para privacidad
 * - Queries optimizadas para dashboard
 * - Flush automático cada 30 segundos
 */

import { pool } from '../config/database.js'
import crypto from 'crypto'

// =====================================================
// QUEUE GLOBAL PARA BATCH PROCESSING
// =====================================================

let eventQueue = []
const BATCH_SIZE = 10 // Flush cuando alcanzamos 10 eventos
const FLUSH_INTERVAL = 30000 // Flush automático cada 30 segundos

// Flush periódico automático
const flushTimer = setInterval(() => {
  if (eventQueue.length > 0) {
    console.log(`📊 Analytics: Flush automático (${eventQueue.length} eventos en queue)`)
    flushEventQueue()
  }
}, FLUSH_INTERVAL)

// Cleanup al cerrar el proceso
process.on('SIGTERM', () => {
  clearInterval(flushTimer)
  if (eventQueue.length > 0) {
    console.log('📊 Analytics: Flush final antes de cerrar')
    flushEventQueue()
  }
})

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Hash de IP para privacidad
 * Usa SHA256 con salt para no guardar IPs completas
 */
function hashIP(ip) {
  const salt = process.env.IP_SALT || 'artefacto-analytics-salt-2027'
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
}

// =====================================================
// GESTIÓN DE SESIONES
// =====================================================

/**
 * Crear o actualizar sesión de usuario
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Object} Sesión creada o actualizada
 */
export async function createOrUpdateSession(sessionData) {
  const { session_id, user_id, ip, user_agent, referrer, landing_page } = sessionData

  const ip_hash = hashIP(ip)

  try {
    const result = await pool.query(
      `
      INSERT INTO analytics_sessions (
        session_id, user_id, ip_hash, user_agent, referrer, landing_page,
        page_views, events_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, 1, 0)
      ON CONFLICT (session_id) DO UPDATE SET
        page_views = analytics_sessions.page_views + 1,
        events_count = analytics_sessions.events_count + 1,
        ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - analytics_sessions.started_at))::INTEGER,
        updated_at = NOW(),
        exit_page = COALESCE($6, analytics_sessions.exit_page)
      RETURNING *
    `,
      [session_id, user_id || null, ip_hash, user_agent, referrer, landing_page]
    )

    return result.rows[0]
  } catch (error) {
    console.error('❌ Error creando/actualizando sesión:', error)
    throw error
  }
}

/**
 * Marcar sesión como convertida
 * @param {string} session_id - UUID de la sesión
 * @param {string} conversion_type - Tipo de conversión
 */
export async function markConversion(session_id, conversion_type) {
  try {
    await pool.query(
      `
      UPDATE analytics_sessions
      SET converted = true, conversion_type = $2, updated_at = NOW()
      WHERE session_id = $1
    `,
      [session_id, conversion_type]
    )
    console.log(`✅ Conversión marcada: ${session_id} - ${conversion_type}`)
  } catch (error) {
    console.error('❌ Error marcando conversión:', error)
    throw error
  }
}

// =====================================================
// TRACKING DE EVENTOS
// =====================================================

/**
 * Agregar evento a la queue (no bloquea)
 * @param {Object} eventData - Datos del evento
 */
export function trackEvent(eventData) {
  eventQueue.push({
    ...eventData,
    timestamp: new Date(),
  })

  console.log(
    `📊 Evento agregado a queue: ${eventData.event_type} (${eventQueue.length}/${BATCH_SIZE})`
  )

  // Flush si alcanzamos el tamaño del batch
  if (eventQueue.length >= BATCH_SIZE) {
    console.log(`📊 Queue llena (${BATCH_SIZE}), iniciando flush...`)
    flushEventQueue()
  }
}

/**
 * Flush de eventos a la base de datos
 * Usa transacción para asegurar atomicidad
 */
async function flushEventQueue() {
  if (eventQueue.length === 0) return

  const events = [...eventQueue]
  eventQueue = [] // Limpiar queue inmediatamente

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    for (const event of events) {
      await client.query(
        `
        INSERT INTO analytics_events (
          session_id, user_id, event_type, event_name, page_url, page_title,
          element_id, element_text, value, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          event.session_id,
          event.user_id || null,
          event.event_type,
          event.event_name || null,
          event.page_url || null,
          event.page_title || null,
          event.element_id || null,
          event.element_text || null,
          event.value || null,
          event.metadata || {},
        ]
      )
    }

    await client.query('COMMIT')
    console.log(`✅ Analytics: ${events.length} eventos guardados en DB`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(`❌ Error guardando eventos (${events.length}):`, error.message)

    // Re-agregar a la queue para retry
    eventQueue = [...events, ...eventQueue]
    console.log(`⚠️  ${events.length} eventos re-agregados a queue para retry`)
  } finally {
    client.release()
  }
}

// =====================================================
// QUERIES DE ESTADÍSTICAS
// =====================================================

/**
 * Obtener estadísticas generales
 * @param {Object} filters - Filtros de fecha, tipo, usuario
 * @returns {Object} Métricas agregadas
 */
export async function getStats(filters = {}) {
  const { start_date, end_date, event_type, user_id } = filters

  // Construir WHERE clause dinámicamente
  let whereConditions = ['1=1']
  let params = []
  let paramIndex = 1

  if (start_date) {
    whereConditions.push(`created_at >= $${paramIndex}`)
    params.push(start_date)
    paramIndex++
  }

  if (end_date) {
    whereConditions.push(`created_at <= $${paramIndex}`)
    params.push(end_date)
    paramIndex++
  }

  if (event_type) {
    whereConditions.push(`event_type = $${paramIndex}`)
    params.push(event_type)
    paramIndex++
  }

  if (user_id) {
    whereConditions.push(`user_id = $${paramIndex}`)
    params.push(user_id)
    paramIndex++
  }

  const whereClause = whereConditions.join(' AND ')

  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
        COUNT(*) FILTER (WHERE event_type = 'page_view') as total_page_views,
        COUNT(*) FILTER (WHERE event_type = 'conversion') as total_conversions,
        COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
        COUNT(*) FILTER (WHERE event_type = 'error') as total_errors,
        ROUND(AVG(value) FILTER (WHERE event_type = 'time_on_page'), 2) as avg_time_on_page_seconds
      FROM analytics_events
      WHERE ${whereClause}
    `,
      params
    )

    return result.rows[0]
  } catch (error) {
    console.error('❌ Error obteniendo stats:', error)
    throw error
  }
}

/**
 * Obtener usuarios activos ahora (últimos 5 minutos)
 * @returns {number} Cantidad de usuarios activos
 */
export async function getActiveUsers() {
  try {
    const result = await pool.query(`
      SELECT COUNT(DISTINCT session_id) as active_users
      FROM analytics_events
      WHERE created_at > NOW() - INTERVAL '5 minutes'
    `)

    return parseInt(result.rows[0].active_users)
  } catch (error) {
    console.error('❌ Error obteniendo usuarios activos:', error)
    throw error
  }
}

/**
 * Obtener páginas más visitadas
 * @param {number} limit - Cantidad de resultados
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array} Top páginas
 */
export async function getTopPages(limit = 10, startDate, endDate) {
  try {
    const result = await pool.query(
      `
      SELECT
        page_url,
        page_title,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_sessions,
        ROUND(AVG(value) FILTER (WHERE event_type = 'time_on_page'), 2) as avg_time_seconds
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= $1
        AND created_at <= $2
        AND page_url IS NOT NULL
      GROUP BY page_url, page_title
      ORDER BY views DESC
      LIMIT $3
    `,
      [startDate, endDate, limit]
    )

    return result.rows
  } catch (error) {
    console.error('❌ Error obteniendo top páginas:', error)
    throw error
  }
}

/**
 * Obtener funnel de conversión de registro
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array} Datos del funnel
 */
export async function getConversionFunnel(startDate, endDate) {
  try {
    const result = await pool.query(
      `
      SELECT
        event_name,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) as events
      FROM analytics_events
      WHERE event_type IN ('registro_start', 'registro_step_completed', 'registro_complete')
        AND created_at >= $1
        AND created_at <= $2
      GROUP BY event_name
      ORDER BY
        CASE
          WHEN event_name = 'registro_start' THEN 1
          WHEN event_name LIKE 'Paso %' THEN 2
          WHEN event_name = 'registro_complete' THEN 3
          ELSE 4
        END,
        event_name
    `,
      [startDate, endDate]
    )

    return result.rows
  } catch (error) {
    console.error('❌ Error obteniendo funnel:', error)
    throw error
  }
}

/**
 * Obtener eventos recientes
 * @param {number} limit - Cantidad de eventos
 * @returns {Array} Eventos recientes
 */
export async function getRecentEvents(limit = 50) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        session_id,
        user_id,
        event_type,
        event_name,
        page_url,
        page_title,
        element_id,
        element_text,
        value,
        metadata,
        created_at
      FROM analytics_events
      ORDER BY created_at DESC
      LIMIT $1
    `,
      [limit]
    )

    return result.rows
  } catch (error) {
    console.error('❌ Error obteniendo eventos recientes:', error)
    throw error
  }
}

/**
 * Obtener distribución de eventos por tipo
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Array} Distribución por tipo
 */
export async function getEventDistribution(startDate, endDate) {
  try {
    const result = await pool.query(
      `
      SELECT
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM analytics_events
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY event_type
      ORDER BY count DESC
    `,
      [startDate, endDate]
    )

    return result.rows
  } catch (error) {
    console.error('❌ Error obteniendo distribución de eventos:', error)
    throw error
  }
}

/**
 * Obtener métricas de conversión
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Object} Métricas de conversión
 */
export async function getConversionMetrics(startDate, endDate) {
  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(DISTINCT session_id) as total_sessions,
        COUNT(DISTINCT session_id) FILTER (WHERE converted = true) as converted_sessions,
        ROUND(
          (COUNT(DISTINCT session_id) FILTER (WHERE converted = true)::DECIMAL /
          NULLIF(COUNT(DISTINCT session_id), 0)) * 100,
          2
        ) as conversion_rate,
        COUNT(*) FILTER (WHERE conversion_type = 'registro_artista') as registros,
        COUNT(*) FILTER (WHERE conversion_type = 'contacto') as contactos
      FROM analytics_sessions
      WHERE started_at >= $1 AND started_at <= $2
    `,
      [startDate, endDate]
    )

    return result.rows[0]
  } catch (error) {
    console.error('❌ Error obteniendo métricas de conversión:', error)
    throw error
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Sesiones
  createOrUpdateSession,
  markConversion,

  // Tracking
  trackEvent,

  // Queries
  getStats,
  getActiveUsers,
  getTopPages,
  getConversionFunnel,
  getRecentEvents,
  getEventDistribution,
  getConversionMetrics,
}
