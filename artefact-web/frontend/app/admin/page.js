'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/shared/AuthGuard'
import RoleGuard from '@/components/shared/RoleGuard'
import Button from '@/components/ui/Button'
import { useArtistasStore } from '@/stores/artistasStore'
import { useFasesStore } from '@/stores/fasesStore'
import { useCuradoresStore } from '@/stores/curadoresStore'
import ArtistasTable from '@/components/admin/ArtistasTable'
import FasesControl from '@/components/admin/FasesControl'
import CuradoresTable from '@/components/admin/CuradoresTable'

/**
 * Dashboard de Admin
 *
 * Panel completo de administración con:
 * - Estadísticas generales
 * - Gestión de artistas
 * - Control de fases
 * - Gestión de curadores
 * - Navegación por tabs
 *
 * Protegido por AuthGuard y RoleGuard
 * Solo accesible para usuarios con role='admin'
 */

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'artistas', label: 'Artistas', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'fases', label: 'Fases', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'curadores', label: 'Curadores', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
]

function AdminDashboardContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Stores
  const artistasStats = useArtistasStore(state => state.getEstadisticas())
  const fasesStats = useFasesStore(state => state.getEstadisticas())
  const curadoresStats = useCuradoresStore(state => state.getEstadisticas())
  const faseActiva = useFasesStore(state => state.getFaseActiva())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user?.nombre}</p>
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
                    ? 'border-red-600 text-red-600'
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Artistas</p>
                <p className="text-3xl font-bold text-gray-900">{artistasStats.total}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">✓ {artistasStats.aprobados} aprobados</span>
                  <span className="text-yellow-600">⏳ {artistasStats.pendientes} pendientes</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Fases</p>
                <p className="text-3xl font-bold text-gray-900">{fasesStats.total}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">✓ {fasesStats.activas} activas</span>
                  <span className="text-gray-600">◉ {fasesStats.finalizadas} finalizadas</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Curadores</p>
                <p className="text-3xl font-bold text-gray-900">{curadoresStats.total}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">✓ {curadoresStats.activos} activos</span>
                  <span className="text-gray-600">◉ {curadoresStats.total_votaciones} votos</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Inscripciones Totales</p>
                <p className="text-3xl font-bold text-gray-900">{fasesStats.total_artistas_inscritos}</p>
                <p className="text-xs text-gray-600 mt-2">En todas las fases</p>
              </div>
            </div>

            {/* Fase Activa */}
            {faseActiva && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 p-6 rounded-r-lg">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Fase Activa</h3>
                    <p className="text-sm text-red-800">
                      <strong>{faseActiva.nombre}</strong> - {faseActiva.inscripciones_abiertas ? 'Inscripciones abiertas' : 'Votaciones abiertas'}
                    </p>
                    <div className="mt-3 flex gap-3 text-sm">
                      <span className="text-red-700">📊 {faseActiva.total_inscritos} inscritos</span>
                      <span className="text-red-700">🎯 {faseActiva.total_seleccionados} seleccionados</span>
                      <span className="text-red-700">👥 {faseActiva.total_curadores} curadores</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab('fases')}>
                    Ver Fases
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('artistas')}
                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    Gestionar Artistas
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Ver, aprobar o rechazar solicitudes de artistas
                </p>
              </div>

              <div
                onClick={() => setActiveTab('fases')}
                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    Controlar Fases
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Abrir/cerrar inscripciones y votaciones
                </p>
              </div>

              <div
                onClick={() => setActiveTab('curadores')}
                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    Administrar Curadores
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Agregar, editar o desactivar curadores
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Información de Sesión</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Usuario:</strong> {user?.nombre} {user?.apellido}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Rol:</strong> <span className="inline-block px-2 py-1 bg-blue-200 rounded text-xs uppercase">{user?.role}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artistas Tab */}
        {activeTab === 'artistas' && <ArtistasTable />}

        {/* Fases Tab */}
        {activeTab === 'fases' && <FasesControl />}

        {/* Curadores Tab */}
        {activeTab === 'curadores' && <CuradoresTable />}
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <AdminDashboardContent />
      </RoleGuard>
    </AuthGuard>
  )
}
