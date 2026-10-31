/**
 * Analytics Controller
 * Controladores para endpoints de analytics
 *
 * Endpoints:
 * - POST /track - Trackear evento (público con auth opcional)
 * - GET /stats - Estadísticas generales (admin only)
 * - GET /realtime - Datos en tiempo real (admin only)
 * - GET /pages - Top páginas (admin only)
 * - GET /funnel - Funnel de conversión (admin only)
 */

import {
  createOrUpdateSession,
  trackEvent,
  markConversion,
  getStats,
  getRecentEvents,
  getActiveUsers,
  getTopPages,
  getConversionFunnel,
  getEventDistribution,
  getConversionMetrics,
  getErrors,
} from '../services/analytics.service.js'

/**
 * POST /api/analytics/track
 * Trackear evento de usuario
 * Público (con auth opcional para usuarios logueados)
 */
export const track = async (req, res) => {
  try {
    const {
      session_id,
      event_type,
      event_name,
      page_url,
      page_title,
      element_id,
      element_text,
      value,
      metadata,
      user_agent,
      referrer,
      landing_page,
    } = req.body

    // Validación
    if (!session_id || !event_type) {
      return res.status(400).json({
        success: false,
        error: 'session_id y event_type son requeridos',
      })
    }

    // Obtener IP (puede estar en diferentes headers dependiendo del proxy)
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '0.0.0.0'

    const user_id = req.user?.id || null

    // Actualizar sesión si es page_view o session_start
    if (event_type === 'page_view' || event_type === 'session_start') {
      await createOrUpdateSession({
        session_id,
        user_id,
        ip,
        user_agent: user_agent || req.headers['user-agent'],
        referrer,
        landing_page: landing_page || page_url,
      })
    }

    // Trackear evento (async, no bloquea)
    trackEvent({
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
    })

    // Marcar conversión si aplica
    if (event_type === 'conversion') {
      await markConversion(session_id, metadata?.conversion_type || 'unknown')
    }

    // Respuesta inmediata (no esperamos a que se guarde en DB)
    res.status(201).json({
      success: true,
      message: 'Evento rastreado',
    })
  } catch (error) {
    console.error('❌ Error tracking event:', error)
    res.status(500).json({
      success: false,
      error: 'Error al trackear evento',
    })
  }
}

/**
 * GET /api/analytics/stats
 * Obtener estadísticas generales
 * Admin only
 */
export const stats = async (req, res) => {
  try {
    const { start_date, end_date, event_type, user_id } = req.query

    // Defaults: últimos 30 días si no se especifica
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const statistics = await getStats({
      start_date: start_date || defaultStartDate,
      end_date: end_date || new Date(),
      event_type,
      user_id,
    })

    res.json({
      success: true,
      data: statistics,
    })
  } catch (error) {
    console.error('❌ Error getting stats:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
    })
  }
}

/**
 * GET /api/analytics/realtime
 * Obtener datos en tiempo real
 * Admin only
 */
export const realtime = async (req, res) => {
  try {
    const activeUsers = await getActiveUsers()
    const recentEvents = await getRecentEvents(20)

    res.json({
      success: true,
      data: {
        active_users: activeUsers,
        recent_events: recentEvents,
      },
    })
  } catch (error) {
    console.error('❌ Error getting realtime data:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos en tiempo real',
    })
  }
}

/**
 * GET /api/analytics/pages
 * Obtener top páginas más visitadas
 * Admin only
 */
export const pages = async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query

    // Defaults: últimos 7 días
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 7)

    const topPages = await getTopPages(
      parseInt(limit) || 10,
      start_date || defaultStartDate,
      end_date || new Date()
    )

    res.json({
      success: true,
      data: topPages,
    })
  } catch (error) {
    console.error('❌ Error getting top pages:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener páginas principales',
    })
  }
}

/**
 * GET /api/analytics/funnel
 * Obtener funnel de conversión de registro
 * Admin only
 */
export const funnel = async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    // Defaults: últimos 30 días
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const funnelData = await getConversionFunnel(
      start_date || defaultStartDate,
      end_date || new Date()
    )

    res.json({
      success: true,
      data: funnelData,
    })
  } catch (error) {
    console.error('❌ Error getting funnel:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener funnel de conversión',
    })
  }
}

/**
 * GET /api/analytics/distribution
 * Obtener distribución de eventos por tipo
 * Admin only
 */
export const distribution = async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    // Defaults: últimos 7 días
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 7)

    const distributionData = await getEventDistribution(
      start_date || defaultStartDate,
      end_date || new Date()
    )

    res.json({
      success: true,
      data: distributionData,
    })
  } catch (error) {
    console.error('❌ Error getting distribution:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener distribución de eventos',
    })
  }
}

/**
 * GET /api/analytics/conversions
 * Obtener métricas de conversión
 * Admin only
 */
export const conversions = async (req, res) => {
  try {
    const { start_date, end_date } = req.query

    // Defaults: últimos 30 días
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const conversionMetrics = await getConversionMetrics(
      start_date || defaultStartDate,
      end_date || new Date()
    )

    res.json({
      success: true,
      data: conversionMetrics,
    })
  } catch (error) {
    console.error('❌ Error getting conversion metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas de conversión',
    })
  }
}

/**
 * GET /api/analytics/errors
 * Obtener lista de errores detectados
 * Admin only
 */
export const errors = async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query

    // Defaults: últimos 7 días
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 7)

    const errorsList = await getErrors(
      start_date || defaultStartDate,
      end_date || new Date(),
      parseInt(limit) || 100
    )

    res.json({
      success: true,
      data: {
        errors: errorsList,
        total: errorsList.length,
      },
    })
  } catch (error) {
    console.error('❌ Error getting errors list:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener lista de errores',
    })
  }
}
