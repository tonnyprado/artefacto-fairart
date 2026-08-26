'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/shared/AuthGuard'
import RoleGuard from '@/components/shared/RoleGuard'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { useVotacionesStore } from '@/stores/votacionesStore'
import ArtistasVotacion from '@/components/curador/ArtistasVotacion'
import MisVotaciones from '@/components/curador/MisVotaciones'
import ResultadosFases from '@/components/curador/ResultadosFases'
import ArtistasPorFase from '@/components/curador/ArtistasPorFase'
import MisFavoritos from '@/components/curador/MisFavoritos'
import ArtistasAceptados from '@/components/admin/ArtistasInscritos'
import { COLORS } from '@/components/artefacto/theme'

/**
 * Panel de Curaduría ARTEFACTO
 * Diseño alineado con la identidad visual de la marca
 */

const TABS = [
  {
    id: 'artistas-fase',
    label: 'Artistas por Fase',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  {
    id: 'votar',
    label: 'Votar',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'mis-favoritos',
    label: 'Mis Favoritos',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
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
  },
  {
    id: 'aceptados',
    label: 'Aceptados',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  }
]

function CuradorDashboardContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('artistas-fase')
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Stores
  const { fetchArtistasByFase } = useArtistasStore()
  const { fases, fetchFases, getFaseActiva } = useFasesStore()
  const { fetchMisVotaciones, getEstadisticasCurador: getEstadisticasAPI } = useVotacionesStore()

  const faseActiva = getFaseActiva()

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true)
      try {
        await fetchFases()
        await fetchMisVotaciones()
      } catch (error) {
        console.error('Error loading data:', error)
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
    if (faseActiva) {
      fetchArtistasByFase(faseActiva.id)
    }
  }, [faseActiva, fetchArtistasByFase])

  if (isLoadingData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.cream }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: COLORS.red }}
          ></div>
          <p style={{ color: COLORS.gray }}>Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      {/* Header ARTEFACTO Style */}
      <header
        className="sticky top-0 z-50 border-b-2"
        style={{
          backgroundColor: COLORS.black,
          borderColor: COLORS.red
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                  style={{ backgroundColor: COLORS.red, color: COLORS.cream }}
                >
                  A
                </div>
                <div>
                  <h1
                    className="text-lg font-black tracking-wider uppercase"
                    style={{
                      color: COLORS.cream,
                      fontFamily: "'Inter Tight', sans-serif",
                      fontStyle: 'italic'
                    }}
                  >
                    ARTEFACTO
                  </h1>
                  <p
                    className="text-xs tracking-widest uppercase"
                    style={{ color: COLORS.red }}
                  >
                    Panel de Curaduría
                  </p>
                </div>
              </div>
            </div>

            {/* User info & logout */}
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p
                  className="text-sm font-medium"
                  style={{ color: COLORS.cream }}
                >
                  {user?.nombre} {user?.apellido}
                </p>
                <p
                  className="text-xs"
                  style={{ color: COLORS.creamDark }}
                >
                  {user?.especialidad || 'Curador'}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: COLORS.red,
                  color: COLORS.cream
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <nav className="flex gap-1 overflow-x-auto pb-0 -mb-[2px] scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all rounded-t-lg"
                style={{
                  backgroundColor: activeTab === tab.id ? COLORS.cream : 'transparent',
                  color: activeTab === tab.id ? COLORS.black : COLORS.creamDark,
                  borderBottom: activeTab === tab.id ? `3px solid ${COLORS.red}` : '3px solid transparent'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Fase activa banner */}
      {faseActiva && faseActiva.votaciones_abiertas && (
        <div
          className="border-b-2"
          style={{
            backgroundColor: COLORS.red,
            borderColor: COLORS.creamDark
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLORS.cream }}
                ></div>
                <p
                  className="text-sm font-medium"
                  style={{ color: COLORS.cream }}
                >
                  <span className="font-bold">{faseActiva.nombre}</span> — Votaciones abiertas hasta el{' '}
                  {new Date(faseActiva.fecha_fin_votaciones).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('votar')}
                className="text-xs font-bold px-4 py-1.5 rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: COLORS.cream,
                  color: COLORS.red
                }}
              >
                IR A VOTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab content with ARTEFACTO styling */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            backgroundColor: 'white',
            border: `2px solid ${COLORS.creamDark}`
          }}
        >
          {activeTab === 'artistas-fase' && <ArtistasPorFase />}
          {activeTab === 'votar' && <ArtistasVotacion />}
          {activeTab === 'mis-favoritos' && <MisFavoritos />}
          {activeTab === 'mis-votaciones' && <MisVotaciones />}
          {activeTab === 'resultados' && <ResultadosFases />}
          {activeTab === 'aceptados' && <ArtistasAceptados />}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: COLORS.gray }}
          >
            ARTEFACTO Fair Art — Panel de Curaduría
          </p>
        </div>
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
