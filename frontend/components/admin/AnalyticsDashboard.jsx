/**
 * Analytics Dashboard
 * Dashboard completo de analytics para panel de administración
 *
 * Características:
 * - Métricas en tiempo real (usuarios activos)
 * - Estadísticas generales (sesiones, conversiones, pageviews)
 * - Top páginas más visitadas
 * - Funnel de conversión de registro
 * - Feed de actividad reciente
 * - Distribución de eventos por tipo
 * - Refresh manual con botón
 */

'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = {
  red: '#B83030',
  black: '#141210',
  cream: '#F4EDE4',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  orange: '#F59E0B',
}

const CHART_COLORS = ['#B83030', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)
  const [realtimeData, setRealtimeData] = useState(null)
  const [topPages, setTopPages] = useState([])
  const [funnelData, setFunnelData] = useState([])
  const [distributionData, setDistributionData] = useState([])
  const [conversionMetrics, setConversionMetrics] = useState(null)
  const [dateRange, setDateRange] = useState('7')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch all data
  const fetchData = async () => {
    const token = localStorage.getItem('token')
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

    if (!token) {
      console.error('No token found')
      setIsLoading(false)
      return
    }

    setIsRefreshing(true)

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      // Fecha de inicio según el rango seleccionado
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const queries = new URLSearchParams({
        start_date: startDate.toISOString(),
      })

      // Fetch all endpoints in parallel
      const [statsRes, realtimeRes, pagesRes, funnelRes, distributionRes, conversionsRes] =
        await Promise.all([
          fetch(`${API_URL}/analytics/stats?${queries}`, { headers }),
          fetch(`${API_URL}/analytics/realtime`, { headers }),
          fetch(`${API_URL}/analytics/pages?${queries}`, { headers }),
          fetch(`${API_URL}/analytics/funnel?${queries}`, { headers }),
          fetch(`${API_URL}/analytics/distribution?${queries}`, { headers }),
          fetch(`${API_URL}/analytics/conversions?${queries}`, { headers }),
        ])

      const [statsData, realtimeData, pagesData, funnelData, distributionData, conversionsData] =
        await Promise.all([
          statsRes.json(),
          realtimeRes.json(),
          pagesRes.json(),
          funnelRes.json(),
          distributionRes.json(),
          conversionsRes.json(),
        ])

      setStats(statsData.data)
      setRealtimeData(realtimeData.data)
      setTopPages(pagesData.data || [])
      setFunnelData(funnelData.data || [])
      setDistributionData(distributionData.data || [])
      setConversionMetrics(conversionsData.data)

      setIsLoading(false)
      setIsRefreshing(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
          <p className="text-gray-600 mt-1">
            Panel de análisis de actividad y conversiones
          </p>
        </div>

        <div className="flex gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="1">Hoy</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Actualizando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Realtime Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">Usuarios Activos Ahora</p>
            <p className="text-4xl font-bold text-green-600">
              {realtimeData?.active_users || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Últimos 5 minutos</p>
      </div>

      {/* Overview Stats - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sesiones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Sesiones Totales</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_sessions || 0}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            {stats?.unique_users || 0} usuarios únicos
          </div>
        </div>

        {/* Páginas Vistas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Páginas Vistas</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.total_page_views || 0}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            {((stats?.total_page_views || 0) / (stats?.total_sessions || 1)).toFixed(1)} por sesión
          </div>
        </div>

        {/* Conversiones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Conversiones</p>
          <p className="text-3xl font-bold text-green-600">{stats?.total_conversions || 0}</p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {conversionMetrics?.conversion_rate || 0}% tasa de conversión
          </div>
        </div>

        {/* Tiempo Promedio */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Tiempo Promedio</p>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.avg_time_on_page_seconds
              ? `${Math.round(stats.avg_time_on_page_seconds)}s`
              : '0s'}
          </p>
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Por página vista
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Páginas Más Visitadas</h2>
          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {page.page_title || 'Sin título'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{page.page_url}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">{page.views}</p>
                    <p className="text-xs text-gray-500">{page.unique_sessions} sesiones</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Event Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribución de Eventos</h2>
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="count"
                  nameKey="event_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.event_type}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Funnel de Registro */}
      {funnelData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Funnel de Registro</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessions" fill={COLORS.red} name="Sesiones" />
              <Bar dataKey="events" fill={COLORS.blue} name="Eventos" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              💡 <strong>Tip:</strong> Identifica en qué paso del registro los usuarios abandonan
              más para optimizar la conversión.
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
        {realtimeData?.recent_events && realtimeData.recent_events.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {realtimeData.recent_events.map((event, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm border-b pb-2 hover:bg-gray-50 px-2 py-1 rounded"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.event_type === 'conversion'
                        ? 'bg-green-100 text-green-800'
                        : event.event_type === 'error'
                        ? 'bg-red-100 text-red-800'
                        : event.event_type === 'click'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.event_type}
                  </span>
                  {event.event_name && <span className="text-gray-600">{event.event_name}</span>}
                  {event.page_title && (
                    <span className="text-xs text-gray-400 truncate max-w-xs">
                      {event.page_title}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(event.created_at).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Clicks</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.total_clicks || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Errores</p>
          <p className="text-2xl font-bold text-red-600">{stats?.total_errors || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 font-medium mb-2">Total Eventos</p>
          <p className="text-2xl font-bold text-purple-600">{stats?.total_events || 0}</p>
        </div>
      </div>
    </div>
  )
}
