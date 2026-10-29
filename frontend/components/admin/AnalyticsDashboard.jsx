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
 * - Diseño moderno full-width
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

      setStats(statsData.data || {})
      setRealtimeData(realtimeData.data || {})
      setTopPages(pagesData.data?.pages || [])
      setFunnelData(funnelData.data?.funnel || [])
      setDistributionData(distributionData.data?.distribution || [])
      setConversionMetrics(conversionsData.data || {})
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header - Full Width */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Panel de análisis de actividad y conversiones
          </p>
        </div>

        <div className="flex gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm hover:border-gray-400 transition-colors"
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
            className={`px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
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

      {/* Realtime Stats - Full Width with Gradient */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 font-medium mb-2">Usuarios Activos Ahora</p>
            <p className="text-5xl font-bold">
              {realtimeData?.active_users || 0}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-lg"></div>
          </div>
        </div>
        <p className="text-green-100 text-sm mt-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Últimos 5 minutos
        </p>
      </div>

      {/* Overview Stats - 4 Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sesiones */}
        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sesiones</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.total_sessions || 0}</p>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {stats?.unique_users || 0} usuarios únicos
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
        </div>

        {/* Páginas Vistas */}
        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Vistas</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats?.total_page_views || 0}</p>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              {((stats?.total_page_views || 0) / (stats?.total_sessions || 1)).toFixed(1)} por sesión
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>

        {/* Conversiones */}
        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Conversiones</span>
            </div>
            <p className="text-4xl font-bold text-green-600 mb-2">{stats?.total_conversions || 0}</p>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              {conversionMetrics?.conversion_rate || 0}% tasa
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600"></div>
        </div>

        {/* Tiempo Promedio */}
        <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Tiempo</span>
            </div>
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {stats?.avg_time_on_page_seconds ? `${Math.round(stats.avg_time_on_page_seconds)}s` : '0s'}
            </p>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Por página vista
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
        </div>
      </div>

      {/* Charts Row - Full Width */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Páginas Más Visitadas</h2>
          </div>
          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-semibold text-gray-900 truncate">
                      {page.page_title || 'Sin título'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{page.page_url}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-gray-900">{page.views}</p>
                    <p className="text-xs text-gray-500">{page.unique_sessions} sesiones</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No hay datos disponibles</p>
            </div>
          )}
        </div>

        {/* Event Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Distribución de Eventos</h2>
          </div>
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ event_type, percentage }) => `${event_type} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-gray-500">No hay datos disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Funnel - Full Width */}
      {funnelData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Funnel de Registro</h2>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="event_name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="sessions" fill="#B83030" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity - Full Width */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-gray-300 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
        </div>
        {realtimeData?.recent_events?.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {realtimeData.recent_events.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all border border-gray-100"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full whitespace-nowrap">
                    {event.event_type}
                  </span>
                  <span className="font-medium text-gray-900 truncate">
                    {event.event_name || event.page_title || 'Sin nombre'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
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
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No hay actividad reciente</p>
          </div>
        )}
      </div>

      {/* Additional Stats Grid - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-2 uppercase tracking-wide">Total Clicks</p>
          <p className="text-3xl font-bold text-blue-900">{stats?.total_clicks || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-semibold mb-2 uppercase tracking-wide">Errores</p>
          <p className="text-3xl font-bold text-red-900">{stats?.total_errors || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p className="text-sm text-purple-700 font-semibold mb-2 uppercase tracking-wide">Eventos Totales</p>
          <p className="text-3xl font-bold text-purple-900">{stats?.total_events || 0}</p>
        </div>
      </div>
    </div>
  )
}
