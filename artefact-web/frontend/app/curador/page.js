'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/shared/AuthGuard'
import RoleGuard from '@/components/shared/RoleGuard'
import Button from '@/components/ui/Button'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { useVotacionesStore } from '@/stores/votacionesStore'
import ArtistasVotacion from '@/components/curador/ArtistasVotacion'
import MisVotaciones from '@/components/curador/MisVotaciones'
import ResultadosFases from '@/components/curador/ResultadosFases'

/**
 * Dashboard de Curador
 *
 * Panel completo de curaduría con:
 * - Estadísticas personales de votación
 * - Vista de artistas para votar
 * - Historial de votaciones
 * - Resultados de fases finalizadas
 * - Navegación por tabs
 *
 * Protegido por AuthGuard y RoleGuard
 * Solo accesible para usuarios con role='curador'
 */

const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    id: 'votar',
    label: 'Votar',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'mis-votaciones',
    label: 'Mis Votaciones',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    id: 'resultados',
    label: 'Resultados',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
]

function CuradorDashboardContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [statsGeneral, setStatsGeneral] = useState({ total_votos: 0, votos_favor: 0, votos_contra: 0, porcentaje_favor: 0 })
  const [statsFaseActiva, setStatsFaseActiva] = useState({ total_votos: 0, votos_favor: 0, votos_contra: 0, porcentaje_favor: 0 })
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Stores
  const { artistas, fetchArtistasByFase, isLoading: isLoadingArtistas } = useArtistasStore()
  const { fases, fetchFases, getFaseActiva, isLoading: isLoadingFases } = useFasesStore()
  const { fetchMisVotaciones, getEstadisticasCurador: getEstadisticasAPI, votaciones } = useVotacionesStore()

  const faseActiva = getFaseActiva()

  // Fetch initial data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        // Fetch fases first
        await fetchFases()
        // Fetch votaciones for statistics
        await fetchMisVotaciones()
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user, fetchFases, fetchMisVotaciones])

  // Fetch artists when fase activa changes
  useEffect(() => {
    const loadArtistas = async () => {
      if (faseActiva) {
        try {
          await fetchArtistasByFase(faseActiva.id)
        } catch (error) {
          console.error('Error loading artistas:', error)
        }
      }
    }

    loadArtistas()
  }, [faseActiva, fetchArtistasByFase])

  // Update statistics when votaciones change
  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        try {
          const general = await getEstadisticasAPI()
          setStatsGeneral(general)

          if (faseActiva) {
            const faseStats = await getEstadisticasAPI(faseActiva.id)
            setStatsFaseActiva(faseStats)
          }
        } catch (error) {
          console.error('Error loading statistics:', error)
        }
      }
    }

    loadStats()
  }, [user, faseActiva, votaciones, getEstadisticasAPI])

  // Artistas de fase activa
  const artistasFaseActiva = faseActiva
    ? artistas.filter(a => a.aprobado === true)
    : []

  // Show loading state
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Curaduría</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user?.nombre}</p>
              {user?.especialidad && (
                <p className="text-xs text-purple-600 font-medium">
                  {user.especialidad}
                </p>
              )}
            </div>
            <Button variant="secondary" onClick={logout}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </Button>
          </div>

          {/* Tabs Navigation */}
          <nav className="flex space-x-1 border-b border-gray-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-2 font-medium text-sm transition-colors border-b-2
                  ${activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Fase activa alert */}
            {faseActiva && faseActiva.votaciones_abiertas && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 mb-2">
                      {faseActiva.nombre} - Votaciones Abiertas
                    </h3>
                    <p className="text-sm text-purple-800 mb-3">
                      Fecha límite: {new Date(faseActiva.fecha_fin_votaciones).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex gap-4 text-sm text-purple-700">
                      <span>📊 {artistasFaseActiva.length} artistas disponibles</span>
                      <span>✓ {statsFaseActiva.total_votos} votos emitidos</span>
                      <span>⏳ {artistasFaseActiva.length - statsFaseActiva.total_votos} pendientes</span>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab('votar')}>
                    Ir a Votar
                  </Button>
                </div>
              </div>
            )}

            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Votaciones</p>
                <p className="text-3xl font-bold text-gray-900">{statsGeneral.total_votos}</p>
                <p className="text-xs text-gray-600 mt-2">En todas las fases</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Votos a Favor</p>
                <p className="text-3xl font-bold text-gray-900">{statsGeneral.votos_favor}</p>
                <p className="text-xs text-gray-600 mt-2">{statsGeneral.porcentaje_favor}% del total</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Votos en Contra</p>
                <p className="text-3xl font-bold text-gray-900">{statsGeneral.votos_contra}</p>
                <p className="text-xs text-gray-600 mt-2">{100 - parseFloat(statsGeneral.porcentaje_favor)}% del total</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Fase Actual</p>
                <p className="text-lg font-bold text-gray-900 line-clamp-2">
                  {faseActiva ? faseActiva.nombre : 'Sin fase activa'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('votar')}
                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Votar Artistas
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Evalúa y vota por los artistas de la fase activa
                </p>
              </div>

              <div
                onClick={() => setActiveTab('mis-votaciones')}
                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Ver Mis Votaciones
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Revisa el historial completo de tus votaciones
                </p>
              </div>

              <div
                onClick={() => setActiveTab('resultados')}
                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Ver Resultados
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Consulta los resultados de fases finalizadas
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-purple-600 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Información de Sesión</h3>
                  <div className="text-sm text-purple-800 space-y-1">
                    <p><strong>Curador:</strong> {user?.nombre} {user?.apellido}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Especialidad:</strong> {user?.especialidad || 'No especificada'}</p>
                    <p><strong>Rol:</strong> <span className="inline-block px-2 py-1 bg-purple-200 rounded text-xs uppercase">{user?.role}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Votar Tab */}
        {activeTab === 'votar' && <ArtistasVotacion />}

        {/* Mis Votaciones Tab */}
        {activeTab === 'mis-votaciones' && <MisVotaciones />}

        {/* Resultados Tab */}
        {activeTab === 'resultados' && <ResultadosFases />}
      </main>
    </div>
  )
}

export default function CuradorDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['curador']}>
        <CuradorDashboardContent />
      </RoleGuard>
    </AuthGuard>
  )
}
