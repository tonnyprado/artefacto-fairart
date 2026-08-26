'use client'

import { useState, useEffect, useRef } from 'react'
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
import gsap from 'gsap'

const SIDEBAR_WIDTH_COLLAPSED = 72
const SIDEBAR_WIDTH_EXPANDED = 240

const TABS = [
  { id: 'artistas-fase', label: 'Artistas', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'votar', label: 'Votar', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'mis-favoritos', label: 'Favoritos', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'mis-votaciones', label: 'Historial', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'resultados', label: 'Resultados', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'aceptados', label: 'Aceptados', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
]

function LogoutModal({ isOpen, onConfirm, onCancel }) {
  const modalRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      )
      gsap.fromTo(modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.5)' }
      )
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        className="rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
        style={{ backgroundColor: COLORS.cream }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${COLORS.red}15` }}
          >
            <svg className="w-7 h-7" style={{ color: COLORS.red }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.black }}>
            Cerrar sesión
          </h3>
          <p className="text-sm mb-6" style={{ color: COLORS.gray }}>
            ¿Estás seguro que deseas salir del panel de curador?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: COLORS.creamDark,
                color: COLORS.black
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: COLORS.red,
                color: COLORS.cream
              }}
            >
              Sí, salir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CuradorDashboardContent() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('artistas-fase')
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const sidebarRef = useRef(null)
  const labelsRef = useRef([])

  const { fetchArtistasByFase } = useArtistasStore()
  const { fetchFases, getFaseActiva } = useFasesStore()
  const { fetchMisVotaciones } = useVotacionesStore()

  const faseActiva = getFaseActiva()

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
    if (user) loadData()
  }, [user, fetchFases, fetchMisVotaciones])

  useEffect(() => {
    if (faseActiva) fetchArtistasByFase(faseActiva.id)
  }, [faseActiva, fetchArtistasByFase])

  // GSAP animations for sidebar
  const handleMouseEnter = () => {
    setIsSidebarExpanded(true)
    gsap.to(sidebarRef.current, {
      width: SIDEBAR_WIDTH_EXPANDED,
      duration: 0.3,
      ease: 'power2.out'
    })
    labelsRef.current.forEach((label, i) => {
      if (label) {
        gsap.to(label, {
          opacity: 1,
          x: 0,
          duration: 0.25,
          delay: i * 0.03,
          ease: 'power2.out'
        })
      }
    })
  }

  const handleMouseLeave = () => {
    setIsSidebarExpanded(false)
    gsap.to(sidebarRef.current, {
      width: SIDEBAR_WIDTH_COLLAPSED,
      duration: 0.25,
      ease: 'power2.inOut'
    })
    labelsRef.current.forEach(label => {
      if (label) {
        gsap.to(label, {
          opacity: 0,
          x: -10,
          duration: 0.15,
          ease: 'power2.in'
        })
      }
    })
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    logout()
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.cream }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 mb-4" style={{ borderColor: COLORS.red, borderTopColor: 'transparent' }}></div>
          <p className="text-sm" style={{ color: COLORS.gray }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: COLORS.cream }}>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col"
        style={{
          width: SIDEBAR_WIDTH_COLLAPSED,
          backgroundColor: COLORS.black
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-3">
          <img
            src="/assets/conocer-mas/logo-red.png"
            alt="ARTEFACTO"
            className="h-10 w-auto"
          />
        </div>

        {/* Separator */}
        <div className="mx-4 border-t" style={{ borderColor: `${COLORS.cream}15` }} />

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-hidden">
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-lg transition-colors overflow-hidden"
                style={{
                  backgroundColor: isActive ? COLORS.red : 'transparent',
                  color: isActive ? COLORS.cream : COLORS.creamDark
                }}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span
                  ref={el => labelsRef.current[index] = el}
                  className="text-sm font-medium whitespace-nowrap"
                  style={{
                    opacity: 0,
                    transform: 'translateX(-10px)'
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* User info & Logout */}
        <div className="px-2 pb-4">
          {/* Separator */}
          <div className="mx-2 mb-4 border-t" style={{ borderColor: `${COLORS.cream}15` }} />

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg overflow-hidden" style={{ backgroundColor: `${COLORS.cream}08` }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
              style={{ backgroundColor: COLORS.red, color: COLORS.cream }}
            >
              {user?.nombre?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <span
              ref={el => labelsRef.current[TABS.length] = el}
              className="text-sm whitespace-nowrap truncate"
              style={{
                color: COLORS.creamDark,
                opacity: 0,
                transform: 'translateX(-10px)'
              }}
            >
              {user?.nombre}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors overflow-hidden hover:opacity-80"
            style={{
              backgroundColor: `${COLORS.red}20`,
              color: COLORS.red
            }}
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span
              ref={el => labelsRef.current[TABS.length + 1] = el}
              className="text-sm font-medium whitespace-nowrap"
              style={{
                opacity: 0,
                transform: 'translateX(-10px)'
              }}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: SIDEBAR_WIDTH_COLLAPSED }}
      >
        {/* Votaciones banner */}
        {faseActiva?.votaciones_abiertas && (
          <div style={{ backgroundColor: COLORS.red }}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
              <p className="text-sm" style={{ color: COLORS.cream }}>
                <span className="font-semibold">{faseActiva.nombre}</span>
                <span className="hidden sm:inline"> — Votaciones abiertas</span>
              </p>
              {activeTab !== 'votar' && (
                <button
                  onClick={() => setActiveTab('votar')}
                  className="text-xs font-semibold px-4 py-1.5 rounded-full transition-transform hover:scale-105"
                  style={{ backgroundColor: COLORS.cream, color: COLORS.red }}
                >
                  VOTAR AHORA
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'artistas-fase' && <ArtistasPorFase />}
          {activeTab === 'votar' && <ArtistasVotacion />}
          {activeTab === 'mis-favoritos' && <MisFavoritos />}
          {activeTab === 'mis-votaciones' && <MisVotaciones />}
          {activeTab === 'resultados' && <ResultadosFases />}
          {activeTab === 'aceptados' && <ArtistasAceptados />}
        </div>
      </main>

      {/* Logout confirmation modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
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
