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
import { MetricCard } from '@/components/ui/metric-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { EmptyState } from '@/components/ui/empty-state'
import { PulseIndicator } from '@/components/ui/pulse-indicator'
import Badge from '@/components/ui/Badge'
import EventsDocModal from './EventsDocModal'
import { exportToPDF, exportToExcel, exportToCSV } from '@/lib/analyticsExport'

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
  const [showEventsDoc, setShowEventsDoc] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

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

  // Export handlers
  const handleExportPDF = () => {
    const data = {
      stats,
      realtimeData,
      topPages,
      funnelData,
      distributionData,
      conversionMetrics
    }
    exportToPDF(data, dateRange)
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    const data = {
      stats,
      realtimeData,
      topPages,
      funnelData,
      distributionData,
      conversionMetrics
    }
    exportToExcel(data, dateRange)
    setShowExportMenu(false)
  }

  const handleExportCSV = () => {
    const data = {
      stats,
      conversionMetrics
    }
    exportToCSV(data)
    setShowExportMenu(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Events Documentation Modal */}
      <EventsDocModal isOpen={showEventsDoc} onClose={() => setShowEventsDoc(false)} />

      {/* Header - Full Width */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Panel de análisis de actividad y conversiones
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

          {/* Documentation Button */}
          <button
            onClick={() => setShowEventsDoc(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documentación
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
              <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Export Menu */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors first:rounded-t-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Exportar PDF</p>
                    <p className="text-xs text-gray-500">Reporte completo</p>
                  </div>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Exportar Excel</p>
                    <p className="text-xs text-gray-500">Análisis detallado</p>
                  </div>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors last:rounded-b-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Exportar CSV</p>
                    <p className="text-xs text-gray-500">Datos básicos</p>
                  </div>
                </button>
              </div>
            )}
          </div>

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
            <p className="text-green-100 font-medium mb-2 flex items-center gap-2">
              <PulseIndicator size="md" color="green" className="opacity-80" />
              Usuarios Activos Ahora
            </p>
            <AnimatedCounter
              value={realtimeData?.active_users || 0}
              className="text-5xl font-bold"
            />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <PulseIndicator size="lg" />
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
        <MetricCard
          label="Sesiones"
          value={stats?.total_sessions || 0}
          context={`${stats?.unique_users || 0} usuarios únicos`}
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          )}
          variant="default"
        />

        <MetricCard
          label="Vistas"
          value={stats?.total_page_views || 0}
          context={`${((stats?.total_page_views || 0) / (stats?.total_sessions || 1)).toFixed(1)} por sesión`}
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          )}
          variant="blue"
        />

        <MetricCard
          label="Conversiones"
          value={stats?.total_conversions || 0}
          context={`${conversionMetrics?.conversion_rate || 0}% tasa`}
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          variant="green"
        />

        <MetricCard
          label="Tiempo Promedio"
          value={Math.round(stats?.avg_time_on_page_seconds || 0)}
          suffix="s"
          context="Por página vista"
          icon={({ className }) => (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
          variant="purple"
        />
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
            <EmptyState
              icon={({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              title="No hay páginas visitadas"
              description="Aún no hay datos de páginas visitadas en este periodo"
            />
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
            <EmptyState
              icon={({ className }) => (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              )}
              title="No hay eventos"
              description="Aún no hay datos de distribución de eventos"
            />
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
                  <Badge variant="info" size="sm">
                    {event.event_type}
                  </Badge>
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
          <EmptyState
            icon={({ className }) => (
              <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            title="No hay actividad reciente"
            description="Los eventos aparecerán aquí cuando haya actividad en el sitio"
          />
        )}
      </div>

      {/* Additional Stats Grid - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:border-blue-300 transition-all hover:shadow-md">
          <p className="text-sm text-blue-700 font-semibold mb-2 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
            Total Clicks
          </p>
          <AnimatedCounter
            value={stats?.total_clicks || 0}
            className="text-3xl font-bold text-blue-900"
          />
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 hover:border-red-300 transition-all hover:shadow-md">
          <p className="text-sm text-red-700 font-semibold mb-2 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Errores
          </p>
          <AnimatedCounter
            value={stats?.total_errors || 0}
            className="text-3xl font-bold text-red-900"
          />
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:border-purple-300 transition-all hover:shadow-md">
          <p className="text-sm text-purple-700 font-semibold mb-2 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Eventos Totales
          </p>
          <AnimatedCounter
            value={stats?.total_events || 0}
            className="text-3xl font-bold text-purple-900"
          />
        </div>
      </div>
    </div>
  )
}
